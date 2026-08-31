import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { hashPassword, createSession, AUTH_COOKIE_NAME } from '@/lib/custom-auth'

export async function POST(request: Request) {
  try {
    const { email, password, displayName, creatorSlug, referrerId } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    if (!normalizedEmail.includes('@') || normalizedEmail.length < 5) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
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
    let token = 'session-token'

    if (process.env.DATABASE_URL) {
      // 1. Strict duplicate credentials check
      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'An account with this email address already exists. Please sign in instead.' },
          { status: 409 },
        )
      }

      // 2. Hash password and insert into Neon PostgreSQL
      const passwordHash = hashPassword(password)
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          displayName: displayName?.trim() || normalizedEmail.split('@')[0],
          role: 'user',
          emailVerified: true,
        },
      })

      // 3. Link to creator workspace
      const slug = creatorSlug || 'mkurugenzi'
      const creator = await prisma.creator.findUnique({
        where: { slug },
      })

      if (creator) {
        let initialPoints = 100 // Standard welcome bonus

        // 4. Handle Referral Attribution
        let validReferrer = null
        if (referrerId) {
          validReferrer = await prisma.user.findFirst({
            where: {
              OR: [{ id: referrerId }, { email: referrerId.toLowerCase().trim() }],
            },
          })
        }

        if (validReferrer && validReferrer.id !== user.id) {
          initialPoints += 100 // +100 bonus for joining with invite

          // Award 100 bonus points to referrer
          await prisma.userCreatorLink.upsert({
            where: {
              userId_creatorId: {
                userId: validReferrer.id,
                creatorId: creator.id,
              },
            },
            update: {
              pointsBalance: { increment: 100 },
            },
            create: {
              userId: validReferrer.id,
              creatorId: creator.id,
              pointsBalance: 200,
              currentStreak: 1,
            },
          })

          // Record referral in database
          await prisma.referral.create({
            data: {
              creatorId: creator.id,
              referrerUserId: validReferrer.id,
              referredUserId: user.id,
              pointsAwarded: 100,
            },
          })
        }

        await prisma.userCreatorLink.create({
          data: {
            userId: user.id,
            creatorId: creator.id,
            pointsBalance: initialPoints,
            currentStreak: 1,
            longestStreak: 1,
          },
        })
      }

      // 5. Create persistent session in Neon Postgres
      token = await createSession(user.id)
    } else {
      user = {
        id: 'user_' + Date.now(),
        email: normalizedEmail,
        displayName: displayName || normalizedEmail.split('@')[0],
        role: 'user',
      }
    }

    // Set secure HTTP-only cookie
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
