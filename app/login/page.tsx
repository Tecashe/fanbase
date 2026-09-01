'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Flame,
  KeyRound,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Sparkles,
  User,
  Users,
  Video,
  X,
} from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/app'
  const creatorSlug = searchParams.get('creator') || 'mkurugenzi'
  const roleParam = searchParams.get('role')

  const [accountType, setAccountType] = useState<'fan' | 'creator'>('fan')
  const [inputMode, setInputMode] = useState<'email' | 'phone'>('email')
  const [authMethod, setAuthMethod] = useState<'password' | 'code'>('password')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingExistingSession, setCheckingExistingSession] = useState(true)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Initialize remembered role from localStorage or query param
  useEffect(() => {
    if (roleParam === 'creator') {
      setAccountType('creator')
    } else {
      const savedRole = localStorage.getItem('campfire_auth_role') as 'fan' | 'creator' | null
      if (savedRole === 'creator' || savedRole === 'fan') {
        setAccountType(savedRole)
      }
    }
  }, [roleParam])

  // Save role preference
  const handleSelectRole = (newRole: 'fan' | 'creator') => {
    setAccountType(newRole)
    localStorage.setItem('campfire_auth_role', newRole)
  }

  // Auto-check if user already has an active stored session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`/api/auth/me?creatorSlug=${creatorSlug}`)
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated && data.user) {
            console.log('[Campfire Auth Client] Active session found for:', data.user.displayName)
            const target =
              accountType === 'creator' || data.user.role === 'creator'
                ? `/admin/${creatorSlug}`
                : redirectPath === '/app' || redirectPath === '/dashboard'
                ? `/dashboard/${data.user?.slug || 'fan'}`
                : redirectPath
            router.replace(target)
            return
          }
        }
      } catch {
        // Continue to show login form
      } finally {
        setCheckingExistingSession(false)
      }
    }
    checkSession()
  }, [creatorSlug, redirectPath, router, accountType])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleGoogleAuth = async () => {
    setGoogleLoading(true)
    setError(null)
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const res = await fetch(
        `/api/auth/youtube/url?creatorSlug=${creatorSlug}&origin=${encodeURIComponent(origin)}&role=${accountType}`,
      )
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Could not generate YouTube authorization URL')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'YouTube Auth failed')
      setGoogleLoading(false)
    }
  }

  const handleSendCode = async () => {
    if (!identifier.trim()) {
      setError(`Please enter your ${inputMode === 'email' ? 'email' : 'phone number'} first.`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send code')

      if (data.previewCode) {
        setGeneratedCode(data.previewCode)
      }

      setCodeSent(true)
      showToast(data.message || 'Verification code sent!')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let authUserResult = null
      if (authMethod === 'code') {
        const res = await fetch('/api/auth/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, code: verificationCode, creatorSlug }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Invalid verification code')
        authUserResult = data.user
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password, creatorSlug }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Invalid credentials')
        authUserResult = data.user
      }

      showToast('Login successful. Redirecting to workspace...')
      const target =
        accountType === 'creator' || authUserResult?.role === 'creator'
          ? `/admin/${creatorSlug}`
          : redirectPath === '/app' || redirectPath === '/dashboard'
          ? `/dashboard/${authUserResult?.slug || 'fan'}`
          : redirectPath

      router.replace(target)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  if (checkingExistingSession) {
    return (
      <div className="w-full max-w-md neu-card p-8 border border-border/90 bg-card text-center space-y-4">
        <div className="grid size-12 place-items-center rounded-2xl bg-card neu-raised border border-border mx-auto text-accent animate-pulse">
          <Flame className="size-6 text-accent" />
        </div>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Checking Active Session...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md neu-card p-6 sm:p-8 border border-border/90 bg-card shadow-2xl relative overflow-hidden">
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 rounded-full px-5 py-2.5 neu-raised-lg border border-accent/30 bg-card text-foreground font-medium text-sm shadow-xl">
            <span className="ruby-dot animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">Sign In</h1>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          {accountType === 'creator'
            ? 'Access your Creator Studio workspace and quest controls'
            : 'Access your verified quests, live points, and creator perks'}
        </p>
      </div>

      {/* Account Type Selector (Fan vs Creator) - Zero Emojis */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => handleSelectRole('fan')}
          className={`p-3.5 rounded-2xl text-left transition-all ${
            accountType === 'fan'
              ? 'neu-inset-sm border-2 border-accent bg-background'
              : 'neu-raised-xs border border-border bg-card hover:border-accent/40'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="grid size-7 place-items-center rounded-lg bg-card neu-raised-xs border border-border text-accent">
              <Users className="size-3.5" />
            </div>
            {accountType === 'fan' && <Check className="size-3.5 text-accent" />}
          </div>
          <p className="font-serif font-bold text-xs text-foreground">Fan Sign In</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
            Go to Fan Dashboard
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleSelectRole('creator')}
          className={`p-3.5 rounded-2xl text-left transition-all ${
            accountType === 'creator'
              ? 'neu-inset-sm border-2 border-accent bg-background'
              : 'neu-raised-xs border border-border bg-card hover:border-accent/40'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="grid size-7 place-items-center rounded-lg bg-card neu-raised-xs border border-border text-accent">
              <Video className="size-3.5" />
            </div>
            {accountType === 'creator' && <Check className="size-3.5 text-accent" />}
          </div>
          <p className="font-serif font-bold text-xs text-foreground">Creator Studio</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
            Go to Creator Admin
          </p>
        </button>
      </div>

      {/* 1-Click YouTube / Google Login */}
      <button
        type="button"
        disabled={googleLoading}
        onClick={handleGoogleAuth}
        className="w-full mb-6 neu-button-accent rounded-xl py-3 px-4 text-xs font-bold text-accent inline-flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        <Video className={`size-4 ${googleLoading ? 'animate-spin' : ''}`} />
        <span>
          {googleLoading
            ? 'Connecting to Google...'
            : accountType === 'creator'
            ? 'Sign In to Studio with YouTube / Google'
            : 'Continue with YouTube / Google'}
        </span>
      </button>

      <div className="relative mb-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <span className="relative bg-card px-3 text-[10px] font-mono uppercase text-muted-foreground">
          or sign in with credentials
        </span>
      </div>

      {/* Input Mode Selector (Email vs Phone) */}
      <div className="flex items-center justify-center gap-4 mb-4 text-xs font-mono">
        <button
          type="button"
          onClick={() => {
            setInputMode('email')
            setIdentifier('')
            setCodeSent(false)
          }}
          className={`flex items-center gap-1.5 pb-1 border-b-2 font-bold transition-all ${
            inputMode === 'email'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mail className="size-3.5" /> Email
        </button>
        <button
          type="button"
          onClick={() => {
            setInputMode('phone')
            setIdentifier('')
            setCodeSent(false)
          }}
          className={`flex items-center gap-1.5 pb-1 border-b-2 font-bold transition-all ${
            inputMode === 'phone'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Phone className="size-3.5" /> Phone Number (M-Pesa)
        </button>
      </div>

      {/* Auth Method Selector (Password vs OTP Code) */}
      <div className="flex rounded-xl neu-inset-xs p-1 mb-5 text-[11px] font-mono">
        <button
          type="button"
          onClick={() => setAuthMethod('password')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            authMethod === 'password'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setAuthMethod('code')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            authMethod === 'code'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Instant OTP Code
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl p-3.5 text-xs font-medium border border-destructive/30 bg-destructive/10 text-destructive animate-in fade-in duration-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
            {inputMode === 'email' ? 'Email Address' : 'Phone Number'}
          </label>
          <div className="relative">
            {inputMode === 'email' ? (
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            ) : (
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            )}
            <input
              type={inputMode === 'email' ? 'email' : 'tel'}
              required
              placeholder={inputMode === 'email' ? 'you@example.com' : '+254 712 345 678'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-medium rounded-xl"
            />
          </div>
        </div>

        {authMethod === 'password' ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase text-muted-foreground">
                Password
              </label>
              <button
                type="button"
                onClick={() => setAuthMethod('code')}
                className="text-[10px] font-mono text-accent font-bold hover:underline"
              >
                Use OTP code instead
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-medium rounded-xl"
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase text-muted-foreground">
                6-Digit Verification Code
              </label>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={loading}
                className="text-[10px] font-mono text-accent font-bold hover:underline"
              >
                {codeSent ? 'Resend Code' : 'Send Code'}
              </button>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                maxLength={6}
                required
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-mono font-bold tracking-widest rounded-xl"
              />
            </div>
            {generatedCode && (
              <p className="text-[10px] font-mono text-muted-foreground mt-2 p-2 rounded-lg neu-inset-xs text-center">
                Verification Code: <strong className="text-accent">{generatedCode}</strong>
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (authMethod === 'code' && verificationCode.length < 6)}
          className="mt-6 w-full neu-button-primary rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : 'hidden'}`} />
          <span>
            {loading
              ? 'Authenticating...'
              : accountType === 'creator'
              ? 'Enter Creator Studio'
              : 'Enter Dashboard'}
          </span>
          {!loading && <ArrowRight className="size-3.5" />}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-border/60 text-center text-xs text-muted-foreground">
        Don't have an account yet?{' '}
        <Link
          href={`/register?role=${accountType}&creator=${creatorSlug}`}
          className="font-mono text-accent font-bold hover:underline"
        >
          Sign Up as {accountType === 'creator' ? 'Creator' : 'Fan'}
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2.5 group">
        <div className="grid size-9 place-items-center rounded-xl bg-card neu-raised-xs border border-border group-hover:scale-105 transition-transform">
          <Flame className="size-4.5 text-accent" />
        </div>
        <span className="font-serif font-bold text-base">Campfire</span>
      </Link>

      <Suspense
        fallback={
          <div className="neu-card p-8 text-center text-xs font-mono text-muted-foreground">
            Loading...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
