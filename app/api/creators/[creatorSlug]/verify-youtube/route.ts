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
      console.warn('[Campfire Manual YouTube Verification] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (process.env.DATABASE_URL) {
      const creator = await prisma.creator.findUnique({
        where: { slug: creatorSlug },
      })

      if (creator) {
        // Check existing link status in Neon DB
        const link = await prisma.userCreatorLink.findUnique({
          where: {
            userId_creatorId: {
              userId: authUser.id,
              creatorId: creator.id,
            },
          },
        })

        const isVerified = link?.youtubeSubscriptionVerified ?? false

        return NextResponse.json({
          success: true,
          verified: isVerified,
          message: isVerified
            ? 'YouTube subscription is verified!'
            : 'Subscription not detected yet. Please click "Verify with Google OAuth (Live)" to verify your subscription.',
        })
      }
    }

    return NextResponse.json({
      success: true,
      verified: false,
      message: 'Please connect via Google OAuth to verify your subscription.',
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Verification check failed'
    console.error('[Campfire Manual YouTube Verification Error]:', errorMsg)
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
