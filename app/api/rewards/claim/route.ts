import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Please sign in to claim rewards' }, { status: 401 })
    }

    const { rewardId, creatorSlug } = await request.json()

    if (!rewardId) {
      return NextResponse.json({ error: 'rewardId is required' }, { status: 400 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    })

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }

    const creator = creatorSlug
      ? await prisma.creator.findUnique({ where: { slug: creatorSlug } })
      : await prisma.creator.findFirst()

    if (!creator) {
      return NextResponse.json({ error: 'Creator workspace not found' }, { status: 404 })
    }

    // Check user points balance
    const link = await prisma.userCreatorLink.findUnique({
      where: {
        userId_creatorId: {
          userId: authUser.id,
          creatorId: creator.id,
        },
      },
    })

    const pointsRequired = reward.pointsRequired || 0

    if (!link || link.pointsBalance < pointsRequired) {
      return NextResponse.json(
        {
          error: `You need ${pointsRequired - (link?.pointsBalance || 0)} more points to claim this perk.`,
        },
        { status: 400 },
      )
    }

    // Check if already claimed
    const existingClaim = await prisma.rewardClaim.findFirst({
      where: {
        rewardId: reward.id,
        userId: authUser.id,
      },
    })

    if (existingClaim) {
      return NextResponse.json(
        { error: 'You have already unlocked this perk.' },
        { status: 400 },
      )
    }

    // Atomically create claim and deduct points
    await prisma.$transaction([
      prisma.rewardClaim.create({
        data: {
          rewardId: reward.id,
          userId: authUser.id,
          fulfillmentStatus: 'pending',
        },
      }),
      prisma.userCreatorLink.update({
        where: { id: link.id },
        data: {
          pointsBalance: { decrement: pointsRequired },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: `Reward "${reward.title}" unlocked successfully!`,
      newBalance: link.pointsBalance - pointsRequired,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Claim failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
