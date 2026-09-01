'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  AlertCircle,
  Award,
  Banknote,
  BarChart3,
  Bell,
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
  Search,
  Send,
  Share2,
  ShieldAlert,
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
import { ShareCardModal } from '@/components/features/share-card-modal'
import { SponsorExportModal } from '@/components/features/sponsor-export-modal'
import { BadgesSection } from '@/components/features/badges-section'
import { AiQuestionGeneratorModal } from '@/components/admin/ai-question-generator-modal'
import { PayoutManager } from '@/components/admin/payout-manager'
import { CashPrizeClaimModal } from '@/components/features/cash-prize-claim-modal'
import { CreatorData, QuizData, RewardData, LeaderboardRow, FanState } from '@/components/campfire-app'
import { toUserSlug } from '@/lib/slug'

type View = 'overview' | 'quizzes' | 'leaderboard' | 'rewards' | 'referrals' | 'badges' | 'admin'

const sidebarNavItems: { id: View; label: string; icon: LucideIcon; pathSegment: string }[] = [
  { id: 'overview', label: 'Overview', icon: Flame, pathSegment: '' },
  { id: 'quizzes', label: 'Quests & Challenges', icon: Zap, pathSegment: 'quizzes' },
  { id: 'leaderboard', label: 'Live Rankings', icon: Trophy, pathSegment: 'leaderboard' },
  { id: 'rewards', label: 'Rewards & Cash Payouts', icon: Gift, pathSegment: 'rewards' },
  { id: 'referrals', label: 'Refer & Earn', icon: Share2, pathSegment: 'referral' },
  { id: 'badges', label: 'Trophy Cabinet', icon: Award, pathSegment: 'badges' },
  { id: 'admin', label: 'Creator Studio', icon: LayoutDashboard, pathSegment: 'admin' },
]

