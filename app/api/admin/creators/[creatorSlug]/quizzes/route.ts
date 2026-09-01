import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ creatorSlug: string }> },
) {
  try {
    const { creatorSlug } = await params

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: true, quizzes: [] })
    }

    const creator = await prisma.creator.findUnique({
      where: { slug: creatorSlug },
    })

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    const quizzes = await prisma.quiz.findMany({
      where: { creatorId: creator.id },
      orderBy: { createdAt: 'desc' },
      include: {
        story: {
          select: { id: true, title: true, youtubeVideoId: true },
        },
        questions: {
          orderBy: { questionOrder: 'asc' },
          include: { options: true },
        },
        _count: {
          select: { attempts: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      quizzes: quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        quizType: q.quizType,
        pointsValue: q.pointsValue,
        isActive: q.isActive,
        requiresWatchConfirmation: q.requiresWatchConfirmation,
        availableFrom: q.availableFrom,
        availableUntil: q.availableUntil,
        story: q.story,
        questionsCount: q.questions.length,
        attemptsCount: q._count.attempts,
        questions: q.questions.map((ques) => ({
          id: ques.id,
          questionText: ques.questionText,
          pointsValue: ques.pointsValue,
          options: ques.options.map((opt) => ({
            id: opt.id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
          })),
        })),
        createdAt: q.createdAt,
      })),
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch quizzes'
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
      title,
      storyId,
      quizType = 'story_recall',
      pointsValue = 250,
      requiresWatchConfirmation = false,
      availableFrom,
      availableUntil,
      questions = [],
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Quiz title is required' }, { status: 400 })
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

    // Create quiz with inline questions & answer options in a transaction
    const quiz = await prisma.quiz.create({
      data: {
        creatorId: creator.id,
        storyId: storyId || null,
        title,
        quizType,
        pointsValue: Number(pointsValue) || 250,
        requiresWatchConfirmation: Boolean(requiresWatchConfirmation),
        availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
        availableUntil: availableUntil ? new Date(availableUntil) : null,
        isActive: true,
        questions: {
          create: questions.map((q: any, qIdx: number) => ({
            questionText: q.questionText || q.text || `Question ${qIdx + 1}`,
            questionOrder: qIdx + 1,
            pointsValue: Number(q.pointsValue || q.points || 50),
            options: {
              create: (q.options || []).map((opt: any, optIdx: number) => {
                const isTextOnly = typeof opt === 'string'
                return {
                  optionText: isTextOnly ? opt : opt.optionText || opt.text,
                  isCorrect: isTextOnly
                    ? optIdx === (q.answer ?? q.correctIndex ?? 0)
                    : Boolean(opt.isCorrect),
                }
              }),
            },
          })),
        },
      },
      include: {
        questions: {
          include: { options: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      quiz,
      message: `Quiz "${quiz.title}" with ${quiz.questions.length} questions created successfully!`,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create quiz'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
