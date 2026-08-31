import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/custom-auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ creatorSlug: string }> },
) {
  try {
    const { creatorSlug } = await params
    const authUser = await getAuthUser()

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ leaderboard: [] })
    }

    const creator = await prisma.creator.findUnique({
      where: { slug: creatorSlug },
    })

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Fetch top 50 fans by points balance
    const topLinks = await prisma.userCreatorLink.findMany({
      where: { creatorId: creator.id },
      orderBy: { pointsBalance: 'desc' },
      take: 50,
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

    const leaderboard = topLinks.map((link, index) => {
      const name = link.user.displayName || link.user.email.split('@')[0]
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

      return {
        rank: index + 1,
        name,
        initials,
        points: link.pointsBalance,
        streak: link.currentStreak,
        me: authUser ? link.userId === authUser.id : false,
      }
    })

    return NextResponse.json({
      success: true,
      leaderboard,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch leaderboard'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
