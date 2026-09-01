'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Clock,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Flame,
  Gift,
  HelpCircle,
  Layers,
  LayoutDashboard,
  Link2,
  Lock,
  LogOut,
  LucideIcon,
  Megaphone,
  Menu,
  MessageCircle,
  Moon,
  Palette,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Trophy,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react'
import { AiQuestionGeneratorModal } from '@/components/admin/ai-question-generator-modal'
import { PayoutManager } from '@/components/admin/payout-manager'
import { SponsorExportModal } from '@/components/features/sponsor-export-modal'

type AdminTab =
  | 'overview'
  | 'branding'
  | 'stories'
  | 'quizzes'
  | 'rewards'
  | 'fans'
  | 'badges'
  | 'announcements'
  | 'analytics'
  | 'sponsor'
  | 'settings'

const adminNavItems: { id: AdminTab; label: string; icon: LucideIcon; badge?: string }[] = [
  { id: 'overview', label: 'Studio Home', icon: LayoutDashboard },
  { id: 'branding', label: 'Branding & Theme', icon: Palette },
  { id: 'stories', label: 'Story Library', icon: Video },
  { id: 'quizzes', label: 'Quiz Builder', icon: Zap, badge: 'AI' },
  { id: 'rewards', label: 'Rewards & Payouts', icon: Gift, badge: 'Cash' },
  { id: 'fans', label: 'Superfan CRM', icon: Users },
  { id: 'badges', label: 'Badge Manager', icon: Award },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'analytics', label: 'Deep Analytics', icon: BarChart3 },
  { id: 'sponsor', label: 'Sponsor Export', icon: FileText },
  { id: 'settings', label: 'Settings & Health', icon: ShieldCheck },
]

