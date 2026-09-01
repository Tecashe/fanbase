/**
 * Helper utility to generate clean, URL-safe user slugs and map sections.
 */

export function toUserSlug(displayName?: string | null, emailOrPhone?: string | null, fallbackId?: string | null): string {
  if (displayName && displayName.trim().length > 0) {
    const cleaned = displayName
      .trim()
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    if (cleaned.length > 0) return cleaned
  }

  if (emailOrPhone && emailOrPhone.trim().length > 0) {
    const handle = emailOrPhone.split('@')[0]
    const cleaned = handle
      .trim()
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
    if (cleaned.length > 0) return cleaned
  }

  if (fallbackId) {
    return `fan-${fallbackId.slice(-6)}`
  }

  return 'fan'
}

export type DashboardSection = 'overview' | 'quizzes' | 'leaderboard' | 'rewards' | 'referrals' | 'badges' | 'admin'

export function normalizeSection(section?: string | null): DashboardSection {
  if (!section) return 'overview'
  const s = section.toLowerCase().trim()
  if (s === 'quiz' || s === 'quizzes' || s === 'quests' || s === 'challenges') return 'quizzes'
  if (s === 'leaderboard' || s === 'rankings' || s === 'ranks' || s === 'standing') return 'leaderboard'
  if (s === 'reward' || s === 'rewards' || s === 'perks' || s === 'payouts' || s === 'payout') return 'rewards'
  if (s === 'referral' || s === 'referrals' || s === 'invite' || s === 'invites' || s === 'earn') return 'referrals'
  if (s === 'badge' || s === 'badges' || s === 'trophies' || s === 'trophy') return 'badges'
  if (s === 'admin' || s === 'studio' || s === 'creator') return 'admin'
  return 'overview'
}
