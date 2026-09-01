'use client'

import { useState } from 'react'
import { Check, Copy, Flame, MessageCircle, Share2, X } from 'lucide-react'
import { toUserSlug } from '@/lib/slug'

export function ShareCardModal({
  isOpen,
  onClose,
  quizTitle,
  score,
  streak,
  fanName,
  userSlug,
  creatorName,
  creatorSlug,
  quizAttemptId,
}: {
  isOpen: boolean
  onClose: () => void
  quizTitle: string
  score: number
  streak: number
  fanName: string
  userSlug?: string
  creatorName: string
  creatorSlug: string
  quizAttemptId?: string
}) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const resolvedSlug = userSlug || toUserSlug(fanName)
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://campfire.app'}/${creatorSlug}?ref=${encodeURIComponent(resolvedSlug)}`
  const shareText = `I just scored ${score} pts on "${quizTitle}" at ${creatorName}'s Campfire! My streak is ${streak} days. Think you can beat me? Join the fan club: ${shareUrl}`

  const logShare = async (platform: string) => {
    try {
      await fetch('/api/shares/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sharePlatform: platform,
          quizAttemptId,
          creatorSlug,
        }),
      })
    } catch {
      // ignore
    }
  }

  const handleWhatsAppShare = () => {
    logShare('whatsapp')
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
    window.open(url, '_blank')
  }

  const handleTwitterShare = () => {
    logShare('x')
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(url, '_blank')
  }

  const handleCopyLink = () => {
    logShare('copy_link')
    try {
      navigator.clipboard?.writeText?.(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md neu-card p-6 border border-border/90 bg-card shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          aria-label="Close share card"
          className="absolute top-4 right-4 grid size-8 place-items-center rounded-lg neu-raised-xs border border-border text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="text-center mb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 neu-pill-inset text-[10px] font-mono font-bold text-accent mb-2">
            <Share2 className="size-3" /> SHARE YOUR RESULT
          </span>
          <h2 className="font-serif text-xl font-bold">Challenge Your Friends</h2>
        </div>

        {/* Dynamic Card Preview */}
        <div className="p-5 rounded-2xl neu-inset-sm border border-border/80 bg-background text-left space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-accent" />
              <span className="font-serif font-bold text-xs">{creatorName} Campfire</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-accent">+{score} PTS</span>
          </div>

          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase">{quizTitle}</p>
            <p className="font-serif text-lg font-bold mt-0.5">{fanName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Active Streak: <strong className="text-foreground">{streak} Days</strong> · Live Standings
            </p>
          </div>

          <div className="pt-2 text-[10px] font-mono text-muted-foreground/80 truncate">
            {shareUrl}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={handleWhatsAppShare}
            className="w-full neu-button rounded-xl py-3 px-4 text-xs font-bold text-foreground inline-flex items-center justify-center gap-2 hover:text-[#25D366] transition-colors"
          >
            <MessageCircle className="size-4" />
            <span>Share to WhatsApp (+100 PTS per join)</span>
          </button>

          <button
            onClick={handleTwitterShare}
            className="w-full neu-button rounded-xl py-3 px-4 text-xs font-bold text-foreground inline-flex items-center justify-center gap-2 hover:text-accent transition-colors"
          >
            <Share2 className="size-4" />
            <span>Share to X / Twitter</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full neu-button-primary rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Referral Link'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
