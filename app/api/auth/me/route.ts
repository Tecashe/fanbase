import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const creatorSlug = searchParams.get('creatorSlug') || 'mkurugenzi'

    const authUser = await getAuthUser()

    // STRICT SECURITY: If not authenticated, return pure unauthenticated state
    if (!authUser) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        fanState: null,
      })
    }

    // Retrieve real database link for this user and creator
    let fanState = {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      initials: authUser.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      points: 0,
      rank: 0,
      streak: 0,
      youtubeVerified: false,
      referrals: 0,
      claimedRewardIds: [] as string[],
      unlockedBadgeIds: [] as string[],
    }

    if (process.env.DATABASE_URL) {
      const creator = await prisma.creator.findUnique({
        where: { slug: creatorSlug },
      })

      if (creator) {
        // Fetch or create user-creator link
        let link = await prisma.userCreatorLink.findUnique({
          where: {
            userId_creatorId: {
              userId: authUser.id,
              creatorId: creator.id,
            },
          },
        })

        if (!link) {
          link = await prisma.userCreatorLink.create({
            data: {
              userId: authUser.id,
              creatorId: creator.id,
              pointsBalance: 100, // 100 welcome bonus points
              currentStreak: 1,
              longestStreak: 1,
            },
          })
        }

        // Calculate real rank
        const higherRankCount = await prisma.userCreatorLink.count({
          where: {
            creatorId: creator.id,
            pointsBalance: { gt: link.pointsBalance },
          },
        })

        // Count referrals
        const referralCount = await prisma.referral.count({
          where: {
            creatorId: creator.id,
            referrerUserId: authUser.id,
          },
        })

        // Fetch user claimed rewards
        const claims = await prisma.rewardClaim.findMany({
          where: { userId: authUser.id },
          select: { rewardId: true },
        })

        // Fetch user unlocked badges
        const badges = await prisma.userBadge.findMany({
          where: { userId: authUser.id },
          select: { badgeId: true },
        })

        fanState = {
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          initials: authUser.name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
          points: link.pointsBalance,
          rank: higherRankCount + 1,
          streak: link.currentStreak,
          youtubeVerified: link.youtubeSubscriptionVerified,
          referrals: referralCount,
          claimedRewardIds: claims.map((c) => c.rewardId),
          unlockedBadgeIds: badges.map((b) => b.badgeId),
        }
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: authUser.id,
        email: authUser.email,
        displayName: authUser.name,
        role: authUser.role,
      },
      fanState,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch auth state'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
