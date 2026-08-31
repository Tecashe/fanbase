import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ creatorSlug: string }> },
) {
  try {
    const { creatorSlug } = await params
    const {
      title,
      storyId,
      quizType,
      pointsValue,
      requiresWatchConfirmation,
      questions,
    } = await request.json()

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Title and at least one question are required' },
        { status: 400 },
      )
    }

    let createdQuiz = null

    if (process.env.DATABASE_URL) {
      const creator = await prisma.creator.findUnique({
        where: { slug: creatorSlug },
      })

      if (!creator) {
        return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
      }

      createdQuiz = await prisma.quiz.create({
        data: {
          creatorId: creator.id,
          storyId: storyId || null,
          title,
          quizType: quizType || 'story_recall',
          pointsValue: pointsValue || 250,
          requiresWatchConfirmation: !!requiresWatchConfirmation,
          questions: {
            create: questions.map((q: any, idx: number) => ({
              questionText: q.questionText,
              questionOrder: idx + 1,
              pointsValue: q.pointsValue || 50,
              options: {
                create: q.options.map((opt: any) => ({
                  optionText: opt.optionText,
                  isCorrect: !!opt.isCorrect,
                })),
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
    } else {
      createdQuiz = {
        id: 'quiz_' + Date.now(),
        title,
        quizType,
        pointsValue,
        questions,
      }
    }

    return NextResponse.json({ success: true, quiz: createdQuiz })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create quiz'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
