import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/custom-auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ creatorSlug: string }> },
) {
  try {
    const { creatorSlug } = await params
    const authUser = await getAuthUser()

    const { title, youtubeVideoId, description, transcriptOrNotes, airedDate } =
      await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    let story = null

    if (process.env.DATABASE_URL) {
      const creator = await prisma.creator.findUnique({
        where: { slug: creatorSlug },
      })

      if (!creator) {
        return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
      }

      story = await prisma.story.create({
        data: {
          creatorId: creator.id,
          title,
          youtubeVideoId: youtubeVideoId || null,
          description: description || null,
          transcriptOrNotes: transcriptOrNotes || null,
          airedDate: airedDate ? new Date(airedDate) : new Date(),
        },
      })
    } else {
      story = {
        id: 'story_' + Date.now(),
        title,
        youtubeVideoId,
        description,
        transcriptOrNotes,
        airedDate: new Date(),
      }
    }

    return NextResponse.json({ success: true, story })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create story'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
