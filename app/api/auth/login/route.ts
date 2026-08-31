import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { verifyPassword, createSession, AUTH_COOKIE_NAME } from '@/lib/custom-auth'

export async function POST(request: Request) {
  try {
    const { email, password, creatorSlug } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    let user = null
    let token = 'mock-session-token'

    if (process.env.DATABASE_URL) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: {
          links: {
            include: {
              creator: true,
            },
          },
        },
      })

      if (!user || !user.passwordHash) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 },
        )
      }

      const isValid = verifyPassword(password, user.passwordHash)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
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
        email: email.toLowerCase().trim(),
        displayName: email.split('@')[0],
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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Login failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
