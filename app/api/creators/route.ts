import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: true, creators: [] })
    }

    const whereClause: any = {
      status: 'active',
    }

    if (search) {
      whereClause.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    const creators = await prisma.creator.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            links: true,
            quizzes: { where: { isActive: true } },
            rewards: { where: { status: 'active' } },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      creators: creators.map((c) => ({
        id: c.id,
        slug: c.slug,
        displayName: c.displayName,
        handle: `@${c.slug}`,
        initials: c.displayName
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'CR',
        brandPrimaryColor: c.brandPrimaryColor || '#d11149',
        brandSecondaryColor: c.brandSecondaryColor || '#0a0a0d',
        welcomeMessage: c.welcomeMessage,
        youtubeChannelId: c.youtubeChannelId,
        channelUrl: c.youtubeChannelId
          ? `https://youtube.com/channel/${c.youtubeChannelId}`
          : 'https://youtube.com',
        stats: {
          totalFans: c._count.links,
          totalQuizzes: c._count.quizzes,
          totalRewards: c._count.rewards,
        },
      })),
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch creators'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
