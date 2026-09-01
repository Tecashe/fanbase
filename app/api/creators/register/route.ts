import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      displayName,
      slug: rawSlug,
      youtubeChannelId,
      brandPrimaryColor = '#d11149',
      brandSecondaryColor = '#0a0a0d',
      welcomeMessage = 'Welcome to our official fan circle! Answer questions, climb the standings, and unlock rewards.',
    } = body

    if (!displayName || !displayName.trim()) {
      return NextResponse.json({ error: 'Creator / Channel name is required' }, { status: 400 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 })
    }

    // Generate url-safe slug
    const cleanSlug = (rawSlug || displayName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `creator-${Date.now()}`

    // Check if slug exists
    const existing = await prisma.creator.findUnique({
      where: { slug: cleanSlug },
    })

    if (existing) {
      return NextResponse.json(
        { error: `The slug "${cleanSlug}" is already taken. Please choose a different handle.` },
        { status: 409 },
      )
    }

    // Create the new Creator Workspace in Neon DB
    const creator = await prisma.creator.create({
      data: {
        slug: cleanSlug,
        displayName: displayName.trim(),
        youtubeChannelId: youtubeChannelId?.trim() || null,
        brandPrimaryColor: brandPrimaryColor || '#d11149',
        brandSecondaryColor: brandSecondaryColor || '#0a0a0d',
        welcomeMessage: welcomeMessage.trim(),
        rewardProgramType: 'weekly',
        status: 'active',
        planTier: 'creator_pro',
      },
    })

    return NextResponse.json({
      success: true,
      creator: {
        id: creator.id,
        slug: creator.slug,
        displayName: creator.displayName,
      },
      message: `Workspace for "${creator.displayName}" registered successfully!`,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to register creator'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
