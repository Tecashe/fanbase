'use client'

import { useState } from 'react'
import { ArrowRight, Flame, Lock, Mail, Sparkles, User, X } from 'lucide-react'

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  creatorSlug,
  referrerId,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: (userData: { id: string; email: string; displayName?: string }) => void
  creatorSlug: string
  referrerId?: string | null
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const payload = {
        email,
        password,
        displayName: mode === 'register' ? displayName : undefined,
        creatorSlug,
        referrerId: mode === 'register' ? referrerId : undefined,
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      onSuccess(data.user)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md neu-card p-6 sm:p-8 border border-border/90 bg-card shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 grid size-8 place-items-center rounded-lg neu-raised-xs border border-border text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="grid size-11 place-items-center rounded-2xl bg-card neu-raised-sm border border-border text-accent">
            <Flame className="size-6 text-accent drop-shadow-[0_0_8px_rgba(209,17,73,0.5)]" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Join the Inner Circle'}
            </h2>
            <p className="text-xs font-mono text-muted-foreground">
              {mode === 'login'
                ? 'Sign in to access your quests & live points'
                : 'Create an account to start earning rewards'}
            </p>
          </div>
        </div>

        {/* Referral Welcome Tag */}
        {mode === 'register' && referrerId && (
          <div className="mb-4 flex items-center gap-2 rounded-xl p-2.5 neu-inset-xs border border-accent/30 text-xs font-mono text-accent">
            <Sparkles className="size-4 shrink-0 text-accent" />
            <span>+100 Bonus Points unlocked from your friend's invite!</span>
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl p-3 text-xs font-medium border border-destructive/30 bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Amina K."
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full neu-button-primary rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 text-primary-foreground disabled:opacity-50"
          >
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="size-3.5" />
          </button>
        </form>

        {/* Switch Mode Toggle */}
        <div className="mt-6 pt-4 border-t border-border/60 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError(null)
            }}
            className="text-xs text-muted-foreground hover:text-accent font-semibold transition-colors"
          >
            {mode === 'login'
              ? "Don't have an account yet? Create one"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
