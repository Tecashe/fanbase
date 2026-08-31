import { prisma } from './db'

export async function getCreatorBySlug(slug: string) {
  if (process.env.DATABASE_URL) {
    const dbCreator = await prisma.creator.findUnique({
      where: { slug },
    })

    if (dbCreator) {
      return {
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
        primaryColor: dbCreator.brandPrimaryColor,
        secondaryColor: dbCreator.brandSecondaryColor,
        welcomeMessage: dbCreator.welcomeMessage,
        channelUrl: dbCreator.youtubeChannelId
          ? `https://youtube.com/channel/${dbCreator.youtubeChannelId}`
          : 'https://youtube.com',
      }
    }
  }

  return null
}

export async function requireCreatorAccess(creatorIdOrSlug: string) {
  const current = await getCreatorBySlug(creatorIdOrSlug)
  if (!current) throw new Error(`Creator workspace "${creatorIdOrSlug}" not found in database`)
  return current
}

export function resolveTenant(request: Request) {
  return new URL(request.url).pathname.split('/').filter(Boolean)[0] ?? 'mkurugenzi'
}
