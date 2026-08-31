'use client'

import { Award, CheckCircle2, Flame, Lock, Sparkles, Trophy, Zap } from 'lucide-react'

export type BadgeItem = {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  criteria: string
}

export const defaultBadges: BadgeItem[] = [
  {
    id: 'b1',
    title: 'First Flame',
    description: 'Completed your first episode recall quest.',
    icon: '🔥',
    unlocked: true,
    criteria: 'Complete 1 quest',
  },
  {
    id: 'b2',
    title: '7-Day Spark',
    description: 'Maintained a 7-day active participation streak.',
    icon: '⚡',
    unlocked: true,
    criteria: '7-day streak',
  },
  {
    id: 'b3',
    title: 'Story Arc Master',
    description: 'Answered all questions in the Season 1 arc correctly.',
    icon: '🏆',
    unlocked: false,
    criteria: '100% score on Ep 40-42',
  },
  {
    id: 'b4',
    title: 'Circle Ambassador',
    description: 'Invited 3 verified friends around the fire.',
    icon: '✦',
    unlocked: true,
    criteria: '3 verified referrals',
  },
  {
    id: 'b5',
    title: 'Top 10 Contender',
    description: 'Finished in the weekly top 10 ranking.',
    icon: '★',
    unlocked: false,
    criteria: 'Reach Top 10 rank',
  },
  {
    id: 'b6',
    title: 'Watch Party Veteran',
    description: 'Confirmed 10 video watch-to-unlock challenges.',
    icon: '👁️',
    unlocked: false,
    criteria: '10 watch confirmations',
  },
]

export function BadgesSection({
  badges = defaultBadges,
}: {
  badges?: BadgeItem[]
}) {
  return (
    <div className="neu-card p-6 sm:p-8 border border-border/80">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="ruby-dot" />
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
              FAN COLLECTIBLES & BADGES
            </p>
          </div>
          <h3 className="font-serif text-2xl font-bold mt-1">Your Trophy Cabinet</h3>
        </div>
        <span className="rounded-full px-3 py-1 neu-pill-inset text-xs font-mono text-accent font-bold">
          {badges.filter((b) => b.unlocked).length} / {badges.length} UNLOCKED
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`p-4.5 rounded-2xl transition-all duration-200 flex items-start gap-3.5 ${
              b.unlocked
                ? 'neu-raised-sm border border-border bg-card'
                : 'neu-inset-xs border border-border/50 bg-background/50 opacity-60'
            }`}
          >
            <div
              className={`grid size-11 shrink-0 place-items-center rounded-xl text-xl font-bold ${
                b.unlocked
                  ? 'bg-accent/15 text-accent border border-accent/30 ruby-glow'
                  : 'neu-inset-xs text-muted-foreground'
              }`}
            >
              {b.unlocked ? b.icon : <Lock className="size-4 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-serif text-sm font-bold text-foreground truncate">{b.title}</h4>
                {b.unlocked && <CheckCircle2 className="size-3.5 text-accent shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{b.description}</p>
              <p className="text-[10px] font-mono text-accent/90 mt-2">{b.criteria}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
