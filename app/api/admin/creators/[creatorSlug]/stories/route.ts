import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ creatorSlug: string }> },
) {
  try {
    const { creatorSlug } = await params

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: true, stories: [] })
    }

    const creator = await prisma.creator.findUnique({
      where: { slug: creatorSlug },
    })

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    const stories = await prisma.story.findMany({
      where: { creatorId: creator.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { quizzes: true, views: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      stories: stories.map((s) => ({
        id: s.id,
        title: s.title,
        youtubeVideoId: s.youtubeVideoId,
        description: s.description,
        airedDate: s.airedDate ? s.airedDate.toISOString().split('T')[0] : '',
        transcriptOrNotes: s.transcriptOrNotes,
        quizzesCount: s._count.quizzes,
        viewsCount: s._count.views,
        createdAt: s.createdAt,
      })),
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch stories'
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
    const { title, youtubeVideoId, description, airedDate, transcriptOrNotes } = body

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

    const story = await prisma.story.create({
      data: {
        creatorId: creator.id,
        title,
        youtubeVideoId: youtubeVideoId || null,
        description: description || null,
        airedDate: airedDate ? new Date(airedDate) : new Date(),
        transcriptOrNotes: transcriptOrNotes || null,
      },
    })

    return NextResponse.json({
      success: true,
      story,
      message: 'Story added to library successfully!',
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create story'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
