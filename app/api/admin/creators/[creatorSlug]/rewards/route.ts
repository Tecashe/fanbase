import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ creatorSlug: string }> },
) {
  try {
    const { creatorSlug } = await params

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: true, rewards: [] })
    }

    const creator = await prisma.creator.findUnique({
      where: { slug: creatorSlug },
    })

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    const rewards = await prisma.reward.findMany({
      where: { creatorId: creator.id },
      orderBy: { pointsRequired: 'asc' },
      include: {
        _count: {
          select: { claims: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      rewards: rewards.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        rewardType: r.rewardType,
        pointsRequired: r.pointsRequired,
        rankRequired: r.rankRequired,
        cashValue: r.cashValue,
        currency: r.currency,
        quantityAvailable: r.quantityAvailable,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        status: r.status,
        claimsCount: r._count.claims,
      })),
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch rewards'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ creatorSlug: string }> },
) {
  try {
    const { creatorSlug } = await params
    const body = await request.json()
    const {
      title,
      description,
      rewardType = 'weekly',
      pointsRequired,
      rankRequired,
      cashValue,
      currency = 'KES',
      quantityAvailable,
      periodEnd,
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 })
    }

    const creator = await prisma.creator.findUnique({
      where: { slug: creatorSlug },
    })

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    const defaultPeriodEnd = new Date()
    defaultPeriodEnd.setDate(defaultPeriodEnd.getDate() + 7)

    const reward = await prisma.reward.create({
      data: {
        creatorId: creator.id,
        title,
        description: description || null,
        rewardType,
        pointsRequired: pointsRequired ? Number(pointsRequired) : null,
        rankRequired: rankRequired ? Number(rankRequired) : null,
        cashValue: cashValue ? Number(cashValue) : null,
        currency: currency || 'KES',
        quantityAvailable: quantityAvailable ? Number(quantityAvailable) : null,
        periodStart: new Date(),
        periodEnd: periodEnd ? new Date(periodEnd) : defaultPeriodEnd,
        status: 'active',
      },
    })

    return NextResponse.json({
      success: true,
      reward,
      message: `Reward perk "${reward.title}" published successfully!`,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create reward'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