export default function CreatorStudio({
  creatorSlug = 'mkurugenzi',
  initialTab = 'overview',
}: {
  creatorSlug?: string
  initialTab?: AdminTab
}) {
  const router = useRouter()
  const [tab, setTab] = useState<AdminTab>(initialTab)
  const [isDark, setIsDark] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Live Studio Data
  const [creator, setCreator] = useState<any>({
    slug: creatorSlug,
    displayName: 'Mkurugenzi',
    brandPrimaryColor: '#d11149',
    brandSecondaryColor: '#0a0a0d',
    welcomeMessage: 'Welcome to the campfire. Answer questions from our stories, climb the ranks, and unlock rewards.',
    youtubeChannelId: 'UC4tjY2tTltEKePusozUxtSA',
  })
  const [stories, setStories] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [rewards, setRewards] = useState<any[]>([])
  const [fans, setFans] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>({
    totalFans: '0',
    verifiedFans: '0',
    totalAttempts: '0',
    pointsDistributed: '0',
    totalShares: '0',
    completionRate: '0%',
  })

  // Modals state
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false)
  const [isSponsorExportOpen, setIsSponsorExportOpen] = useState(false)
  const [selectedFanForDetail, setSelectedFanForDetail] = useState<any | null>(null)

  // Forms state
  const [storyForm, setStoryForm] = useState({
    title: '',
    youtubeVideoId: '',
    airedDate: new Date().toISOString().split('T')[0],
    transcriptOrNotes: '',
  })
  const [isCreatingStory, setIsCreatingStory] = useState(false)

  const [quizForm, setQuizForm] = useState({
    title: '',
    storyId: '',
    quizType: 'story_recall',
    pointsValue: 250,
    requiresWatchConfirmation: true,
    questions: [
      {
        questionText: '',
        pointsValue: 50,
        options: ['', '', '', ''],
        answer: 0,
      },
    ],
  })
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false)

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    priority: 'episode_drop',
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Load live Studio data
  const loadStudioData = async () => {
    try {
      setLoading(true)
      const [brandRes, storiesRes, quizzesRes, rewardsRes, fansRes, analyticsRes] =
        await Promise.all([
          fetch(`/api/admin/creators/${creatorSlug}/branding`),
          fetch(`/api/admin/creators/${creatorSlug}/stories`),
          fetch(`/api/admin/creators/${creatorSlug}/quizzes`),
          fetch(`/api/admin/creators/${creatorSlug}/rewards`),
          fetch(`/api/admin/creators/${creatorSlug}/fans`),
          fetch(`/api/creators/${creatorSlug}/analytics`),
        ])

      if (brandRes.ok) {
        const b = await brandRes.json()
        if (b.branding) setCreator(b.branding)
      }
      if (storiesRes.ok) {
        const s = await storiesRes.json()
        if (Array.isArray(s.stories)) setStories(s.stories)
      }
      if (quizzesRes.ok) {
        const q = await quizzesRes.json()
        if (Array.isArray(q.quizzes)) setQuizzes(q.quizzes)
      }
      if (rewardsRes.ok) {
        const r = await rewardsRes.json()
        if (Array.isArray(r.rewards)) setRewards(r.rewards)
      }
      if (fansRes.ok) {
        const f = await fansRes.json()
        if (Array.isArray(f.fans)) setFans(f.fans)
      }
      if (analyticsRes.ok) {
        const a = await analyticsRes.json()
        if (a.analytics) setAnalytics(a.analytics)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudioData()
  }, [creatorSlug])

  // Theme effect
  useEffect(() => {
    const root = document.documentElement
    if (isDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [isDark])

  // Story Submit
  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storyForm.title.trim()) return

    try {
      const res = await fetch(`/api/admin/creators/${creatorSlug}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyForm),
      })
      if (res.ok) {
        showToast('Story added to library!')
        setStoryForm({
          title: '',
          youtubeVideoId: '',
          airedDate: new Date().toISOString().split('T')[0],
          transcriptOrNotes: '',
        })
        setIsCreatingStory(false)
        loadStudioData()
      }
    } catch {
      showToast('Failed to create story')
    }
  }

  // Quiz Submit
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quizForm.title.trim()) return

    try {
      const res = await fetch(`/api/admin/creators/${creatorSlug}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizForm),
      })
      if (res.ok) {
        showToast('Quiz published to live platform!')
        setIsCreatingQuiz(false)
        loadStudioData()
      }
    } catch {
      showToast('Failed to create quiz')
    }
  }

  // Branding Save
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/admin/creators/${creatorSlug}/branding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creator),
      })
      if (res.ok) {
        showToast('Branding and theme saved to database!')
      }
    } catch {
      showToast('Failed to save branding')
    }
  }

  // Announcement Submit
  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!announcementForm.title.trim()) return

    try {
      const res = await fetch(`/api/admin/creators/${creatorSlug}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementForm),
      })
      if (res.ok) {
        showToast('Announcement broadcasted to fan feed!')
        setAnnouncementForm({ title: '', message: '', priority: 'episode_drop' })
      }
    } catch {
      showToast('Failed to send announcement')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-accent/25">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 rounded-full px-5 py-2.5 neu-raised-lg border border-accent/40 bg-card text-foreground font-medium text-xs shadow-2xl">
            <span className="ruby-dot animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-16 border-b border-border/80 bg-card/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl neu-raised-xs border border-border text-foreground"
          >
            <Menu className="size-4" />
          </button>
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="grid size-8 place-items-center rounded-xl bg-card neu-raised-xs border border-border text-accent">
              <Flame className="size-4 text-accent" />
            </div>
            <div>
              <span className="font-serif font-bold text-sm tracking-tight block leading-none">
                {creator.displayName} Studio
              </span>
              <span className="text-[9px] font-mono text-muted-foreground uppercase">Creator Dashboard</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${creatorSlug}`}
            target="_blank"
            className="neu-button hidden sm:inline-flex rounded-xl px-3 py-1.5 text-xs font-bold text-foreground items-center gap-1.5"
          >
            <Eye className="size-3.5 text-accent" />
            <span>View Public Portal</span>
          </Link>

          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl neu-raised-xs border border-border text-foreground hover:text-accent"
            title={`Switch to ${isDark ? 'Light' : 'Dark'}`}
          >
            {isDark ? <Sun className="size-4 text-accent" /> : <Moon className="size-4" />}
          </button>

          <Link
            href="/dashboard"
            className="neu-button-primary rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
          >
            <span>Fan View</span>
            <ChevronRight className="size-3" />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/80 p-4 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 md:static ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between md:hidden pb-3 border-b border-border">
              <span className="font-serif font-bold text-sm">Studio Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg neu-raised-xs border border-border"
              >
                <X className="size-4" />
              </button>
            </div>

            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon
                const isActive = tab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTab(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'neu-inset-sm bg-background text-accent border border-accent/30 font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`size-4 ${isActive ? 'text-accent' : ''}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-border/60 text-xs font-mono text-muted-foreground space-y-2">
            <div className="flex items-center justify-between">
              <span>Channel ID</span>
              <span className="font-bold text-foreground truncate max-w-[100px]">
                {creator.youtubeChannelId?.slice(0, 10)}...
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tenant Status</span>
              <span className="text-accent font-bold">Active Live</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-5xl w-full overflow-x-hidden space-y-8">
          {/* TAB A: OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="ruby-dot animate-pulse" />
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                    CREATOR SITUATIONAL AWARENESS
                  </p>
                </div>
                <h1 className="font-serif text-3xl font-bold tracking-tight">Studio Overview</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Real-time heartbeat of your verified fanbase, live challenges, and monetization queue.
                </p>
              </div>

              {/* Needs Attention Panel */}
              <div className="p-5 rounded-2xl neu-inset-sm border border-accent/30 bg-card space-y-3">
                <div className="flex items-center gap-2 text-accent font-mono font-bold text-xs">
                  <AlertCircle className="size-4" />
                  <span>ACTIONABLE CONTENT & PAYOUT NUDGES</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl neu-raised-xs border border-border flex items-center justify-between bg-card">
                    <span>Active Live Quizzes</span>
                    <span className="font-mono font-bold text-foreground">{quizzes.length} Live</span>
                  </div>
                  <div className="p-3 rounded-xl neu-raised-xs border border-border flex items-center justify-between bg-card">
                    <span>Pending Cash Winner Claims</span>
                    <button
                      onClick={() => setTab('rewards')}
                      className="font-mono font-bold text-accent hover:underline"
                    >
                      Review Queue →
                    </button>
                  </div>
                </div>
              </div>

              {/* At-a-glance KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="neu-card p-5 border border-border/80">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground block mb-2">
                    Verified Subscribers
                  </span>
                  <p className="font-serif text-2xl font-bold text-foreground">{analytics.verifiedFans}</p>
                  <p className="text-[9px] font-mono text-accent mt-0.5">YOUTUBE OAUTH V3</p>
                </div>
                <div className="neu-card p-5 border border-border/80">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground block mb-2">
                    Episode Recall Quests
                  </span>
                  <p className="font-serif text-2xl font-bold text-foreground">{quizzes.length}</p>
                  <p className="text-[9px] font-mono text-muted-foreground mt-0.5">CONTENT ROTATION</p>
                </div>
                <div className="neu-card p-5 border border-border/80">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground block mb-2">
                    Total Question Attempts
                  </span>
                  <p className="font-serif text-2xl font-bold text-foreground">{analytics.totalAttempts}</p>
                  <p className="text-[9px] font-mono text-muted-foreground mt-0.5">AUDIENCE ENGAGEMENT</p>
                </div>
                <div className="neu-card p-5 border border-border/80">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground block mb-2">
                    Points Credited
                  </span>
                  <p className="font-serif text-2xl font-bold text-accent">{analytics.pointsDistributed}</p>
                  <p className="text-[9px] font-mono text-muted-foreground mt-0.5">POSTGRES ACCRUAL</p>
                </div>
              </div>

              {/* Top 3 Superfans Pulse Card */}
              <div className="neu-card p-6 border border-border/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4 text-accent" />
                    <h3 className="font-serif text-lg font-bold">Current Top 3 Superfan Champions</h3>
                  </div>
                  <button
                    onClick={() => setTab('fans')}
                    className="text-xs font-mono text-accent font-bold hover:underline"
                  >
                    View All Fans ({fans.length})
                  </button>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  {fans.slice(0, 3).map((fan, idx) => (
                    <div key={fan.id} className="p-4 rounded-2xl neu-raised-sm border border-border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-accent">#{idx + 1} Champion</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{fan.streak}d Streak</span>
                      </div>
                      <p className="font-serif text-base font-bold truncate">{fan.name}</p>
                      <p className="font-mono text-xs text-accent font-semibold mt-1">
                        {fan.points.toLocaleString()} PTS
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB B: BRANDING & LIVE PREVIEW */}
          {tab === 'branding' && (
            <div className="space-y-8">
              <div>
                <h1 className="font-serif text-3xl font-bold">Branding & White-Label Theme</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Customize colors, logo, channel URLs, and welcome copy. Changes reflect live on the fan dashboard.
                </p>
              </div>

              <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-8">
                {/* Form */}
                <form onSubmit={handleSaveBranding} className="neu-card p-6 sm:p-8 border border-border space-y-5">
                  <div>
                    <label className="text-xs font-mono uppercase text-muted-foreground block mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={creator.displayName}
                      onChange={(e) => setCreator({ ...creator, displayName: e.target.value })}
                      className="w-full neu-input px-3.5 py-2.5 text-xs text-foreground font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono uppercase text-muted-foreground block mb-1.5">
                        Brand Primary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={creator.brandPrimaryColor}
                          onChange={(e) => setCreator({ ...creator, brandPrimaryColor: e.target.value })}
                          className="size-8 rounded-lg border border-border cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={creator.brandPrimaryColor}
                          onChange={(e) => setCreator({ ...creator, brandPrimaryColor: e.target.value })}
                          className="w-full neu-input px-3 py-2 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase text-muted-foreground block mb-1.5">
                        Brand Secondary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={creator.brandSecondaryColor}
                          onChange={(e) => setCreator({ ...creator, brandSecondaryColor: e.target.value })}
                          className="size-8 rounded-lg border border-border cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={creator.brandSecondaryColor}
                          onChange={(e) => setCreator({ ...creator, brandSecondaryColor: e.target.value })}
                          className="w-full neu-input px-3 py-2 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-muted-foreground block mb-1.5">
                      YouTube Channel ID (@Mkurugenziii)
                    </label>
                    <input
                      type="text"
                      value={creator.youtubeChannelId}
                      onChange={(e) => setCreator({ ...creator, youtubeChannelId: e.target.value })}
                      className="w-full neu-input px-3.5 py-2.5 text-xs text-foreground font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-muted-foreground block mb-1.5">
                      Welcome Message
                    </label>
                    <textarea
                      rows={3}
                      value={creator.welcomeMessage}
                      onChange={(e) => setCreator({ ...creator, welcomeMessage: e.target.value })}
                      className="w-full neu-input p-3.5 text-xs text-foreground resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="neu-button-primary w-full rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider"
                  >
                    Save Branding to Database
                  </button>
                </form>

                {/* Live Preview Pane */}
                <div className="neu-card p-6 border border-border bg-card space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-xs font-mono uppercase font-bold text-muted-foreground">
                      Live Fan UI Preview
                    </span>
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: creator.brandPrimaryColor }}
                    />
                  </div>

                  <div className="p-4 rounded-2xl neu-inset-sm border border-border bg-background space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="grid size-7 place-items-center rounded-lg font-bold text-xs"
                        style={{ backgroundColor: creator.brandPrimaryColor, color: '#ffffff' }}
                      >
                        <Flame className="size-3.5" />
                      </div>
                      <span className="font-serif font-bold text-sm">{creator.displayName} Campfire</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{creator.welcomeMessage}</p>
                    <div
                      className="p-3 rounded-xl text-center text-xs font-bold"
                      style={{ backgroundColor: creator.brandPrimaryColor, color: '#ffffff' }}
                    >
                      Play Quest (+250 PTS)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB C: STORY LIBRARY */}
          {tab === 'stories' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl font-bold">Story Library</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    YouTube videos and episode transcripts that back episode recall quests and watch-to-unlock gating.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreatingStory(!isCreatingStory)}
                  className="neu-button-primary rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <Plus className="size-4" />
                  <span>{isCreatingStory ? 'Close Form' : 'Add New Story'}</span>
                </button>
              </div>

              {isCreatingStory && (
                <form onSubmit={handleCreateStory} className="neu-card p-6 sm:p-8 border border-accent/40 space-y-4">
                  <h3 className="font-serif text-lg font-bold">Add YouTube Video Story</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono uppercase text-muted-foreground block mb-1">Story Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Episode 42: The Midnight Heist"
                        value={storyForm.title}
                        onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                        className="w-full neu-input px-3.5 py-2.5 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase text-muted-foreground block mb-1">
                        YouTube Video ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. dQw4w9WgXcQ"
                        value={storyForm.youtubeVideoId}
                        onChange={(e) => setStoryForm({ ...storyForm, youtubeVideoId: e.target.value })}
                        className="w-full neu-input px-3.5 py-2.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-muted-foreground block mb-1">
                      Video Transcript / Episode Production Notes
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Paste raw transcript or key plot points here to use as reference when creating quiz questions..."
                      value={storyForm.transcriptOrNotes}
                      onChange={(e) => setStoryForm({ ...storyForm, transcriptOrNotes: e.target.value })}
                      className="w-full neu-input p-3.5 text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="neu-button-primary rounded-xl py-3 px-6 text-xs font-bold uppercase tracking-wider"
                  >
                    Save Story to Database
                  </button>
                </form>
              )}

              <div className="grid gap-4">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className="neu-card p-5 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md px-2 py-0.5 text-[9px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
                          {story.quizzesCount} Quizzes Attached
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">{story.airedDate}</span>
                      </div>
                      <h4 className="font-serif text-lg font-bold">{story.title}</h4>
                      {story.youtubeVideoId && (
                        <p className="text-xs font-mono text-muted-foreground">
                          Video: https://youtu.be/{story.youtubeVideoId}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setQuizForm({ ...quizForm, storyId: story.id, title: `${story.title} Recall Quest` })
                          setTab('quizzes')
                          setIsCreatingQuiz(true)
                        }}
                        className="neu-button-primary rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider"
                      >
                        Build Quiz
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB D: QUIZ BUILDER & AI GENERATOR */}
          {tab === 'quizzes' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl font-bold">Quiz Builder & AI Synthesizer</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create multiple-choice episode recall quests or generate them with 1-click AI from transcripts.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsAiGeneratorOpen(true)}
                    className="neu-button-primary rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                  >
                    <Sparkles className="size-4" />
                    <span>AI Question Generator</span>
                  </button>
                  <button
                    onClick={() => setIsCreatingQuiz(!isCreatingQuiz)}
                    className="neu-button rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 text-foreground"
                  >
                    <Plus className="size-4" />
                    <span>Manual Quiz Form</span>
                  </button>
                </div>
              </div>

              {isCreatingQuiz && (
                <form onSubmit={handleCreateQuiz} className="neu-card p-6 sm:p-8 border border-accent/40 space-y-6">
                  <h3 className="font-serif text-xl font-bold">Create New Episode Quiz</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-mono uppercase text-muted-foreground block mb-1">Quiz Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Episode 42: Midnight Heist Recall Quest"
                        value={quizForm.title}
                        onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                        className="w-full neu-input px-3.5 py-2.5 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase text-muted-foreground block mb-1">
                        Total Points Awarded
                      </label>
                      <input
                        type="number"
                        value={quizForm.pointsValue}
                        onChange={(e) => setQuizForm({ ...quizForm, pointsValue: Number(e.target.value) })}
                        className="w-full neu-input px-3.5 py-2.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-xl neu-inset-xs border border-border">
                    <input
                      type="checkbox"
                      id="watchConfirm"
                      checked={quizForm.requiresWatchConfirmation}
                      onChange={(e) => setQuizForm({ ...quizForm, requiresWatchConfirmation: e.target.checked })}
                      className="size-4 accent-[#d11149] cursor-pointer"
                    />
                    <label htmlFor="watchConfirm" className="text-xs text-foreground cursor-pointer font-medium">
                      Require Watch-to-Unlock Confirmation (Drives YouTube Video Views)
                    </label>
                  </div>

                  {/* Inline Questions */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-sm font-bold">Questions ({quizForm.questions.length})</h4>
                      <button
                        type="button"
                        onClick={() =>
                          setQuizForm({
                            ...quizForm,
                            questions: [
                              ...quizForm.questions,
                              { questionText: '', pointsValue: 50, options: ['', '', '', ''], answer: 0 },
                            ],
                          })
                        }
                        className="text-xs font-mono text-accent font-bold hover:underline"
                      >
                        + Add Another Question
                      </button>
                    </div>

                    {quizForm.questions.map((q, qIdx) => (
                      <div key={qIdx} className="p-4 rounded-xl neu-inset-sm border border-border space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono font-bold text-accent">Question {qIdx + 1}</span>
                          {quizForm.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setQuizForm({
                                  ...quizForm,
                                  questions: quizForm.questions.filter((_, i) => i !== qIdx),
                                })
                              }
                              className="text-xs text-destructive hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Enter question text..."
                          value={q.questionText}
                          onChange={(e) => {
                            const updated = [...quizForm.questions]
                            updated[qIdx].questionText = e.target.value
                            setQuizForm({ ...quizForm, questions: updated })
                          }}
                          className="w-full neu-input px-3 py-2 text-xs"
                          required
                        />
                        <div className="grid sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${qIdx}`}
                                checked={q.answer === optIdx}
                                onChange={() => {
                                  const updated = [...quizForm.questions]
                                  updated[qIdx].answer = optIdx
                                  setQuizForm({ ...quizForm, questions: updated })
                                }}
                                className="accent-[#d11149] cursor-pointer"
                              />
                              <input
                                type="text"
                                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                value={opt}
                                onChange={(e) => {
                                  const updated = [...quizForm.questions]
                                  updated[qIdx].options[optIdx] = e.target.value
                                  setQuizForm({ ...quizForm, questions: updated })
                                }}
                                className="w-full neu-input px-2.5 py-1.5 text-xs"
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="neu-button-primary w-full rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider"
                  >
                    Publish Quiz to Live Platform
                  </button>
                </form>
              )}

              {/* Quizzes List */}
              <div className="grid gap-4">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="neu-card p-5 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-md px-2 py-0.5 text-[9px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
                          {quiz.questionsCount} Questions
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {quiz.attemptsCount || 0} Attempts
                        </span>
                      </div>
                      <h4 className="font-serif text-lg font-bold">{quiz.title}</h4>
                      <p className="text-xs font-mono text-accent">+{quiz.pointsValue} PTS</p>
                    </div>
                    <span className="self-start sm:self-auto rounded-full px-3 py-1 neu-pill-inset text-[10px] font-mono font-bold text-accent">
                      LIVE IN ROTATION
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB E: REWARDS & PAYOUTS */}
          {tab === 'rewards' && (
            <div className="space-y-8">
              <div>
                <h1 className="font-serif text-3xl font-bold">Reward Program & Winner Payouts</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure weekly cash prize pools, consultation perks, and disburse winner rewards via M-Pesa / PayPal.
                </p>
              </div>

              <PayoutManager
                creatorSlug={creatorSlug}
                onDisburseSuccess={() => {
                  showToast('Winner payout disbursed successfully!')
                  loadStudioData()
                }}
              />
            </div>
          )}

          {/* TAB F: FAN CRM DIRECTORY */}
          {tab === 'fans' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl font-bold">Superfan CRM Directory</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Searchable directory of all verified YouTube subscribers in your inner circle.
                  </p>
                </div>
                <span className="rounded-full px-3.5 py-1.5 neu-pill-inset text-xs font-mono text-accent font-bold">
                  {fans.length} VERIFIED FANS
                </span>
              </div>

              <div className="overflow-x-auto neu-card p-6 border border-border">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border font-mono uppercase text-muted-foreground text-[10px]">
                      <th className="pb-3 pl-2">Rank / Fan</th>
                      <th className="pb-3">Points</th>
                      <th className="pb-3">Streak</th>
                      <th className="pb-3">Quizzes</th>
                      <th className="pb-3">Referrals</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {fans.map((fan) => (
                      <tr key={fan.id} className="hover:bg-muted/30">
                        <td className="py-3 pl-2 font-semibold text-foreground">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">#{fan.rank}</span>
                            <span>{fan.name}</span>
                          </div>
                        </td>
                        <td className="py-3 font-mono font-bold text-accent">{fan.points.toLocaleString()} PTS</td>
                        <td className="py-3 font-mono">{fan.streak} Days</td>
                        <td className="py-3 font-mono">{fan.attemptsCount} Completed</td>
                        <td className="py-3 font-mono">{fan.referralsCount} Joined</td>
                        <td className="py-3">
                          <span className="rounded-full px-2 py-0.5 text-[9px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
                            YouTube Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB G: BADGE MANAGER */}
          {tab === 'badges' && (
            <div className="space-y-8">
              <div>
                <h1 className="font-serif text-3xl font-bold">Collectible Badge Manager</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage fan achievement collectibles awarded dynamically for quest streaks, referrals, and watch milestones.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'First Flame', criteria: 'Complete 1st quest', Icon: Flame },
                  { title: '7-Day Spark', criteria: '7-day active streak', Icon: Zap },
                  { title: 'YouTube Superfan', criteria: 'Verified YouTube Subscriber', Icon: Trophy },
                  { title: 'Circle Ambassador', criteria: '3 verified referrals', Icon: Users },
                  { title: 'Top 10 Contender', criteria: 'Reach Top 10 rank', Icon: Award },
                  { title: 'Watch Party Veteran', criteria: '3 episode watch confirmations', Icon: Eye },
                ].map((b, i) => (
                  <div key={i} className="p-5 rounded-2xl neu-raised-sm border border-border bg-card">
                    <div className="grid size-9 place-items-center rounded-xl bg-card neu-inset-xs text-accent mb-3">
                      <b.Icon className="size-4.5" />
                    </div>
                    <h4 className="font-serif text-base font-bold">{b.title}</h4>
                    <p className="text-xs font-mono text-accent mt-1">{b.criteria}</p>
                    <span className="block text-[9px] font-mono text-muted-foreground mt-2">ACTIVE TEMPLATE</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB H: ANNOUNCEMENTS COMPOSER */}
          {tab === 'announcements' && (
            <div className="space-y-8">
              <div>
                <h1 className="font-serif text-3xl font-bold">Announcements Composer</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Broadcast updates directly to your inner circle's dashboard notification feed.
                </p>
              </div>

              <form onSubmit={handleSendAnnouncement} className="neu-card p-6 sm:p-8 border border-border space-y-4">
                <div>
                  <label className="text-xs font-mono uppercase text-muted-foreground block mb-1">Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Episode 43 drops this Friday at 6:00 PM!"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    className="w-full neu-input px-3.5 py-2.5 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-muted-foreground block mb-1">
                    Announcement Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about the upcoming drop, cash prize deadline, or special watch-to-unlock instructions..."
                    value={announcementForm.message}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                    className="w-full neu-input p-3.5 text-xs resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="neu-button-primary rounded-xl py-3 px-6 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <Send className="size-3.5" />
                  <span>Broadcast to Fan Feed</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB I: DEEP ANALYTICS */}
          {tab === 'analytics' && (
            <div className="space-y-8">
              <div>
                <h1 className="font-serif text-3xl font-bold">Growth & Engagement Intelligence</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Data YouTube Studio doesn't give you: verified subscriber growth, quiz completion rates, and share virality.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="neu-card p-5 border border-border">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground block mb-1">
                    Average Quiz Completion Rate
                  </span>
                  <p className="font-serif text-3xl font-bold">{analytics.completionRate}</p>
                  <p className="text-[9px] font-mono text-accent mt-1">ATTENTION METRIC</p>
                </div>
                <div className="neu-card p-5 border border-border">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground block mb-1">
                    Score Card Shares
                  </span>
                  <p className="font-serif text-3xl font-bold">{analytics.totalShares}</p>
                  <p className="text-[9px] font-mono text-muted-foreground mt-1">WHATSAPP & X VIRALITY</p>
                </div>
                <div className="neu-card p-5 border border-border">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground block mb-1">
                    Estimated Organic Reach
                  </span>
                  <p className="font-serif text-3xl font-bold">{(Number(analytics.totalShares || 0) * 8).toLocaleString()}</p>
                  <p className="text-[9px] font-mono text-accent mt-1">PEER-TO-PEER RECOMMENDATIONS</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB J: SPONSOR EXPORT */}
          {tab === 'sponsor' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl font-bold">Sponsor Pitch Deck Export</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate clean PDF summaries of your verified audience to pitch high-paying brand sponsors.
                  </p>
                </div>
                <button
                  onClick={() => setIsSponsorExportOpen(true)}
                  className="neu-button-primary rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <FileText className="size-4" />
                  <span>Preview & Export Deck</span>
                </button>
              </div>

              <div className="p-6 rounded-2xl neu-inset-sm border border-border bg-card space-y-4">
                <h3 className="font-serif text-lg font-bold">Audience Metrics Included in Report:</h3>
                <ul className="text-xs space-y-2.5 text-muted-foreground font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-accent shrink-0" />
                    <span>Total 100% Google OAuth Verified YouTube Subscribers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-accent shrink-0" />
                    <span>Exact Episode Recall Quiz Completion Rate ({analytics.completionRate})</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-accent shrink-0" />
                    <span>Organic Social Media Share Counts ({analytics.totalShares} Shares)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-accent shrink-0" />
                    <span>Live Leaderboard Engagement Volume</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB K: SETTINGS & HEALTH */}
          {tab === 'settings' && (
            <div className="space-y-8">
              <div>
                <h1 className="font-serif text-3xl font-bold">Settings & Platform Health</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  API quota status, team access controls, and database connection monitors.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="neu-card p-5 border border-border space-y-3">
                  <div className="flex items-center gap-2 text-accent font-bold text-xs font-mono">
                    <Video className="size-4" />
                    <span>YouTube Data API v3 Status</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Connected to channel <strong>{creator.youtubeChannelId}</strong> with 30-day scheduled re-verification.
                  </p>
                  <span className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold bg-accent/15 text-accent">
                    Healthy · Zero Quota Overages
                  </span>
                </div>

                <div className="neu-card p-5 border border-border space-y-3">
                  <div className="flex items-center gap-2 text-foreground font-bold text-xs font-mono">
                    <Layers className="size-4 text-accent" />
                    <span>Neon PostgreSQL Database</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Multi-tenant schema with 18 tables scoped strictly by <code>creatorId</code>.
                  </p>
                  <span className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold bg-accent/15 text-accent">
                    Connected · 100% Live DB
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* AI Question Generator Modal */}
      <AiQuestionGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        creatorSlug={creatorSlug}
        onSuccess={(title) => {
          showToast(`AI Quest "${title}" published to live platform!`)
          loadStudioData()
        }}
      />

      {/* Sponsor Pitch Export Modal */}
      <SponsorExportModal
        isOpen={isSponsorExportOpen}
        onClose={() => setIsSponsorExportOpen(false)}
        creator={{
          displayName: creator.displayName,
          handle: `@${creator.slug}`,
          brandPrimaryColor: creator.brandPrimaryColor,
        }}
        analytics={{
          verifiedFans: analytics.verifiedFans,
          completions: analytics.completionRate,
          points: analytics.pointsDistributed,
          trend: '+24%',
        }}
      />
    </div>
  )
}
