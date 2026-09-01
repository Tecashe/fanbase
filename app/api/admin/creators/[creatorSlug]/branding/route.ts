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

    return NextResponse.json({
      success: true,
      branding: {
        id: creator.id,
        slug: creator.slug,
        displayName: creator.displayName,
        logoUrl: creator.logoUrl,
        brandPrimaryColor: creator.brandPrimaryColor,
        brandSecondaryColor: creator.brandSecondaryColor,
        welcomeMessage: creator.welcomeMessage,
        youtubeChannelId: creator.youtubeChannelId,
        rewardProgramType: creator.rewardProgramType,
      },
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch branding'
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
      displayName,
      logoUrl,
      brandPrimaryColor,
      brandSecondaryColor,
      welcomeMessage,
      youtubeChannelId,
      rewardProgramType,
    } = body

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 })
    }

    const updatedCreator = await prisma.creator.update({
      where: { slug: creatorSlug },
      data: {
        displayName: displayName || undefined,
        logoUrl: logoUrl || undefined,
        brandPrimaryColor: brandPrimaryColor || undefined,
        brandSecondaryColor: brandSecondaryColor || undefined,
        welcomeMessage: welcomeMessage || undefined,
        youtubeChannelId: youtubeChannelId || undefined,
        rewardProgramType: rewardProgramType || undefined,
      },
    })

    return NextResponse.json({
      success: true,
      creator: updatedCreator,
      message: 'Branding and workspace profile saved to database!',
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update branding'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
