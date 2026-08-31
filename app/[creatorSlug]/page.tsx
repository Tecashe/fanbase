import DashboardLayout from '@/components/dashboard/dashboard-layout'
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
  return <DashboardLayout creatorSlug={creatorSlug} />
}
