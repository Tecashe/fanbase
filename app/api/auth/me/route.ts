import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'
import { toUserSlug } from '@/lib/slug'

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

    const displayName = authUser.name || authUser.displayName || (authUser.email ? authUser.email.split('@')[0] : 'Fan')
    const userSlug = toUserSlug(displayName, authUser.email || authUser.phone, authUser.id)
    const initials = (displayName || 'Fan')
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'FN'

    // Baseline fan state
    let fanState = {
      id: authUser.id,
      name: displayName,
      slug: userSlug,
      email: authUser.email || '',
      phone: authUser.phone || '',
      initials,
      points: 100,
      rank: 1,
      streak: 1,
      youtubeVerified: false,
      referrals: 0,
      claimedRewardIds: [] as string[],
      unlockedBadgeIds: [] as string[],
    }

    if (process.env.DATABASE_URL) {
      try {
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
          }).catch(() => 0)

          // Count referrals
          const referralCount = await prisma.referral.count({
            where: {
              creatorId: creator.id,
              referrerUserId: authUser.id,
            },
          }).catch(() => 0)

          // Fetch user claimed rewards
          const claims = await prisma.rewardClaim.findMany({
            where: { userId: authUser.id },
            select: { rewardId: true },
          }).catch(() => [])

          // Fetch user unlocked badges
          const badges = await prisma.userBadge.findMany({
            where: { userId: authUser.id },
            select: { badgeId: true },
          }).catch(() => [])

          fanState = {
            id: authUser.id,
            name: displayName,
            slug: userSlug,
            email: authUser.email || '',
            phone: authUser.phone || '',
            initials,
            points: link.pointsBalance,
            rank: higherRankCount + 1,
            streak: link.currentStreak,
            youtubeVerified: link.youtubeSubscriptionVerified,
            referrals: referralCount,
            claimedRewardIds: claims.map((c) => c.rewardId),
            unlockedBadgeIds: badges.map((b) => b.badgeId),
          }
        }
      } catch (dbErr) {
        console.error('[Campfire Auth /me DB Error]:', dbErr)
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: authUser.id,
        slug: userSlug,
        email: authUser.email,
        phone: authUser.phone,
        displayName,
        role: authUser.role || 'user',
      },
      fanState,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch auth state'
    console.error('[Campfire Auth /me Error]:', errorMsg)
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
