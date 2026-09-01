import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const creatorSlug = searchParams.get('creatorSlug') || 'mkurugenzi'

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: true, claims: [] })
    }

    const creator = await prisma.creator.findUnique({
      where: { slug: creatorSlug },
    })

    if (!creator) {
      return NextResponse.json({ success: true, claims: [] })
    }

    const claims = await prisma.rewardClaim.findMany({
      where: {
        reward: { creatorId: creator.id },
      },
      include: {
        user: { select: { displayName: true, email: true, phone: true } },
        reward: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      claims: claims.map((c) => ({
        id: c.id,
        userName: c.user.displayName || (c.user.email ? c.user.email.split('@')[0] : c.user.phone || 'Superfan Winner'),
        rewardTitle: c.reward.title,
        cashValue: c.reward.cashValue || 0,
        currency: c.reward.currency || 'KES',
        payoutMethod: c.payoutMethod || 'M-Pesa',
        payoutAccount: c.payoutPhone || c.payoutEmail || (c.user.phone || 'Verified Account'),
        status: c.fulfillmentStatus || 'pending',
        claimedAt: new Date(c.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        payoutReference: c.payoutReference,
      })),
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch payout claims'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { claimId, payoutReference, status = 'fulfilled' } = await request.json()

    if (!claimId) {
      return NextResponse.json({ error: 'claimId is required' }, { status: 400 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 })
    }

    const updatedClaim = await prisma.rewardClaim.update({
      where: { id: claimId },
      data: {
        fulfillmentStatus: status === 'fulfilled' ? 'fulfilled' : 'processing',
        payoutReference: payoutReference || `REF-${Date.now()}`,
        paidAt: status === 'fulfilled' ? new Date() : null,
      },
      include: {
        user: { select: { displayName: true, email: true } },
        reward: true,
      },
    })

    return NextResponse.json({
      success: true,
      claim: updatedClaim,
      message: `Payout marked as ${status}. Reference: ${updatedClaim.payoutReference}`,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Payout update failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
