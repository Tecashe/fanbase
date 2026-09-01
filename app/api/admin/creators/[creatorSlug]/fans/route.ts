import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ creatorSlug: string }> },
) {
  try {
    const { creatorSlug } = await params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'all' // 'all' | 'top100' | 'highStreak' | 'inactive'

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: true, fans: [] })
    }

    const creator = await prisma.creator.findUnique({
      where: { slug: creatorSlug },
    })

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Build where clause
    const whereClause: any = {
      creatorId: creator.id,
    }

    if (search) {
      whereClause.user = {
        OR: [
          { displayName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      }
    }

    if (filter === 'highStreak') {
      whereClause.currentStreak = { gte: 7 }
    } else if (filter === 'inactive') {
      const fourteenDaysAgo = new Date()
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
      whereClause.lastActiveAt = { lte: fourteenDaysAgo }
    }

    const links = await prisma.userCreatorLink.findMany({
      where: whereClause,
      orderBy: { pointsBalance: 'desc' },
      take: filter === 'top100' ? 100 : 200,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            createdAt: true,
            attempts: {
              where: { creatorId: creator.id },
              select: { id: true, score: true, pointsEarned: true, startedAt: true },
            },
            claims: {
              where: { reward: { creatorId: creator.id } },
              select: { id: true, fulfillmentStatus: true, claimedAt: true },
            },
            badges: {
              select: { id: true, badgeId: true, awardedAt: true },
            },
          },
        },
      },
    })

    // Count referrals for each fan
    const referralCounts = await prisma.referral.groupBy({
      by: ['referrerUserId'],
      where: { creatorId: creator.id },
      _count: { id: true },
    })
    const refMap = new Map(referralCounts.map((r) => [r.referrerUserId, r._count.id]))

    return NextResponse.json({
      success: true,
      fans: links.map((link, index) => {
        const name =
          link.user.displayName ||
          (link.user.email ? link.user.email.split('@')[0] : link.user.phone || 'Superfan')

        return {
          id: link.user.id,
          rank: index + 1,
          name,
          email: link.user.email || '',
          phone: link.user.phone || '',
          avatarUrl: link.user.avatarUrl,
          points: link.pointsBalance,
          streak: link.currentStreak,
          longestStreak: link.longestStreak,
          youtubeVerified: link.youtubeSubscriptionVerified,
          joinedAt: link.joinedAt ? link.joinedAt.toISOString().split('T')[0] : '',
          lastActiveAt: link.lastActiveAt ? link.lastActiveAt.toISOString().split('T')[0] : 'Today',
          referralsCount: refMap.get(link.userId) || 0,
          attemptsCount: link.user.attempts.length,
          claimsCount: link.user.claims.length,
          badgesCount: link.user.badges.length,
        }
      }),
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch fan directory'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
