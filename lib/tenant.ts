import { creator as mockCreator } from './mock-data'
import { requireCreatorAccess as dbRequireCreatorAccess } from './db'

export async function getCreatorBySlug(slug: string) {
  const dbCreator = await dbRequireCreatorAccess(slug)
  if (dbCreator) {
    return {
      slug: dbCreator.slug,
      displayName: dbCreator.displayName,
      handle: `@${dbCreator.slug}`,
      initials: dbCreator.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      primaryColor: dbCreator.brandPrimaryColor,
      secondaryColor: dbCreator.brandSecondaryColor,
      welcomeMessage: dbCreator.welcomeMessage || mockCreator.welcomeMessage,
      channelUrl: dbCreator.youtubeChannelId
        ? `https://youtube.com/channel/${dbCreator.youtubeChannelId}`
        : mockCreator.channelUrl,
    }
  }

  return slug === mockCreator.slug ? mockCreator : null
}

export async function requireCreatorAccess(creatorIdOrSlug: string) {
  const current = await getCreatorBySlug(creatorIdOrSlug)
  if (!current) throw new Error('Creator workspace not found')
  return current
}

export function resolveTenant(request: Request) {
  return new URL(request.url).pathname.split('/').filter(Boolean)[0] ?? mockCreator.slug
}
