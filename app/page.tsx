'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Banknote,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  Flame,
  Gift,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogIn,
  Mic,
  Moon,
  Phone,
  Play,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Sun,
  Trophy,
  UserCheck,
  Users,
  Video,
  Zap,
} from 'lucide-react'

export default function LandingPage() {
  const [isDark, setIsDark] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authUser, setAuthUser] = useState<{ displayName: string; slug?: string } | null>(null)

  // Interactive Live Demo state on landing page
  const [demoSelected, setDemoSelected] = useState<number | null>(null)
  const [demoSubmitted, setDemoSubmitted] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(0)

  useEffect(() => {
    // Check if user already has an active stored session
    fetch('/api/auth/me?creatorSlug=mkurugenzi')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setAuthUser(data.user)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  const demoQuestion = {
    title: 'River Road Heist Breakdown',
    subtitle: 'EPISODE 42 · LORE RECALL',
    question: 'What clue did the investigator uncover inside the glove compartment at timestamp 14:20?',
    options: [
      'A forged parking permit',
      'An encrypted cassette tape',
      'A receipt from the downtown diner',
      'A vintage brass compass',
    ],
    correct: 1,
  }

  const faqs = [
    {
      q: 'How does YouTube subscriber verification work?',
      a: 'Campfire connects directly with the official Google YouTube Data API v3. When a fan signs in or clicks "Verify YouTube", our system queries their active subscriptions in real-time. Only verified subscribers unlock lore quests and leaderboard rewards.',
    },
    {
      q: 'How are cash prizes disbursed to winners?',
      a: 'When top-ranking fans win weekly challenges, they submit their payout preference (M-Pesa phone number or PayPal email). Creators review the disbursement queue with 1-click receipt approvals, and funds are disbursed instantly.',
    },
    {
      q: 'Can creators generate questions automatically from video scripts?',
      a: 'Yes. In the Creator Studio, you can paste raw episode scripts or production transcripts. Our AI synthesizes structured 4-option multiple choice questions with authentic distractors and point weights in seconds.',
    },
    {
      q: 'Can fans register using their mobile phone numbers?',
      a: 'Yes! Fans can sign up or sign in using either email or their mobile phone number with instant 6-digit OTP verification codes. Phone numbers link directly with M-Pesa for seamless cash prize payouts.',
    },
    {
      q: 'How does the referral program work?',
      a: 'Every fan receives a personalized invite link (e.g. campfire.app/mkurugenzi?ref=user_id). When friends join and verify, both the referrer and the new fan instantly receive +100 bonus points credited directly to their live standings.',
    },
    {
      q: 'Is Campfire multi-tenant for multiple creators?',
      a: 'Absolutely. Each creator gets their own white-labeled portal at /creatorSlug (e.g. /mkurugenzi) featuring custom branding colors, welcome notes, exclusive quests, and creator-specific trophy badges.',
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans selection:bg-accent/25">
      {/* ═════════════════════════════════════════════════════════════════════
          MORPHING FLOATING ROUNDED RECTANGLE NAVBAR
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-3 sm:p-5 pointer-events-none transition-all duration-300">
        <header
          className={`pointer-events-auto w-full transition-all duration-300 ease-out flex items-center justify-between border ${
            scrolled
              ? 'max-w-4xl h-14 rounded-full px-4 sm:px-6 bg-card/90 backdrop-blur-2xl neu-raised-md border-accent/25 shadow-2xl'
              : 'max-w-6xl h-18 rounded-3xl sm:rounded-full px-5 sm:px-8 bg-card/75 backdrop-blur-xl neu-raised border-border/80 shadow-lg'
          }`}
        >
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group outline-none">
            <div className="relative grid size-9 place-items-center rounded-2xl bg-card neu-raised-xs border border-border group-hover:scale-105 transition-transform duration-200">
              <Flame className="size-5 text-accent drop-shadow-[0_0_8px_rgba(209,17,73,0.5)]" />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-accent ruby-glow" />
            </div>
            <div className="text-left">
              <span className="font-serif text-lg font-bold tracking-tight block leading-none">
                Campfire
              </span>
              {!scrolled && (
                <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase hidden sm:block">
                  Fan Clubs
                </span>
              )}
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-wide text-muted-foreground">
            <Link href="/explore" className="hover:text-foreground transition-colors font-bold text-accent">
              Explore Campfires
            </Link>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#live-demo" className="hover:text-foreground transition-colors">
              Try Quest
            </a>
            <a href="#monetization" className="hover:text-foreground transition-colors">
              Cash Prizes
            </a>
            <Link href="/creator/register" className="hover:text-foreground transition-colors">
              For Creators
            </Link>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsDark(!isDark)}
              className="grid size-8.5 place-items-center rounded-xl neu-raised-xs border border-border bg-card text-foreground/80 hover:text-accent transition-colors"
              aria-label="Toggle theme"
              title={`Switch to ${isDark ? 'Tactile Alabaster (Light)' : 'Tactile Obsidian (Dark)'}`}
            >
              {isDark ? (
                <Sun className="size-4 text-accent" />
              ) : (
                <Moon className="size-4 text-foreground" />
              )}
            </button>

            {authUser ? (
              <Link
                href={`/dashboard/${authUser.slug || 'fan'}`}
                className="neu-button-primary rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight className="size-3" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="neu-button hidden sm:inline-flex rounded-xl px-3.5 py-1.5 text-xs font-bold text-foreground"
                >
                  Sign In
                </Link>

                <Link
                  href="/explore"
                  className="neu-button-primary rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                >
                  <span>Explore Campfires</span>
                  <ChevronRight className="size-3" />
                </Link>
              </>
            )}
          </div>
        </header>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          HERO SECTION
          ═════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 size-[32rem] rounded-full bg-accent/8 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 neu-pill-inset text-xs font-mono font-bold text-accent mb-6">
              <span className="ruby-dot animate-pulse" />
              <span>THE TACTILE INNER CIRCLE FOR YOUTUBE AUDIENCES</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05]">
              Subscribe. Play.{' '}
              <span className="text-accent italic underline decoration-accent/30 decoration-wavy underline-offset-8">
                Win Cash.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-xl leading-relaxed text-muted-foreground">
              Turn passive viewers into an active, verified community.
              Fans answer episode recall quests generated from video transcripts, climb live standings,
              and win weekly cash rewards paid directly via <strong>M-Pesa</strong> & <strong>PayPal</strong>.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {authUser ? (
                <Link
                  href={`/dashboard/${authUser.slug || 'fan'}`}
                  className="w-full sm:w-auto neu-button-primary rounded-xl px-8 py-4 text-sm font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2.5"
                >
                  <span>Continue to Dashboard ({authUser.displayName})</span>
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/explore"
                    className="w-full sm:w-auto neu-button-primary rounded-xl px-8 py-4 text-sm font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2.5"
                  >
                    <span>Explore Creators & Play</span>
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/creator/register"
                    className="w-full sm:w-auto neu-button rounded-xl px-8 py-4 text-sm font-bold tracking-wide text-foreground inline-flex items-center justify-center gap-2"
                  >
                    <Sparkles className="size-4 text-accent" />
                    <span>Launch Your Creator Portal</span>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <Video className="size-4 text-accent" />
                <span>YouTube OAuth v3 Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-accent" />
                <span>Phone & Email OTP Auth</span>
              </div>
              <div className="flex items-center gap-2">
                <Banknote className="size-4 text-accent" />
                <span>M-Pesa & PayPal Cash Rails</span>
              </div>
            </div>
          </div>

          {/* Tactile Platform Quad Preview */}
          <div className="mt-16 neu-card p-6 sm:p-8 border border-border/90 bg-card/80 backdrop-blur-md shadow-2xl relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-xl bg-card neu-raised-xs text-accent">
                  <Flame className="size-4.5 text-accent" />
                </div>
                <div>
                  <p className="font-serif text-sm font-bold">Mkurugenzi Official Campfire</p>
                  <p className="text-[10px] font-mono text-muted-foreground">@Mkurugenziii · Active Community Rotation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="ruby-dot animate-pulse" />
                <span className="rounded-full px-3 py-1 neu-pill-inset text-[10px] font-mono font-bold text-accent">
                  NEON POSTGRES CONNECTED
                </span>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="p-5 rounded-2xl neu-inset-sm border border-border/80 bg-background flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-accent font-bold">Episode Lore Quest</span>
                  <h4 className="font-serif text-lg font-bold mt-1">The Midnight Train Artifact</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    3 questions synthesized from script · 250 PTS
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-bold text-accent">
                  <span>Watch-to-Unlock Gated</span>
                  <Play className="size-3.5 fill-current" />
                </div>
              </div>

              <div className="p-5 rounded-2xl neu-inset-sm border border-accent/40 bg-card ruby-glow flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-accent font-bold">Weekly Grand Prize</span>
                  <h4 className="font-serif text-lg font-bold mt-1">KES 5,000 Cash Disbursed</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Rewarded to #1 ranking superfan via M-Pesa
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-bold text-accent">
                  <span>Instant Disbursement Rail</span>
                  <Banknote className="size-4" />
                </div>
              </div>

              <div className="p-5 rounded-2xl neu-inset-sm border border-border/80 bg-background flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-accent font-bold">Live Standings</span>
                  <h4 className="font-serif text-lg font-bold mt-1">Real-Time Leaderboard</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kofi B. (Rank #1) · 4,820 Live Points · 7-Day Streak
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-bold text-accent">
                  <span>Continuous Sync</span>
                  <Trophy className="size-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
          INTERACTIVE LIVE QUEST DEMO
          ═════════════════════════════════════════════ */}
      <section id="live-demo" className="py-20 border-t border-border/80 bg-background/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
              INTERACTIVE DEMO
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mt-2">
              Test Drive a Lore Challenge
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Experience the tactile sensation of answering an episode question just like a real fan.
            </p>
          </div>

          <div className="neu-card p-6 sm:p-8 border border-border/90 bg-card shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="ruby-dot" />
                <span className="text-[11px] font-mono uppercase font-bold text-accent">
                  {demoQuestion.subtitle}
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground">+80 PTS</span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold">{demoQuestion.question}</h3>

            <div className="mt-6 space-y-3">
              {demoQuestion.options.map((opt, i) => {
                const isSelected = demoSelected === i
                const isCorrect = i === demoQuestion.correct
                let stateStyle = 'neu-raised-sm bg-card hover:border-accent/40 text-foreground'

                if (demoSubmitted) {
                  if (isCorrect) stateStyle = 'neu-inset-sm border-2 border-accent text-accent font-bold bg-background'
                  else if (isSelected && !isCorrect)
                    stateStyle = 'neu-inset-xs border-destructive/50 text-destructive bg-destructive/5'
                } else if (isSelected) {
                  stateStyle = 'neu-inset-sm border-2 border-accent text-foreground bg-background'
                }

                return (
                  <button
                    key={opt}
                    onClick={() => {
                      if (!demoSubmitted) setDemoSelected(i)
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border border-border/80 text-left text-sm font-medium transition-all ${stateStyle}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid size-6 place-items-center rounded-lg text-xs font-mono font-bold neu-inset-xs text-muted-foreground">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt}</span>
                    </span>
                    {demoSubmitted && isCorrect && <Check className="size-4 text-accent" />}
                  </button>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs font-mono text-muted-foreground">
                {demoSubmitted
                  ? demoSelected === demoQuestion.correct
                    ? 'Correct! +80 points awarded to balance.'
                    : 'Not quite! The correct answer was an encrypted cassette tape.'
                  : 'Select an option to test the answering engine.'}
              </p>

              {!demoSubmitted ? (
                <button
                  disabled={demoSelected === null}
                  onClick={() => setDemoSubmitted(true)}
                  className="neu-button-primary rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={() => {
                    setDemoSubmitted(false)
                    setDemoSelected(null)
                  }}
                  className="neu-button rounded-xl px-6 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  Reset Demo
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
          HOW IT WORKS
          ═════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 border-t border-border/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
              SEAMLESS FLOW
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mt-2">
              How Campfire Works
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Built for speed, simplicity, and maximum fan retention.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="neu-card p-6 sm:p-8 border border-border/80 flex flex-col justify-between">
              <div>
                <div className="grid size-12 place-items-center rounded-2xl neu-convex text-accent mb-6 font-serif font-bold text-lg">
                  1
                </div>
                <h3 className="font-serif text-xl font-bold">1-Click Subscribe & Verify</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Fans authenticate with YouTube/Google or mobile phone OTP. Our automated backend validates their active subscription in real-time.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-[11px] font-mono text-accent font-bold">
                +150 Instant Subscriber Bonus
              </div>
            </div>

            <div className="neu-card p-6 sm:p-8 border border-accent/40 bg-card ruby-glow flex flex-col justify-between">
              <div>
                <div className="grid size-12 place-items-center rounded-2xl neu-raised text-accent mb-6 font-serif font-bold text-lg">
                  2
                </div>
                <h3 className="font-serif text-xl font-bold">Play Episode Lore Quests</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Answer multiple-choice recall questions created by AI from episode scripts. Build daily streaks and climb the live leaderboards.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-[11px] font-mono text-accent font-bold">
                Accuracy & Streak Multipliers
              </div>
            </div>

            <div className="neu-card p-6 sm:p-8 border border-border/80 flex flex-col justify-between">
              <div>
                <div className="grid size-12 place-items-center rounded-2xl neu-convex text-accent mb-6 font-serif font-bold text-lg">
                  3
                </div>
                <h3 className="font-serif text-xl font-bold">Win Cash & Real Perks</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Top leaderboard champions claim weekly cash rewards sent straight to M-Pesa, shoutouts, and 1-on-1 creator consultation calls.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-[11px] font-mono text-accent font-bold">
                M-Pesa & PayPal Payout Rails
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
          MONETIZATION & WINNER REWARDS
          ═════════════════════════════════════════════ */}
      <section id="monetization" className="py-20 border-t border-border/80 bg-background/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
              REAL MONETIZATION
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mt-2">
              Perks Worth Competing For
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Rewarding superfans with real cash rewards, on-screen recognition, and VIP creator access.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="neu-card p-6 sm:p-8 border border-accent/40 bg-card ruby-glow flex flex-col justify-between">
              <div>
                <div className="grid size-12 place-items-center rounded-2xl neu-raised text-accent mb-6">
                  <Banknote className="size-6 text-accent" />
                </div>
                <span className="text-[10px] font-mono uppercase text-accent font-bold">WEEKLY GRAND PRIZE</span>
                <h3 className="font-serif text-xl font-bold mt-1">KES 5,000 Cash Prize</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Disbursed directly to the #1 top ranking fan at the end of each weekly cycle via M-Pesa or PayPal.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-xs font-mono font-bold text-accent">
                3,000 PTS Required
              </div>
            </div>

            <div className="neu-card p-6 sm:p-8 border border-border/80 flex flex-col justify-between">
              <div>
                <div className="grid size-12 place-items-center rounded-2xl neu-convex text-accent mb-6">
                  <Mic className="size-6 text-accent" />
                </div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">TIER 1 RECOGNITION</span>
                <h3 className="font-serif text-xl font-bold mt-1">Episode Opening Shoutout</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Your fan name and custom shoutout featured in the opening credits of the next video drop.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-xs font-mono font-bold text-accent">
                1,500 PTS Required
              </div>
            </div>

            <div className="neu-card p-6 sm:p-8 border border-border/80 flex flex-col justify-between">
              <div>
                <div className="grid size-12 place-items-center rounded-2xl neu-convex text-accent mb-6">
                  <Flame className="size-6 text-accent" />
                </div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">VIP ACCESS</span>
                <h3 className="font-serif text-xl font-bold mt-1">1-on-1 Story Consultation</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  30-minute private Zoom consultation with the creator to review upcoming video ideas and behind-the-scenes lore.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 text-xs font-mono font-bold text-accent">
                5,000 PTS Required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
          CREATOR STUDIO & AI ENGINE
          ═════════════════════════════════════════════ */}
      <section id="creator-studio" className="py-20 border-t border-border/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
                CREATOR TOOLKIT
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mt-2">
                Turn Raw Transcripts into Playable Quests in 10 Seconds
              </h2>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                No tedious question writing. Paste your YouTube script or production notes. Our AI analyzes plot points, vehicles, timelines, and lore to synthesize high-quality 4-option questions with accurate point distributions.
              </p>

              <div className="mt-8 space-y-3.5 text-xs font-medium">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-4 text-accent shrink-0" />
                  <span>AI Question & Distractor Generation with 1-Click Publishing</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-4 text-accent shrink-0" />
                  <span>Subscriber-Gating & Watch Confirmation for Maximum Retention</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-4 text-accent shrink-0" />
                  <span>Winner Payout Queue with Instant M-Pesa & PayPal Record Tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-4 text-accent shrink-0" />
                  <span>Automated Sponsor Pitch PDF Deck Generator</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/register"
                  className="neu-button-primary rounded-xl px-6 py-3.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <span>Launch Creator Studio</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            <div className="neu-card p-6 border border-border/90 bg-card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
                <span className="text-xs font-mono text-accent font-bold">AI STUDIO SIMULATION</span>
                <span className="text-[10px] font-mono text-muted-foreground">NEON DB</span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl neu-inset-sm border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="size-4 text-accent" />
                    <div>
                      <p className="text-xs font-bold">Script Analysis: Episode 42</p>
                      <p className="text-[10px] font-mono text-muted-foreground">3 Lore Questions Extracted</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-accent font-bold">SYNTHESIZED</span>
                </div>

                <div className="p-4 rounded-2xl neu-inset-sm border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Banknote className="size-4 text-accent" />
                    <div>
                      <p className="text-xs font-bold">Winner Disbursement Queue</p>
                      <p className="text-[10px] font-mono text-muted-foreground">KES 5,000 M-Pesa to Kofi B.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-accent font-bold">VERIFIED</span>
                </div>

                <div className="p-4 rounded-2xl neu-inset-sm border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="size-4 text-accent" />
                    <div>
                      <p className="text-xs font-bold">Sponsor PDF Report</p>
                      <p className="text-[10px] font-mono text-muted-foreground">84% Retention · 5,000+ Plays</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-accent font-bold">READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
          FAQ ACCORDION
          ═════════════════════════════════════════════ */}
      <section id="faq" className="py-20 border-t border-border/80 bg-background/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
              GOT QUESTIONS?
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = faqOpen === index
              return (
                <div
                  key={faq.q}
                  className="neu-card border border-border/80 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4"
                  >
                    <span className="font-serif text-base font-bold">{faq.q}</span>
                    <ChevronDown
                      className={`size-4 text-accent shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
          CTA BANNER & FOOTER
          ═════════════════════════════════════════════ */}
      <section className="py-20 border-t border-border/80 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
            Ready to Experience Campfire?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Join the inner circle, answer episode questions, and compete for weekly cash rewards.
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
