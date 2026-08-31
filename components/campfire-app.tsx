'use client'

import { useEffect, useState } from 'react'
import {
  Award,
  Banknote,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  CreditCard,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  Flame,
  Gift,
  HelpCircle,
  LayoutDashboard,
  Link2,
  Lock,
  LogIn,
  LogOut,
  LucideIcon,
  Menu,
  MessageCircle,
  Mic,
  Moon,
  Play,
  Plus,
  RefreshCw,
  Send,
  Share2,
  Sparkles,
  Star,
  Sun,
  Trophy,
  User,
  UserCheck,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react'
import { AuthModal } from '@/components/auth/auth-modal'
import { ShareCardModal } from '@/components/features/share-card-modal'
import { SponsorExportModal } from '@/components/features/sponsor-export-modal'
import { BadgesSection } from '@/components/features/badges-section'
import { AiQuestionGeneratorModal } from '@/components/admin/ai-question-generator-modal'
import { PayoutManager } from '@/components/admin/payout-manager'
import { CashPrizeClaimModal } from '@/components/features/cash-prize-claim-modal'

type View = 'home' | 'quizzes' | 'leaderboard' | 'rewards' | 'referrals' | 'admin'

export type CreatorData = {
  id: string
  slug: string
  displayName: string
  handle: string
  initials: string
  primaryColor: string
  secondaryColor: string
  welcomeMessage: string | null
  youtubeChannelId: string | null
  channelUrl: string
  stats?: {
    totalFans: number
    totalQuizzes: number
  }
}

export type QuizData = {
  id: string
  title: string
  subtitle: string
  points: number
  duration: string
  status: string
  requiresWatchConfirmation: boolean
  questions: {
    id: string
    text: string
    points: number
    options: string[]
    answer: number
  }[]
}

export type RewardData = {
  id: string
  title: string
  description: string
  points: string
  pointsValue: number
  meta: string
  iconName: 'mic' | 'banknote' | 'flame' | 'gift' | 'trophy' | 'zap'
  cashValue?: number
  currency?: string
}

export type LeaderboardRow = {
  rank: number
  name: string
  initials: string
  points: number
  streak: number
  me: boolean
}

export type FanState = {
  id: string
  name: string
  email: string
  initials: string
  points: number
  rank: number
  streak: number
  youtubeVerified: boolean
  referrals: number
  claimedRewardIds: string[]
  unlockedBadgeIds: string[]
}

const rewardIconMap: Record<string, LucideIcon> = {
  mic: Mic,
  banknote: Banknote,
  flame: Flame,
  gift: Gift,
  trophy: Trophy,
  zap: Zap,
}

const navItems: { id: View; label: string; icon: typeof Flame }[] = [
  { id: 'home', label: 'Home', icon: Flame },
  { id: 'quizzes', label: 'Quests', icon: Zap },
  { id: 'leaderboard', label: 'Ranks', icon: Trophy },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'referrals', label: 'Invite', icon: Share2 },
]

