import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ creatorSlug: string }> },
) {
  console.log('[Campfire Manual YouTube Verification] Request received')

  try {
    const { creatorSlug } = await params
    const authUser = await getAuthUser()

    if (!authUser) {
      console.warn('[Campfire Manual YouTube Verification] Failed: Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Campfire Manual YouTube Verification] Verifying user:', authUser.id, 'for creator:', creatorSlug)

    if (process.env.DATABASE_URL) {
      const creator = await prisma.creator.findUnique({
        where: { slug: creatorSlug },
      })

      if (creator) {
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
            lastActiveAt: new Date(),
          },
          create: {
            userId: authUser.id,
            creatorId: creator.id,
            youtubeSubscriptionVerified: true,
            youtubeVerifiedAt: new Date(),
            subscriptionCheckExpiresAt: expiresAt,
            pointsBalance: 250,
            currentStreak: 1,
            longestStreak: 1,
          },
        })

        console.log('[Campfire Manual YouTube Verification] User verified and updated in Neon Postgres.')
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'YouTube subscription verified! +150 bonus points awarded.',
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Verification failed'
    console.error('[Campfire Manual YouTube Verification Error]:', errorMsg)
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
