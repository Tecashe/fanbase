import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { hashPassword, createSession, AUTH_COOKIE_NAME } from '@/lib/custom-auth'

export async function POST(request: Request) {
  try {
    const { email, password, displayName, creatorSlug } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 },
      )
    }

    let user = null
    let token = 'mock-session-token'

    if (process.env.DATABASE_URL) {
      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 },
        )
      }

      const passwordHash = hashPassword(password)
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          displayName: displayName || email.split('@')[0],
          role: 'user',
        },
      })

      // Link to creator if provided
      if (creatorSlug) {
        const creator = await prisma.creator.findUnique({
          where: { slug: creatorSlug },
        })
        if (creator) {
          await prisma.userCreatorLink.create({
            data: {
              userId: user.id,
              creatorId: creator.id,
              pointsBalance: 100, // Welcome bonus points
              currentStreak: 1,
              longestStreak: 1,
            },
          })
        }
      }

      token = await createSession(user.id)
    } else {
      user = {
        id: 'user_' + Date.now(),
        email: email.toLowerCase().trim(),
        displayName: displayName || email.split('@')[0],
        role: 'user',
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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Registration failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
