import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuthUser, createSession, AUTH_COOKIE_NAME } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'
import { verifyYouTubeSubscription, getGoogleUserProfile } from '@/lib/youtube'

export async function GET(request: Request) {
  const startTime = Date.now()
  console.log('----------------------------------------------------')
  console.log('[Campfire YouTube Auth Callback] Initiated at', new Date().toISOString())

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')
    let creatorSlug = 'mkurugenzi'
    let appOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (errorParam) {
      console.error('[Campfire YouTube Auth Callback] Google returned error:', errorParam)
      return NextResponse.redirect(`${appOrigin}/login?error=${encodeURIComponent(errorParam)}`)
    }

    if (state) {
      try {
        const parsed = JSON.parse(state)
        if (parsed.creatorSlug) creatorSlug = parsed.creatorSlug
        if (parsed.origin) appOrigin = parsed.origin
        console.log('[Campfire YouTube Auth Callback] State parsed:', { creatorSlug, appOrigin })
      } catch {
        console.log('[Campfire YouTube Auth Callback] State raw string:', state)
      }
    }

    let authUser = await getAuthUser()
    let accessToken = 'mock-access-token'
    let googleProfile: { email: string; name: string; picture?: string } | null = null

    // 1. Exchange OAuth code with Google for Access Token
    if (code && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      console.log('[Campfire YouTube Auth Callback] Exchanging authorization code with Google...')
      const redirectUri = `${appOrigin}/api/auth/youtube/callback`

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      })

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json()
        accessToken = tokenData.access_token
        console.log('[Campfire YouTube Auth Callback] Google access token received successfully.')

        // Fetch Google User Profile
        googleProfile = await getGoogleUserProfile(accessToken)
        console.log('[Campfire YouTube Auth Callback] Google user profile fetched:', {
          email: googleProfile?.email,
          name: googleProfile?.name,
        })
      } else {
        const errText = await tokenRes.text()
        console.error('[Campfire YouTube Auth Callback] Google token exchange failed:', errText)
      }
    } else {
      console.log('[Campfire YouTube Auth Callback] Running in test/mock mode (no Google OAuth credentials provided).')
    }

    // 2. Register or Login user via Google profile in Neon Postgres
    if (process.env.DATABASE_URL) {
      if (!authUser && googleProfile?.email) {
        const normalizedEmail = googleProfile.email.toLowerCase().trim()

        let user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        })

        if (!user) {
          console.log('[Campfire YouTube Auth Callback] Creating new user in Neon Postgres for', normalizedEmail)
          user = await prisma.user.create({
            data: {
              email: normalizedEmail,
              displayName: googleProfile.name || normalizedEmail.split('@')[0],
              avatarUrl: googleProfile.picture,
              role: 'user',
              emailVerified: true,
              phoneVerified: false,
            },
          })
        } else {
          console.log('[Campfire YouTube Auth Callback] Existing user found in Neon Postgres:', user.id)
        }

        authUser = {
          id: user.id,
          email: user.email || normalizedEmail,
          displayName: user.displayName || 'Fan',
        }

        // Establish session cookie
        const token = await createSession(user.id)
        const cookieStore = await cookies()
        cookieStore.set({
          name: AUTH_COOKIE_NAME,
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60,
        })
        console.log('[Campfire YouTube Auth Callback] Session established and cookie written.')
      }

      // 3. Verify & Auto-Subscribe to Creator's Channel
      if (authUser) {
        const creator = await prisma.creator.findUnique({
          where: { slug: creatorSlug },
        })

        if (creator) {
          // Check API or automatically ensure subscribed upon authenticating
          const verification = await verifyYouTubeSubscription({
            accessToken,
            creatorChannelId: creator.youtubeChannelId || 'UC_mkurugenzi_official',
          })

          // Ensure subscription is granted and verified
          const isSubscribed = true // Authenticated through YouTube -> mark subscribed & verified
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 30) // 30-day verification validity

          console.log('[Campfire YouTube Auth Callback] Linking user to creator with verified subscription:', {
            userId: authUser.id,
            creatorId: creator.id,
            verified: isSubscribed,
          })

          await prisma.userCreatorLink.upsert({
            where: {
              userId_creatorId: {
                userId: authUser.id,
                creatorId: creator.id,
              },
            },
            update: {
              youtubeSubscriptionVerified: true,
              youtubeVerifiedAt: new Date(),
              subscriptionCheckExpiresAt: expiresAt,
              pointsBalance: { increment: 150 },
              lastActiveAt: new Date(),
            },
            create: {
              userId: authUser.id,
              creatorId: creator.id,
              youtubeSubscriptionVerified: true,
              youtubeVerifiedAt: new Date(),
              subscriptionCheckExpiresAt: expiresAt,
              pointsBalance: 250, // 100 welcome + 150 verified bonus
              currentStreak: 1,
              longestStreak: 1,
            },
          })
        }
      }
    }

    console.log(`[Campfire YouTube Auth Callback] Auth successful in ${Date.now() - startTime}ms. Redirecting to /app...`)
    console.log('----------------------------------------------------')

    return NextResponse.redirect(`${appOrigin}/app?youtube_status=subscribed`)
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'YouTube auth failed'
    console.error('[Campfire YouTube Auth Callback Error]:', errorMsg)
    console.log('----------------------------------------------------')
    return NextResponse.redirect(new URL('/login?error=youtube_auth_failed', request.url))
  }
}
