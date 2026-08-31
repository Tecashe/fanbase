import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { storyId, creatorSlug } = await request.json()
    const authUser = await getAuthUser()

    if (!storyId) {
      return NextResponse.json({ error: 'storyId is required' }, { status: 400 })
    }

    if (authUser && process.env.DATABASE_URL) {
      const creator = await prisma.creator.findUnique({
        where: { slug: creatorSlug || 'mkurugenzi' },
      })

      if (creator) {
        await prisma.storyView.upsert({
          where: {
            storyId_userId: {
              storyId,
              userId: authUser.id,
            },
          },
          update: {
            watchedConfirmation: true,
            confirmedAt: new Date(),
          },
          create: {
            storyId,
            userId: authUser.id,
            creatorId: creator.id,
            watchedConfirmation: true,
            confirmedAt: new Date(),
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Episode watch verified. Quest unlocked!',
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Watch confirmation failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
