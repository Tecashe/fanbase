'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Flame, KeyRound, Lock, Mail, RefreshCw, Sparkles, User, X } from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/app'
  const creatorSlug = searchParams.get('creator') || 'mkurugenzi'
  const refCode = searchParams.get('ref')

  const [step, setStep] = useState<'details' | 'verify'>('details')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [referrerId, setReferrerId] = useState(refCode || '')
  const [verificationCode, setVerificationCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (refCode) {
      setReferrerId(refCode)
      showToast('Friend invite detected! +100 Bonus Points when you complete registration.')
    }
  }, [refCode])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleProceedToVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code')

      if (data.previewCode) {
        setGeneratedCode(data.previewCode)
      }

      setStep('verify')
      showToast('Verification code sent to your email!')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration error')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const verifyRes = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode, creatorSlug }),
      })

      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Invalid verification code')

      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          email,
          password,
          creatorSlug,
          referrerId,
        }),
      })

      const regData = await regRes.json()
      if (!regRes.ok) throw new Error(regData.error || 'Registration failed')

      showToast('Account created successfully! Redirecting to dashboard...')
      setTimeout(() => {
        router.push(redirectPath)
        router.refresh()
      }, 500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
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
          {step === 'details' ? 'Create Your Account' : 'Verify Your Email'}
        </h1>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          {step === 'details'
            ? 'Join the campfire, play episode recall quests, and climb the ranks'
            : `Enter the 6-digit code sent to ${email}`}
        </p>
      </div>

      {referrerId && step === 'details' && (
        <div className="mb-4 flex items-center gap-2 rounded-xl p-2.5 neu-inset-xs border border-accent/30 text-xs font-mono text-accent">
          <Sparkles className="size-4 shrink-0 text-accent" />
          <span>+100 Bonus Points unlocked from your friend's invite!</span>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl p-3.5 text-xs font-medium border border-destructive/30 bg-destructive/10 text-destructive animate-in fade-in duration-200">
          {error}
        </div>
      )}

      {step === 'details' ? (
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
