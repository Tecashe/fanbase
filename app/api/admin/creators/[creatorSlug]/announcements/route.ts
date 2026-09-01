import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ creatorSlug: string }> },
) {
  try {
    const { creatorSlug } = await params

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: true, announcements: [] })
    }

    const creator = await prisma.creator.findUnique({
      where: { slug: creatorSlug },
    })

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    const logs = await prisma.notificationLog.findMany({
      where: {
        creatorId: creator.id,
        type: 'announcement',
      },
      orderBy: { sentAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      success: true,
      announcements: logs.map((log) => ({
        id: log.id,
        title: log.type,
        sentAt: log.sentAt.toISOString(),
      })),
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch announcements'
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
    const { title, message, priority = 'general', linkUrl } = body

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
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

    // Log announcement to NotificationLog
    const announcement = await prisma.notificationLog.create({
      data: {
        creatorId: creator.id,
        userId: creator.id, // Broadcast type
        type: 'announcement',
        sentAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      announcement,
      message: 'Announcement broadcasted to fan feed successfully!',
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to publish announcement'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
