import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rewardId, payoutMethod, payoutAccount, creatorSlug } = await request.json()

    if (!rewardId || !payoutMethod || !payoutAccount) {
      return NextResponse.json(
        { error: 'Reward ID, payout method (e.g. M-Pesa / PayPal), and payout account number/email are required' },
        { status: 400 },
      )
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 })
    }

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    })

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }

    const creator = await prisma.creator.findUnique({
      where: { slug: creatorSlug || 'mkurugenzi' },
    })

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Check user points
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
        { error: `Insufficient points to claim this payout. Required: ${pointsRequired}` },
        { status: 400 },
      )
    }

    // Create payout claim in transaction
    const claim = await prisma.$transaction(async (tx) => {
      await tx.userCreatorLink.update({
        where: { id: link.id },
        data: {
          pointsBalance: { decrement: pointsRequired },
        },
      })

      return tx.rewardClaim.create({
        data: {
          rewardId: reward.id,
          userId: authUser.id,
          fulfillmentStatus: 'pending',
          cashValue: reward.cashValue || 0,
          currency: reward.currency || 'KES',
          payoutMethod,
          payoutAccount,
        },
      })
    })

    return NextResponse.json({
      success: true,
      claim,
      message: `🎉 Cash prize claim submitted! Payout of ${reward.currency} ${reward.cashValue || ''} will be disbursed to ${payoutAccount}.`,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Payout claim failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
