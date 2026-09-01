import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { hashPassword, createSession, AUTH_COOKIE_NAME } from '@/lib/custom-auth'
import { toUserSlug } from '@/lib/slug'

export async function POST(request: Request) {
  try {
    const { email, phone, identifier, password, displayName, creatorSlug, referrerId } = await request.json()

    const rawTarget = identifier || phone || email
    if (!rawTarget || !password) {
      return NextResponse.json(
        { error: 'Email or phone number, and password are required' },
        { status: 400 },
      )
    }

    const normalizedTarget = rawTarget.trim().toLowerCase()
    const isEmail = normalizedTarget.includes('@')
    const cleanPhone = normalizedTarget.replace(/\s+/g, '')

    if (!isEmail && cleanPhone.length < 9) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number (e.g. +254 712 345 678)' },
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
      // 1. Strict duplicate credentials check (both email and phone)
      const existing = await prisma.user.findFirst({
        where: isEmail
          ? { email: normalizedTarget }
          : { phone: cleanPhone },
      })

      if (existing) {
        return NextResponse.json(
          { error: `An account with this ${isEmail ? 'email address' : 'phone number'} already exists. Please sign in instead.` },
          { status: 409 },
        )
      }

      // 2. Hash password and insert into Neon PostgreSQL
      const passwordHash = hashPassword(password)
      user = await prisma.user.create({
        data: {
          email: isEmail ? normalizedTarget : null,
          phone: !isEmail ? cleanPhone : null,
          passwordHash,
          displayName: displayName?.trim() || (isEmail ? normalizedTarget.split('@')[0] : `Fan-${cleanPhone.slice(-4)}`),
          role: 'user',
          emailVerified: isEmail,
          phoneVerified: !isEmail,
        },
      })

      // 3. Link to creator workspace
      const slug = creatorSlug || 'mkurugenzi'
      const creator = await prisma.creator.findUnique({
        where: { slug },
      })

      if (creator) {
        let initialPoints = 100

        // 4. Handle Referral Attribution (supports user ID, email, phone, or slugified name)
        let validReferrer = null
        if (referrerId) {
          const cleanRef = referrerId.trim()
          const unhyphenated = cleanRef.replace(/-/g, ' ')
          validReferrer = await prisma.user.findFirst({
            where: {
              OR: [
                { id: cleanRef },
                { email: cleanRef.toLowerCase() },
                { phone: cleanRef.replace(/\s+/g, '') },
                { displayName: { equals: cleanRef, mode: 'insensitive' } },
                { displayName: { equals: unhyphenated, mode: 'insensitive' } },
              ],
            },
          })
        }

        if (validReferrer && validReferrer.id !== user.id) {
          initialPoints += 100 // +100 invite bonus

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

      token = await createSession(user.id)
    } else {
      user = {
        id: 'user_' + Date.now(),
        email: isEmail ? normalizedTarget : null,
        phone: !isEmail ? cleanPhone : null,
        displayName: displayName || 'Fan',
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

    const userSlug = toUserSlug(user.displayName, user.email || user.phone, user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        slug: userSlug,
        email: user.email,
        phone: user.phone,
        displayName: user.displayName,
      },
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Registration failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
