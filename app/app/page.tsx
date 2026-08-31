import { Suspense } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'

export const metadata = {
  title: 'Campfire — Dashboard & Quests',
  description: 'Play episode recall quests, climb the ranks, and claim creator perks.',
}

export default function AppPage() {
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
