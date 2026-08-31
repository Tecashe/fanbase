'use client'

import { useState } from 'react'
import { Check, Copy, Flame, MessageCircle, Share2, Trophy, X } from 'lucide-react'

export function ShareCardModal({
  isOpen,
  onClose,
  quizTitle,
  score,
  streak,
  fanName,
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
  creatorName: string
  creatorSlug: string
  quizAttemptId?: string
}) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://campfire.app'}/${creatorSlug}`
  const shareText = `🔥 I just scored ${score} pts on "${quizTitle}" at ${creatorName}'s Campfire! My streak is ${streak} days. Think you can beat me? Join the fan club: ${shareUrl}`

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

  const handleNativeShare = async () => {
    logShare('native')
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${creatorName} Campfire Quest`,
          text: shareText,
          url: shareUrl,
        })
      } catch {
        // user cancelled or failed
      }
    } else {
      handleCopy()
    }
  }

  const handleCopy = () => {
    logShare('copy')
    navigator.clipboard?.writeText?.(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md neu-card p-6 sm:p-8 border border-border/90 bg-card shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close share modal"
          className="absolute top-5 right-5 grid size-8 place-items-center rounded-lg neu-raised-xs border border-border text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 neu-pill-inset text-[10px] font-mono font-bold text-accent mb-2">
            <Share2 className="size-3" /> SHAREABLE SCORE CARD
          </span>
          <h2 className="font-serif text-2xl font-bold tracking-tight">Show Off Your Score</h2>
          <p className="text-xs text-muted-foreground">Challenge friends on WhatsApp or Twitter / X</p>
        </div>

        {/* Tactile Score Card Preview */}
        <div className="p-6 rounded-3xl neu-inset-sm border border-border/80 text-left bg-background relative overflow-hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="grid size-7 place-items-center rounded-lg bg-card neu-raised-xs text-accent">
                <Flame className="size-4 text-accent" />
              </div>
              <span className="font-serif text-sm font-bold">{creatorName}</span>
            </div>
            <span className="text-[10px] font-mono text-accent font-bold px-2 py-0.5 rounded-full neu-pill">
              {streak} DAY STREAK
            </span>
          </div>

          <p className="text-[10px] font-mono text-muted-foreground uppercase">{quizTitle}</p>
          <p className="font-serif text-3xl font-bold mt-1 text-foreground">
            +{score} <span className="font-sans text-xs font-normal text-muted-foreground">PTS</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground font-mono">
            Played by <span className="font-bold text-foreground">{fanName}</span>
          </p>

          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-accent">
            <span>campfire.app/{creatorSlug}</span>
            <span>★ TOP FAN</span>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleWhatsAppShare}
            className="neu-button-accent rounded-xl py-3 px-4 text-xs font-bold inline-flex items-center justify-center gap-2 text-accent"
          >
            <MessageCircle className="size-4" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleTwitterShare}
            className="neu-button rounded-xl py-3 px-4 text-xs font-bold inline-flex items-center justify-center gap-2 text-foreground"
          >
            <span className="font-mono font-black text-sm">𝕏</span>
            <span>Post on X</span>
          </button>
          <button
            onClick={handleNativeShare}
            className="col-span-2 neu-button-primary rounded-xl py-3.5 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            <span>{copied ? 'Card Link Copied!' : 'Share / Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
