import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { verifyPassword, createSession, AUTH_COOKIE_NAME } from '@/lib/custom-auth'

export async function POST(request: Request) {
  console.log('[Campfire Auth Server] Password Login attempt received')
  try {
    const { email, phone, identifier, password, creatorSlug } = await request.json()

    const rawTarget = identifier || phone || email
    if (!rawTarget || !password) {
      console.warn('[Campfire Auth Server] Login failed: Missing identifier or password')
      return NextResponse.json(
        { error: 'Email or phone number, and password are required' },
        { status: 400 },
      )
    }

    const normalizedTarget = rawTarget.trim().toLowerCase()
    const isEmail = normalizedTarget.includes('@')
    const cleanPhone = normalizedTarget.replace(/\s+/g, '')

    console.log(`[Campfire Auth Server] Looking up user by ${isEmail ? 'email' : 'phone'}:`, isEmail ? normalizedTarget : cleanPhone)

    let user = null
    let token = 'mock-session-token'

    if (process.env.DATABASE_URL) {
      user = await prisma.user.findFirst({
        where: isEmail
          ? { email: normalizedTarget }
          : { phone: cleanPhone },
        include: {
          links: {
            include: {
              creator: true,
            },
          },
        },
      })

      if (!user || !user.passwordHash) {
        console.warn('[Campfire Auth Server] Login failed: User not found or no password set')
        return NextResponse.json(
          { error: `Invalid ${isEmail ? 'email' : 'phone number'} or password` },
          { status: 401 },
        )
      }

      const isValid = verifyPassword(password, user.passwordHash)
      if (!isValid) {
        console.warn('[Campfire Auth Server] Login failed: Password mismatch')
        return NextResponse.json(
          { error: `Invalid ${isEmail ? 'email' : 'phone number'} or password` },
          { status: 401 },
        )
      }

      // Ensure user is linked to current creator
      if (creatorSlug) {
        const creator = await prisma.creator.findUnique({
          where: { slug: creatorSlug },
        })
        if (creator) {
          const existingLink = await prisma.userCreatorLink.findUnique({
            where: {
              userId_creatorId: {
                userId: user.id,
                creatorId: creator.id,
              },
            },
          })

          if (!existingLink) {
            await prisma.userCreatorLink.create({
              data: {
                userId: user.id,
                creatorId: creator.id,
                pointsBalance: 100,
                currentStreak: 1,
                longestStreak: 1,
              },
            })
          } else {
            await prisma.userCreatorLink.update({
              where: { id: existingLink.id },
              data: { lastActiveAt: new Date() },
            })
          }
        }
      }

      token = await createSession(user.id)
    } else {
      user = {
        id: 'user_' + Date.now(),
        email: isEmail ? normalizedTarget : null,
        phone: !isEmail ? cleanPhone : null,
        displayName: 'Fan',
        role: 'user',
        links: [],
      }
    }

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

    console.log('[Campfire Auth Server] Login SUCCESS for user:', user.id, user.email || user.phone)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        displayName: user.displayName,
      },
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Login failed'
    console.error('[Campfire Auth Server Error]:', errorMsg)
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
