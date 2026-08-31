'use client'

import { useState } from 'react'
import { Banknote, Check, DollarSign, Flame, Phone, Send, X } from 'lucide-react'
import { RewardData } from '@/components/campfire-app'

export function CashPrizeClaimModal({
  isOpen,
  onClose,
  reward,
  creatorSlug,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  reward: RewardData | null
  creatorSlug: string
  onSuccess: (msg: string) => void
}) {
  const [payoutMethod, setPayoutMethod] = useState<'M-Pesa' | 'PayPal' | 'Bank'>('M-Pesa')
  const [payoutAccount, setPayoutAccount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !reward) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/payouts/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewardId: reward.id,
          payoutMethod,
          payoutAccount,
          creatorSlug,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Claim failed')

      onSuccess(data.message || 'Cash prize claim submitted!')
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Claim failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md neu-card p-6 sm:p-8 border border-border/90 bg-card shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 grid size-8 place-items-center rounded-lg neu-raised-xs border border-border text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl neu-raised border border-accent/30 bg-card text-accent">
            <Banknote className="size-7 text-accent drop-shadow-[0_0_8px_rgba(209,17,73,0.5)]" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 neu-pill-inset text-[10px] font-mono font-bold text-accent mb-2">
            WINNER MONETIZATION PAYOUT
          </span>
          <h2 className="font-serif text-2xl font-bold tracking-tight">Claim Cash Reward</h2>
          <p className="text-xs text-muted-foreground mt-1">{reward.title}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl p-3 text-xs font-medium border border-destructive/30 bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
              Select Payout Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['M-Pesa', 'PayPal', 'Bank'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPayoutMethod(method)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    payoutMethod === method
                      ? 'neu-inset-xs border-2 border-accent text-accent font-bold bg-background'
                      : 'neu-raised-xs border border-border text-muted-foreground hover:text-foreground bg-card'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
              {payoutMethod === 'M-Pesa'
                ? 'M-Pesa Phone Number (+254...)'
                : payoutMethod === 'PayPal'
                ? 'PayPal Account Email'
                : 'Bank Account Number & Bank Name'}
            </label>
            <input
              type="text"
              required
              placeholder={
                payoutMethod === 'M-Pesa'
                  ? '+254 712 345 678'
                  : payoutMethod === 'PayPal'
                  ? 'you@example.com'
                  : 'Account #12345678 - KCB'
              }
              value={payoutAccount}
              onChange={(e) => setPayoutAccount(e.target.value)}
              className="w-full neu-input px-3.5 py-2.5 text-xs text-foreground font-medium"
            />
          </div>

          <div className="p-3 rounded-xl neu-inset-xs border border-border/80 text-[11px] font-mono text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Points Required:</span>
              <span className="font-bold text-foreground">{reward.points}</span>
            </div>
            <div className="flex justify-between">
              <span>Disbursement Speed:</span>
              <span className="text-accent font-bold">Within 24 Hours</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full neu-button-primary rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="size-4" />
            <span>{loading ? 'Submitting Claim...' : 'Confirm & Request Payout'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}
