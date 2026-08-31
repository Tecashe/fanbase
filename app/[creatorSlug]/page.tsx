import CampfireApp from '@/components/campfire-app'
import { prisma } from '@/lib/db'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ creatorSlug: string }>
}) {
  const { creatorSlug } = await params
  let name = 'Mkurugenzi'

  if (process.env.DATABASE_URL) {
    const creator = await prisma.creator.findUnique({
      where: { slug: creatorSlug },
    })
    if (creator) name = creator.displayName
  }

  return {
    title: `${name} — Campfire Fan Club & Quests`,
    description: `Official fan club for ${name}. Take weekly episode recall quizzes, climb the ranks, and win rewards.`,
  }
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ creatorSlug: string }>
}) {
  const { creatorSlug } = await params
  let initialCreator = undefined

  if (process.env.DATABASE_URL) {
    const dbCreator = await prisma.creator.findUnique({
      where: { slug: creatorSlug },
    })

    if (dbCreator) {
      initialCreator = {
        id: dbCreator.id,
        slug: dbCreator.slug,
        displayName: dbCreator.displayName,
        handle: `@${dbCreator.slug}`,
        initials: dbCreator.displayName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        primaryColor: dbCreator.brandPrimaryColor || '#d11149',
        secondaryColor: dbCreator.brandSecondaryColor || '#0a0a0d',
        welcomeMessage: dbCreator.welcomeMessage,
        youtubeChannelId: dbCreator.youtubeChannelId,
        channelUrl: dbCreator.youtubeChannelId
          ? `https://youtube.com/channel/${dbCreator.youtubeChannelId}`
          : 'https://youtube.com',
      }
    }
  }

  return <CampfireApp initialCreator={initialCreator} />
}
