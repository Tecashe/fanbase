import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { quizId, answers, timeTakenSeconds, creatorSlug } = await request.json()
    const authUser = await getAuthUser()
    const userId = authUser?.id || 'guest_fan'

    let score = 0
    let pointsEarned = 0
    let streakCount = 1

    if (process.env.DATABASE_URL && quizId) {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            include: { options: true },
          },
          story: true,
        },
      })

      if (quiz) {
        // Enforce watch-to-unlock if enabled
        if (quiz.requiresWatchConfirmation && authUser) {
          const watchRecord = await prisma.storyView.findUnique({
            where: {
              storyId_userId: {
                storyId: quiz.storyId || '',
                userId: authUser.id,
              },
            },
          })
          if (!watchRecord || !watchRecord.watchedConfirmation) {
            return NextResponse.json(
              { error: 'Please confirm you watched the episode video before submitting the quiz.' },
              { status: 403 },
            )
          }
        }

        // Server-side scoring calculation
        let correctCount = 0
        const totalQuestions = quiz.questions.length

        for (const q of quiz.questions) {
          const selectedOptionId = answers?.[q.id]
          const correctOption = q.options.find((opt) => opt.isCorrect)
          if (correctOption && selectedOptionId === correctOption.id) {
            correctCount++
          }
        }

        pointsEarned = Math.round((correctCount / (totalQuestions || 1)) * quiz.pointsValue)
        score = pointsEarned

        // Record attempt
        if (authUser) {
          await prisma.quizAttempt.upsert({
            where: {
              quizId_userId: {
                quizId: quiz.id,
                userId: authUser.id,
              },
            },
            update: {
              score,
              timeTakenSeconds: timeTakenSeconds || 60,
              pointsEarned,
              completedAt: new Date(),
            },
            create: {
              quizId: quiz.id,
              userId: authUser.id,
              creatorId: quiz.creatorId,
              score,
              timeTakenSeconds: timeTakenSeconds || 60,
              pointsEarned,
              completedAt: new Date(),
            },
          })

          // Update user-creator link balance & streak
          const link = await prisma.userCreatorLink.upsert({
            where: {
              userId_creatorId: {
                userId: authUser.id,
                creatorId: quiz.creatorId,
              },
            },
            update: {
              pointsBalance: { increment: pointsEarned },
              currentStreak: { increment: 1 },
              lastActiveAt: new Date(),
            },
            create: {
              userId: authUser.id,
              creatorId: quiz.creatorId,
              pointsBalance: pointsEarned + 100,
              currentStreak: 1,
              longestStreak: 1,
            },
          })

          streakCount = link.currentStreak
        }
      }
    } else {
      // Mock calculation fallback
      pointsEarned = 250
      score = 250
    }

    return NextResponse.json({
      success: true,
      score,
      pointsEarned,
      streak: streakCount,
      message: `Quest complete! +${pointsEarned} points awarded.`,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Submission failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
