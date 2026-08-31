import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const db = prisma

export type CreatorScopedQuery<T> = {
  creatorSlug: string
  execute: () => Promise<T>
}

export function creatorScopedQuery<T>(
  creatorSlug: string,
  execute: () => Promise<T>,
): CreatorScopedQuery<T> {
  return { creatorSlug, execute }
}

/**
 * Scopes queries strictly by creator_id / slug to prevent multi-tenant data leakage.
 */
export async function requireCreatorAccess(creatorSlugOrId: string) {
  try {
    if (process.env.DATABASE_URL) {
      const creator = await prisma.creator.findFirst({
        where: {
          OR: [{ slug: creatorSlugOrId }, { id: creatorSlugOrId }],
        },
        include: {
          stories: { orderBy: { createdAt: 'desc' } },
          quizzes: {
            where: { isActive: true },
            include: { questions: { include: { options: true } } },
          },
          rewards: { where: { status: 'active' } },
          badges: true,
        },
      })
      if (creator) return creator
    }
  } catch (err) {
    console.warn('[Tenant Scoping] DB query fallback:', err)
  }
  return null
}
