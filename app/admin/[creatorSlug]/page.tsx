import CreatorStudio from '@/components/admin/creator-studio'

export default async function AdminPage({
  params,
}: {
  params: Promise<{ creatorSlug: string }>
}) {
  const { creatorSlug } = await params
  return <CreatorStudio creatorSlug={creatorSlug} />
}

