'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Flame,
  KeyRound,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Sparkles,
  User,
  Video,
  X,
} from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/app'
  const creatorSlug = searchParams.get('creator') || 'mkurugenzi'
  const refCode = searchParams.get('ref')

  const roleParam = searchParams.get('role')
  const [accountType, setAccountType] = useState<'fan' | 'creator'>(roleParam === 'creator' ? 'creator' : 'fan')
  const [inputMode, setInputMode] = useState<'email' | 'phone'>('email')
  const [step, setStep] = useState<'details' | 'verify'>('details')
  const [displayName, setDisplayName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [referrerId, setReferrerId] = useState(refCode || '')
  const [verificationCode, setVerificationCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingExistingSession, setCheckingExistingSession] = useState(true)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Auto-check if user already has an active stored session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`/api/auth/me?creatorSlug=${creatorSlug}`)
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated && data.user) {
            console.log('[Campfire Auth Client] Active session found on register page for:', data.user.displayName)
            const target =
              redirectPath === '/app' || redirectPath === '/dashboard'
                ? `/dashboard/${data.user?.slug || 'fan'}`
                : redirectPath
            router.replace(target)
            return
          }
        }
      } catch {
        // Continue to show register form
      } finally {
        setCheckingExistingSession(false)
      }
    }
    checkSession()
  }, [creatorSlug, redirectPath, router])

  useEffect(() => {
    if (refCode) {
      setReferrerId(refCode)
      console.log('[Campfire Auth Client] Referral invite detected:', refCode)
      showToast('Friend invite detected! +100 Bonus Points when you complete registration.')
    }
  }, [refCode])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleGoogleAuth = async () => {
    console.log('[Campfire Auth Client] Initiating Google / YouTube Sign Up...')
    setGoogleLoading(true)
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const res = await fetch(
        `/api/auth/youtube/url?creatorSlug=${creatorSlug}&origin=${encodeURIComponent(origin)}`,
      )
      const data = await res.json()
      if (data.url) {
        console.log('[Campfire Auth Client] Redirecting to Google OAuth:', data.url)
        window.location.href = data.url
      } else {
        throw new Error('Could not generate YouTube auth URL')
      }
    } catch (err: unknown) {
      console.error('[Campfire Auth Client] Google OAuth error:', err)
      setError(err instanceof Error ? err.message : 'YouTube Auth failed')
      setGoogleLoading(false)
    }
  }

  const handleProceedToVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      if (!identifier.trim()) {
        throw new Error(`Please enter your ${inputMode === 'email' ? 'email' : 'phone number'}`)
      }

      console.log(`[Campfire Auth Client] Requesting verification OTP for ${inputMode}:`, identifier)
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      })

      const data = await res.json()
      console.log('[Campfire Auth Client] Send-code response:', data)
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code')

      if (data.previewCode) {
        setGeneratedCode(data.previewCode)
      }

      setStep('verify')
      showToast(`Verification code sent to your ${inputMode === 'email' ? 'email' : 'phone'}!`)
    } catch (err: unknown) {
      console.error('[Campfire Auth Client] Step 1 error:', err)
      setError(err instanceof Error ? err.message : 'Registration error')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    console.log(`[Campfire Auth Client] Verifying code ${verificationCode} and creating user...`)

    try {
      const verifyRes = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code: verificationCode }),
      })

      const verifyData = await verifyRes.json()
      console.log('[Campfire Auth Client] Verify code response:', verifyData)
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Invalid verification code')

      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
          displayName: displayName.trim() || undefined,
          creatorSlug,
          referrerId: referrerId.trim() || undefined,
        }),
      })

      const registerData = await registerRes.json()
      console.log('[Campfire Auth Client] Register account response:', registerData)
      if (!registerRes.ok) throw new Error(registerData.error || 'Failed to create user account')

      showToast('Registration successful! Launching campfire...')

      const finalUserSlug = registerData.user?.slug || 'fan'
      const destination =
        redirectPath === '/app' || redirectPath === '/dashboard'
          ? `/dashboard/${finalUserSlug}`
          : redirectPath

      router.replace(destination)
    } catch (err: unknown) {
      console.error('[Campfire Auth Client] Step 2 error:', err)
      setError(err instanceof Error ? err.message : 'Registration failed')
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
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
          {step === 'details' ? 'Create Your Account' : 'Verify Your Code'}
        </h1>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          {step === 'details'
            ? 'Join the platform as a fan or launch your creator portal'
            : `Enter the 6-digit code sent to ${identifier}`}
        </p>
      </div>

      {step === 'details' && (
        <>
          {/* Account Type Selector (Fan vs Creator) */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setAccountType('fan')}
              className={`p-3.5 rounded-2xl text-left transition-all ${
                accountType === 'fan'
                  ? 'neu-inset-sm border-2 border-accent bg-background'
                  : 'neu-raised-xs border border-border bg-card hover:border-accent/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-lg">👥</span>
                {accountType === 'fan' && <Check className="size-3.5 text-accent" />}
              </div>
              <p className="font-serif font-bold text-xs text-foreground">I am a Fan</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                Play quests, climb ranks, & win cash
              </p>
            </button>

            <button
              type="button"
              onClick={() => setAccountType('creator')}
              className={`p-3.5 rounded-2xl text-left transition-all ${
                accountType === 'creator'
                  ? 'neu-inset-sm border-2 border-accent bg-background'
                  : 'neu-raised-xs border border-border bg-card hover:border-accent/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-lg">🎬</span>
                {accountType === 'creator' && <Check className="size-3.5 text-accent" />}
              </div>
              <p className="font-serif font-bold text-xs text-foreground">I am a Creator</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                Launch fan club & monetize audience
              </p>
            </button>
          </div>

          {accountType === 'creator' ? (
            <div className="space-y-4 text-center py-2">
              <div className="p-4 rounded-2xl neu-inset-xs border border-border bg-background space-y-2 text-left">
                <p className="font-serif text-sm font-bold text-foreground">Launch Your Creator Campfire</p>
                <p className="text-xs text-muted-foreground">
                  Set up your custom portal slug, connect your YouTube channel, customize your brand theme, and publish your first lore quest in 60 seconds.
                </p>
              </div>

              <Link
                href="/creator/register"
                className="neu-button-primary w-full rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2"
              >
                <span>Open Creator Onboarding Wizard →</span>
              </Link>
            </div>
          ) : (
            <>
              {referrerId && (
                <div className="mb-4 flex items-center gap-2 rounded-xl p-2.5 neu-inset-xs border border-accent/30 text-xs font-mono text-accent">
                  <Sparkles className="size-4 shrink-0 text-accent" />
                  <span>+100 Bonus Points unlocked from your friend's invite!</span>
                </div>
              )}

              {/* 1-Click YouTube / Google Sign Up */}
              <button
                type="button"
                disabled={googleLoading}
                onClick={handleGoogleAuth}
                className="w-full mb-6 neu-button-accent rounded-xl py-3 px-4 text-xs font-bold text-accent inline-flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Video className={`size-4 ${googleLoading ? 'animate-spin' : ''}`} />
                <span>{googleLoading ? 'Connecting to Google...' : 'Sign Up with YouTube / Google'}</span>
              </button>

              <div className="relative mb-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/60" />
                </div>
                <span className="relative bg-card px-3 text-[10px] font-mono uppercase text-muted-foreground">
                  or register with credentials
                </span>
              </div>

              {/* Mode Selector */}
              <div className="flex items-center justify-center gap-4 mb-4 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('email')
                    setIdentifier('')
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
            </>
          )}
        </>
      )}

      {error && (
        <div className="mb-5 rounded-xl p-3.5 text-xs font-medium border border-destructive/30 bg-destructive/10 text-destructive animate-in fade-in duration-200">
          {error}
        </div>
      )}

      {step === 'details' ? (
        accountType === 'fan' && (
          <form onSubmit={handleProceedToVerify} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                Display Name / Handle
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
                  placeholder="•••••••• (Min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-medium"
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
        )
      ) : (
        <form onSubmit={handleCompleteRegistration} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase text-muted-foreground">
                6-Digit Verification Code
              </label>
              <button
                type="button"
                onClick={handleProceedToVerify}
                disabled={loading}
                className="text-[10px] font-mono text-accent font-bold hover:underline"
              >
                Resend Code
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
                className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-mono font-bold tracking-widest text-center text-base"
              />
            </div>
            {generatedCode && (
              <p className="text-[10px] font-mono text-muted-foreground mt-2 p-2 rounded-lg neu-inset-xs text-center">
                Verification Code: <strong className="text-accent">{generatedCode}</strong>
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep('details')}
              className="flex-1 neu-button rounded-xl py-3 text-xs font-bold text-muted-foreground"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || verificationCode.length < 6}
              className="flex-2 neu-button-primary rounded-xl py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : 'hidden'}`} />
              <span>{loading ? 'Creating...' : 'Verify & Enter Dashboard'}</span>
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-border/60 text-center">
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link
            href={`/login?creator=${creatorSlug}&redirect=${encodeURIComponent(redirectPath)}`}
            className="text-accent font-bold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-accent/25 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-3 group outline-none">
          <div className="relative grid size-12 place-items-center rounded-2xl bg-card neu-raised border border-border group-hover:scale-105 transition-transform duration-200">
            <Flame className="size-6 text-accent drop-shadow-[0_0_8px_rgba(209,17,73,0.5)]" />
            <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-accent ruby-glow" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight block leading-none">
            Campfire
          </span>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-md neu-card p-8 border border-border text-center text-xs font-mono text-muted-foreground">
            Loading...
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  )
}