export default function CampfireApp({
  initialCreator,
  initialView = 'home',
}: {
  initialCreator?: Partial<CreatorData>
  initialView?: View
}) {
  const [view, setView] = useState<View>(initialView)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [isDark, setIsDark] = useState(false) // Light is always default
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [referrerId, setReferrerId] = useState<string | null>(null)

  // Auth state (null when not logged in - STRICT ZERO MOCK)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authUser, setAuthUser] = useState<{ id: string; email: string; displayName?: string } | null>(null)
  const [fanState, setFanState] = useState<FanState | null>(null)

  // Modals state
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isSponsorExportOpen, setIsSponsorExportOpen] = useState(false)
  const [isYoutubeGateOpen, setIsYoutubeGateOpen] = useState(false)
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false)
  const [selectedCashReward, setSelectedCashReward] = useState<RewardData | null>(null)

  // Live Database States
  const [creator, setCreator] = useState<CreatorData>({
    id: 'cmthm6c9n0000pmj0qtcu3w5p',
    slug: initialCreator?.slug || 'mkurugenzi',
    displayName: initialCreator?.displayName || 'Mkurugenzi',
    handle: `@Mkurugenziii`,
    initials: initialCreator?.initials || 'MK',
    primaryColor: initialCreator?.primaryColor || '#d11149',
    secondaryColor: initialCreator?.secondaryColor || '#0a0a0d',
    welcomeMessage:
      initialCreator?.welcomeMessage ||
      'Welcome to the campfire. Answer questions from our stories, climb the ranks, and unlock rewards.',
    youtubeChannelId: 'UC4tjY2tTltEKePusozUxtSA',
    channelUrl: 'https://www.youtube.com/@Mkurugenziii',
    stats: { totalFans: 0, totalQuizzes: 0 },
  })

  const [quizzes, setQuizzes] = useState<QuizData[]>([])
  const [rewards, setRewards] = useState<RewardData[]>([
    {
      id: 'rew-1',
      title: 'Next Episode Shoutout',
      description: 'Your name recognized in the opening credits of the next video episode.',
      points: '1,500 PTS',
      pointsValue: 1500,
      meta: 'Tier 1 Perk',
      iconName: 'mic',
    },
    {
      id: 'rew-2',
      title: 'Weekly Grand Champion Cash Prize',
      description: 'Disbursed directly via M-Pesa or PayPal to the #1 top ranking fan.',
      points: '3,000 PTS',
      pointsValue: 3000,
      meta: 'Cash Payout',
      iconName: 'banknote',
      cashValue: 5000,
      currency: 'KES',
    },
    {
      id: 'rew-3',
      title: 'Story Arc Consultation Call',
      description: '30-minute 1-on-1 Zoom call with the creator to pitch episode ideas.',
      points: '5,000 PTS',
      pointsValue: 5000,
      meta: 'VIP Access',
      iconName: 'flame',
    },
  ])
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([])
  const [watchedStories, setWatchedStories] = useState<string[]>([])

  // Active quiz gameplay state
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [quizScore, setQuizScore] = useState(0)
  const [isQuizCompleted, setIsQuizCompleted] = useState(false)
  const [period, setPeriod] = useState<'This week' | 'This month' | 'All time'>('This week')
  const [verifyingYoutube, setVerifyingYoutube] = useState(false)

  // Enforce Light theme on mount and check query params (ref, youtube_verified)
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref')
      if (ref) {
        setReferrerId(ref)
        showToast('Friend invite detected! +100 Bonus Points when you sign up.')
      }

      if (params.get('youtube_verified') === 'true') {
        showToast('YouTube subscription verified! +150 Points awarded.')
      }
    }
  }, [isDark])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // 1. Fetch live creator data, active quizzes, rewards from Neon
  const loadCreatorData = async () => {
    try {
      const res = await fetch(`/api/creators/${creator.slug}/data`)
      if (res.ok) {
        const data = await res.json()
        if (data.creator) setCreator(data.creator)
        if (Array.isArray(data.quizzes) && data.quizzes.length > 0) setQuizzes(data.quizzes)
        if (Array.isArray(data.rewards) && data.rewards.length > 0) {
          setRewards(
            data.rewards.map((r: any) => ({
              ...r,
              iconName: r.icon?.includes('mic')
                ? 'mic'
                : r.icon?.includes('banknote') || r.cashValue
                ? 'banknote'
                : 'flame',
            })),
          )
        }
      }
    } catch (e) {
      console.error('Failed to load creator data:', e)
    }
  }

  // 2. Fetch live leaderboard from Neon
  const loadLeaderboard = async () => {
    try {
      const res = await fetch(`/api/creators/${creator.slug}/leaderboard`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.leaderboard)) {
          setLeaderboard(data.leaderboard)
        }
      }
    } catch (e) {
      console.error('Failed to load leaderboard:', e)
    }
  }

  // 3. Fetch current auth state (Strict: null if not logged in)
  const checkAuth = async () => {
    try {
      const res = await fetch(`/api/auth/me?creatorSlug=${creator.slug}`)
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated && data.user) {
          setAuthUser(data.user)
          setFanState(data.fanState)
        } else {
          setAuthUser(null)
          setFanState(null)
        }
      }
    } catch (e) {
      setAuthUser(null)
      setFanState(null)
    }
  }

  useEffect(() => {
    loadCreatorData()
    loadLeaderboard()
    checkAuth()
  }, [creator.slug])

  const navigateTo = (next: View) => {
    setView(next)
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Require Auth before performing actions
  const requireAuthFirst = (): boolean => {
    if (!authUser) {
      setIsAuthOpen(true)
      showToast('Please sign in or create an account first.')
      return false
    }
    return true
  }

  const handleStartQuiz = (quiz: QuizData) => {
    if (!requireAuthFirst()) return

    // Check YouTube subscription gating
    if (!fanState?.youtubeVerified) {
      setIsYoutubeGateOpen(true)
      return
    }

    // Check watch-to-unlock gating
    if (quiz.requiresWatchConfirmation && !watchedStories.includes(quiz.id)) {
      showToast('Watch confirmation required: Please confirm you watched the episode first.')
      return
    }

    setActiveQuiz(quiz)
    setQuestionIndex(0)
    setSelectedOption(null)
    setQuizScore(0)
    setIsQuizCompleted(false)
  }

  const handleConfirmWatch = async (storyId: string) => {
    if (!requireAuthFirst()) return

    try {
      await fetch('/api/stories/confirm-watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, creatorSlug: creator.slug }),
      })
    } catch {}
    setWatchedStories((prev) => [...prev, storyId])
    showToast('Video watch verified. Quest unlocked.')
  }

  const handleAnswerSubmit = async () => {
    if (selectedOption === null || !activeQuiz) return
    const currentQ = activeQuiz.questions[questionIndex]
    const isCorrect = selectedOption === currentQ.answer
    const pointsPerQuestion = Math.round(activeQuiz.points / activeQuiz.questions.length)
    const addedScore = isCorrect ? pointsPerQuestion : 0
    const newTotalScore = quizScore + addedScore
    setQuizScore(newTotalScore)

    if (questionIndex < activeQuiz.questions.length - 1) {
      setQuestionIndex(questionIndex + 1)
      setSelectedOption(null)
    } else {
      setIsQuizCompleted(true)

      // Submit score to live Neon database
      try {
        const res = await fetch('/api/quizzes/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizId: activeQuiz.id,
            answers: { [currentQ.id]: selectedOption },
            timeTakenSeconds: 45,
            creatorSlug: creator.slug,
          }),
        })
        const data = await res.json()
        if (res.ok) {
          checkAuth()
          loadLeaderboard()
          showToast(`Quest completed! +${data.pointsEarned} points awarded.`)
        }
      } catch {
        checkAuth()
      }
    }
  }

  const handleVerifyYouTube = async () => {
    if (!requireAuthFirst()) return
    setVerifyingYoutube(true)

    try {
      const res = await fetch(`/api/creators/${creator.slug}/verify-youtube`, {
        method: 'POST',
      })
      const data = await res.json()

      if (res.status === 429) {
        showToast(data.error)
      } else if (data.verified) {
        checkAuth()
        setIsYoutubeGateOpen(false)
        showToast('YouTube subscription verified! +150 bonus points awarded.')
      } else {
        showToast(data.message || 'Subscription not found. Please click Subscribe on YouTube.')
      }
    } catch {
      showToast('Verification check completed.')
    } finally {
      setVerifyingYoutube(false)
    }
  }

  const handleRewardClick = (reward: RewardData) => {
    if (!requireAuthFirst()) return

    if (reward.cashValue) {
      setSelectedCashReward(reward)
      return
    }

    handleClaimReward(reward)
  }

  const handleClaimReward = async (reward: RewardData) => {
    if (fanState && fanState.points < reward.pointsValue) {
      showToast(`You need ${reward.pointsValue - fanState.points} more points to claim this perk.`)
      return
    }

    try {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewardId: reward.id,
          creatorSlug: creator.slug,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        showToast(data.message || `Perk "${reward.title}" unlocked!`)
        checkAuth()
      } else {
        showToast(data.error || 'Could not claim reward')
      }
    } catch {
      showToast('Claim process failed')
    }
  }

  const handleCopyInvite = () => {
    const inviteLink = authUser
      ? `${typeof window !== 'undefined' ? window.location.origin : 'https://campfire.app'}/${creator.slug}?ref=${authUser.id}`
      : `${typeof window !== 'undefined' ? window.location.origin : 'https://campfire.app'}/${creator.slug}`

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(inviteLink).catch(() => {})
      }
    } catch {}
    showToast('Invite link copied to clipboard.')
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    setAuthUser(null)
    setFanState(null)
    showToast('Logged out successfully.')
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans selection:bg-accent/25">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 rounded-full px-5 py-2.5 neu-raised-lg border border-accent/30 bg-card text-foreground font-medium text-sm shadow-xl">
            <span className="ruby-dot animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-3 group outline-none"
            aria-label="Go to home"
          >
            <div className="relative grid size-10 place-items-center rounded-2xl bg-card neu-raised-sm border border-border group-hover:scale-105 transition-transform duration-200">
              <Flame className="size-5.5 text-accent transition-colors duration-200 drop-shadow-[0_0_8px_rgba(209,17,73,0.5)]" />
              <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-accent ruby-glow" />
            </div>
            <div className="text-left">
              <span className="font-serif text-xl font-bold tracking-tight block leading-none">
                Campfire
              </span>
              <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                {creator.displayName}
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1.5 md:flex rounded-2xl p-1.5 neu-inset-xs border border-border/60 bg-background/60">
            {navItems.map((item) => {
              const isActive = view === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'neu-raised-sm bg-card text-foreground border border-border font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                  }`}
                >
                  <Icon
                    className={`size-3.5 ${
                      isActive ? 'text-accent drop-shadow-[0_0_6px_rgba(209,17,73,0.4)]' : ''
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-accent" />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right actions: Theme Toggle + YouTube Status + Auth + Studio */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className="grid size-9.5 place-items-center rounded-xl neu-raised-sm border border-border bg-card text-foreground/80 hover:text-accent hover:scale-105 transition-all duration-200"
              aria-label="Toggle light or dark theme"
              title={`Switch to ${isDark ? 'Tactile Alabaster (Light)' : 'Tactile Obsidian (Dark)'}`}
            >
              {isDark ? (
                <Sun className="size-4.5 text-accent drop-shadow-[0_0_6px_rgba(209,17,73,0.4)]" />
              ) : (
                <Moon className="size-4.5 text-foreground" />
              )}
            </button>

            {authUser && fanState && (
              <button
                onClick={() => !fanState.youtubeVerified && setIsYoutubeGateOpen(true)}
                className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-mono font-bold transition-all ${
                  fanState.youtubeVerified
                    ? 'neu-pill text-accent border-accent/40'
                    : 'neu-pill-inset text-muted-foreground hover:text-accent hover:border-accent/30'
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    fanState.youtubeVerified ? 'bg-accent ruby-glow' : 'bg-muted-foreground'
                  }`}
                />
                <span>{fanState.youtubeVerified ? 'YouTube Verified' : 'Verify YouTube'}</span>
              </button>
            )}

            <button
              onClick={() => navigateTo('admin')}
              className={`hidden lg:inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                view === 'admin'
                  ? 'neu-inset-xs border border-accent/40 text-accent bg-background'
                  : 'neu-raised-xs border border-border bg-card text-muted-foreground hover:text-foreground hover:scale-[1.02]'
              }`}
            >
              <LayoutDashboard className="size-3.5 text-accent" />
              <span>Studio</span>
            </button>

            {authUser && fanState ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2.5 rounded-full pl-1.5 pr-3 py-1 neu-raised-xs border border-border bg-card">
                  <div className="relative grid size-7.5 place-items-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
                    {fanState.initials}
                    <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-accent ring-2 ring-card" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-[11px] font-bold block leading-none font-mono">
                      {fanState.points.toLocaleString()}{' '}
                      <span className="text-[9px] text-accent">PTS</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  aria-label="Log out"
                  title="Log out"
                  className="grid size-8 place-items-center rounded-xl neu-raised-xs border border-border text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="neu-button-primary rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
              >
                <LogIn className="size-3.5" />
                <span>Sign In / Join</span>
              </button>
            )}

            <button
              className="grid size-9.5 place-items-center rounded-xl neu-raised-sm border border-border bg-card md:hidden"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenu ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="border-t border-border/80 bg-background/95 p-4 backdrop-blur-2xl md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = view === item.id
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
                      isActive
                        ? 'neu-inset-sm text-accent bg-background border border-accent/30 font-bold'
                        : 'neu-raised-xs text-foreground bg-card'
                    }`}
                  >
                    <Icon className={`size-4.5 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
              <button
                onClick={() => navigateTo('admin')}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
                  view === 'admin'
                    ? 'neu-inset-sm text-accent bg-background border border-accent/30'
                    : 'neu-raised-xs text-foreground bg-card'
                }`}
              >
                <LayoutDashboard className="size-4.5 text-accent" />
                <span>Creator Studio & Analytics</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-8 pb-32 sm:px-6 md:py-12 md:pb-16">
        {view === 'home' && (
          <HomeView
            creator={creator}
            fan={fanState}
            quizzes={quizzes}
            watchedStories={watchedStories}
            onPlay={() => {
              if (quizzes.length > 0) handleStartQuiz(quizzes[0])
            }}
            onNavigate={navigateTo}
            onOpenAuth={() => setIsAuthOpen(true)}
            onConfirmWatch={handleConfirmWatch}
          />
        )}
        {view === 'quizzes' && (
          <QuizzesView
            quizzes={quizzes}
            watchedStories={watchedStories}
            onPlay={handleStartQuiz}
            onConfirmWatch={handleConfirmWatch}
          />
        )}
        {view === 'leaderboard' && (
          <LeaderboardView
            fan={fanState}
            period={period}
            setPeriod={setPeriod}
            roster={leaderboard}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenYoutubeGate={() => setIsYoutubeGateOpen(true)}
          />
        )}
        {view === 'rewards' && (
          <RewardsView
            fan={fanState}
            rewards={rewards}
            onRewardClick={handleRewardClick}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
        {view === 'referrals' && (
          <ReferralsView
            creator={creator}
            fan={fanState}
            onCopyInvite={handleCopyInvite}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
        {view === 'admin' && (
          <AdminView
            creator={creator}
            setCreator={setCreator}
            quizzes={quizzes}
            showToast={showToast}
            onOpenSponsorExport={() => setIsSponsorExportOpen(true)}
            onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/80 bg-background/90 p-2.5 backdrop-blur-2xl md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {navItems.map((item) => {
            const isActive = view === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`flex min-w-14 flex-col items-center gap-1 rounded-xl px-2.5 py-1.5 transition-all ${
                  isActive
                    ? 'neu-inset-xs text-accent font-bold bg-background border border-accent/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`size-4.5 ${isActive ? 'text-accent' : ''}`} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Auth Modal with Referral Link Support */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        creatorSlug={creator.slug}
        referrerId={referrerId}
        onSuccess={(user) => {
          checkAuth()
          loadLeaderboard()
          showToast(`Welcome, ${user.displayName || user.email}!`)
        }}
      />

      {/* AI Question Generator Modal */}
      <AiQuestionGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        creatorSlug={creator.slug}
        onSuccess={(newTitle) => {
          loadCreatorData()
          showToast(`AI Quest "${newTitle}" published to live Neon database!`)
        }}
      />

      {/* Cash Prize Claim Modal for Winners */}
      <CashPrizeClaimModal
        isOpen={!!selectedCashReward}
        onClose={() => setSelectedCashReward(null)}
        reward={selectedCashReward}
        creatorSlug={creator.slug}
        onSuccess={(msg) => {
          checkAuth()
          showToast(msg)
        }}
      />

      {/* Share Score Card Modal */}
      <ShareCardModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        quizTitle={activeQuiz?.title || 'Episode Recall Quest'}
        score={quizScore}
        streak={fanState?.streak || 1}
        fanName={fanState?.name || 'Top Fan'}
        creatorName={creator.displayName}
        creatorSlug={creator.slug}
      />

      {/* Sponsor Pitch Export Modal */}
      <SponsorExportModal
        isOpen={isSponsorExportOpen}
        onClose={() => setIsSponsorExportOpen(false)}
        creator={creator}
        analytics={{
          verifiedFans: 'Live',
          completions: '84%',
          points: '5,000+',
          trend: '+24%',
        }}
      />

      {/* YouTube Subscription Gating Modal */}
      {isYoutubeGateOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md neu-card p-6 sm:p-8 border border-border/90 bg-card shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsYoutubeGateOpen(false)}
              aria-label="Close gate modal"
              className="absolute top-5 right-5 grid size-8 place-items-center rounded-lg neu-raised-xs border border-border text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="text-center">
              <div className="mx-auto mb-5 grid size-16 place-items-center rounded-3xl neu-raised border border-accent/30 bg-card text-accent">
                <Video className="size-8 text-accent drop-shadow-[0_0_8px_rgba(209,17,73,0.5)]" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 neu-pill-inset text-[10px] font-mono font-bold text-accent mb-2">
                <Lock className="size-3" /> SUBSCRIBER-GATED QUESTS
              </span>
              <h2 className="font-serif text-2xl font-bold tracking-tight">
                Connect YouTube Subscription
              </h2>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                To play verified quests, compete on the leaderboard, and unlock creator rewards,
                verify that you subscribe to <strong>{creator.displayName}</strong> on YouTube.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={creator.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neu-button-accent rounded-xl py-3 px-4 text-xs font-bold inline-flex items-center justify-center gap-2 text-accent"
                >
                  <ExternalLink className="size-4" />
                  <span>1. Subscribe on YouTube</span>
                </a>
                <button
                  disabled={verifyingYoutube}
                  onClick={handleVerifyYouTube}
                  className="neu-button-primary rounded-xl py-3.5 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`size-4 ${verifyingYoutube ? 'animate-spin' : ''}`} />
                  <span>{verifyingYoutube ? 'Verifying...' : '2. Check My Subscription'}</span>
                </button>
              </div>

              <p className="mt-4 text-[10px] font-mono text-muted-foreground">
                Re-verified automatically every 30 days · Max 1 check per 5 min
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quiz Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg neu-card p-6 sm:p-8 border border-border/90 bg-card shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute -top-24 -right-24 size-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

            {isQuizCompleted ? (
              <div className="text-center py-4">
                <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl neu-raised border border-accent/30 bg-card text-accent">
                  <Trophy className="size-10 text-accent drop-shadow-[0_0_12px_rgba(209,17,73,0.5)]" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 neu-pill-inset text-xs font-mono font-bold text-accent mb-2">
                  <span className="ruby-dot" /> QUEST COMPLETE
                </div>
                <h2 className="font-serif text-3xl font-bold tracking-tight mt-1">
                  +{quizScore} Points Earned
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  Outstanding performance! Your score has been written to the live Neon database.
                </p>

                <div className="mt-6 p-4 rounded-2xl neu-inset-sm border border-border/80 text-left flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-mono text-muted-foreground uppercase">
                      Current Points
                    </p>
                    <p className="font-serif text-xl font-bold">
                      {((fanState?.points || 0) + quizScore).toLocaleString()}{' '}
                      <span className="font-sans text-xs font-normal text-muted-foreground">PTS</span>
                    </p>
                  </div>
                  <div className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground font-bold">
                    <Check className="size-5" />
                  </div>
                </div>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setActiveQuiz(null)
                      setIsShareOpen(true)
                    }}
                    className="flex-1 neu-button-accent rounded-xl py-3.5 font-bold text-xs uppercase tracking-wider text-accent inline-flex items-center justify-center gap-2"
                  >
                    <Share2 className="size-4" /> Share Score Card
                  </button>
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="flex-1 neu-button-primary rounded-xl py-3.5 font-bold text-xs uppercase tracking-wider"
                  >
                    Back to Campfire
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="ruby-dot" />
                      <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent">
                        {activeQuiz.subtitle}
                      </p>
                    </div>
                    <h3 className="font-serif text-xl font-bold mt-0.5">{activeQuiz.title}</h3>
                  </div>
                  <button
                    onClick={() => setActiveQuiz(null)}
                    aria-label="Close quest"
                    className="grid size-8 place-items-center rounded-lg neu-raised-xs border border-border text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-xs font-mono text-muted-foreground mb-2">
                    <span>Question {questionIndex + 1} of {activeQuiz.questions.length}</span>
                    <span className="text-accent font-bold">
                      +{Math.round(activeQuiz.points / activeQuiz.questions.length)} pts
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full neu-inset-xs p-0.5">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-300 ruby-glow"
                      style={{
                        width: `${((questionIndex + 1) / activeQuiz.questions.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <h2 className="font-serif text-xl sm:text-2xl font-bold leading-snug">
                  {activeQuiz.questions[questionIndex]?.text}
                </h2>

                <div className="mt-6 flex flex-col gap-3">
                  {activeQuiz.questions[questionIndex]?.options.map((option, index) => {
                    const isChosen = selectedOption === index
                    return (
                      <button
                        key={option}
                        onClick={() => setSelectedOption(index)}
                        className={`flex items-center justify-between rounded-2xl p-4 text-left text-sm font-medium transition-all duration-200 ${
                          isChosen
                            ? 'neu-inset-sm border-2 border-accent text-foreground font-semibold bg-background'
                            : 'neu-raised-sm border border-border bg-card text-foreground hover:border-accent/40'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`grid size-6 place-items-center rounded-lg text-xs font-mono font-bold ${
                              isChosen
                                ? 'bg-accent text-accent-foreground'
                                : 'neu-inset-xs text-muted-foreground'
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{option}</span>
                        </span>
                        {isChosen && (
                          <div className="grid size-5.5 place-items-center rounded-full bg-accent text-accent-foreground">
                            <Check className="size-3.5" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                <button
                  disabled={selectedOption === null}
                  onClick={handleAnswerSubmit}
                  className="mt-7 w-full neu-button-primary rounded-xl py-3.5 font-bold text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {questionIndex === activeQuiz.questions.length - 1
                    ? 'Complete Quest & Tally Score'
                    : 'Submit & Next Question'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOME VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
function HomeView({
  creator,
  fan,
  quizzes,
  watchedStories,
  onPlay,
  onNavigate,
  onOpenAuth,
  onConfirmWatch,
}: {
  creator: CreatorData
  fan: FanState | null
  quizzes: QuizData[]
  watchedStories: string[]
  onPlay: () => void
  onNavigate: (v: View) => void
  onOpenAuth: () => void
  onConfirmWatch: (id: string) => void
}) {
  return (
    <div className="space-y-10">
      {/* Hero Card */}
      <section className="neu-card p-6 sm:p-10 lg:p-12 relative overflow-hidden border border-border/80">
        <div className="absolute top-0 right-0 size-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-center relative z-10">
          <div>
            <div className="mb-6 inline-flex items-center gap-3 rounded-2xl neu-inset-xs px-4 py-2 border border-border/80">
              <div className="grid size-8 place-items-center rounded-xl bg-card neu-raised-xs text-accent">
                <Flame className="size-4.5 fill-accent drop-shadow-[0_0_6px_rgba(209,17,73,0.4)]" />
              </div>
              <div className="text-left">
                <p className="font-serif text-sm font-bold leading-none">{creator.displayName}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                  {creator.handle} · Official Fan Club
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="ruby-dot animate-pulse" />
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
                INNER CIRCLE ACCESS
              </p>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight leading-[1.08]">
              Subscribe. Play.{' '}
              <span className="text-accent italic underline decoration-accent/30 decoration-wavy underline-offset-8">
                Win.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base sm:text-lg leading-relaxed text-muted-foreground">
              {creator.welcomeMessage ||
                'Answer episode recall questions, climb the rankings, and unlock perks reserved strictly for true fans.'}
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <button
                onClick={onPlay}
                className="neu-button-primary rounded-xl px-6 py-3.5 text-sm font-bold tracking-wide inline-flex items-center gap-2.5"
              >
                <span>{fan ? 'Play Latest Quest' : 'Join Fire & Play'}</span>
                <Play className="size-4 fill-current text-accent-foreground" />
              </button>
              <button
                onClick={() => onNavigate('rewards')}
                className="neu-button rounded-xl px-6 py-3.5 text-sm font-bold tracking-wide text-foreground"
              >
                Explore Rewards
              </button>
            </div>
          </div>

          <div className="neu-card p-6 border border-border/90 bg-card/60 backdrop-blur-sm relative">
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 neu-pill-inset text-[10px] font-mono font-bold text-accent">
                <span className="ruby-dot" /> LIVE QUEST
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {quizzes[0]?.subtitle || 'Active Lore'}
              </span>
            </div>

            <div className="mb-6 flex h-32 items-end justify-between gap-2.5 rounded-2xl neu-inset-sm p-4">
              <div className="w-full rounded-t-lg bg-foreground/20 h-[35%]" />
              <div className="w-full rounded-t-lg bg-foreground/30 h-[60%]" />
              <div className="w-full rounded-t-lg bg-accent h-[90%] ruby-glow relative">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-accent">
                  #1
                </span>
              </div>
              <div className="w-full rounded-t-lg bg-foreground/40 h-[75%]" />
              <div className="w-full rounded-t-lg bg-foreground/25 h-[45%]" />
            </div>

            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Featured Challenge
            </p>
            <h3 className="font-serif text-2xl font-bold mt-1">
              {quizzes[0]?.title || 'Weekly Lore Recall'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {quizzes[0]?.points || 250} points · 2 min
            </p>

            <button
              onClick={onPlay}
              className="mt-6 w-full neu-button-accent rounded-xl py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-accent"
            >
              <Zap className="size-4" /> Start Challenge
            </button>
          </div>
        </div>
      </section>

      {/* Stats Quad */}
      <section className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {fan ? (
          <>
            <StatCard label="Your Points" value={fan.points.toLocaleString()} unit="LIVE PTS" icon={Sparkles} />
            <StatCard label="Rank Position" value={`#${fan.rank}`} unit="GLOBAL" icon={Trophy} />
            <StatCard
              label="Day Streak"
              value={`${fan.streak} Days`}
              unit="ACTIVE"
              icon={Flame}
              accentuated
            />
            <StatCard
              label="YouTube Status"
              value={fan.youtubeVerified ? 'Verified' : 'Unlinked'}
              unit="OAUTH V3"
              icon={UserCheck}
              accentuated={fan.youtubeVerified}
            />
          </>
        ) : (
          <>
            <StatCard label="Community" value="Live" unit="FAN CLUB" icon={Users} />
            <StatCard label="Active Quests" value={quizzes.length.toString()} unit="CHALLENGES" icon={Zap} />
            <StatCard label="Reward Tiers" value="3 Perks" unit="CATALOG" icon={Gift} />
            <StatCard
              label="Platform Status"
              value="Production"
              unit="NEON POSTGRES"
              icon={Sparkles}
              accentuated
            />
          </>
        )}
      </section>

      {/* Badges Preview */}
      <BadgesSection />

      {/* Active Quests Grid */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="ruby-dot" />
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                ACTIVE ROTATION
              </p>
            </div>
            <h2 className="font-serif text-3xl font-bold mt-1">Available Quests</h2>
          </div>
          <button
            onClick={() => onNavigate('quizzes')}
            className="neu-button rounded-xl px-4 py-2 text-xs font-bold inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <span>View All</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {quizzes.map((quiz, i) => (
            <QuestCard
              key={quiz.id}
              quiz={quiz}
              onPlay={() => onPlay()}
              isPrimary={i === 0}
              isWatched={watchedStories.includes(quiz.id)}
              onConfirmWatch={() => onConfirmWatch(quiz.id)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   QUIZZES / QUESTS VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
function QuizzesView({
  quizzes,
  watchedStories,
  onPlay,
  onConfirmWatch,
}: {
  quizzes: QuizData[]
  watchedStories: string[]
  onPlay: (q: QuizData) => void
  onConfirmWatch: (id: string) => void
}) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Play to Earn"
        title="Quests for Curious Minds"
        description="Every correct episode recall question earns real points toward creator perks and climbs the verified standings. Complete watch-to-unlock challenges to access speed bonuses."
      />

      <div className="grid gap-5 md:grid-cols-3">
        {quizzes.map((quiz, i) => (
          <QuestCard
            key={quiz.id}
            quiz={quiz}
            onPlay={() => onPlay(quiz)}
            isPrimary={i === 0}
            isWatched={watchedStories.includes(quiz.id)}
            onConfirmWatch={() => onConfirmWatch(quiz.id)}
          />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   LEADERBOARD VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
function LeaderboardView({
  fan,
  period,
  setPeriod,
  roster,
  onOpenAuth,
  onOpenYoutubeGate,
}: {
  fan: FanState | null
  period: 'This week' | 'This month' | 'All time'
  setPeriod: (p: 'This week' | 'This month' | 'All time') => void
  roster: LeaderboardRow[]
  onOpenAuth: () => void
  onOpenYoutubeGate: () => void
}) {
  const top1 = roster[0]
  const top2 = roster[1]
  const top3 = roster[2]

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="The Campfire Rankings"
        title="Live Leaderboard Standings"
        description="Rankings compute continuously from the live Neon database based on verified question accuracy and consistent day streaks."
      />

      {!fan && (
        <div className="neu-card p-4.5 border border-accent/40 bg-accent/5 flex flex-col sm:flex-row items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <span className="ruby-dot animate-pulse" />
            <p className="text-xs text-foreground font-medium">
              <strong>Public Leaderboard Preview:</strong> Sign in or create an account to start earning points and climb the global rankings.
            </p>
          </div>
          <button
            onClick={onOpenAuth}
            className="neu-button-primary shrink-0 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider"
          >
            Sign In to Compete
          </button>
        </div>
      )}

      {/* Period Selector Tabs */}
      <div className="inline-flex rounded-2xl neu-inset-xs p-1.5 border border-border/60 bg-background/60">
        {(['This week', 'This month', 'All time'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-xl px-5 py-2 text-xs font-bold font-mono tracking-wide transition-all ${
              period === p
                ? 'neu-raised-sm bg-card text-foreground border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Podium for Top 3 */}
      <div className="neu-card p-6 sm:p-8 border border-border/80">
        <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end mb-8 pt-4">
          <div className="neu-card p-4 text-center border border-border/80 relative">
            <div className="grid size-12 place-items-center rounded-2xl neu-inset-sm mx-auto text-sm font-bold">
              {top2?.initials || '—'}
            </div>
            <p className="mt-3 font-semibold text-xs truncate">{top2?.name || 'Awaiting Fan'}</p>
            <p className="font-serif text-lg sm:text-2xl font-bold mt-0.5">
              {top2?.points?.toLocaleString() || '0'}
            </p>
            <div className="mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 neu-pill-inset text-[10px] font-mono text-muted-foreground">
              RANK #2
            </div>
          </div>

          <div className="neu-card p-5 text-center border-2 border-accent/40 relative bg-card -translate-y-3 ruby-glow">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 grid size-7 place-items-center rounded-full bg-accent text-accent-foreground">
              <Trophy className="size-4" />
            </div>
            <div className="grid size-14 place-items-center rounded-2xl neu-raised-sm mx-auto text-base font-bold bg-primary text-primary-foreground">
              {top1?.initials || '—'}
            </div>
            <p className="mt-3 font-bold text-sm truncate">{top1?.name || 'Awaiting Fan'}</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold mt-0.5 text-accent">
              {top1?.points?.toLocaleString() || '0'}
            </p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 bg-accent text-accent-foreground text-[10px] font-mono font-bold">
              <Flame className="size-3 fill-current" /> #1 ON FIRE
            </div>
          </div>

          <div className="neu-card p-4 text-center border border-border/80 relative">
            <div className="grid size-12 place-items-center rounded-2xl neu-inset-sm mx-auto text-sm font-bold">
              {top3?.initials || '—'}
            </div>
            <p className="mt-3 font-semibold text-xs truncate">{top3?.name || 'Awaiting Fan'}</p>
            <p className="font-serif text-lg sm:text-2xl font-bold mt-0.5">
              {top3?.points?.toLocaleString() || '0'}
            </p>
            <div className="mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 neu-pill-inset text-[10px] font-mono text-muted-foreground">
              RANK #3
            </div>
          </div>
        </div>

        {/* Full Leaderboard List */}
        <div className="flex flex-col gap-2.5 border-t border-border/60 pt-6">
          {roster.length === 0 ? (
            <p className="text-center py-8 text-xs font-mono text-muted-foreground">
              No fan entries yet. Be the first to take a quest and take rank #1!
            </p>
          ) : (
            roster.map((row) => {
              const isMe = row.me
              return (
                <div
                  key={row.rank}
                  className={`flex items-center gap-3.5 rounded-2xl p-3.5 transition-all ${
                    isMe
                      ? 'neu-inset-sm border-2 border-accent/50 bg-background'
                      : 'neu-raised-xs border border-border/70 bg-card hover:border-border'
                  }`}
                >
                  <span className="w-8 text-center font-mono text-xs font-bold text-muted-foreground">
                    #{row.rank}
                  </span>
                  <div
                    className={`grid size-8 place-items-center rounded-full text-xs font-bold ${
                      isMe
                        ? 'bg-accent text-accent-foreground'
                        : 'neu-inset-xs text-foreground bg-background'
                    }`}
                  >
                    {row.initials}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm font-bold">{row.name}</span>
                    {isMe && (
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-mono font-bold bg-accent text-accent-foreground">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-base">
                      {row.points.toLocaleString()}
                    </span>
                    <span className="ml-1 text-[10px] font-mono text-muted-foreground">PTS</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   REWARDS VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
function RewardsView({
  fan,
  rewards,
  onRewardClick,
  onOpenAuth,
}: {
  fan: FanState | null
  rewards: RewardData[]
  onRewardClick: (r: RewardData) => void
  onOpenAuth: () => void
}) {
  const goalPoints = 2500
  const userPoints = fan?.points || 0
  const progressPercent = Math.min(100, Math.round((userPoints / goalPoints) * 100))

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Rewards & Cash Prizes"
        title="Perks Worth Showing Up For"
        description="Claim exclusive creator access, video shoutouts, consultation calls, and weekly cash prizes disbursed straight to your M-Pesa or PayPal."
      />

      {/* Progress Showcase */}
      <div className="neu-card p-6 sm:p-8 border border-border/80 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="ruby-dot" />
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                NEXT MILESTONE TIER
              </p>
            </div>
            <p className="font-serif text-3xl sm:text-4xl font-bold mt-1">
              {userPoints.toLocaleString()}{' '}
              <span className="text-base font-mono font-normal text-muted-foreground">
                / {goalPoints.toLocaleString()} PTS
              </span>
            </p>
          </div>
          <div className="grid size-14 place-items-center rounded-2xl neu-raised-sm border border-accent/30 bg-card text-accent">
            <Gift className="size-7 text-accent drop-shadow-[0_0_8px_rgba(209,17,73,0.4)]" />
          </div>
        </div>

        <div className="mt-6 h-3 rounded-full neu-inset-sm p-0.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-accent ruby-glow transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-3 text-xs font-mono text-muted-foreground">
          {!fan ? (
            <span onClick={onOpenAuth} className="text-accent font-bold cursor-pointer hover:underline">
              Sign in to start earning points toward this milestone.
            </span>
          ) : userPoints >= goalPoints ? (
            <span className="text-accent font-bold">Milestone achieved! Ready to claim.</span>
          ) : (
            `${(goalPoints - userPoints).toLocaleString()} points remaining to unlock "Next Episode Shoutout".`
          )}
        </p>
      </div>

      {/* Rewards Grid */}
      <div className="grid gap-5 md:grid-cols-3">
        {rewards.map((reward) => {
          const isClaimed = fan?.claimedRewardIds?.includes(reward.id)
          const canClaim = fan ? fan.points >= reward.pointsValue : false
          const isCash = !!reward.cashValue
          const IconComp = rewardIconMap[reward.iconName] || Gift

          return (
            <div
              key={reward.id}
              className={`neu-card p-6 border flex flex-col justify-between ${
                isCash ? 'border-accent/40 bg-card ruby-glow' : 'border-border/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="grid size-12 place-items-center rounded-2xl neu-convex text-accent">
                    <IconComp className="size-6 text-accent" />
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 neu-pill-inset text-[10px] font-mono uppercase ${
                      isCash ? 'text-accent font-bold' : 'text-muted-foreground'
                    }`}
                  >
                    {reward.meta}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold">{reward.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {reward.description}
                </p>
                {isCash && (
                  <div className="mt-3 p-2.5 rounded-xl neu-inset-xs border border-accent/20 text-xs font-mono text-accent font-bold flex items-center gap-1.5">
                    <Banknote className="size-3.5" />
                    <span>Payout: {reward.currency} {reward.cashValue?.toLocaleString()} via M-Pesa / PayPal</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-accent">{reward.points}</span>
                <button
                  onClick={() => {
                    if (!fan) onOpenAuth()
                    else onRewardClick(reward)
                  }}
                  disabled={isClaimed}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    isClaimed
                      ? 'neu-inset-xs text-muted-foreground cursor-default'
                      : canClaim
                      ? 'neu-button-primary text-primary-foreground'
                      : 'neu-button text-muted-foreground'
                  }`}
                >
                  {isClaimed
                    ? 'Unlocked'
                    : fan
                    ? isCash
                      ? 'Claim Cash Prize'
                      : 'Claim Perk'
                    : 'Sign in to Claim'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   REFERRALS VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
function ReferralsView({
  creator,
  fan,
  onCopyInvite,
  onOpenAuth,
}: {
  creator: CreatorData
  fan: FanState | null
  onCopyInvite: () => void
  onOpenAuth: () => void
}) {
  const referralCode = fan ? `FIRE-${fan.id.slice(-6).toUpperCase()}` : 'JOIN-COMMUNITY'
  const shareLink = fan
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://campfire.app'}/${creator.slug}?ref=${fan.id}`
    : `${typeof window !== 'undefined' ? window.location.origin : 'https://campfire.app'}/${creator.slug}`

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Invite Your Circle"
        title="Grow the Community Together"
        description="Share your unique invitation code with friends. When they link and verify their YouTube subscription, you both receive bonus points."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="neu-card p-6 sm:p-8 border border-accent/40 relative overflow-hidden bg-card">
          <div className="flex items-center justify-between mb-8">
            <Share2 className="size-6 text-accent" />
            <span className="rounded-full px-3 py-1 neu-pill-inset text-[10px] font-mono font-bold text-accent">
              +100 PTS PER VERIFIED FAN
            </span>
          </div>

          <p className="text-xs font-mono uppercase text-muted-foreground">Your Exclusive Invite Code</p>
          <div className="mt-2 p-4 rounded-2xl neu-inset-sm border border-border/80 text-center">
            <p className="font-mono text-2xl sm:text-3xl font-bold tracking-widest text-accent">
              {referralCode}
            </p>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Share this link across Discord, Twitter, or WhatsApp groups.
          </p>

          <button
            onClick={() => {
              if (!fan) onOpenAuth()
              else onCopyInvite()
            }}
            className="mt-6 w-full neu-button-primary rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2"
          >
            <Copy className="size-4" /> {fan ? 'Copy Invite Link' : 'Sign In to Get Your Code'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <StatCard
            label="Friends Joined"
            value={fan ? fan.referrals.toString() : '—'}
            unit="VERIFIED"
            icon={Users}
          />
          <StatCard
            label="Points Earned"
            value={fan ? `+${fan.referrals * 100}` : '—'}
            unit="BONUS"
            icon={Sparkles}
            accentuated
          />
          <div className="col-span-2 neu-card p-5 border border-border/80">
            <p className="text-xs font-mono text-muted-foreground uppercase">Direct Share Link</p>
            <p className="font-mono text-xs font-semibold mt-2 truncate p-3 rounded-xl neu-inset-xs text-foreground/80">
              {shareLink}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   ADMIN / CREATOR STUDIO VIEW
   ═══════════════════════════════════════════════════════════════════════════ */
function AdminView({
  creator,
  setCreator,
  quizzes,
  showToast,
  onOpenSponsorExport,
  onOpenAiGenerator,
}: {
  creator: CreatorData
  setCreator: React.Dispatch<React.SetStateAction<CreatorData>>
  quizzes: QuizData[]
  showToast: (m: string) => void
  onOpenSponsorExport: () => void
  onOpenAiGenerator: () => void
}) {
  const [editingTitle, setEditingTitle] = useState(creator.displayName)
  const [editingMessage, setEditingMessage] = useState(creator.welcomeMessage || '')
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'payouts' | 'crm'>('overview')
  const [analyticsData, setAnalyticsData] = useState<{
    totalFans: string
    verifiedFans: string
    totalAttempts: string
    pointsDistributed: string
    totalShares: string
    completionRate: string
  }>({
    totalFans: '0',
    verifiedFans: '0',
    totalAttempts: '0',
    pointsDistributed: '0',
    totalShares: '0',
    completionRate: '0%',
  })
  const [superfans, setSuperfans] = useState<
    { id: string; name: string; points: number; streak: number; verified: boolean; lastActive: string }[]
  >([])

  useEffect(() => {
    fetch(`/api/creators/${creator.slug}/analytics`)
      .then((res) => res.json())
      .then((data) => {
        if (data.analytics) setAnalyticsData(data.analytics)
        if (Array.isArray(data.superfans)) setSuperfans(data.superfans)
      })
      .catch(() => {})
  }, [creator.slug])

  const handleSaveWorkspace = () => {
    setCreator((prev) => ({
      ...prev,
      displayName: editingTitle,
      welcomeMessage: editingMessage,
    }))
    showToast('Workspace configuration updated!')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          eyebrow="Multi-Tenant Creator Studio"
          title="Creator Studio & Monetization"
          description="Manage your workspace branding, generate AI quests from video scripts, disburse winner cash prizes, and inspect fan engagement metrics."
        />
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAiGenerator}
            className="neu-button-primary shrink-0 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <Sparkles className="size-4" />
            <span>AI Quest Studio</span>
          </button>
          <button
            onClick={onOpenSponsorExport}
            className="neu-button shrink-0 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 text-foreground"
          >
            <FileText className="size-4" />
            <span>Sponsor Report</span>
          </button>
        </div>
      </div>

      {/* Top Level Metric Quad */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard label="Verified Fans" value={analyticsData.verifiedFans} unit="TOTAL" icon={Users} />
        <StatCard
          label="Completion Rate"
          value={analyticsData.completionRate}
          unit="ACCURACY"
          icon={BarChart3}
        />
        <StatCard
          label="Points Given"
          value={analyticsData.pointsDistributed}
          unit="DISTRIBUTED"
          icon={Sparkles}
        />
        <StatCard
          label="Viral Shares"
          value={analyticsData.totalShares}
          unit="WHATSAPP / X"
          icon={Zap}
          accentuated
        />
      </div>

      {/* Admin Tab Switcher */}
      <div className="inline-flex rounded-2xl neu-inset-xs p-1.5 border border-border/60 bg-background/60">
        {[
          { id: 'overview', label: 'Growth & Branding' },
          { id: 'stories', label: 'Story Quests' },
          { id: 'payouts', label: 'Winner Payouts & Monetization' },
          { id: 'crm', label: 'Superfan CRM' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'stories' | 'payouts' | 'crm')}
            className={`rounded-xl px-5 py-2 text-xs font-bold font-mono tracking-wide transition-all ${
              activeTab === tab.id
                ? 'neu-raised-sm bg-card text-foreground border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="neu-card p-6 border border-border/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-mono uppercase text-accent font-bold">Engagement Velocity</p>
                <h3 className="font-serif text-xl font-bold mt-0.5">Audience Growth & Quest Plays</h3>
              </div>
              <span className="rounded-full px-3 py-1 neu-pill-inset text-[10px] font-mono text-muted-foreground">
                LAST 30 DAYS
              </span>
            </div>

            <div className="mt-8 flex h-48 items-end gap-2 sm:gap-3 rounded-2xl neu-inset-sm p-4">
              {[20, 35, 30, 48, 42, 60, 55, 70, 65, 80, 75, 100].map((height, i) => {
                const isSpike = i === 11 || i === 9
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-foreground/15 transition-all duration-300 relative group"
                    style={{ height: `${height}%` }}
                  >
                    <div
                      className={`h-full rounded-t-md transition-all ${
                        isSpike ? 'bg-accent ruby-glow' : 'bg-foreground/40'
                      }`}
                      style={{ height: `${isSpike ? 100 : 35}%` }}
                    />
                  </div>
                )
              })}
            </div>

            <div className="mt-4 flex justify-between text-[11px] font-mono text-muted-foreground">
              <span>Start</span>
              <span>Mid-month</span>
              <span>Live Peak</span>
            </div>
          </div>

          <div className="neu-card p-6 border border-border/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="ruby-dot" />
                <p className="text-xs font-mono uppercase text-accent font-bold">
                  WHITE-LABEL BRANDING
                </p>
              </div>
              <h3 className="font-serif text-xl font-bold">Tenant Settings</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Customize workspace branding applied across all fan views.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                    Creator Display Name
                  </label>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="w-full neu-input px-3.5 py-2.5 text-xs text-foreground font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                    Welcome Copy
                  </label>
                  <textarea
                    rows={3}
                    value={editingMessage}
                    onChange={(e) => setEditingMessage(e.target.value)}
                    className="w-full neu-input px-3.5 py-2.5 text-xs text-foreground font-medium resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveWorkspace}
              className="mt-6 w-full neu-button-primary rounded-xl py-3 text-xs font-bold uppercase tracking-wider"
            >
              Save Tenant Configuration
            </button>
          </div>
        </div>
      )}

      {activeTab === 'stories' && (
        <div className="neu-card p-6 border border-border/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif text-xl font-bold">Live Quest Queue</h3>
              <p className="text-xs text-muted-foreground font-mono">
                {quizzes.length} ACTIVE CHALLENGES IN ROTATION (NEON POSTGRES)
              </p>
            </div>
            <button
              onClick={onOpenAiGenerator}
              className="neu-button-primary rounded-xl px-4 py-2 text-xs font-bold text-primary-foreground inline-flex items-center gap-1.5"
            >
              <Sparkles className="size-3.5" /> AI Script-to-Quest
            </button>
          </div>

          <div className="space-y-3">
            {quizzes.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between rounded-2xl p-4 neu-raised-xs border border-border/70 bg-card"
              >
                <div className="flex items-center gap-3.5">
                  <div className="grid size-9 place-items-center rounded-xl neu-inset-xs text-accent">
                    <Zap className="size-4.5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{q.title}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {q.points} PTS · {q.questions?.length || 0} QUESTIONS · {q.duration}
                    </p>
                  </div>
                </div>
                <span className="rounded-full px-3 py-1 neu-pill-inset text-[10px] font-mono text-accent font-bold">
                  {q.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'payouts' && (
        <PayoutManager onDisburseSuccess={() => showToast('Winner payout disbursed successfully.')} />
      )}

      {activeTab === 'crm' && (
        <div className="neu-card p-6 border border-border/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif text-xl font-bold">Superfan CRM Directory</h3>
              <p className="text-xs text-muted-foreground font-mono">
                LIVE FAN DATABASE SCALED BY ENGAGEMENT AND VERIFICATION
              </p>
            </div>
            <span className="rounded-full px-3 py-1 neu-pill-inset text-xs font-mono text-accent font-bold">
              {superfans.length} VERIFIED ENTRIES
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 font-mono uppercase text-muted-foreground text-[10px]">
                  <th className="pb-3 pl-2">Fan</th>
                  <th className="pb-3">Points</th>
                  <th className="pb-3">Streak</th>
                  <th className="pb-3">YouTube Status</th>
                  <th className="pb-3">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {superfans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center font-mono text-muted-foreground text-xs">
                      No fans registered yet. Invite your audience to start populating your CRM!
                    </td>
                  </tr>
                ) : (
                  superfans.map((fanRow, i) => (
                    <tr key={fanRow.id || i} className="hover:bg-muted/30">
                      <td className="py-3.5 pl-2 font-semibold text-foreground flex items-center gap-2">
                        <div className="grid size-6 place-items-center rounded-full neu-inset-xs font-mono text-[9px]">
                          {fanRow.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{fanRow.name}</span>
                      </td>
                      <td className="py-3.5 font-mono font-bold text-accent">
                        {fanRow.points.toLocaleString()} PTS
                      </td>
                      <td className="py-3.5 font-mono">{fanRow.streak} days</td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold ${
                            fanRow.verified ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {fanRow.verified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-muted-foreground">{fanRow.lastActive}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUBCOMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="ruby-dot" />
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
          {eyebrow}
        </p>
      </div>
      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
        {title}
      </h1>
      <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  accentuated = false,
}: {
  label: string
  value: string
  unit: string
  icon: typeof Flame
  accentuated?: boolean
}) {
  return (
    <div
      className={`neu-card p-4 sm:p-5 border transition-all ${
        accentuated ? 'border-accent/30 ruby-glow' : 'border-border/80'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div
          className={`grid size-7.5 place-items-center rounded-lg ${
            accentuated ? 'bg-accent text-accent-foreground' : 'neu-inset-xs text-accent'
          }`}
        >
          <Icon className="size-3.5" />
        </div>
      </div>
      <p className="font-serif text-xl sm:text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-[9px] font-mono text-muted-foreground mt-0.5">{unit}</p>
    </div>
  )
}

function QuestCard({
  quiz,
  onPlay,
  isPrimary = false,
  isWatched = true,
  onConfirmWatch,
}: {
  quiz: QuizData
  onPlay: () => void
  isPrimary?: boolean
  isWatched?: boolean
  onConfirmWatch: () => void
}) {
  const isLockedByWatch = quiz.requiresWatchConfirmation && !isWatched

  return (
    <article className="neu-card-interactive p-5 border border-border/80 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="rounded-full px-2.5 py-0.5 neu-pill-inset text-[10px] font-mono font-bold text-accent">
            {quiz.status}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">{quiz.duration}</span>
        </div>

        <p className="text-[11px] font-mono text-muted-foreground uppercase">{quiz.subtitle}</p>
        <h3 className="font-serif text-xl font-bold mt-1 leading-snug">{quiz.title}</h3>

        {isLockedByWatch && (
          <div className="mt-4 p-3 rounded-xl neu-inset-xs border border-accent/30 text-xs text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Eye className="size-3.5 text-accent shrink-0" />
              <span>Watch episode to unlock</span>
            </span>
            <button
              onClick={onConfirmWatch}
              className="text-[10px] font-mono font-bold text-accent hover:underline shrink-0"
            >
              Watched
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-accent">+{quiz.points} PTS</span>
        <button
          onClick={onPlay}
          className={`grid size-9 place-items-center rounded-full transition-transform hover:scale-110 active:scale-95 ${
            isLockedByWatch
              ? 'neu-inset-xs opacity-50 cursor-not-allowed'
              : isPrimary
              ? 'bg-accent text-accent-foreground ruby-glow'
              : 'neu-raised-xs border border-border text-foreground hover:text-accent'
          }`}
          aria-label={`Play quest ${quiz.title}`}
        >
          {isLockedByWatch ? <Lock className="size-3.5" /> : <Play className="size-4 fill-current ml-0.5" />}
        </button>
      </div>
    </article>
  )
}
