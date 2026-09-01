import { Suspense } from 'react'
import CreatorPortal from '@/components/public/creator-portal'
import { prisma } from '@/lib/db'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ creatorSlug: string }>
}) {
  const { creatorSlug } = await params
  let name = creatorSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())

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
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground grid place-items-center p-6 font-sans">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Loading {creatorSlug} Campfire...
          </div>
        </div>
      }
    >
      <CreatorPortal creatorSlug={creatorSlug} />
    </Suspense>
  )
}

