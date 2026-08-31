import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyYouTubeSubscription } from '@/lib/youtube'

/**
 * Scheduled Cron Handler:
 * Re-verifies YouTube subscriptions for links whose 30-day verification has expired.
 * Protected by CRON_SECRET or Bearer token header.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET || 'campfire_cron_secret_key'

    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        message: 'No DATABASE_URL configured. Mock verification skipped.',
        reverifiedCount: 0,
      })
    }

    const now = new Date()

    // Find links that need re-verification
    const expiredLinks = await prisma.userCreatorLink.findMany({
      where: {
        youtubeSubscriptionVerified: true,
        subscriptionCheckExpiresAt: { lte: now },
      },
      include: {
        creator: true,
        user: true,
      },
      take: 50, // Batch limit to respect API quotas
    })

    let reverifiedCount = 0

    for (const link of expiredLinks) {
      const verification = await verifyYouTubeSubscription({
        accessToken: 'stored-refresh-token',
        creatorChannelId: link.creator.youtubeChannelId || '',
      })

      const newExpiry = new Date()
      newExpiry.setDate(newExpiry.getDate() + 30)

      await prisma.userCreatorLink.update({
        where: { id: link.id },
        data: {
          youtubeSubscriptionVerified: verification.verified,
          youtubeVerifiedAt: verification.verified ? new Date() : link.youtubeVerifiedAt,
          subscriptionCheckExpiresAt: newExpiry,
        },
      })

      reverifiedCount++
    }

    return NextResponse.json({
      success: true,
      processed: expiredLinks.length,
      reverifiedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Cron job failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
