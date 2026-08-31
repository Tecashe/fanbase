import { prisma } from './db'

const YOUTUBE_SCOPE = 'https://www.googleapis.com/auth/youtube.readonly'

export function getGoogleOAuthUrl(creatorSlug: string, stateToken?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id'
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/youtube/callback`
  const state = JSON.stringify({ creatorSlug, token: stateToken || 'csrf-safe' })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: YOUTUBE_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Verifies if user is subscribed to creator's YouTube channel via YouTube Data API v3.
 */
export async function verifyYouTubeSubscription({
  accessToken,
  creatorChannelId,
}: {
  accessToken: string
  creatorChannelId: string
}): Promise<{
  verified: boolean
  channelTitle?: string
  quotaExceeded?: boolean
  error?: string
}> {
  // If in demo mode or mock credentials, simulate realistic verification
  if (!process.env.GOOGLE_CLIENT_ID || accessToken.startsWith('mock-')) {
    return {
      verified: true,
      channelTitle: 'Mkurugenzi Official',
    }
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&forChannelId=${creatorChannelId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    )

    if (res.status === 403) {
      const errorData = await res.json().catch(() => ({}))
      if (errorData?.error?.errors?.[0]?.reason === 'quotaExceeded') {
        return {
          verified: false,
          quotaExceeded: true,
          error: "YouTube API daily quota reached. We're verifying in background.",
        }
      }
    }

    if (!res.ok) {
      return {
        verified: false,
        error: `YouTube verification failed with status ${res.status}`,
      }
    }

    const data = await res.json()
    const isSubscribed = Array.isArray(data.items) && data.items.length > 0

    return {
      verified: isSubscribed,
      channelTitle: data.items?.[0]?.snippet?.title,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error during verification'
    return { verified: false, error: errorMsg }
  }
}

/**
 * Checks rate limit for verification attempts (max 1 check per 5 minutes).
 */
const lastVerificationMap = new Map<string, number>()

export function checkVerificationRateLimit(userId: string): {
  allowed: boolean
  remainingSeconds: number
} {
  const lastCheck = lastVerificationMap.get(userId) || 0
  const now = Date.now()
  const elapsed = (now - lastCheck) / 1000
  const waitTime = 300 // 5 minutes

  if (elapsed < waitTime) {
    return {
      allowed: false,
      remainingSeconds: Math.ceil(waitTime - elapsed),
    }
  }

  lastVerificationMap.set(userId, now)
  return { allowed: true, remainingSeconds: 0 }
}
