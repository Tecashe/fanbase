import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ creatorSlug: string }> },
) {
  try {
    const { creatorSlug } = await params

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 })
    }

    const creator = await prisma.creator.findUnique({
      where: { slug: creatorSlug },
    })

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Real aggregate metrics
    const totalFans = await prisma.userCreatorLink.count({
      where: { creatorId: creator.id },
    })

    const verifiedFans = await prisma.userCreatorLink.count({
      where: {
        creatorId: creator.id,
        youtubeSubscriptionVerified: true,
      },
    })

    const totalAttempts = await prisma.quizAttempt.count({
      where: { creatorId: creator.id },
    })

    const pointsSum = await prisma.quizAttempt.aggregate({
      where: { creatorId: creator.id },
      _sum: { pointsEarned: true },
    })

    const totalShares = await prisma.shareEvent.count({
      where: { creatorId: creator.id },
    })

    // Superfans CRM list
    const superfans = await prisma.userCreatorLink.findMany({
      where: { creatorId: creator.id },
      orderBy: { pointsBalance: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      analytics: {
        totalFans: totalFans.toLocaleString(),
        verifiedFans: verifiedFans.toLocaleString(),
        totalAttempts: totalAttempts.toLocaleString(),
        pointsDistributed: (pointsSum._sum.pointsEarned || 0).toLocaleString(),
        totalShares: totalShares.toLocaleString(),
        completionRate: totalFans > 0 ? `${Math.round((totalAttempts / (totalFans * 2 || 1)) * 100)}%` : '0%',
      },
      superfans: superfans.map((sf) => ({
        id: sf.userId,
        name: sf.user.displayName || sf.user.email.split('@')[0],
        points: sf.pointsBalance,
        streak: sf.currentStreak,
        verified: sf.youtubeSubscriptionVerified,
        lastActive: sf.lastActiveAt ? new Date(sf.lastActiveAt).toLocaleDateString() : 'Recent',
      })),
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Analytics fetch failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
