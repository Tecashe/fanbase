'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Banknote,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  Flame,
  Gift,
  HelpCircle,
  LayoutDashboard,
  Lock,
  LogIn,
  Mic,
  Moon,
  Play,
  Share2,
  Sparkles,
  Sun,
  Trophy,
  Users,
  Video,
  Zap,
} from 'lucide-react'

export default function LandingPage() {
  const [isDark, setIsDark] = useState(false) // Tactile Alabaster by default

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans selection:bg-accent/25">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group outline-none">
            <div className="relative grid size-10 place-items-center rounded-2xl bg-card neu-raised-sm border border-border group-hover:scale-105 transition-transform duration-200">
              <Flame className="size-5.5 text-accent drop-shadow-[0_0_8px_rgba(209,17,73,0.5)]" />
              <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-accent ruby-glow" />
            </div>
            <div className="text-left">
              <span className="font-serif text-xl font-bold tracking-tight block leading-none">
                Campfire
              </span>
              <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                Creator Fan Clubs
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-wide text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#rewards" className="hover:text-foreground transition-colors">
              Monetization
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="grid size-9.5 place-items-center rounded-xl neu-raised-sm border border-border bg-card text-foreground/80 hover:text-accent hover:scale-105 transition-all duration-200"
              aria-label="Toggle theme"
              title={`Switch to ${isDark ? 'Tactile Alabaster (Light)' : 'Tactile Obsidian (Dark)'}`}
            >
              {isDark ? (
                <Sun className="size-4.5 text-accent drop-shadow-[0_0_6px_rgba(209,17,73,0.4)]" />
              ) : (
                <Moon className="size-4.5 text-foreground" />
              )}
            </button>

            <Link
              href="/login"
              className="neu-button hidden sm:inline-flex rounded-xl px-4 py-2 text-xs font-bold text-foreground"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="neu-button-primary rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Ambient Glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 size-96 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 neu-pill-inset text-xs font-mono font-bold text-accent mb-6">
              <span className="ruby-dot animate-pulse" />
              <span>THE INNER CIRCLE PLATFORM FOR STORYTELLERS</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.06]">
              Subscribe. Play.{' '}
              <span className="text-accent italic underline decoration-accent/30 decoration-wavy underline-offset-8">
                Win Cash.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-xl leading-relaxed text-muted-foreground">
              Campfire transforms YouTube audiences into verified, active fan communities.
              Answer episode recall quests generated from video transcripts, climb live standings,
              and win cash prizes disbursed straight to <strong>M-Pesa</strong> & <strong>PayPal</strong>.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto neu-button-primary rounded-xl px-8 py-4 text-sm font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2.5"
              >
                <span>Join Official Fan Club</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/app"
                className="w-full sm:w-auto neu-button rounded-xl px-8 py-4 text-sm font-bold tracking-wide text-foreground inline-flex items-center justify-center gap-2"
              >
                <Play className="size-4 text-accent" />
                <span>Enter Dashboard</span>
              </Link>
            </div>

            {/* Social Proof Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-accent" />
                <span>YouTube OAuth Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-accent" />
                <span>Live Neon PostgreSQL</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-accent" />
                <span>Instant M-Pesa Payouts</span>
              </div>
            </div>
          </div>

          {/* Interactive Tactile Product Mockup Preview */}
          <div className="mt-16 neu-card p-6 sm:p-8 border border-border/90 bg-card/70 backdrop-blur-md shadow-2xl relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-xl bg-card neu-raised-xs text-accent">
                  <Flame className="size-4.5 text-accent" />
                </div>
                <div>
                  <p className="font-serif text-sm font-bold">Mkurugenzi Official Campfire</p>
                  <p className="text-[10px] font-mono text-muted-foreground">@mkurugenzi · Active Story Arc</p>
                </div>
              </div>
              <span className="rounded-full px-3 py-1 neu-pill-inset text-[10px] font-mono font-bold text-accent">
                LIVE PRODUCTION
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Feature 1: Quest */}
              <div className="p-5 rounded-2xl neu-inset-sm border border-border/80 bg-background flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-accent font-bold">Episode Quest</span>
                  <h4 className="font-serif text-lg font-bold mt-1">River Road Heist Lore</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    3 questions extracted from transcript · 250 PTS
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-bold text-accent">
                  <span>Watch-to-Unlock</span>
                  <Play className="size-3.5 fill-current" />
                </div>
              </div>

              {/* Feature 2: Cash Payout */}
              <div className="p-5 rounded-2xl neu-inset-sm border border-accent/30 bg-background ruby-glow flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-accent font-bold">Weekly Prize</span>
                  <h4 className="font-serif text-lg font-bold mt-1">KES 5,000 Cash Disbursed</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Rewarded to #1 weekly ranking fan via M-Pesa
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-bold text-accent">
                  <span>M-Pesa Rail Active</span>
                  <Banknote className="size-4" />
                </div>
              </div>

              {/* Feature 3: Leaderboard */}
              <div className="p-5 rounded-2xl neu-inset-sm border border-border/80 bg-background flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-accent font-bold">Leaderboard</span>
                  <h4 className="font-serif text-lg font-bold mt-1">Real-time Rankings</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kofi B. (Rank #1) · 4,820 Live Points
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-bold text-accent">
                  <span>Day 7 Streak</span>
                  <Trophy className="size-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-t border-border/80 bg-background/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
              SIMPLE & TACTILE
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mt-2">
              How Campfire Works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Three seamless steps for fans and creators to connect, play, and win.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <div className="neu-card p-6 sm:p-8 border border-border/80 flex flex-col justify-between">
              <div>
                <div className="grid size-12 place-items-center rounded-2xl neu-convex text-accent mb-6 font-serif font-bold text-lg">
                  1
                </div>
                <h3 className="font-serif text-xl font-bold">Subscribe & Verify</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Fans authenticate and verify their YouTube subscription with 1 click via official YouTube OAuth.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-[11px] font-mono text-accent font-bold">
                +150 Instant Bonus Points
              </div>
            </div>

            {/* Step 2 */}
            <div className="neu-card p-6 sm:p-8 border border-accent/40 bg-card ruby-glow flex flex-col justify-between">
              <div>
                <div className="grid size-12 place-items-center rounded-2xl neu-raised text-accent mb-6 font-serif font-bold text-lg">
                  2
                </div>
                <h3 className="font-serif text-xl font-bold">Play Episode Quests</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Answer multiple-choice recall questions generated by AI directly from creator video scripts and episode transcripts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-[11px] font-mono text-accent font-bold">
                Daily Streaks & Accuracy Scoring
              </div>
            </div>

            {/* Step 3 */}
            <div className="neu-card p-6 sm:p-8 border border-border/80 flex flex-col justify-between">
              <div>
                <div className="grid size-12 place-items-center rounded-2xl neu-convex text-accent mb-6 font-serif font-bold text-lg">
                  3
                </div>
                <h3 className="font-serif text-xl font-bold">Win Cash & Perks</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Top leaderboard champions claim weekly cash rewards sent straight to M-Pesa, shoutouts, and 1-on-1 creator calls.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-[11px] font-mono text-accent font-bold">
                M-Pesa & PayPal Payout Rails
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="py-20 border-t border-border/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
                FOR CREATORS
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mt-2">
                Turn Video Scripts into High-Engagement Quests
              </h2>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Creators paste raw video transcripts or production notes. Our AI synthesizes structured 4-option recall questions with distractors and point weights, published instantly to the live database.
              </p>

              <div className="mt-8 space-y-4 text-xs font-medium">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-4 text-accent shrink-0" />
                  <span>Automated AI Question & Distractor Synthesis</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-4 text-accent shrink-0" />
                  <span>Watch-to-Unlock Gating for Maximum Video Retention</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-4 text-accent shrink-0" />
                  <span>Superfan CRM & PDF Sponsor Pitch Export</span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/register"
                  className="neu-button-primary rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <span>Launch Creator Studio</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* Tactile Sidebar Visualizer */}
            <div className="neu-card p-6 border border-border/90 bg-card">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-accent font-bold">CREATOR STUDIO PREVIEW</span>
                <span className="text-[10px] font-mono text-muted-foreground">NEON POSTGRES</span>
              </div>
              <div className="space-y-3">
                <div className="p-4 rounded-2xl neu-inset-sm border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="size-4 text-accent" />
                    <div>
                      <p className="text-xs font-bold">AI Script-to-Quest Generator</p>
                      <p className="text-[10px] font-mono text-muted-foreground">3 Questions Synthesized</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-accent font-bold">READY</span>
                </div>

                <div className="p-4 rounded-2xl neu-inset-sm border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Banknote className="size-4 text-accent" />
                    <div>
                      <p className="text-xs font-bold">Winner Payout Queue</p>
                      <p className="text-[10px] font-mono text-muted-foreground">KES 5,000 M-Pesa Payout</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-accent font-bold">DISBURSED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 border-t border-border/80 bg-background/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
            Ready to Enter the Campfire?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Join thousands of curious fans, take episode recall quests, and start climbing the ranks today.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto neu-button-primary rounded-xl px-8 py-4 text-sm font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2"
            >
              <span>Create Account</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto neu-button rounded-xl px-8 py-4 text-sm font-bold text-foreground"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/80 py-8 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <Flame className="size-4 text-accent" />
            <span>Campfire · Official Creator Fan Clubs</span>
          </div>
          <div>Built with Next.js, Prisma & Neon PostgreSQL</div>
        </div>
      </footer>
    </div>
  )
}
