import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ creatorSlug: string }> },
) {
  try {
    const { creatorSlug } = await params

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 })
    }

    const creator = await prisma.creator.findUnique({
      where: { slug: creatorSlug },
      include: {
        stories: {
          orderBy: { createdAt: 'desc' },
        },
        quizzes: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          include: {
            questions: {
              orderBy: { questionOrder: 'asc' },
              include: {
                options: true,
              },
            },
            story: true,
          },
        },
        rewards: {
          where: { status: 'active' },
          orderBy: { pointsRequired: 'asc' },
        },
        badges: true,
        _count: {
          select: {
            links: true,
            attempts: true,
            rewards: true,
          },
        },
      },
    })

    if (!creator) {
      return NextResponse.json({ error: 'Creator workspace not found' }, { status: 404 })
    }

    return NextResponse.json({
      creator: {
        id: creator.id,
        slug: creator.slug,
        displayName: creator.displayName,
        handle: `@${creator.slug}`,
        initials: creator.displayName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        primaryColor: creator.brandPrimaryColor,
        secondaryColor: creator.brandSecondaryColor,
        welcomeMessage: creator.welcomeMessage,
        youtubeChannelId: creator.youtubeChannelId,
        channelUrl: creator.youtubeChannelId
          ? `https://youtube.com/channel/${creator.youtubeChannelId}`
          : 'https://youtube.com',
        stats: {
          totalFans: creator._count.links,
          totalQuizzes: creator._count.attempts,
        },
      },
      stories: creator.stories,
      quizzes: creator.quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        subtitle: q.story ? q.story.title : 'Official Lore Quest',
        points: q.pointsValue,
        duration: '2 min',
        status: q.requiresWatchConfirmation ? 'Watch to Unlock' : 'Active',
        requiresWatchConfirmation: q.requiresWatchConfirmation,
        questions: q.questions.map((ques) => ({
          id: ques.id,
          text: ques.questionText,
          points: ques.pointsValue,
          options: ques.options.map((opt) => opt.optionText),
          answer: ques.options.findIndex((opt) => opt.isCorrect),
        })),
      })),
      rewards: creator.rewards.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        points: `${r.pointsRequired?.toLocaleString() || 2500} PTS`,
        pointsValue: r.pointsRequired || 2500,
        meta: r.rewardType.toUpperCase(),
        icon: r.rewardType === 'weekly' ? '🎬' : r.rewardType === 'monthly' ? '🎧' : '✦',
      })),
      badges: creator.badges.map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description,
        icon: b.iconUrl || '🔥',
        criteria: b.criteriaType,
      })),
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch creator data'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
