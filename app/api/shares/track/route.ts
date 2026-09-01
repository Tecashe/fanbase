import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { sharePlatform, quizAttemptId, creatorSlug } = await request.json()
    const authUser = await getAuthUser()

    if (authUser && process.env.DATABASE_URL) {
      const creator = creatorSlug
        ? await prisma.creator.findUnique({ where: { slug: creatorSlug } })
        : await prisma.creator.findFirst()

      if (creator) {
        await prisma.shareEvent.create({
          data: {
            creatorId: creator.id,
            userId: authUser.id,
            quizAttemptId: quizAttemptId || null,
            sharePlatform: sharePlatform || 'whatsapp',
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Share event tracked for creator reach analytics.',
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Share tracking failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
