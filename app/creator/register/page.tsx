'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  Flame,
  LayoutDashboard,
  Moon,
  Palette,
  Sparkles,
  Sun,
  Video,
  Zap,
} from 'lucide-react'

export default function CreatorRegisterPage() {
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    displayName: '',
    slug: '',
    youtubeChannelId: '',
    brandPrimaryColor: '#d11149',
    brandSecondaryColor: '#0a0a0d',
    welcomeMessage: 'Welcome to our official fan circle! Answer episode questions, climb the standings, and win weekly rewards.',
  })

  // Auto-generate slug as user types display name
  const handleNameChange = (name: string) => {
    const autoSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setFormData((prev) => ({
      ...prev,
      displayName: name,
      slug: prev.slug === '' || prev.slug === prev.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-') ? autoSlug : prev.slug,
    }))
  }

  // Theme Sync
  useEffect(() => {
    const root = document.documentElement
    if (isDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [isDark])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/creators/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create creator workspace')
        setLoading(false)
        return
      }

      // Success -> Redirect to Creator Studio
      router.push(`/admin/${data.creator.slug}`)
    } catch {
      setError('An unexpected network error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-accent/25">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-16 border-b border-border/80 bg-card/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="grid size-8 place-items-center rounded-xl bg-card neu-raised-xs border border-border text-accent">
            <Flame className="size-4 text-accent" />
          </div>
          <div>
            <span className="font-serif font-bold text-sm tracking-tight block leading-none">
              Campfire
            </span>
            <span className="text-[9px] font-mono text-muted-foreground uppercase">Creator Network</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl neu-raised-xs border border-border text-foreground hover:text-accent"
            title={`Switch to ${isDark ? 'Light' : 'Dark'}`}
          >
            {isDark ? <Sun className="size-4 text-accent" /> : <Moon className="size-4" />}
          </button>
          <Link
            href="/explore"
            className="neu-button hidden sm:inline-flex rounded-xl px-3.5 py-1.5 text-xs font-bold text-foreground"
          >
            Browse Campfires
          </Link>
          <Link
            href="/login"
            className="neu-button-primary rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 neu-pill-inset text-xs font-mono font-bold text-accent">
            <Sparkles className="size-3.5" />
            <span>INSTANT CREATOR ONBOARDING</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Launch Your Official Fan Club & Quests
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Get your own white-labeled portal, subscriber-gated quizzes, leaderboard, and M-Pesa cash prize manager in 60 seconds.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl neu-inset-sm border border-destructive/40 text-destructive text-xs font-mono">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="neu-card p-6 sm:p-8 border border-border space-y-5">
            <h2 className="font-serif text-xl font-bold">1. Channel & Workspace Info</h2>

            <div>
              <label className="text-xs font-mono uppercase text-muted-foreground block mb-1.5">
                Channel / Creator Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Cinema Vault, Tech Reviews KE, Abel Mutua"
                value={formData.displayName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full neu-input px-3.5 py-2.5 text-xs font-medium text-foreground"
                required
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-muted-foreground block mb-1.5">
                Custom URL Slug (Your portal handle) *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 rounded-l-xl neu-inset-xs border border-r-0 border-border text-[11px] font-mono text-muted-foreground bg-muted/40">
                  fanbase.app/
                </span>
                <input
                  type="text"
                  placeholder="cinema-vault"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full neu-input rounded-l-none px-3.5 py-2.5 text-xs font-mono text-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-muted-foreground block mb-1.5">
                YouTube Channel ID (e.g. UC4tjY2tTltEKePusozUxtSA)
              </label>
              <input
                type="text"
                placeholder="UC..."
                value={formData.youtubeChannelId}
                onChange={(e) => setFormData({ ...formData, youtubeChannelId: e.target.value })}
                className="w-full neu-input px-3.5 py-2.5 text-xs font-mono text-foreground"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Used to verify fan subscriptions via official Google YouTube Data API v3.
              </p>
            </div>

            <div className="pt-3 border-t border-border">
              <h2 className="font-serif text-lg font-bold mb-3">2. Brand Colors & Theme</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-muted-foreground block mb-1.5">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.brandPrimaryColor}
                      onChange={(e) => setFormData({ ...formData, brandPrimaryColor: e.target.value })}
                      className="size-8 rounded-lg border border-border cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={formData.brandPrimaryColor}
                      onChange={(e) => setFormData({ ...formData, brandPrimaryColor: e.target.value })}
                      className="w-full neu-input px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-muted-foreground block mb-1.5">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.brandSecondaryColor}
                      onChange={(e) => setFormData({ ...formData, brandSecondaryColor: e.target.value })}
                      className="size-8 rounded-lg border border-border cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={formData.brandSecondaryColor}
                      onChange={(e) => setFormData({ ...formData, brandSecondaryColor: e.target.value })}
                      className="w-full neu-input px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-muted-foreground block mb-1.5">
                Welcome Message for Fans
              </label>
              <textarea
                rows={3}
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                className="w-full neu-input p-3.5 text-xs text-foreground resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neu-button-primary w-full rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Workspace...</span>
              ) : (
                <>
                  <span>Create Campfire & Open Studio</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Live Preview */}
          <div className="space-y-4">
            <div className="neu-card p-6 border border-border bg-card space-y-4 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-mono uppercase font-bold text-muted-foreground">
                  Live Fan Portal Preview
                </span>
                <span
                  className="size-3 rounded-full shadow-sm"
                  style={{ backgroundColor: formData.brandPrimaryColor }}
                />
              </div>

              <div className="p-4 rounded-2xl neu-inset-sm border border-border bg-background space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="grid size-7 place-items-center rounded-lg font-bold text-xs"
                    style={{ backgroundColor: formData.brandPrimaryColor, color: '#ffffff' }}
                  >
                    🔥
                  </div>
                  <div>
                    <p className="font-serif font-bold text-sm leading-none">
                      {formData.displayName || 'Your Channel'} Campfire
                    </p>
                    <p className="text-[9px] font-mono text-muted-foreground mt-0.5">
                      /{formData.slug || 'your-slug'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-3">
                  {formData.welcomeMessage}
                </p>

                <div
                  className="p-3 rounded-xl text-center text-xs font-bold shadow-sm"
                  style={{ backgroundColor: formData.brandPrimaryColor, color: '#ffffff' }}
                >
                  Play Latest Quest (+250 PTS)
                </div>
              </div>

              <div className="text-xs font-mono text-muted-foreground space-y-1.5 pt-2">
                <p className="flex items-center gap-1.5 text-accent font-semibold">
                  <CheckCircle2 className="size-3.5" />
                  <span>White-labeled portal created instantly</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-accent" />
                  <span>AI Quest Builder from transcripts</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-accent" />
                  <span>Direct M-Pesa cash prize manager</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
