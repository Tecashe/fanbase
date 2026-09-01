import { Suspense } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userSlug: string }>
}) {
  const { userSlug } = await params
  const readableName = userSlug.replace(/-/g, ' ')
  return {
    title: `${readableName} — Campfire Dashboard`,
    description: `Official Campfire fan dashboard for ${readableName}.`,
  }
}

export default async function UserDashboardPage({
  params,
}: {
  params: Promise<{ userSlug: string }>
}) {
  const { userSlug } = await params

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground grid place-items-center p-6 font-sans">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Loading Dashboard for {userSlug}...
          </div>
        </div>
      }
    >
      <DashboardLayout userSlug={userSlug} initialView="overview" />
    </Suspense>
  )
}
