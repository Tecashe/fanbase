import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
