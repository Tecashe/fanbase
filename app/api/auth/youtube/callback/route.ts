import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/custom-auth'
import { prisma } from '@/lib/db'
import { verifyYouTubeSubscription } from '@/lib/youtube'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    let creatorSlug = 'mkurugenzi'

    if (state) {
      try {
        const parsed = JSON.parse(state)
        if (parsed.creatorSlug) creatorSlug = parsed.creatorSlug
      } catch {
        // use default
      }
    }

    const authUser = await getAuthUser()

    // Exchange code for Google Access Token
    let accessToken = 'mock-access-token'
    if (code && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/youtube/callback`
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
      }
    }

    if (authUser && process.env.DATABASE_URL) {
      const creator = await prisma.creator.findUnique({
        where: { slug: creatorSlug },
      })

      if (creator) {
        const verification = await verifyYouTubeSubscription({
          accessToken,
          creatorChannelId: creator.youtubeChannelId || 'UC_example',
        })

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30) // 30-day periodic re-check

        await prisma.userCreatorLink.upsert({
          where: {
            userId_creatorId: {
              userId: authUser.id,
              creatorId: creator.id,
            },
          },
          update: {
            youtubeSubscriptionVerified: verification.verified,
            youtubeVerifiedAt: verification.verified ? new Date() : null,
            subscriptionCheckExpiresAt: expiresAt,
            pointsBalance: verification.verified ? { increment: 150 } : undefined,
          },
          create: {
            userId: authUser.id,
            creatorId: creator.id,
            youtubeSubscriptionVerified: verification.verified,
            youtubeVerifiedAt: verification.verified ? new Date() : null,
            subscriptionCheckExpiresAt: expiresAt,
            pointsBalance: verification.verified ? 250 : 100,
          },
        })
      }
    }

    return NextResponse.redirect(
      new URL(`/${creatorSlug}?youtube_verified=true`, request.url),
    )
  } catch (err: unknown) {
    console.error('[YouTube Callback Error]', err)
    return NextResponse.redirect(new URL('/?error=youtube_auth_failed', request.url))
  }
}
