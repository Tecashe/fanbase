import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuthUser, createSession, AUTH_COOKIE_NAME } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'
import { verifyYouTubeSubscription, getGoogleUserProfile } from '@/lib/youtube'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    let creatorSlug = 'mkurugenzi'
    let appOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (state) {
      try {
        const parsed = JSON.parse(state)
        if (parsed.creatorSlug) creatorSlug = parsed.creatorSlug
        if (parsed.origin) appOrigin = parsed.origin
      } catch {
        // fallback
      }
    }

    let authUser = await getAuthUser()
    let accessToken = 'mock-access-token'
    let googleProfile: { email: string; name: string; picture?: string } | null = null

    // 1. Exchange OAuth code with Google for Access Token
    if (code && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
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
        googleProfile = await getGoogleUserProfile(accessToken)
      } else {
        const errText = await tokenRes.text()
        console.error('[Google Token Exchange Failed]', errText)
      }
    }

    let isSubscribed = false

    if (process.env.DATABASE_URL) {
      // 2. Register or Login user via Google profile
      if (!authUser && googleProfile?.email) {
        const normalizedEmail = googleProfile.email.toLowerCase().trim()

        let user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: normalizedEmail,
              displayName: googleProfile.name || normalizedEmail.split('@')[0],
              avatarUrl: googleProfile.picture,
              role: 'user',
              emailVerified: true,
            },
          })
        }

        authUser = {
          id: user.id,
          email: user.email || normalizedEmail,
          displayName: user.displayName || 'Fan',
        }

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
      }

      // 3. Verify YouTube subscription against creator channel
      if (authUser) {
        const creator = await prisma.creator.findUnique({
          where: { slug: creatorSlug },
        })

        if (creator) {
          const verification = await verifyYouTubeSubscription({
            accessToken,
            creatorChannelId: creator.youtubeChannelId || 'UC_mkurugenzi_official',
          })

          isSubscribed = verification.verified
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 30) // 30-day validity

          await prisma.userCreatorLink.upsert({
            where: {
              userId_creatorId: {
                userId: authUser.id,
                creatorId: creator.id,
              },
            },
            update: {
              youtubeSubscriptionVerified: isSubscribed,
              youtubeVerifiedAt: isSubscribed ? new Date() : null,
              subscriptionCheckExpiresAt: expiresAt,
              pointsBalance: isSubscribed ? { increment: 150 } : undefined,
              lastActiveAt: new Date(),
            },
            create: {
              userId: authUser.id,
              creatorId: creator.id,
              youtubeSubscriptionVerified: isSubscribed,
              youtubeVerifiedAt: isSubscribed ? new Date() : null,
              subscriptionCheckExpiresAt: expiresAt,
              pointsBalance: isSubscribed ? 250 : 100,
              currentStreak: 1,
              longestStreak: 1,
            },
          })
        }
      }
    }

    const redirectStatus = isSubscribed ? 'subscribed' : 'unsubscribed'
    return NextResponse.redirect(`${appOrigin}/app?youtube_status=${redirectStatus}`)
  } catch (err: unknown) {
    console.error('[YouTube Callback Error]', err)
    return NextResponse.redirect(new URL('/login?error=youtube_auth_failed', request.url))
  }
}
