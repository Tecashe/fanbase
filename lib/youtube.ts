import { prisma } from './db'

const GOOGLE_SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/youtube.readonly',
].join(' ')

export function getGoogleOAuthUrl(
  creatorSlug: string = '',
  origin?: string,
  role: 'fan' | 'creator' = 'fan',
): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id'
  const baseAppUrl = origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUri = `${baseAppUrl}/api/auth/youtube/callback`
  const state = JSON.stringify({ creatorSlug, origin: baseAppUrl, role })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline',
    prompt: 'select_account consent',
    state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Fetches user profile from Google using the access token.
 */
export async function getGoogleUserProfile(accessToken: string): Promise<{
  email: string
  name: string
  picture?: string
} | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return {
      email: data.email,
      name: data.name || data.email?.split('@')[0],
      picture: data.picture,
    }
  } catch {
    return null
  }
}

/**
 * Strictly verifies if user is subscribed to creator's YouTube channel via YouTube Data API v3.
 */
export async function verifyYouTubeSubscription({
  accessToken,
  creatorChannelId,
}: {
  accessToken: string
  creatorChannelId?: string
}): Promise<{
  verified: boolean
  channelTitle?: string
  quotaExceeded?: boolean
  error?: string
}> {
  const targetChannelId = creatorChannelId

  if (!targetChannelId) {
    return {
      verified: false,
      error: 'Creator YouTube Channel ID is not configured.',
    }
  }

  if (!accessToken || accessToken.startsWith('mock-')) {
    console.warn('[YouTube API Strict] No valid access token, verification is FALSE.')
    return {
      verified: false,
      error: 'Google OAuth token missing. Please sign in with Google/YouTube to verify.',
    }
  }

  try {
    console.log(`[YouTube API Strict] Querying subscriptions for target channel: ${targetChannelId}...`)

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&forChannelId=${targetChannelId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    )

    if (res.status === 403) {
      const errorData = await res.json().catch(() => ({}))
      console.warn('[YouTube API 403]', errorData)
      if (errorData?.error?.errors?.[0]?.reason === 'quotaExceeded') {
        return {
          verified: false,
          quotaExceeded: true,
          error: 'YouTube API daily quota reached.',
        }
      }
      return {
        verified: false,
        error: errorData?.error?.message || 'Access to subscriptions forbidden.',
      }
    }

    if (!res.ok) {
      const errText = await res.text()
      console.warn(`[YouTube API Check Failed ${res.status}]:`, errText)
      return {
        verified: false,
        error: `YouTube API returned status ${res.status}`,
      }
    }

    const data = await res.json()
    const isSubscribed = Array.isArray(data.items) && data.items.length > 0
    console.log(`[YouTube API Strict] Subscribed to ${targetChannelId}?`, isSubscribed)

    return {
      verified: isSubscribed,
      channelTitle: isSubscribed ? data.items[0]?.snippet?.title || 'Verified Channel' : undefined,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error during verification'
    console.error('[YouTube API Strict Error]:', errorMsg)
    return { verified: false, error: errorMsg }
  }
}

/**
 * Checks rate limit for verification attempts.
 */
const lastVerificationMap = new Map<string, number>()

export function checkVerificationRateLimit(userId: string): {
  allowed: boolean
  remainingSeconds: number
} {
  const lastCheck = lastVerificationMap.get(userId) || 0
  const now = Date.now()
  const elapsed = (now - lastCheck) / 1000
  const waitTime = 60 // 1 minute

  if (elapsed < waitTime) {
    return {
      allowed: false,
      remainingSeconds: Math.ceil(waitTime - elapsed),
    }
  }

  lastVerificationMap.set(userId, now)
  return { allowed: true, remainingSeconds: 0 }
}
