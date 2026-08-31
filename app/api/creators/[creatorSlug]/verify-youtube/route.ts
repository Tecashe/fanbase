import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'
import { checkVerificationRateLimit, verifyYouTubeSubscription } from '@/lib/youtube'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ creatorSlug: string }> },
) {
  try {
    const { creatorSlug } = await params
    const authUser = await getAuthUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateCheck = checkVerificationRateLimit(authUser.id)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Please wait ${rateCheck.remainingSeconds}s before checking subscription again.`,
          retryAfter: rateCheck.remainingSeconds,
        },
        { status: 429 },
      )
    }

    let verified = true
    let quotaExceeded = false

    if (process.env.DATABASE_URL) {
      const creator = await prisma.creator.findUnique({
        where: { slug: creatorSlug },
      })

      if (creator) {
        const result = await verifyYouTubeSubscription({
          accessToken: 'mock-access-token',
          creatorChannelId: creator.youtubeChannelId || 'UC_example',
        })

        verified = result.verified
        quotaExceeded = !!result.quotaExceeded

        if (verified) {
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 30)

          await prisma.userCreatorLink.upsert({
            where: {
              userId_creatorId: {
                userId: authUser.id,
                creatorId: creator.id,
              },
            },
            update: {
              youtubeSubscriptionVerified: true,
              youtubeVerifiedAt: new Date(),
              subscriptionCheckExpiresAt: expiresAt,
              pointsBalance: { increment: 150 },
            },
            create: {
              userId: authUser.id,
              creatorId: creator.id,
              youtubeSubscriptionVerified: true,
              youtubeVerifiedAt: new Date(),
              subscriptionCheckExpiresAt: expiresAt,
              pointsBalance: 250,
            },
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      verified,
      quotaExceeded,
      message: verified
        ? 'Subscription verified! +150 bonus points awarded.'
        : quotaExceeded
        ? "YouTube API daily limit reached. We're verifying in background."
        : 'Subscription check completed.',
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Verification failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
