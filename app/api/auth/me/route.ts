import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'
import { fan } from '@/lib/mock-data'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const creatorSlug = searchParams.get('creatorSlug')

    const authUser = await getAuthUser()

    if (!authUser) {
      // Return guest / mock state for effortless local testing
      return NextResponse.json({
        authenticated: false,
        user: null,
        fanState: fan,
      })
    }

    let linkData = null
    if (creatorSlug && process.env.DATABASE_URL) {
      const creator = await prisma.creator.findUnique({
        where: { slug: creatorSlug },
      })
      if (creator) {
        linkData = await prisma.userCreatorLink.findUnique({
          where: {
            userId_creatorId: {
              userId: authUser.id,
              creatorId: creator.id,
            },
          },
        })
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
      fanState: linkData
        ? {
            name: authUser.name,
            initials: authUser.name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
            points: linkData.pointsBalance,
            rank: 14,
            streak: linkData.currentStreak,
            youtubeVerified: linkData.youtubeSubscriptionVerified,
            referrals: 3,
          }
        : fan,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch auth state'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
