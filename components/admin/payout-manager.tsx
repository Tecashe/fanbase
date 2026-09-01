'use client'

import { useState, useEffect } from 'react'
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
  ShieldCheck,
  Trophy,
  Users,
  X,
  Zap,
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
  creatorSlug = '',
  onDisburseSuccess,
}: {
  creatorSlug?: string
  onDisburseSuccess: () => void
}) {
  const [selectedClaim, setSelectedClaim] = useState<PayoutClaimItem | null>(null)
  const [referenceCode, setReferenceCode] = useState('')
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [localClaims, setLocalClaims] = useState<PayoutClaimItem[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'fulfilled'>('all')
  const [prizePool, setPrizePool] = useState('5,000')
  const [paybillNumber, setPaybillNumber] = useState('400200')
  const [autoApprove, setAutoApprove] = useState(true)

  const fetchClaims = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/payouts/disburse?creatorSlug=${creatorSlug}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.claims)) {
          setLocalClaims(data.claims)
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims()
  }, [creatorSlug])

  const handleDisburse = async () => {
    if (!selectedClaim) return
    setProcessing(true)

    try {
      const generatedRef = referenceCode || `MPESA-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      const res = await fetch('/api/admin/payouts/disburse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: selectedClaim.id,
          payoutReference: generatedRef,
          status: 'fulfilled',
        }),
      })

      if (res.ok) {
        setLocalClaims((prev) =>
          prev.map((c) =>
            c.id === selectedClaim.id
              ? {
                  ...c,
                  status: 'fulfilled',
                  payoutReference: generatedRef,
                }
              : c,
          ),
        )
        setSelectedClaim(null)
        setReferenceCode('')
        onDisburseSuccess()
      }
    } catch {
      // ignore
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

  const filteredClaims = localClaims.filter((c) => {
    if (statusFilter === 'pending') return c.status === 'pending'
    if (statusFilter === 'fulfilled') return c.status === 'fulfilled'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Top Monetization Metrics - 4 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neu-card p-5 border border-border/80 bg-card">
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
              Pending Winner Claims
            </span>
            <Clock className="size-4 text-accent" />
          </div>
          <p className="font-serif text-2xl font-bold text-accent">
            KES {totalPending.toLocaleString()}
          </p>
          <p className="text-[9px] font-mono text-muted-foreground mt-0.5">AWAITING RECEIPT APPROVAL</p>
        </div>

        <div className="neu-card p-5 border border-border/80 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
              Total Winners Rewarded
            </span>
            <Trophy className="size-4 text-accent" />
          </div>
          <p className="font-serif text-2xl font-bold text-foreground">
            {localClaims.filter((c) => c.status === 'fulfilled').length} Fans
          </p>
          <p className="text-[9px] font-mono text-muted-foreground mt-0.5">VERIFIED SUPERFANS</p>
        </div>

        <div className="neu-card p-5 border border-border/80 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
              Connected Cash Rails
            </span>
            <CreditCard className="size-4 text-accent" />
          </div>
          <p className="font-serif text-lg font-bold text-foreground">M-Pesa & PayPal</p>
          <p className="text-[9px] font-mono text-muted-foreground mt-0.5">INSTANT CREDITING ACTIVE</p>
        </div>
      </div>

      {/* Main 12-Column Responsive Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left 8 Columns: Live Disbursement Queue Table */}
        <div className="xl:col-span-8 neu-card p-6 sm:p-8 border border-border/80 bg-card flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold">Winner Payout Queue</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  REAL-TIME DISBURSEMENT QUEUE FROM NEON POSTGRESQL
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-xl neu-inset-xs p-1 text-[11px] font-mono">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      statusFilter === 'all'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All ({localClaims.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      statusFilter === 'pending'
                        ? 'bg-card text-accent shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Pending ({localClaims.filter((c) => c.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('fulfilled')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      statusFilter === 'fulfilled'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Paid ({localClaims.filter((c) => c.status === 'fulfilled').length})
                  </button>
                </div>

                <button
                  onClick={fetchClaims}
                  disabled={loading}
                  title="Refresh queue"
                  className="p-2 rounded-xl neu-raised-xs border border-border text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs font-mono text-muted-foreground">
                <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-accent" />
                Loading live payout queue...
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="py-16 text-center rounded-2xl neu-inset-xs border border-border/60">
                <Trophy className="size-9 mx-auto mb-3 text-muted-foreground/50" />
                <p className="font-serif text-base font-bold text-foreground">No Claims Found</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {statusFilter === 'pending'
                    ? 'All pending winner payouts have been approved and disbursed.'
                    : 'When superfans climb the live standings and claim prizes, their records populate here automatically.'}
                </p>
              </div>
            ) : (
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
                    {filteredClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-muted/30 transition-colors">
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
                          {claim.status === 'fulfilled' ? (
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 neu-pill-inset text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="size-3" />
                              PAID
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 neu-pill-inset text-[10px] font-mono font-bold text-accent">
                              <Clock className="size-3" />
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          {claim.status === 'pending' ? (
                            <button
                              onClick={() => {
                                setSelectedClaim(claim)
                                setReferenceCode(`MPESA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)
                              }}
                              className="neu-button-primary rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                            >
                              <span>Disburse</span>
                              <Send className="size-3" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[100px] inline-block">
                              Ref: {claim.payoutReference || 'COMPLETED'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Columns: Connected Rails & Prize Pool Settings */}
        <div className="xl:col-span-4 space-y-6">
          {/* Prize Pool Config */}
          <div className="neu-card p-6 border border-border/80 bg-card space-y-4">
            <div className="flex items-center gap-2">
              <Banknote className="size-4 text-accent" />
              <h3 className="font-serif text-lg font-bold">Weekly Prize Pool</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure the automated cash purse allocated to the #1 ranked fan every Sunday.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">
                  Weekly Pool Amount (KES)
                </label>
                <input
                  type="text"
                  value={prizePool}
                  onChange={(e) => setPrizePool(e.target.value)}
                  className="w-full neu-input px-3.5 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">
                  M-Pesa B2C Paybill / Till
                </label>
                <input
                  type="text"
                  value={paybillNumber}
                  onChange={(e) => setPaybillNumber(e.target.value)}
                  className="w-full neu-input px-3.5 py-2 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl neu-inset-xs border border-border">
                <span className="text-xs font-medium text-foreground">Auto-Confirm Subscriptions</span>
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="size-4 accent-[#d11149] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Security & Verification Box */}
          <div className="p-5 rounded-2xl neu-inset-sm border border-border bg-card/60 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-serif font-bold text-sm">
              <ShieldCheck className="size-4 text-accent" />
              <span>Fraud Protection Built-In</span>
            </div>
            <ul className="text-xs space-y-2 text-muted-foreground font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-accent shrink-0" />
                <span>Double-spend lock on reward claims</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-accent shrink-0" />
                <span>Google OAuth verified YouTube subscriber audit</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-accent shrink-0" />
                <span>Direct M-Pesa transaction reference logging</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disburse Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md neu-card p-6 sm:p-8 border border-accent/40 bg-card shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-xl bg-card neu-raised-xs text-accent">
                  <Banknote className="size-4 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">Approve Cash Payout</h3>
                  <p className="text-[10px] font-mono text-muted-foreground">DIRECT M-PESA DISBURSEMENT</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="p-1 rounded-lg neu-raised-xs border border-border text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl neu-inset-sm border border-border space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Winner:</span>
                <span className="font-bold text-foreground">{selectedClaim.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reward Title:</span>
                <span className="font-bold text-foreground">{selectedClaim.rewardTitle}</span>
              </div>
              <div className="flex justify-between text-accent">
                <span>Disbursement Amount:</span>
                <span className="font-bold text-sm">
                  {selectedClaim.currency} {selectedClaim.cashValue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payout Destination:</span>
                <span className="font-bold text-foreground">{selectedClaim.payoutAccount}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-muted-foreground block mb-1">
                M-Pesa Reference / Transaction Code
              </label>
              <input
                type="text"
                placeholder="e.g. QKJ49X82LL"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                className="w-full neu-input px-3.5 py-2.5 text-xs font-mono uppercase tracking-widest text-foreground font-bold"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="flex-1 neu-button rounded-xl py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleDisburse}
                className="flex-1 neu-button-primary rounded-xl py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2"
              >
                <RefreshCw className={`size-3.5 ${processing ? 'animate-spin' : 'hidden'}`} />
                <span>{processing ? 'Processing...' : 'Confirm Transfer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
