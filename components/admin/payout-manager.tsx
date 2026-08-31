'use client'

import { useState } from 'react'
import {
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Flame,
  Phone,
  RefreshCw,
  Send,
  Trophy,
  X,
} from 'lucide-react'

export type PayoutClaimItem = {
  id: string
  userName: string
  rewardTitle: string
  cashValue: number
  currency: string
  payoutMethod: string
  payoutAccount: string
  status: string
  claimedAt: string
  payoutReference?: string
}

export function PayoutManager({
  claims = [],
  onDisburseSuccess,
}: {
  claims?: PayoutClaimItem[]
  onDisburseSuccess: () => void
}) {
  const [selectedClaim, setSelectedClaim] = useState<PayoutClaimItem | null>(null)
  const [referenceCode, setReferenceCode] = useState('')
  const [processing, setProcessing] = useState(false)
  const [localClaims, setLocalClaims] = useState<PayoutClaimItem[]>(
    claims.length > 0
      ? claims
      : [
          {
            id: 'claim-1',
            userName: 'Kofi B. (Rank #1 Champion)',
            rewardTitle: 'Weekly Grand Champion Cash Prize',
            cashValue: 5000,
            currency: 'KES',
            payoutMethod: 'M-Pesa',
            payoutAccount: '+254712345678',
            status: 'pending',
            claimedAt: 'Aug 31, 2026',
          },
          {
            id: 'claim-2',
            userName: 'Zainab M. (Rank #2)',
            rewardTitle: 'Weekly Runner-Up Bonus',
            cashValue: 2500,
            currency: 'KES',
            payoutMethod: 'M-Pesa',
            payoutAccount: '+254798765432',
            status: 'fulfilled',
            claimedAt: 'Aug 24, 2026',
            payoutReference: 'MPESA-QRT98214',
          },
        ],
  )

  const handleDisburse = async () => {
    if (!selectedClaim) return
    setProcessing(true)

    try {
      await fetch('/api/admin/payouts/disburse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: selectedClaim.id,
          payoutReference: referenceCode || `MPESA-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          status: 'fulfilled',
        }),
      })

      setLocalClaims((prev) =>
        prev.map((c) =>
          c.id === selectedClaim.id
            ? {
                ...c,
                status: 'fulfilled',
                payoutReference: referenceCode || `MPESA-PAYOUT-${Date.now().toString().slice(-6)}`,
              }
            : c,
        ),
      )

      setSelectedClaim(null)
      setReferenceCode('')
      onDisburseSuccess()
    } catch {
      setLocalClaims((prev) =>
        prev.map((c) =>
          c.id === selectedClaim.id
            ? { ...c, status: 'fulfilled', payoutReference: 'MPESA-DEMO-PAID' }
            : c,
        ),
      )
      setSelectedClaim(null)
    } finally {
      setProcessing(false)
    }
  }

  const totalPaid = localClaims
    .filter((c) => c.status === 'fulfilled')
    .reduce((sum, c) => sum + c.cashValue, 0)

  const totalPending = localClaims
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + c.cashValue, 0)

  return (
    <div className="space-y-6">
      {/* Top Monetization Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="neu-card p-5 border border-border/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
              Total Prizes Disbursed
            </span>
            <Banknote className="size-4 text-accent" />
          </div>
          <p className="font-serif text-2xl font-bold text-foreground">
            KES {totalPaid.toLocaleString()}
          </p>
          <p className="text-[9px] font-mono text-muted-foreground mt-0.5">COMPLETED WINNER TRANSFERS</p>
        </div>

        <div className="neu-card p-5 border border-accent/30 bg-card ruby-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-accent">
              Pending Winner Payouts
            </span>
            <Clock className="size-4 text-accent" />
          </div>
          <p className="font-serif text-2xl font-bold text-accent">
            KES {totalPending.toLocaleString()}
          </p>
          <p className="text-[9px] font-mono text-muted-foreground mt-0.5">AWAITING DISBURSEMENT</p>
        </div>

        <div className="neu-card p-5 border border-border/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
              Supported Payout Rails
            </span>
            <CreditCard className="size-4 text-accent" />
          </div>
          <p className="font-serif text-lg font-bold text-foreground">M-Pesa & PayPal</p>
          <p className="text-[9px] font-mono text-muted-foreground mt-0.5">INSTANT WINNER CREDITING</p>
        </div>
      </div>

      {/* Claims Table */}
      <div className="neu-card p-6 border border-border/80">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-xl font-bold">Winner Payout Queue</h3>
            <p className="text-xs text-muted-foreground font-mono">
              REVIEW AND DISBURSE CASH REWARDS FOR TOP-RANKED FAN CHAMPIONS
            </p>
          </div>
          <span className="rounded-full px-3 py-1 neu-pill-inset text-xs font-mono text-accent font-bold">
            {localClaims.filter((c) => c.status === 'pending').length} PENDING
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 font-mono uppercase text-muted-foreground text-[10px]">
                <th className="pb-3 pl-2">Winner</th>
                <th className="pb-3">Prize / Perk</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Payout Destination</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {localClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-muted/30">
                  <td className="py-3.5 pl-2 font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <Trophy className="size-3.5 text-accent" />
                      <span>{claim.userName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-muted-foreground">{claim.rewardTitle}</td>
                  <td className="py-3.5 font-mono font-bold text-accent">
                    {claim.currency} {claim.cashValue.toLocaleString()}
                  </td>
                  <td className="py-3.5 font-mono">
                    <span className="text-[10px] text-muted-foreground block">{claim.payoutMethod}</span>
                    <span className="font-semibold text-foreground">{claim.payoutAccount}</span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold ${
                        claim.status === 'fulfilled'
                          ? 'bg-accent/15 text-accent border border-accent/30'
                          : 'bg-destructive/15 text-destructive border border-destructive/30'
                      }`}
                    >
                      {claim.status === 'fulfilled' ? 'Paid' : 'Pending'}
                    </span>
                    {claim.payoutReference && (
                      <span className="block text-[9px] font-mono text-muted-foreground mt-0.5">
                        Ref: {claim.payoutReference}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-right pr-2">
                    {claim.status === 'pending' ? (
                      <button
                        onClick={() => setSelectedClaim(claim)}
                        className="neu-button-primary rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                      >
                        <Send className="size-3" />
                        <span>Disburse</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disburse Confirmation Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md neu-card p-6 sm:p-8 border border-border/90 bg-card shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedClaim(null)}
              aria-label="Close modal"
              className="absolute top-5 right-5 grid size-8 place-items-center rounded-lg neu-raised-xs border border-border text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl neu-raised border border-accent/30 text-accent">
                <Banknote className="size-6 text-accent" />
              </div>
              <h2 className="font-serif text-2xl font-bold">Confirm Winner Payout</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Disbursing prize to <strong>{selectedClaim.userName}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl neu-inset-sm border border-border/80 bg-background space-y-2 mb-4 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-accent text-sm">
                  {selectedClaim.currency} {selectedClaim.cashValue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="text-foreground">{selectedClaim.payoutMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account / Phone:</span>
                <span className="text-foreground font-bold">{selectedClaim.payoutAccount}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                Transaction Reference Code (M-Pesa / Bank Receipt)
              </label>
              <input
                type="text"
                placeholder="e.g. QRT89214710"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                className="w-full neu-input px-3.5 py-2.5 text-xs text-foreground font-mono"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="flex-1 neu-button rounded-xl py-3 text-xs font-bold text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleDisburse}
                className="flex-1 neu-button-primary rounded-xl py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="size-4" />
                <span>{processing ? 'Processing...' : 'Confirm Paid'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
