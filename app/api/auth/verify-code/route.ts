import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { createSession, AUTH_COOKIE_NAME } from '@/lib/custom-auth'

export async function POST(request: Request) {
  try {
    const { email, code, creatorSlug = 'mkurugenzi' } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    if (process.env.DATABASE_URL) {
      const record = await prisma.verificationCode.findFirst({
        where: {
          email: normalizedEmail,
          code: code.trim(),
          expiresAt: { gt: new Date() },
        },
      })

      if (!record) {
        return NextResponse.json(
          { error: 'Invalid or expired 6-digit verification code. Please request a new one.' },
          { status: 400 },
        )
      }

      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })

      if (user) {
        // Mark user verified
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        })

        // Delete used code
        await prisma.verificationCode.deleteMany({
          where: { email: normalizedEmail },
        })

        // Ensure linked to creator
        const creator = await prisma.creator.findUnique({
          where: { slug: creatorSlug },
        })

        if (creator) {
          await prisma.userCreatorLink.upsert({
            where: {
              userId_creatorId: {
                userId: user.id,
                creatorId: creator.id,
              },
            },
            update: { lastActiveAt: new Date() },
            create: {
              userId: user.id,
              creatorId: creator.id,
              pointsBalance: 100,
              currentStreak: 1,
              longestStreak: 1,
            },
          })
        }

        // Establish secure session cookie
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

        return NextResponse.json({
          success: true,
          verified: true,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
          },
        })
      }

      // If user not registered yet, confirm the code is valid so registration form can complete
      return NextResponse.json({
        success: true,
        verified: true,
        isNewUser: true,
      })
    }

    return NextResponse.json({
      success: true,
      verified: true,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Verification failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