export default function DashboardLayout({
  creatorSlug = 'mkurugenzi',
  initialView = 'overview',
  userSlug: propUserSlug,
}: {
  creatorSlug?: string
  initialView?: View
  userSlug?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const youtubeStatusParam = searchParams.get('youtube_status')

  const [view, setView] = useState<View>(initialView)

  useEffect(() => {
    if (initialView) {
      setView(initialView)
    }
  }, [initialView])
  const [isDark, setIsDark] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [authChecking, setAuthChecking] = useState(true)

  // Top Navbar Notification Dropdown State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Weekly Cash Prize Active',
      message: 'KES 5,000 weekly grand cash prize is live for top ranking superfans.',
      time: '1h ago',
      read: false,
      icon: Banknote,
    },
    {
      id: 'n2',
      title: 'New Episode Lore Quest',
      message: 'Episode 42 challenge has been synthesized and added to rotation.',
      time: '3h ago',
      read: false,
      icon: Zap,
    },
    {
      id: 'n3',
      title: 'YouTube Verification Gate',
      message: 'Ensure your YouTube subscription is active to receive score multipliers.',
      time: '1d ago',
      read: true,
      icon: Video,
    },
  ])

  // Authenticated user state
  const [authUser, setAuthUser] = useState<{ id: string; email?: string; phone?: string; displayName?: string } | null>(null)
  const [fanState, setFanState] = useState<FanState | null>(null)

  // Live Database States
  const [creator, setCreator] = useState<CreatorData>({
    id: 'cmthm6c9n0000pmj0qtcu3w5p',
    slug: creatorSlug,
    displayName: 'Mkurugenzi',
    handle: `@Mkurugenziii`,
    initials: 'MK',
    primaryColor: '#d11149',
    secondaryColor: '#0a0a0d',
    welcomeMessage: 'Welcome to the campfire. Answer questions from our stories, climb the ranks, and unlock rewards.',
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

  // Modals state
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isSponsorExportOpen, setIsSponsorExportOpen] = useState(false)
  const [isYoutubeGateOpen, setIsYoutubeGateOpen] = useState(false)
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false)
  const [selectedCashReward, setSelectedCashReward] = useState<RewardData | null>(null)
  const [unsubscribedAlert, setUnsubscribedAlert] = useState(false)

  // Gameplay state
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [quizScore, setQuizScore] = useState(0)
  const [isQuizCompleted, setIsQuizCompleted] = useState(false)
  const [period, setPeriod] = useState<'This week' | 'This month' | 'All time'>('This week')
  const [verifyingYoutube, setVerifyingYoutube] = useState(false)

  const [liveAnalytics, setLiveAnalytics] = useState({
    verifiedFans: '0',
    completions: '0%',
    points: '0',
    trend: '+18%',
  })

  // Theme Sync
  useEffect(() => {
    const root = document.documentElement
    if (isDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [isDark])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // 1. Strict Auth Verification
  const verifyAuth = async () => {
    try {
      const res = await fetch(`/api/auth/me?creatorSlug=${creator.slug}`)
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated && data.user) {
          setAuthUser(data.user)
          setFanState(data.fanState)
          setAuthChecking(false)
          return
        }
      }
      router.push(`/login?creator=${creator.slug}&redirect=/app`)
    } catch {
      router.push(`/login?creator=${creator.slug}&redirect=/app`)
    }
  }

  // 2. Fetch live data
  const loadData = async () => {
    try {
      const [creatorRes, leaderboardRes, analyticsRes] = await Promise.all([
        fetch(`/api/creators/${creator.slug}/data`),
        fetch(`/api/creators/${creator.slug}/leaderboard`),
        fetch(`/api/creators/${creator.slug}/analytics`),
      ])

      if (creatorRes.ok) {
        const data = await creatorRes.json()
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

      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json()
        if (Array.isArray(data.leaderboard)) setLeaderboard(data.leaderboard)
      }

      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        if (data.analytics) {
          setLiveAnalytics({
            verifiedFans: data.analytics.verifiedFans || '0',
            completions: data.analytics.completionRate || '0%',
            points: data.analytics.pointsDistributed || '0',
            trend: '+24%',
          })
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    verifyAuth()
    loadData()
  }, [creator.slug])

  // Handle YouTube Auth Return Status
  useEffect(() => {
    if (youtubeStatusParam === 'subscribed') {
      showToast('YouTube Verified! +150 Subscriber bonus points awarded.')
    } else if (youtubeStatusParam === 'unsubscribed') {
      setUnsubscribedAlert(true)
      setIsYoutubeGateOpen(true)
    }
  }, [youtubeStatusParam])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    router.push('/login')
  }

  // Strict Subscriber Gating for gameplay
  const handleStartQuiz = (quiz: QuizData) => {
    if (!fanState?.youtubeVerified) {
      setIsYoutubeGateOpen(true)
      return
    }

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
          verifyAuth()
          loadData()
          showToast(`Quest completed! +${data.pointsEarned} points awarded.`)
        }
      } catch {
        verifyAuth()
      }
    }
  }

  const handleVerifyYouTube = async () => {
    setVerifyingYoutube(true)
    try {
      const res = await fetch(`/api/creators/${creator.slug}/verify-youtube`, { method: 'POST' })
      const data = await res.json()
      if (res.status === 429) {
        showToast(data.error)
      } else if (data.verified) {
        verifyAuth()
        setIsYoutubeGateOpen(false)
        setUnsubscribedAlert(false)
        showToast('YouTube subscription verified! +150 bonus points awarded.')
      } else {
        showToast(data.message || 'Subscription check complete.')
      }
    } catch {
      showToast('Verification check completed.')
    } finally {
      setVerifyingYoutube(false)
    }
  }

  const handleRewardClick = (reward: RewardData) => {
    if (!fanState?.youtubeVerified) {
      setIsYoutubeGateOpen(true)
      return
    }

    if (reward.cashValue) {
      setSelectedCashReward(reward)
      return
    }
    handleClaimPerk(reward)
  }

  const handleClaimPerk = async (reward: RewardData) => {
    if (fanState && fanState.points < reward.pointsValue) {
      showToast(`You need ${reward.pointsValue - fanState.points} more points to claim this perk.`)
      return
    }

    try {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId: reward.id, creatorSlug: creator.slug }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast(data.message || `Perk "${reward.title}" unlocked!`)
        verifyAuth()
      } else {
        showToast(data.error || 'Could not claim reward')
      }
    } catch {
      showToast('Claim process failed')
    }
  }

  const currentUserSlug =
    propUserSlug ||
    fanState?.slug ||
    authUser?.slug ||
    toUserSlug(fanState?.name || authUser?.displayName, authUser?.email, authUser?.id)

  const handleNavigate = (newView: View) => {
    setView(newView)
    setMobileSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (typeof window !== 'undefined') {
      const slug = currentUserSlug || 'fan'
      const targetUrl =
        newView === 'overview'
          ? `/dashboard/${slug}`
          : `/dashboard/${slug}/${newView === 'referrals' ? 'referral' : newView}`
      window.history.pushState(null, '', targetUrl)
    }
  }

  const handleCopyInvite = () => {
    const slug = currentUserSlug || authUser?.id || 'fan'
    const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://campfire.app'}/${creator.slug}?ref=${encodeURIComponent(slug)}`

    try {
      navigator.clipboard?.writeText?.(inviteLink)
    } catch {}
    showToast('Personalized invite link copied to clipboard.')
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center p-6 font-sans">
        <div className="text-center space-y-4">
          <div className="grid size-14 place-items-center rounded-3xl bg-card neu-raised border border-border mx-auto text-accent animate-pulse">
            <Flame className="size-7 text-accent" />
          </div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Verifying Session & Syncing Neon Postgres...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300 font-sans selection:bg-accent/25">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 rounded-full px-5 py-2.5 neu-raised-lg border border-accent/30 bg-card text-foreground font-medium text-sm shadow-xl">
            <span className="ruby-dot animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          LEFT-SIDED SIDEBAR (Desktop: 260px Sticky | Mobile: Drawer)
          ═════════════════════════════════════════════════════════════════════ */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border/80 bg-background/95 backdrop-blur-2xl p-4 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-6">
            <Link href="/" className="flex items-center gap-3 group outline-none">
              <div className="relative grid size-10 place-items-center rounded-2xl bg-card neu-raised-sm border border-border group-hover:scale-105 transition-transform duration-200">
                <Flame className="size-5.5 text-accent drop-shadow-[0_0_8px_rgba(209,17,73,0.5)]" />
                <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-accent ruby-glow" />
              </div>
              <div className="text-left">
                <span className="font-serif text-lg font-bold tracking-tight block leading-none">
                  Campfire
                </span>
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                  {creator.displayName}
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="grid size-8 place-items-center rounded-lg neu-raised-xs border border-border text-muted-foreground lg:hidden"
            >
              <X className="size-4" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {sidebarNavItems.map((item) => {
              const isActive = view === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'neu-inset-sm bg-background text-accent border border-accent/30 font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                  }`}
                >
                  <Icon
                    className={`size-4 ${
                      isActive ? 'text-accent drop-shadow-[0_0_6px_rgba(209,17,73,0.4)]' : ''
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-border/60 space-y-3">
          <div className="flex items-center justify-between p-2 rounded-xl neu-inset-xs text-xs font-mono text-muted-foreground">
            <span className="text-[10px] uppercase font-bold pl-1">Theme</span>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 rounded-lg neu-raised-xs border border-border text-foreground hover:text-accent transition-colors"
              title={`Switch to ${isDark ? 'Tactile Alabaster (Light)' : 'Tactile Obsidian (Dark)'}`}
            >
              {isDark ? <Sun className="size-3.5 text-accent" /> : <Moon className="size-3.5" />}
            </button>
          </div>

          {fanState && (
            <div className="p-3 rounded-2xl neu-card border border-border/80 bg-card flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold font-mono">
                  {fanState.initials}
                  <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-accent ring-2 ring-card" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate text-foreground leading-none">
                    {fanState.name}
                  </p>
                  <p className="text-[10px] font-mono text-accent font-bold mt-1">
                    {fanState.points.toLocaleString()} PTS
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                className="grid size-7.5 place-items-center rounded-lg neu-raised-xs border border-border text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ═════════════════════════════════════════════════════════════════════
          MAIN DASHBOARD AREA WITH COMMON TOP NAVBAR
          ═════════════════════════════════════════════ */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* COMMON TOP NAVBAR */}
        <header className="sticky top-0 z-30 h-16 border-b border-border/80 bg-background/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="grid size-9 place-items-center rounded-xl neu-raised-sm border border-border text-foreground lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-muted-foreground hidden sm:inline">
                Campfire /
              </span>
              <span className="font-serif font-bold text-sm sm:text-base capitalize">
                {view.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Day Streak Pill */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 neu-pill-inset text-xs font-mono font-bold text-accent">
              <Flame className="size-3.5 text-accent" />
              <span>{fanState?.streak || 1}D Streak</span>
            </div>

            {/* Live Points Pill */}
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1 neu-pill text-xs font-mono font-bold text-foreground border border-border/80 bg-card">
              <span className="ruby-dot animate-pulse" />
              <span>{fanState?.points.toLocaleString()} PTS</span>
            </div>

            {/* YouTube Subscriber Status Badge */}
            {fanState?.youtubeVerified ? (
              <div className="hidden md:flex items-center gap-1.5 rounded-full px-3 py-1 neu-pill-inset text-[11px] font-mono font-bold text-accent">
                <CheckCircle2 className="size-3.5 text-accent" />
                <span>Verified Subscriber</span>
              </div>
            ) : (
              <button
                onClick={() => setIsYoutubeGateOpen(true)}
                className="hidden md:flex items-center gap-1.5 rounded-full px-3 py-1 neu-button-accent text-[11px] font-mono font-bold text-accent"
              >
                <Video className="size-3.5" />
                <span>Subscribe on YouTube</span>
              </button>
            )}

            {/* Notifications Dropdown Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative grid size-9 place-items-center rounded-xl neu-raised-sm border border-border text-foreground/80 hover:text-accent transition-colors"
                aria-label="View notifications"
              >
                <Bell className="size-4" />
                <span className="absolute 1.5 top-1.5 right-1.5 size-2 rounded-full bg-accent ruby-glow" />
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 neu-card p-4 border border-border/90 bg-card shadow-2xl rounded-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
                    <span className="font-serif font-bold text-sm">Notifications</span>
                    <span className="text-[10px] font-mono text-accent font-bold">3 NEW</span>
                  </div>

                  <div className="space-y-2.5">
                    {notifications.map((n) => {
                      const Icon = n.icon
                      return (
                        <div
                          key={n.id}
                          className="p-3 rounded-xl neu-inset-xs border border-border/60 text-left flex items-start gap-3"
                        >
                          <div className="grid size-7 place-items-center rounded-lg bg-card text-accent shrink-0 mt-0.5">
                            <Icon className="size-3.5 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground leading-tight">{n.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                              {n.message}
                            </p>
                            <span className="text-[9px] font-mono text-muted-foreground/70 mt-1 block">
                              {n.time}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Persistent Unsubscribed Warning Alert if Fan is Unverified */}
        {!fanState?.youtubeVerified && (
          <div className="bg-accent/10 border-b border-accent/30 px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-accent">
              <ShieldAlert className="size-4 shrink-0 text-accent" />
              <span>
                <strong>Subscriber Gate Active:</strong> You must subscribe to{' '}
                <strong>{creator.displayName}</strong> on YouTube to play quests & claim rewards.
              </span>
            </div>
            <button
              onClick={() => setIsYoutubeGateOpen(true)}
              className="neu-button-primary rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider shrink-0"
            >
              Verify YouTube Now
            </button>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-5xl w-full mx-auto space-y-10">
          {view === 'overview' && (
            <OverviewSection
              creator={creator}
              fan={fanState}
              quizzes={quizzes}
              watchedStories={watchedStories}
              onPlay={() => {
                if (quizzes.length > 0) handleStartQuiz(quizzes[0])
              }}
              onNavigate={handleNavigate}
              onConfirmWatch={handleConfirmWatch}
              onOpenYoutubeGate={() => setIsYoutubeGateOpen(true)}
            />
          )}

          {view === 'quizzes' && (
            <div className="space-y-6">
              <PageHeader
                eyebrow="Play to Earn"
                title="Quests & Challenges"
                description="Episode recall quests synthesized from video transcripts. Correct answers award points directly to your balance."
              />
              <div className="grid gap-5 md:grid-cols-3">
                {quizzes.map((quiz, i) => (
                  <QuestCard
                    key={quiz.id}
                    quiz={quiz}
                    onPlay={() => handleStartQuiz(quiz)}
                    isPrimary={i === 0}
                    isWatched={watchedStories.includes(quiz.id)}
                    onConfirmWatch={() => handleConfirmWatch(quiz.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {view === 'leaderboard' && (
            <div className="space-y-6">
              <PageHeader
                eyebrow="The Campfire Rankings"
                title="Live Leaderboard Standings"
                description="Computed continuously from the live Neon PostgreSQL database based on question accuracy and streaks."
              />
              <LeaderboardCard
                fan={fanState}
                period={period}
                setPeriod={setPeriod}
                roster={leaderboard}
              />
            </div>
          )}

          {view === 'rewards' && (
            <div className="space-y-6">
              <PageHeader
                eyebrow="Rewards & Cash Prizes"
                title="Perks Worth Showing Up For"
                description="Claim video shoutouts, consultation calls, and weekly cash rewards disbursed via M-Pesa & PayPal."
              />
              <div className="grid gap-5 md:grid-cols-3">
                {rewards.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    fan={fanState}
                    onClick={() => handleRewardClick(reward)}
                  />
                ))}
              </div>
            </div>
          )}

          {view === 'referrals' && (
            <div className="space-y-6">
              <PageHeader
                eyebrow="Invite Your Circle"
                title="Refer Friends & Earn Points"
                description="Share your personal link. When your friends register, you both get +100 bonus points credited in Postgres."
              />
              <ReferralsSection
                creator={creator}
                fan={fanState}
                userSlug={currentUserSlug}
                onCopyInvite={handleCopyInvite}
              />
            </div>
          )}

          {view === 'badges' && (
            <BadgesSection fan={fanState} watchedStoriesCount={watchedStories.length} />
          )}

          {view === 'admin' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader
                  eyebrow="Creator Studio"
                  title="Studio & Monetization"
                  description="Manage stories, build AI quizzes, disburse winner payouts, inspect superfan CRM, and export sponsor pitch decks."
                />
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href={`/admin/${creator.slug}`}
                    className="neu-button-primary rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                  >
                    <LayoutDashboard className="size-4" />
                    <span>Launch Full 11-Module Studio →</span>
                  </Link>
                  <button
                    onClick={() => setIsAiGeneratorOpen(true)}
                    className="neu-button rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 text-foreground"
                  >
                    <Sparkles className="size-4 text-accent" />
                    <span>AI Quest Studio</span>
                  </button>
                  <button
                    onClick={() => setIsSponsorExportOpen(true)}
                    className="neu-button rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 text-foreground"
                  >
                    <FileText className="size-4" />
                    <span>Sponsor Report</span>
                  </button>
                </div>
              </div>

              {/* Quick Jump Bar */}
              <div className="p-4 rounded-2xl neu-card border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="ruby-dot animate-pulse" />
                  <span className="text-xs font-mono font-bold text-foreground">
                    Dedicated Admin URL: <code className="text-accent">/admin/{creator.slug}</code>
                  </span>
                </div>
                <Link
                  href={`/admin/${creator.slug}`}
                  className="text-xs font-mono font-bold text-accent hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Full Creator Studio</span>
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>

              <PayoutManager
                creatorSlug={creator.slug}
                onDisburseSuccess={() => {
                  showToast('Winner payout disbursed successfully.')
                  loadData()
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* AI Question Generator Modal */}
      <AiQuestionGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        creatorSlug={creator.slug}
        onSuccess={(newTitle) => {
          loadData()
          showToast(`AI Quest "${newTitle}" published to Neon database!`)
        }}
      />

      {/* Cash Prize Claim Modal for Winners */}
      <CashPrizeClaimModal
        isOpen={!!selectedCashReward}
        onClose={() => setSelectedCashReward(null)}
        reward={selectedCashReward}
        creatorSlug={creator.slug}
        onSuccess={(msg) => {
          verifyAuth()
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
        userSlug={currentUserSlug}
        creatorName={creator.displayName}
        creatorSlug={creator.slug}
      />

      {/* Sponsor Pitch Export Modal */}
      <SponsorExportModal
        isOpen={isSponsorExportOpen}
        onClose={() => setIsSponsorExportOpen(false)}
        creator={creator}
        analytics={liveAnalytics}
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
                <Lock className="size-3" /> SUBSCRIBER-GATED ACCESS
              </span>
              <h2 className="font-serif text-2xl font-bold tracking-tight">
                {unsubscribedAlert ? 'Subscription Not Found' : 'Connect YouTube Subscription'}
              </h2>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {unsubscribedAlert
                  ? `Google verification showed you are not yet subscribed to ${creator.displayName} on YouTube. Please subscribe to unlock quests, climb rankings, and win prizes.`
                  : `To participate in verified quests and claim rewards, verify that you subscribe to ${creator.displayName} on YouTube.`}
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    setVerifyingYoutube(true)
                    try {
                      const origin = typeof window !== 'undefined' ? window.location.origin : ''
                      const res = await fetch(
                        `/api/auth/youtube/url?creatorSlug=${creator.slug}&origin=${encodeURIComponent(origin)}`,
                      )
                      const data = await res.json()
                      if (data.url) {
                        window.location.href = data.url
                      }
                    } catch {
                      showToast('Could not initiate Google OAuth')
                      setVerifyingYoutube(false)
                    }
                  }}
                  className="neu-button-primary rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 text-primary-foreground"
                >
                  <Video className="size-4" />
                  <span>Verify with Google OAuth (Live)</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground uppercase">
                  <span>or quick check</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={creator.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neu-button-accent rounded-xl py-2.5 px-3 text-xs font-bold inline-flex items-center justify-center gap-1.5 text-accent text-center"
                  >
                    <ExternalLink className="size-3.5" />
                    <span>1. Open Channel</span>
                  </a>
                  <button
                    disabled={verifyingYoutube}
                    onClick={handleVerifyYouTube}
                    className="neu-button rounded-xl py-2.5 px-3 text-xs font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50 text-center"
                  >
                    <RefreshCw className={`size-3.5 ${verifyingYoutube ? 'animate-spin' : ''}`} />
                    <span>{verifyingYoutube ? 'Checking...' : '2. Check Status'}</span>
                  </button>
                </div>
              </div>
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
                      Current Balance
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
                    Back to Dashboard
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
   SUB-VIEWS & COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function OverviewSection({
  creator,
  fan,
  quizzes,
  watchedStories,
  onPlay,
  onNavigate,
  onConfirmWatch,
  onOpenYoutubeGate,
}: {
  creator: CreatorData
  fan: FanState | null
  quizzes: QuizData[]
  watchedStories: string[]
  onPlay: () => void
  onNavigate: (v: View) => void
  onConfirmWatch: (id: string) => void
  onOpenYoutubeGate: () => void
}) {
  return (
    <div className="space-y-8">
      <section className="neu-card p-6 sm:p-8 border border-border/80 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="ruby-dot animate-pulse" />
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                INNER CIRCLE ACCESS
              </p>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Welcome Back, {fan?.name || 'Fan'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {creator.welcomeMessage || 'Ready for today’s episode lore challenge?'}
            </p>
          </div>
          <button
            onClick={onPlay}
            className="neu-button-primary shrink-0 rounded-xl px-6 py-3.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <span>Play Latest Quest</span>
            <Play className="size-3.5 fill-current" />
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <StatCard
          label="Your Points"
          value={fan?.points.toLocaleString() || '0'}
          unit="LIVE PTS"
          icon={Sparkles}
        />
        <StatCard label="Global Rank" value={`#${fan?.rank || 1}`} unit="LEADERBOARD" icon={Trophy} />
        <StatCard
          label="Day Streak"
          value={`${fan?.streak || 1} Days`}
          unit="ACTIVE"
          icon={Flame}
          accentuated
        />
        <StatCard
          label="YouTube Status"
          value={fan?.youtubeVerified ? 'Verified' : 'Unlinked'}
          unit="OAUTH V3"
          icon={UserCheck}
          accentuated={fan?.youtubeVerified}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl font-bold">Active Challenges</h3>
          <button
            onClick={() => onNavigate('quizzes')}
            className="text-xs font-mono text-accent font-bold hover:underline"
          >
            View All ({quizzes.length})
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {quizzes.map((quiz, i) => (
            <QuestCard
              key={quiz.id}
              quiz={quiz}
              onPlay={onPlay}
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
      <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
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
  icon: LucideIcon
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

function LeaderboardCard({
  fan,
  period,
  setPeriod,
  roster,
}: {
  fan: FanState | null
  period: 'This week' | 'This month' | 'All time'
  setPeriod: (p: 'This week' | 'This month' | 'All time') => void
  roster: LeaderboardRow[]
}) {
  return (
    <div className="neu-card p-6 sm:p-8 border border-border/80 space-y-6">
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

      <div className="flex flex-col gap-2.5">
        {roster.length === 0 ? (
          <div className="py-12 text-center rounded-2xl neu-inset-xs border border-border/60">
            <Trophy className="size-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="font-serif text-sm font-bold text-foreground">No Rankings Recorded Yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Complete your first episode recall quest to register your score on the live standings.
            </p>
          </div>
        ) : (
          roster.map((row) => {
            const isMe = row.me
            return (
              <div
                key={row.rank}
                className={`flex items-center gap-3.5 rounded-2xl p-3.5 transition-all ${
                  isMe
                    ? 'neu-inset-sm border-2 border-accent/50 bg-background'
                    : 'neu-raised-xs border border-border/70 bg-card'
                }`}
              >
                <span className="w-8 text-center font-mono text-xs font-bold text-muted-foreground">
                  #{row.rank}
                </span>
                <div
                  className={`grid size-8 place-items-center rounded-full text-xs font-bold ${
                    isMe ? 'bg-accent text-accent-foreground' : 'neu-inset-xs text-foreground'
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
                  <span className="font-serif font-bold text-base">{row.points.toLocaleString()}</span>
                  <span className="ml-1 text-[10px] font-mono text-muted-foreground">PTS</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function RewardCard({
  reward,
  fan,
  onClick,
}: {
  reward: RewardData
  fan: FanState | null
  onClick: () => void
}) {
  const isClaimed = fan?.claimedRewardIds?.includes(reward.id)
  const canClaim = fan ? fan.points >= reward.pointsValue : false
  const isCash = !!reward.cashValue

  return (
    <div
      className={`neu-card p-6 border flex flex-col justify-between ${
        isCash ? 'border-accent/40 bg-card ruby-glow' : 'border-border/80'
      }`}
    >
      <div>
        <div className="flex items-start justify-between mb-6">
          <div className="grid size-12 place-items-center rounded-2xl neu-convex text-accent">
            {isCash ? <Banknote className="size-6 text-accent" /> : <Mic className="size-6 text-accent" />}
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
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{reward.description}</p>
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
          onClick={onClick}
          disabled={isClaimed}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            isClaimed
              ? 'neu-inset-xs text-muted-foreground cursor-default'
              : canClaim
              ? 'neu-button-primary text-primary-foreground'
              : 'neu-button text-muted-foreground'
          }`}
        >
          {isClaimed ? 'Unlocked' : isCash ? 'Claim Cash Prize' : 'Claim Perk'}
        </button>
      </div>
    </div>
  )
}

function ReferralsSection({
  creator,
  fan,
  userSlug,
  onCopyInvite,
}: {
  creator: CreatorData
  fan: FanState | null
  userSlug?: string
  onCopyInvite: () => void
}) {
  const displaySlug = userSlug || fan?.slug || (fan ? `FIRE-${fan.id.slice(-6).toUpperCase()}` : 'JOIN-COMMUNITY')
  const referralCode = displaySlug.toUpperCase()
  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://campfire.app'}/${creator.slug}?ref=${encodeURIComponent(displaySlug)}`

  return (
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
          Share this link across WhatsApp, X, or Discord communities.
        </p>

        <button
          onClick={onCopyInvite}
          className="mt-6 w-full neu-button-primary rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2"
        >
          <Copy className="size-4" /> Copy Invite Link
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <StatCard
          label="Friends Joined"
          value={fan ? fan.referrals.toString() : '0'}
          unit="VERIFIED"
          icon={Users}
        />
        <StatCard
          label="Points Earned"
          value={fan ? `+${fan.referrals * 100}` : '0'}
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
  )
}
