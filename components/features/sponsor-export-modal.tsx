'use client'

import { useState } from 'react'
import { Download, FileText, Flame, Printer, Sparkles, Trophy, Users, X, Zap } from 'lucide-react'

export function SponsorExportModal({
  isOpen,
  onClose,
  creator,
  analytics,
}: {
  isOpen: boolean
  onClose: () => void
  creator: {
    displayName: string
    handle: string
    brandPrimaryColor: string
  }
  analytics: {
    verifiedFans: string
    completions: string
    points: string
    trend: string
  }
}) {
  const [downloading, setDownloading] = useState(false)

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl neu-card p-6 sm:p-10 border border-border/90 bg-card shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close export modal"
          className="absolute top-5 right-5 grid size-8 place-items-center rounded-lg neu-raised-xs border border-border text-muted-foreground hover:text-foreground print:hidden"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-card neu-raised-sm border border-border text-accent">
              <Flame className="size-6 text-accent" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold">{creator.displayName} — Audience Report</h2>
              <p className="text-xs font-mono text-muted-foreground">Sponsorship & Brand Engagement Pitch Deck</p>
            </div>
          </div>
          <span className="rounded-full px-3 py-1 neu-pill-inset text-[10px] font-mono text-accent font-bold">
            CONFIDENTIAL AUDIENCE AUDIT
          </span>
        </div>

        {/* Sponsor Pitch Sheet */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="neu-card p-4 text-center border border-border/80">
              <Users className="size-4 text-accent mx-auto mb-1.5" />
              <p className="font-serif text-2xl font-bold">{analytics.verifiedFans}</p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase">Verified YouTube Fans</p>
            </div>
            <div className="neu-card p-4 text-center border border-border/80">
              <Zap className="size-4 text-accent mx-auto mb-1.5" />
              <p className="font-serif text-2xl font-bold">{analytics.completions}</p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase">Quest Completion Rate</p>
            </div>
            <div className="neu-card p-4 text-center border border-border/80">
              <Sparkles className="size-4 text-accent mx-auto mb-1.5" />
              <p className="font-serif text-2xl font-bold">{analytics.points}</p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase">Reward Points Awarded</p>
            </div>
            <div className="neu-card p-4 text-center border border-border/80">
              <Trophy className="size-4 text-accent mx-auto mb-1.5" />
              <p className="font-serif text-2xl font-bold">{analytics.trend}</p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase">Month-over-Month Growth</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl neu-inset-sm border border-border/80 space-y-3 bg-background">
            <h4 className="font-serif text-sm font-bold text-foreground">Why Partner with {creator.displayName}?</h4>
            <ul className="text-xs space-y-2 text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="ruby-dot mt-1.5 shrink-0" />
                <span><strong>100% Verified Fans:</strong> Every participant has active Google OAuth verified subscription status.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="ruby-dot mt-1.5 shrink-0" />
                <span><strong>Hyper-Engaged Attention:</strong> Average episode recall question completion rate is 72.4% with full story attention.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="ruby-dot mt-1.5 shrink-0" />
                <span><strong>Direct Organic Virality:</strong> Integrated WhatsApp & X score card sharing drives peer-to-peer recommendation.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-4 border-t border-border/60 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="neu-button rounded-xl py-3 px-5 text-xs font-bold inline-flex items-center gap-2 text-foreground"
          >
            <Printer className="size-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => {
              setDownloading(true)
              setTimeout(() => {
                setDownloading(false)
                handlePrint()
              }, 600)
            }}
            className="neu-button-primary rounded-xl py-3 px-6 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <Download className="size-4" />
            <span>{downloading ? 'Preparing...' : 'Export PDF / Share'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
