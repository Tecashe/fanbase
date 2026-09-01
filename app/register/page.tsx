'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Flame,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Radio,
  RefreshCw,
  Sparkles,
  Tv,
  User,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/app'
  const creatorSlugParam = searchParams.get('creator') || ''
  const refCode = searchParams.get('ref')
  const roleParam = searchParams.get('role')

  // Questionnaire & Role State
  const [role, setRole] = useState<'fan' | 'creator'>(roleParam === 'creator' ? 'creator' : 'fan')
  const [step, setStep] = useState<number>(1)

  // Fan Form State
  const [fanInputMode, setFanInputMode] = useState<'email' | 'phone'>('email')
  const [displayName, setDisplayName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [referrerId, setReferrerId] = useState(refCode || '')
  const [verificationCode, setVerificationCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')

  // Creator Form State
  const [channelHandle, setChannelHandle] = useState('')
  const [creatorName, setCreatorName] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [creatorSlug, setCreatorSlug] = useState('')
  const [youtubeChannelId, setYoutubeChannelId] = useState('')
  const [creatorEmail, setCreatorEmail] = useState('')
  const [creatorPassword, setCreatorPassword] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#d11149')

  // UI state
  const [loading, setLoading] = useState(false)
  const [checkingExistingSession, setCheckingExistingSession] = useState(true)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Auto-check active session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`/api/auth/me?creatorSlug=${creatorSlugParam}`)
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated && data.user) {
            console.log('[Campfire Auth Client] Active session found for:', data.user.displayName)
            const target =
              data.user?.role === 'creator'
                ? `/admin/${creatorSlugParam}`
                : redirectPath === '/app' || redirectPath === '/dashboard'
                ? `/dashboard/${data.user?.slug || 'fan'}`
                : redirectPath
            router.replace(target)
            return
          }
        }
      } catch {
        // Continue to show registration questionnaire
      } finally {
        setCheckingExistingSession(false)
      }
    }
    checkSession()
  }, [creatorSlugParam, redirectPath, router])

  useEffect(() => {
    if (refCode) {
      setReferrerId(refCode)
      showToast('Friend invite detected! +100 Bonus Points when you join.')
    }
  }, [refCode])

  // Sync creator name to suggested slug & workspace
  useEffect(() => {
    if (creatorName && !creatorSlug) {
      const slugified = creatorName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setCreatorSlug(slugified)
      if (!workspaceName) setWorkspaceName(`${creatorName} Campfire`)
    }
  }, [creatorName, creatorSlug, workspaceName])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // 1-Click YouTube OAuth for Fan or Creator
  const handleGoogleAuth = async (targetRole: 'fan' | 'creator') => {
    setGoogleLoading(true)
    setError(null)
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const targetSlug = targetRole === 'creator' ? creatorSlug || 'creator' : creatorSlugParam
      const res = await fetch(
        `/api/auth/youtube/url?creatorSlug=${targetSlug}&origin=${encodeURIComponent(origin)}&role=${targetRole}`,
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

  // FAN FLOW: Request OTP
  const handleFanSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }
      if (!identifier.trim()) {
        throw new Error(`Please enter your ${fanInputMode === 'email' ? 'email address' : 'phone number'}`)
      }

      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code')

      if (data.previewCode) {
        setGeneratedCode(data.previewCode)
      }

      setStep(3)
      showToast(`Verification code sent to ${identifier}!`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration error')
    } finally {
      setLoading(false)
    }
  }

  // FAN FLOW: Verify OTP & Finish
  const handleFanComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const verifyRes = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code: verificationCode }),
      })

      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Invalid verification code')

      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
          displayName: displayName.trim() || undefined,
          creatorSlug: creatorSlugParam,
          referrerId: referrerId.trim() || undefined,
        }),
      })

      const registerData = await registerRes.json()
      if (!registerRes.ok) throw new Error(registerData.error || 'Failed to create user account')

      showToast('Registration complete! Launching Campfire...')
      const userSlug = registerData.user?.slug || 'fan'
      const target =
        redirectPath === '/app' || redirectPath === '/dashboard'
          ? `/dashboard/${userSlug}`
          : redirectPath

      router.replace(target)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // CREATOR FLOW: Create Workspace
  const handleCreatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!creatorName.trim()) throw new Error('Please enter your channel or creator name')
      if (!creatorSlug.trim()) throw new Error('Please choose a workspace URL slug')
      if (creatorPassword.length < 6) throw new Error('Password must be at least 6 characters')

      const cleanSlug = creatorSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      const res = await fetch('/api/creators/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: creatorName.trim(),
          slug: cleanSlug,
          youtubeChannelId: youtubeChannelId.trim() || undefined,
          channelHandle: channelHandle.trim() || undefined,
          email: creatorEmail.trim() || undefined,
          password: creatorPassword,
          brandPrimaryColor: primaryColor,
          welcomeMessage: `Welcome to the official ${creatorName} Campfire! Take quests and earn real cash prizes.`,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to register creator workspace')

      showToast('Creator Studio created! Launching your workspace...')
      router.replace(`/admin/${cleanSlug}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Creator registration failed')
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
          Checking Session...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg neu-card p-6 sm:p-8 border border-border/90 bg-card shadow-2xl relative overflow-hidden">
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 rounded-full px-5 py-2.5 neu-raised-lg border border-accent/30 bg-card text-foreground font-medium text-sm shadow-xl">
            <span className="ruby-dot animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* QUESTION 1: Role Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 neu-pill-inset text-[10px] font-mono font-bold text-accent mb-2">
              <Zap className="size-3" /> STEP 1 OF 2 · ONBOARDING
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              What brings you to Campfire?
            </h1>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              Select your role to personalize your experience
            </p>
          </div>

          <div className="grid gap-3.5">
            {/* Card 1: Fan */}
            <button
              type="button"
              onClick={() => {
                setRole('fan')
                setStep(2)
              }}
              className="p-5 rounded-2xl text-left transition-all group neu-raised border border-border bg-card hover:border-accent/60 hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="grid size-11 place-items-center rounded-2xl bg-card neu-raised-xs border border-border text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground">
                      I am a Fan / Subscriber
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Compete in lore quests, climb leaderboards, earn points, and claim cash rewards.
                    </p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all mt-1" />
              </div>
            </button>

            {/* Card 2: Creator */}
            <button
              type="button"
              onClick={() => {
                setRole('creator')
                setStep(2)
              }}
              className="p-5 rounded-2xl text-left transition-all group neu-raised border border-border bg-card hover:border-accent/60 hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="grid size-11 place-items-center rounded-2xl bg-card neu-raised-xs border border-border text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <Video className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground">
                      I am a Content Creator
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Launch your official fan club, build subscriber-gated quests, manage cash payouts, and track deep analytics.
                    </p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all mt-1" />
              </div>
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-mono text-accent font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* QUESTION 2 (FAN): Sign Up Method */}
      {step === 2 && role === 'fan' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="neu-button-sm rounded-xl px-2.5 py-1 text-xs font-mono text-muted-foreground inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="size-3" /> Back
            </button>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              Fan Setup · Step 2 of 2
            </span>
          </div>

          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold tracking-tight">Create Fan Account</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Join the campfire, play quests, and climb the rankings
            </p>
          </div>

          {referrerId && (
            <div className="flex items-center gap-2 rounded-xl p-2.5 neu-inset-xs border border-accent/30 text-xs font-mono text-accent">
              <Sparkles className="size-4 shrink-0 text-accent" />
              <span>+100 Bonus Points unlocked from your friend's invite!</span>
            </div>
          )}

          {error && (
            <div className="rounded-xl p-3.5 text-xs font-medium border border-destructive/30 bg-destructive/10 text-destructive">
              {error}
            </div>
          )}

          {/* 1-Click YouTube OAuth */}
          <button
            type="button"
            disabled={googleLoading}
            onClick={() => handleGoogleAuth('fan')}
            className="w-full neu-button-accent rounded-xl py-3.5 px-4 text-xs font-bold text-accent inline-flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01]"
          >
            <Video className={`size-4 ${googleLoading ? 'animate-spin' : ''}`} />
            <span>{googleLoading ? 'Connecting to Google...' : 'Sign Up with YouTube / Google'}</span>
          </button>

          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <span className="relative bg-card px-3 text-[10px] font-mono uppercase text-muted-foreground">
              or register with credentials
            </span>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center justify-center gap-4 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setFanInputMode('email')
                setIdentifier('')
              }}
              className={`flex items-center gap-1.5 pb-1 border-b-2 font-bold transition-all ${
                fanInputMode === 'email'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="size-3.5" /> Email
            </button>
            <button
              type="button"
              onClick={() => {
                setFanInputMode('phone')
                setIdentifier('')
              }}
              className={`flex items-center gap-1.5 pb-1 border-b-2 font-bold transition-all ${
                fanInputMode === 'phone'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Phone className="size-3.5" /> Mobile Phone (M-Pesa)
            </button>
          </div>

          <form onSubmit={handleFanSendCode} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                Display Name / Handle
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Your Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-medium rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                {fanInputMode === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <div className="relative">
                {fanInputMode === 'email' ? (
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                ) : (
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                )}
                <input
                  type={fanInputMode === 'email' ? 'email' : 'tel'}
                  required
                  placeholder={fanInputMode === 'email' ? 'you@example.com' : '+254 712 345 678'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-medium rounded-xl"
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
                  placeholder="•••••••• (Min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-medium rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full neu-button-primary rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : 'hidden'}`} />
              <span>{loading ? 'Sending Code...' : 'Continue to Verification'}</span>
              {!loading && <ArrowRight className="size-3.5" />}
            </button>
          </form>
        </div>
      )}

      {/* QUESTION 3 (FAN): OTP Verification */}
      {step === 3 && role === 'fan' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="neu-button-sm rounded-xl px-2.5 py-1 text-xs font-mono text-muted-foreground inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="size-3" /> Back
            </button>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              OTP Verification
            </span>
          </div>

          <div className="text-center">
            <div className="grid size-12 place-items-center rounded-2xl bg-card neu-raised border border-border mx-auto text-accent mb-3">
              <KeyRound className="size-6 text-accent" />
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight">Verify Your Account</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Enter the 6-digit code sent to <strong className="text-foreground">{identifier}</strong>
            </p>
          </div>

          {error && (
            <div className="rounded-xl p-3.5 text-xs font-medium border border-destructive/30 bg-destructive/10 text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleFanComplete} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono uppercase text-muted-foreground">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={handleFanSendCode}
                  disabled={loading}
                  className="text-[10px] font-mono text-accent font-bold hover:underline"
                >
                  Resend Code
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full neu-input py-3 text-center text-lg font-mono font-bold tracking-widest text-foreground rounded-xl"
                />
              </div>
              {generatedCode && (
                <p className="text-[10px] font-mono text-muted-foreground mt-2 p-2 rounded-lg neu-inset-xs text-center">
                  Verification Code: <strong className="text-accent">{generatedCode}</strong>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length < 6}
              className="mt-6 w-full neu-button-primary rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : 'hidden'}`} />
              <span>{loading ? 'Verifying...' : 'Verify & Enter Dashboard'}</span>
              {!loading && <Check className="size-3.5" />}
            </button>
          </form>
        </div>
      )}

      {/* QUESTION 2 (CREATOR): Channel Details & Setup */}
      {step === 2 && role === 'creator' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="neu-button-sm rounded-xl px-2.5 py-1 text-xs font-mono text-muted-foreground inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="size-3" /> Back
            </button>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              Creator Setup · Step 2 of 2
            </span>
          </div>

          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold tracking-tight">Channel & Studio Setup</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Connect your YouTube channel and configure your Campfire workspace
            </p>
          </div>

          {error && (
            <div className="rounded-xl p-3.5 text-xs font-medium border border-destructive/30 bg-destructive/10 text-destructive">
              {error}
            </div>
          )}

          {/* 1-Click YouTube Connect for Creators */}
          <button
            type="button"
            disabled={googleLoading}
            onClick={() => handleGoogleAuth('creator')}
            className="w-full neu-button-accent rounded-xl py-3.5 px-4 text-xs font-bold text-accent inline-flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01]"
          >
            <Video className={`size-4 ${googleLoading ? 'animate-spin' : ''}`} />
            <span>{googleLoading ? 'Connecting to Google...' : '1-Click Connect Channel with Google'}</span>
          </button>

          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <span className="relative bg-card px-3 text-[10px] font-mono uppercase text-muted-foreground">
              or set up manually
            </span>
          </div>

          <form onSubmit={handleCreatorSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                Channel Name / Host Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Your Channel or Brand Name"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-medium rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                  Channel Handle
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">@</span>
                  <input
                    type="text"
                    placeholder="yourhandle"
                    value={channelHandle}
                    onChange={(e) => setChannelHandle(e.target.value.replace('@', ''))}
                    className="w-full neu-input pl-8 pr-3.5 py-2.5 text-xs text-foreground font-medium rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                  Portal URL Slug
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="your-custom-slug"
                    value={creatorSlug}
                    onChange={(e) => setCreatorSlug(e.target.value)}
                    className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-mono font-medium rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                YouTube Channel ID (for Subscriber Gating)
              </label>
              <div className="relative">
                <Tv className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. UCxxxxxxxxxxxxxxxxxxxxxx"
                  value={youtubeChannelId}
                  onChange={(e) => setYoutubeChannelId(e.target.value)}
                  className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-mono rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                  Admin Email / Phone
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="admin@yourchannel.com"
                    value={creatorEmail}
                    onChange={(e) => setCreatorEmail(e.target.value)}
                    className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-medium rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                  Studio Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={creatorPassword}
                    onChange={(e) => setCreatorPassword(e.target.value)}
                    className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-medium rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                Brand Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="size-9 rounded-xl border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-32 neu-input px-3 py-2 text-xs font-mono text-foreground uppercase rounded-xl"
                />
                <span className="text-xs text-muted-foreground">Sets button & badge highlights</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full neu-button-primary rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : 'hidden'}`} />
              <span>{loading ? 'Creating Studio...' : 'Launch Creator Studio'}</span>
              {!loading && <ArrowRight className="size-3.5" />}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function RegisterPage() {
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
        <RegisterForm />
      </Suspense>
    </div>
  )
}
