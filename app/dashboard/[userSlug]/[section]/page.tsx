import { Suspense } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { normalizeSection } from '@/lib/slug'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userSlug: string; section: string }>
}) {
  const { userSlug, section } = await params
  const readableName = userSlug.replace(/-/g, ' ')
  const readableSection = section.charAt(0).toUpperCase() + section.slice(1)
  return {
    title: `${readableSection} — ${readableName} | Campfire`,
    description: `Official Campfire ${readableSection} for ${readableName}.`,
  }
}

export default async function UserDashboardSectionPage({
  params,
}: {
  params: Promise<{ userSlug: string; section: string }>
}) {
  const { userSlug, section } = await params
  const normalized = normalizeSection(section)

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground grid place-items-center p-6 font-sans">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Loading {section} for {userSlug}...
          </div>
        </div>
      }
    >
      <DashboardLayout userSlug={userSlug} initialView={normalized} />
    </Suspense>
  )
}
