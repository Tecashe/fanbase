import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuthUser, createSession, AUTH_COOKIE_NAME } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'
import { verifyYouTubeSubscription, getGoogleUserProfile } from '@/lib/youtube'
import { toUserSlug } from '@/lib/slug'

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

    let authRole = 'fan'
    if (state) {
      try {
        const parsed = JSON.parse(state)
        if (parsed.creatorSlug) creatorSlug = parsed.creatorSlug
        if (parsed.origin) appOrigin = parsed.origin
        if (parsed.role) authRole = parsed.role
        console.log('[Campfire YouTube Auth Callback] State parsed:', { creatorSlug, appOrigin, authRole })
      } catch {
        console.log('[Campfire YouTube Auth Callback] State raw string:', state)
      }
    }

    let authUser = await getAuthUser()
    let accessToken: string | null = null
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
        googleProfile = await getGoogleUserProfile(accessToken!)
        console.log('[Campfire YouTube Auth Callback] Google user profile fetched:', {
          email: googleProfile?.email,
          name: googleProfile?.name,
        })
      } else {
        const errText = await tokenRes.text()
        console.error('[Campfire YouTube Auth Callback] Google token exchange failed:', errText)
      }
    }

    let isSubscribed = false

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
              role: authRole === 'creator' ? 'creator' : 'user',
              emailVerified: true,
              phoneVerified: false,
            },
          })
        } else {
          console.log('[Campfire YouTube Auth Callback] Existing user found in Neon Postgres:', user.id)
          const updatedRole = authRole === 'creator' ? 'creator' : user.role
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              displayName: googleProfile.name || user.displayName,
              avatarUrl: googleProfile.picture || user.avatarUrl,
              role: updatedRole,
            },
          })
        }

        authUser = {
          id: user.id,
          email: user.email || normalizedEmail,
          displayName: user.displayName || googleProfile.name || 'Fan',
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

      // 3. Strictly Verify Subscription against @Mkurugenziii (UC4tjY2tTltEKePusozUxtSA)
      if (authUser) {
        const creator = await prisma.creator.findUnique({
          where: { slug: creatorSlug },
        })

        if (creator) {
          const targetChannelId = creator.youtubeChannelId || 'UC4tjY2tTltEKePusozUxtSA'

          if (accessToken) {
            console.log(`[Campfire YouTube Auth Callback] Querying YouTube Data API for channel: ${targetChannelId}...`)
            const verification = await verifyYouTubeSubscription({
              accessToken,
              creatorChannelId: targetChannelId,
            })
            isSubscribed = verification.verified
            console.log(`[Campfire YouTube Auth Callback] Verification result for user ${authUser.id}: isSubscribed = ${isSubscribed}`)
          } else {
            console.warn('[Campfire YouTube Auth Callback] No access token available, user is marked unverified.')
            isSubscribed = false
          }

          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 30)

          const existingLink = await prisma.userCreatorLink.findUnique({
            where: {
              userId_creatorId: {
                userId: authUser.id,
                creatorId: creator.id,
              },
            },
          })

          // Only award YouTube verification bonus points (+150) once upon first verification
          const isNewlyVerified = isSubscribed && (!existingLink || !existingLink.youtubeSubscriptionVerified)

          if (existingLink) {
            await prisma.userCreatorLink.update({
              where: { id: existingLink.id },
              data: {
                youtubeSubscriptionVerified: isSubscribed,
                youtubeVerifiedAt: isSubscribed ? (existingLink.youtubeVerifiedAt || new Date()) : null,
                subscriptionCheckExpiresAt: isSubscribed ? expiresAt : null,
                pointsBalance: isNewlyVerified ? { increment: 150 } : undefined,
                lastActiveAt: new Date(),
              },
            })
          } else {
            await prisma.userCreatorLink.create({
              data: {
                userId: authUser.id,
                creatorId: creator.id,
                youtubeSubscriptionVerified: isSubscribed,
                youtubeVerifiedAt: isSubscribed ? new Date() : null,
                subscriptionCheckExpiresAt: isSubscribed ? expiresAt : null,
                pointsBalance: isSubscribed ? 250 : 100,
                currentStreak: 1,
                longestStreak: 1,
                lastActiveAt: new Date(),
              },
            })
          }
        }
      }
    }

    if (authRole === 'creator') {
      console.log(`[Campfire YouTube Auth Callback] Creator flow complete. Redirecting to /admin/${creatorSlug}`)
      console.log('----------------------------------------------------')
      return NextResponse.redirect(`${appOrigin}/admin/${creatorSlug}`)
    }

    const redirectStatus = isSubscribed ? 'subscribed' : 'unsubscribed'
    const slug = authUser ? toUserSlug(authUser.displayName, authUser.email, authUser.id) : 'fan'
    console.log(`[Campfire YouTube Auth Callback] Fan flow complete. Redirecting to /dashboard/${slug}?youtube_status=${redirectStatus}`)
    console.log('----------------------------------------------------')

    return NextResponse.redirect(`${appOrigin}/dashboard/${slug}?youtube_status=${redirectStatus}`)
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'YouTube auth failed'
    console.error('[Campfire YouTube Auth Callback Error]:', errorMsg)
    console.log('----------------------------------------------------')
    return NextResponse.redirect(new URL('/login?error=youtube_auth_failed', request.url))
  }
}
