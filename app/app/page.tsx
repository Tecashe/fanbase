import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/custom-auth'
import { toUserSlug } from '@/lib/slug'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Suspense } from 'react'

export const metadata = {
  title: 'Campfire — Dashboard & Quests',
  description: 'Play episode recall quests, climb the ranks, and claim creator perks.',
}

export default async function AppPage() {
  const authUser = await getAuthUser()

  if (authUser) {
    const slug = toUserSlug(authUser.name, authUser.email, authUser.id)
    redirect(`/dashboard/${slug}`)
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground grid place-items-center p-6 font-sans">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Loading Dashboard...
          </div>
        </div>
      }
    >
      <DashboardLayout />
    </Suspense>
  )
}
