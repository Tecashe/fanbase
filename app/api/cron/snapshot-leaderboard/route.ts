import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Scheduled Cron Handler:
 * Pre-computes leaderboard rankings into LeaderboardSnapshot table for fast queries.
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
        message: 'No DATABASE_URL configured. Mock snapshot skipped.',
      })
    }

    const creators = await prisma.creator.findMany({
      where: { status: 'active' },
    })

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - 7)

    let totalSnapshotsCreated = 0

    for (const creator of creators) {
      // Fetch top users by points balance
      const topLinks = await prisma.userCreatorLink.findMany({
        where: { creatorId: creator.id },
        orderBy: { pointsBalance: 'desc' },
        take: 100,
        include: { user: true },
      })

      // Write snapshot records
      for (let i = 0; i < topLinks.length; i++) {
        const link = topLinks[i]
        await prisma.leaderboardSnapshot.create({
          data: {
            creatorId: creator.id,
            periodType: 'weekly',
            periodStart: weekStart,
            periodEnd: now,
            userId: link.userId,
            rank: i + 1,
            points: link.pointsBalance,
          },
        })
        totalSnapshotsCreated++
      }
    }

    return NextResponse.json({
      success: true,
      creatorsProcessed: creators.length,
      snapshotsCreated: totalSnapshotsCreated,
      timestamp: new Date().toISOString(),
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Leaderboard snapshot cron failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
