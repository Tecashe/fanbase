'use client'

import { useState } from 'react'
import {
  Check,
  CheckCircle2,
  FileText,
  Flame,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Video,
  X,
  Zap,
} from 'lucide-react'

export type QuestionDraft = {
  questionText: string
  pointsValue: number
  options: { optionText: string; isCorrect: boolean }[]
  explanation?: string
}

export function AiQuestionGeneratorModal({
  isOpen,
  onClose,
  creatorSlug,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  creatorSlug: string
  onSuccess: (newQuizTitle: string) => void
}) {
  const [step, setStep] = useState<'input' | 'review'>('input')
  const [storyTitle, setStoryTitle] = useState('')
  const [youtubeVideoId, setYoutubeVideoId] = useState('')
  const [scriptText, setScriptText] = useState('')
  const [questionCount, setQuestionCount] = useState(3)
  const [quizType, setQuizType] = useState<'story_recall' | 'speed_bonus' | 'prediction'>('story_recall')
  const [requiresWatch, setRequiresWatch] = useState(false)
  const [loadingAi, setLoadingAi] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [generatedQuestions, setGeneratedQuestions] = useState<QuestionDraft[]>([])

  if (!isOpen) return null

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoadingAi(true)

    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyTitle,
          scriptText,
          questionCount,
          quizType,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'AI generation failed')

      setGeneratedQuestions(data.questions || [])
      setStep('review')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions')
    } finally {
      setLoadingAi(false)
    }
  }

  const handlePublish = async () => {
    setPublishing(true)
    setError(null)

    try {
      // 1. Create the Story first if video ID or transcript is provided
      let storyId = null
      if (storyTitle) {
        const storyRes = await fetch(`/api/creators/${creatorSlug}/stories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: storyTitle,
            youtubeVideoId,
            transcriptOrNotes: scriptText,
          }),
        })
        const storyData = await storyRes.json()
        if (storyData.story) storyId = storyData.story.id
      }

      // 2. Create the Quiz with all generated questions
      const totalPoints = generatedQuestions.reduce((sum, q) => sum + (q.pointsValue || 75), 0)
      const quizRes = await fetch(`/api/creators/${creatorSlug}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${storyTitle} Recall Quest`,
          storyId,
          quizType,
          pointsValue: totalPoints || 250,
          requiresWatchConfirmation: requiresWatch,
          questions: generatedQuestions,
        }),
      })

      const quizData = await quizRes.json()
      if (!quizRes.ok) throw new Error(quizData.error || 'Publishing quest failed')

      onSuccess(`${storyTitle} Recall Quest`)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Publishing failed')
    } finally {
      setPublishing(false)
    }
  }

  const handleUpdateOption = (qIdx: number, optIdx: number, newText: string) => {
    const updated = [...generatedQuestions]
    updated[qIdx].options[optIdx].optionText = newText
    setGeneratedQuestions(updated)
  }

  const handleSetCorrect = (qIdx: number, optIdx: number) => {
    const updated = [...generatedQuestions]
    updated[qIdx].options.forEach((opt, idx) => {
      opt.isCorrect = idx === optIdx
    })
    setGeneratedQuestions(updated)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-2xl neu-card p-6 sm:p-8 border border-border/90 bg-card shadow-2xl relative overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close AI Quest Generator"
          className="absolute top-5 right-5 grid size-8 place-items-center rounded-lg neu-raised-xs border border-border text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/70">
          <div className="grid size-11 place-items-center rounded-2xl bg-card neu-raised-sm border border-border text-accent">
            <Sparkles className="size-6 text-accent drop-shadow-[0_0_8px_rgba(209,17,73,0.5)]" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight">AI Quest Studio</h2>
            <p className="text-xs font-mono text-muted-foreground">
              Paste episode transcripts or video scripts to generate interactive quests with choices
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl p-3 text-xs font-medium border border-destructive/30 bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        {step === 'input' ? (
          /* Step 1: Script Input Form */
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                  Episode / Story Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Episode 43: Midnight Convoy"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  className="w-full neu-input px-3.5 py-2.5 text-xs text-foreground font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                  YouTube Video ID (Optional)
                </label>
                <div className="relative">
                  <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. dQw4w9WgXcQ"
                    value={youtubeVideoId}
                    onChange={(e) => setYoutubeVideoId(e.target.value)}
                    className="w-full neu-input pl-10 pr-3.5 py-2.5 text-xs text-foreground font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono uppercase text-muted-foreground">
                  Paste Video Script or Production Transcript
                </label>
                <span className="text-[10px] font-mono text-accent">
                  AI extracts lore, timestamps & key decisions
                </span>
              </div>
              <textarea
                required
                rows={6}
                placeholder="Paste the raw text of your script, transcript, or bullet-point episode notes here..."
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                className="w-full neu-input p-3.5 text-xs text-foreground font-sans leading-relaxed resize-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                  Question Count
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full neu-input px-3 py-2 text-xs text-foreground font-medium"
                >
                  <option value={2}>2 Questions</option>
                  <option value={3}>3 Questions (Standard)</option>
                  <option value={4}>4 Questions</option>
                  <option value={5}>5 Questions (Hard)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-muted-foreground block mb-1.5">
                  Quest Format
                </label>
                <select
                  value={quizType}
                  onChange={(e) => setQuizType(e.target.value as any)}
                  className="w-full neu-input px-3 py-2 text-xs text-foreground font-medium"
                >
                  <option value="story_recall">Multiple Choice Recall</option>
                  <option value="speed_bonus">Speed Bonus Timer</option>
                  <option value="prediction">Plot Prediction</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="watchGate"
                  checked={requiresWatch}
                  onChange={(e) => setRequiresWatch(e.target.checked)}
                  className="rounded neu-raised-xs accent-[#d11149] size-4 cursor-pointer"
                />
                <label htmlFor="watchGate" className="text-xs text-foreground font-semibold cursor-pointer">
                  Watch-to-Unlock
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAi}
              className="mt-6 w-full neu-button-primary rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className={`size-4 ${loadingAi ? 'animate-spin' : ''}`} />
              <span>{loadingAi ? 'Synthesizing Quest with AI...' : 'Generate Questions with AI'}</span>
            </button>
          </form>
        ) : (
          /* Step 2: Review and Edit Generated Questions */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-accent font-bold">
                {generatedQuestions.length} Questions Generated
              </span>
              <button
                onClick={() => setStep('input')}
                className="text-xs font-mono text-muted-foreground hover:text-foreground underline"
              >
                Back to Script
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {generatedQuestions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 rounded-2xl neu-inset-sm border border-border/80 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase text-accent font-bold">
                      Question {qIdx + 1} · {q.pointsValue} PTS
                    </span>
                  </div>

                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => {
                      const updated = [...generatedQuestions]
                      updated[qIdx].questionText = e.target.value
                      setGeneratedQuestions(updated)
                    }}
                    className="w-full neu-input px-3 py-2 text-xs font-bold text-foreground mb-3"
                  />

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetCorrect(qIdx, optIdx)}
                          className={`grid size-6 shrink-0 place-items-center rounded-lg text-xs font-mono font-bold transition-all ${
                            opt.isCorrect
                              ? 'bg-accent text-accent-foreground ruby-glow'
                              : 'neu-raised-xs text-muted-foreground hover:text-foreground'
                          }`}
                          title={opt.isCorrect ? 'Correct Option' : 'Mark as Correct'}
                        >
                          {opt.isCorrect ? (
                            <Check className="size-3.5" />
                          ) : (
                            String.fromCharCode(65 + optIdx)
                          )}
                        </button>
                        <input
                          type="text"
                          value={opt.optionText}
                          onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                          className="flex-1 neu-input px-3 py-1.5 text-xs text-foreground font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="neu-button rounded-xl py-3 px-5 text-xs font-bold text-muted-foreground"
              >
                Edit Parameters
              </button>
              <button
                type="button"
                disabled={publishing}
                onClick={handlePublish}
                className="neu-button-primary rounded-xl py-3.5 px-6 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Zap className="size-4" />
                <span>{publishing ? 'Publishing...' : 'Publish Quest to Neon Live'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
