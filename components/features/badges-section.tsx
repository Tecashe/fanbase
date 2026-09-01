'use client'

import {
  Award,
  CheckCircle2,
  Eye,
  Flame,
  Lock,
  LucideIcon,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import { FanState } from '@/components/campfire-app'

export type BadgeItem = {
  id: string
  title: string
  description: string
  iconName: 'flame' | 'zap' | 'trophy' | 'users' | 'star' | 'eye'
  unlocked: boolean
  criteria: string
  progressText: string
}

const badgeIconMap: Record<string, LucideIcon> = {
  flame: Flame,
  zap: Zap,
  trophy: Trophy,
  users: Users,
  star: Star,
  eye: Eye,
}

export function BadgesSection({
  fan,
  watchedStoriesCount = 0,
}: {
  fan: FanState | null
  watchedStoriesCount?: number
}) {
  const points = fan?.points || 0
  const streak = fan?.streak || 0
  const referrals = fan?.referrals || 0
  const rank = fan?.rank || 0
  const unlockedBadgeIds = fan?.unlockedBadgeIds || []

  // Dynamic real-data criteria evaluation
  const badges: BadgeItem[] = [
    {
      id: 'b1',
      title: 'First Flame',
      description: 'Completed your first episode recall quest.',
      iconName: 'flame',
      unlocked: points > 100 || unlockedBadgeIds.includes('b1'),
      criteria: 'Complete 1 quest',
      progressText: points > 100 ? 'Completed' : '0 / 1 Completed',
    },
    {
      id: 'b2',
      title: '7-Day Spark',
      description: 'Maintained a 7-day active participation streak.',
      iconName: 'zap',
      unlocked: streak >= 7 || unlockedBadgeIds.includes('b2'),
      criteria: '7-day streak',
      progressText: `${streak} / 7 Days Active`,
    },
    {
      id: 'b3',
      title: 'YouTube Superfan',
      description: 'Verified active subscription to the YouTube channel.',
      iconName: 'trophy',
      unlocked: !!fan?.youtubeVerified || unlockedBadgeIds.includes('b3'),
      criteria: 'Verified YouTube Subscriber',
      progressText: fan?.youtubeVerified ? 'Verified Active' : 'Not Connected',
    },
    {
      id: 'b4',
      title: 'Circle Ambassador',
      description: 'Invited 3 verified friends around the campfire.',
      iconName: 'users',
      unlocked: referrals >= 3 || unlockedBadgeIds.includes('b4'),
      criteria: '3 verified referrals',
      progressText: `${referrals} / 3 Friends Joined`,
    },
    {
      id: 'b5',
      title: 'Top 10 Contender',
      description: 'Climbed into the top 10 on the live leaderboard.',
      iconName: 'star',
      unlocked: (rank > 0 && rank <= 10) || unlockedBadgeIds.includes('b5'),
      criteria: 'Reach Top 10 rank',
      progressText: rank > 0 ? `Current Rank: #${rank}` : 'Unranked',
    },
    {
      id: 'b6',
      title: 'Watch Party Veteran',
      description: 'Confirmed episode watch-to-unlock challenges.',
      iconName: 'eye',
      unlocked: watchedStoriesCount >= 3 || unlockedBadgeIds.includes('b6'),
      criteria: '3 episode watch confirmations',
      progressText: `${watchedStoriesCount} / 3 Confirmed`,
    },
  ]

  const totalUnlocked = badges.filter((b) => b.unlocked).length

  return (
    <div className="neu-card p-6 sm:p-8 border border-border/80 bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="ruby-dot" />
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
              LIVE POSTGRES METRICS & COLLECTIBLES
            </p>
          </div>
          <h3 className="font-serif text-2xl font-bold mt-1">Your Trophy Cabinet</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Badges unlock automatically as your live points, streaks, watch confirmations, and referrals are recorded in Neon DB.
          </p>
        </div>
        <span className="self-start sm:self-auto rounded-full px-3.5 py-1.5 neu-pill-inset text-xs font-mono text-accent font-bold tracking-wider">
          {totalUnlocked} / {badges.length} UNLOCKED
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b) => {
          const IconComponent = badgeIconMap[b.iconName] || Trophy
          return (
            <div
              key={b.id}
              className={`p-5 rounded-2xl transition-all duration-200 flex items-start gap-4 ${
                b.unlocked
                  ? 'neu-raised-sm border border-accent/30 bg-card shadow-sm'
                  : 'neu-inset-xs border border-border/50 bg-background/50 opacity-60'
              }`}
            >
              <div
                className={`grid size-12 shrink-0 place-items-center rounded-2xl font-bold ${
                  b.unlocked
                    ? 'bg-accent/15 text-accent border border-accent/40 ruby-glow'
                    : 'neu-inset-xs text-muted-foreground'
                }`}
              >
                {b.unlocked ? (
                  <IconComponent className="size-5 text-accent" />
                ) : (
                  <Lock className="size-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-serif text-sm font-bold text-foreground truncate">{b.title}</h4>
                  {b.unlocked && <CheckCircle2 className="size-3.5 text-accent shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{b.description}</p>
                <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-muted-foreground font-semibold uppercase">{b.criteria}</span>
                  <span className={`font-bold ${b.unlocked ? 'text-accent' : 'text-muted-foreground'}`}>
                    {b.progressText}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
