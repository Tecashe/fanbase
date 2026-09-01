'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Award,
  ChevronRight,
  Eye,
  Flame,
  Gift,
  Moon,
  Play,
  Search,
  Sparkles,
  Sun,
  Trophy,
  Users,
  Video,
  Zap,
} from 'lucide-react'

export default function ExplorePage() {
  const [isDark, setIsDark] = useState(false)
  const [creators, setCreators] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Theme Sync
  useEffect(() => {
    const root = document.documentElement
    if (isDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [isDark])

  // Load creators
  const loadCreators = async (query = '') => {
    try {
      setLoading(true)
      const res = await fetch(`/api/creators?search=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.creators)) {
          setCreators(data.creators)
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCreators('')
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadCreators(search)
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
            <span className="text-[9px] font-mono text-muted-foreground uppercase">Creator Directory</span>
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
            href="/creator/register"
            className="neu-button hidden sm:inline-flex rounded-xl px-3.5 py-1.5 text-xs font-bold text-foreground"
          >
            Creators: Launch Portal
          </Link>

          <Link
            href="/login"
            className="neu-button-primary rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Search Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 neu-pill-inset text-xs font-mono font-bold text-accent">
            <Sparkles className="size-3.5" />
            <span>DISCOVER CREATOR CAMPFIRES</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Search & Join Your Favorite Creators
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Explore official YouTube creator fan clubs. Take weekly episode recall quizzes, climb standings, and win cash prizes.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-lg mx-auto pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search creator by name or handle..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  loadCreators(e.target.value)
                }}
                className="w-full neu-input pl-10 pr-4 py-3 text-xs text-foreground font-medium rounded-2xl"
              />
            </div>
            <button
              type="submit"
              className="neu-button-primary rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {/* Creators Grid */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-muted-foreground">
              {creators.length} Creators on Platform
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-mono text-muted-foreground animate-pulse">
              Loading Creator Portals...
            </div>
          ) : creators.length === 0 ? (
            <div className="py-16 text-center rounded-2xl neu-inset-sm border border-border space-y-3">
              <p className="font-serif text-lg font-bold">No creators found matching "{search}"</p>
              <p className="text-xs text-muted-foreground">
                Are you a creator? Be the first to launch a campfire for your channel!
              </p>
              <Link
                href="/creator/register"
                className="neu-button-primary inline-flex rounded-xl px-4 py-2 text-xs font-bold uppercase"
              >
                Create Your Campfire
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((c) => (
                <div
                  key={c.id}
                  className="neu-card-interactive p-6 border border-border/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="grid size-12 place-items-center rounded-2xl text-base font-bold text-white shadow-md font-serif"
                        style={{ backgroundColor: c.brandPrimaryColor }}
                      >
                        {c.initials}
                      </div>
                      <span className="rounded-full px-2.5 py-0.5 neu-pill-inset text-[10px] font-mono font-bold text-accent">
                        {c.stats.totalQuizzes} Active Quests
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold leading-tight">{c.displayName}</h3>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{c.handle}</p>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {c.welcomeMessage}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                    <div className="text-[10px] font-mono text-muted-foreground">
                      <span className="font-bold text-foreground">{c.stats.totalFans}</span> Verified Fans
                    </div>
                    <Link
                      href={`/${c.slug}`}
                      className="neu-button-primary rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                    >
                      <span>Enter Campfire</span>
                      <ChevronRight className="size-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
