'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Award,
  ChevronRight,
  Eye,
  Flame,
  Gift,
  Lock,
  Moon,
  Play,
  Share2,
  Sparkles,
  Sun,
  Trophy,
  UserCheck,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'

export default function CreatorPortal({
  creatorSlug = '',
}: {
  creatorSlug?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const referralParam = searchParams?.get('ref') || null

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Live Public Creator Data
  const [creator, setCreator] = useState<any>({
    slug: creatorSlug,
    displayName: creatorSlug ? creatorSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Creator',
    handle: `@${creatorSlug}`,
    brandPrimaryColor: '#d11149',
    brandSecondaryColor: '#0a0a0d',
    welcomeMessage: 'Welcome to the campfire. Answer questions from our stories, climb the ranks, and unlock rewards.',
    youtubeChannelId: '',
    channelUrl: '',
  })
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [rewards, setRewards] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  // 1. Check if user is logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`/api/auth/me?creatorSlug=${creatorSlug}`)
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated && data.user) {
            setIsAuthenticated(true)
            setCheckingAuth(false)
            return
          }
        }
      } catch {
        // ignore
      } finally {
        setCheckingAuth(false)
      }
    }
    checkSession()
  }, [creatorSlug])

  // 2. Fetch public creator data
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [dataRes, leadRes] = await Promise.all([
          fetch(`/api/creators/${creatorSlug}/data`),
          fetch(`/api/creators/${creatorSlug}/leaderboard`),
        ])
        if (dataRes.ok) {
          const d = await dataRes.json()
          if (d.creator) setCreator(d.creator)
          if (Array.isArray(d.quizzes)) setQuizzes(d.quizzes)
          if (Array.isArray(d.rewards)) setRewards(d.rewards)
        }
        if (leadRes.ok) {
          const l = await leadRes.json()
          if (Array.isArray(l.leaderboard)) setLeaderboard(l.leaderboard)
        }
      } catch {
        // ignore
      }
    }
    fetchPublicData()
  }, [creatorSlug])

  // Theme Sync
  useEffect(() => {
    const root = document.documentElement
    if (isDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [isDark])

  // If already authenticated, render full personalized dashboard
  if (isAuthenticated) {
    return <DashboardLayout creatorSlug={creatorSlug} />
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center p-6 font-sans">
        <div className="flex items-center gap-2.5">
          <span className="ruby-dot animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Entering {creator.displayName} Campfire...
          </span>
        </div>
      </div>
    )
  }

  const joinUrl = `/register?creator=${creatorSlug}${referralParam ? `&ref=${referralParam}` : ''}`
  const loginUrl = `/login?creator=${creatorSlug}&redirect=/${creatorSlug}`

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-accent/25">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-16 border-b border-border/80 bg-card/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-xl bg-card neu-raised-xs border border-border text-accent">
            <Flame className="size-4 text-accent" />
          </div>
          <div>
            <span className="font-serif font-bold text-sm tracking-tight block leading-none">
              {creator.displayName}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground uppercase">Official Fan Circle</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl neu-raised-xs border border-border text-foreground hover:text-accent"
            title={`Switch to ${isDark ? 'Light' : 'Dark'}`}
          >
            {isDark ? <Sun className="size-4 text-accent" /> : <Moon className="size-4" />}
          </button>

          <Link
            href={loginUrl}
            className="neu-button rounded-xl px-3.5 py-1.5 text-xs font-bold text-foreground"
          >
            Sign In
          </Link>

          <Link
            href={joinUrl}
            className="neu-button-primary rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
          >
            <span>Connect YouTube & Play</span>
            <ChevronRight className="size-3" />
          </Link>
        </div>
      </header>

      {/* Main Public Conversion Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-12">
        {/* Hero Section */}
        <section className="neu-card p-6 sm:p-10 border border-border/80 relative overflow-hidden text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 neu-pill-inset text-xs font-mono font-bold text-accent">
                <span className="ruby-dot animate-pulse" />
                <span>OFFICIAL YOUTUBE SUBSCRIBER ARENA</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                {creator.displayName} Lore Quests & Rewards
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {creator.welcomeMessage ||
                  'Watch our stories, answer recall questions, climb the standings, and win weekly cash prizes.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={joinUrl}
                  className="neu-button-primary rounded-xl px-6 py-3.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <Sparkles className="size-4" />
                  <span>Join Campfire & Earn 150 PTS</span>
                </Link>
                <a
                  href={
                    creator.channelUrl ||
                    (creator.youtubeChannelId
                      ? `https://www.youtube.com/channel/${creator.youtubeChannelId}`
                      : 'https://www.youtube.com')
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="neu-button rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 text-foreground"
                >
                  <Video className="size-4 text-accent" />
                  <span>Watch on YouTube</span>
                </a>
              </div>
            </div>

            {/* Quick Stats Box */}
            <div className="p-5 rounded-2xl neu-inset-sm border border-border/80 bg-card space-y-3 min-w-[220px]">
              <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground block">
                Prize Pool This Week
              </span>
              <p className="font-serif text-3xl font-bold text-accent">KES 5,000</p>
              <p className="text-[10px] font-mono text-muted-foreground">Disbursed directly via M-Pesa to #1 Fan</p>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-mono">
                <span>Active Quests</span>
                <span className="font-bold text-foreground">{quizzes.length} Live</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Active Challenges Preview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold">Active Episode Quests</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Answer recall questions from our YouTube episodes to rack up points.
              </p>
            </div>
            <Link href={joinUrl} className="text-xs font-mono text-accent font-bold hover:underline">
              Unlock All ({quizzes.length}) →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {quizzes.map((quiz) => (
              <article
                key={quiz.id}
                className="neu-card-interactive p-5 border border-border flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-full px-2.5 py-0.5 neu-pill-inset text-[10px] font-mono font-bold text-accent">
                      {quiz.status || 'Active'}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{quiz.duration || '2 min'}</span>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">{quiz.subtitle}</p>
                  <h3 className="font-serif text-lg font-bold mt-1 leading-snug">{quiz.title}</h3>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-accent">+{quiz.points} PTS</span>
                  <Link
                    href={joinUrl}
                    className="neu-button-primary rounded-xl px-3 py-1.5 text-xs font-bold uppercase inline-flex items-center gap-1"
                  >
                    <span>Play</span>
                    <Lock className="size-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Section 2: Public Leaderboard Preview (Pre-Subscription Acquisition) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-accent" />
                <h2 className="font-serif text-2xl font-bold">Live Fan Standings</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Top verified subscribers this week competing for the KES 5,000 grand prize.
              </p>
            </div>
            <Link href={joinUrl} className="text-xs font-mono text-accent font-bold hover:underline">
              Join Standings →
            </Link>
          </div>

          <div className="neu-card p-6 border border-border space-y-3">
            {leaderboard.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground font-mono">
                Leaderboard opening with the next episode drop. Be the first to register a score!
              </div>
            ) : (
              leaderboard.slice(0, 5).map((row) => (
                <div
                  key={row.rank}
                  className="flex items-center gap-3.5 rounded-2xl p-3.5 neu-raised-xs border border-border/70 bg-card"
                >
                  <span className="w-8 text-center font-mono text-xs font-bold text-muted-foreground">
                    #{row.rank}
                  </span>
                  <div className="grid size-8 place-items-center rounded-full text-xs font-bold neu-inset-xs text-foreground">
                    {row.initials}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold">{row.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-base">{row.points.toLocaleString()}</span>
                    <span className="ml-1 text-[10px] font-mono text-muted-foreground">PTS</span>
                  </div>
                </div>
              ))
            )}

            <div className="pt-4 text-center">
              <Link
                href={joinUrl}
                className="neu-button-primary rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
              >
                <span>Connect YouTube to Compete on Leaderboard</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 3: Rewards Showcase */}
        <section className="space-y-4">
          <div>
            <h2 className="font-serif text-2xl font-bold">Rewards & Cash Perks</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              What top fans unlock by scoring high on episode recall quests.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {rewards.map((reward) => (
              <div key={reward.id} className="neu-card p-5 border border-border flex flex-col justify-between">
                <div>
                  <span className="rounded-full px-2.5 py-0.5 neu-pill-inset text-[10px] font-mono font-bold text-accent">
                    {reward.meta || 'PERK'}
                  </span>
                  <h3 className="font-serif text-lg font-bold mt-2 leading-snug">{reward.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5">{reward.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-accent">{reward.points}</span>
                  <Link
                    href={joinUrl}
                    className="text-xs font-mono text-accent font-bold hover:underline"
                  >
                    Claim Perk →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 py-8 px-4 text-center text-xs font-mono text-muted-foreground bg-card/50">
        <p>© 2026 {creator.displayName} Campfire · Powered by Campfire Platform</p>
      </footer>
    </div>
  )
}
