import CampfireApp from '@/components/campfire-app'
import { requireCreatorAccess } from '@/lib/db'
import { creator as mockCreator } from '@/lib/mock-data'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ creatorSlug: string }>
}) {
  const { creatorSlug } = await params
  const dbCreator = await requireCreatorAccess(creatorSlug)
  const name = dbCreator?.displayName || mockCreator.displayName

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
  const dbCreator = await requireCreatorAccess(creatorSlug)

  const initialCreator = dbCreator
    ? {
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
        welcomeMessage: dbCreator.welcomeMessage || mockCreator.welcomeMessage,
        channelUrl: dbCreator.youtubeChannelId
          ? `https://youtube.com/channel/${dbCreator.youtubeChannelId}`
          : 'https://youtube.com',
      }
    : mockCreator

  return <CampfireApp initialCreator={initialCreator} />
}
