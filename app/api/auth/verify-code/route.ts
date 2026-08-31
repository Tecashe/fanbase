import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { createSession, AUTH_COOKIE_NAME } from '@/lib/custom-auth'

export async function POST(request: Request) {
  try {
    const { email, phone, identifier, code, creatorSlug = 'mkurugenzi' } = await request.json()

    const rawTarget = identifier || phone || email
    if (!rawTarget || !code) {
      return NextResponse.json({ error: 'Identifier (email/phone) and 6-digit code are required' }, { status: 400 })
    }

    const normalizedTarget = rawTarget.trim().toLowerCase()
    const isEmail = normalizedTarget.includes('@')
    const cleanPhone = normalizedTarget.replace(/\s+/g, '')
    const finalIdentifier = isEmail ? normalizedTarget : cleanPhone

    if (process.env.DATABASE_URL) {
      const record = await prisma.verificationCode.findFirst({
        where: {
          identifier: finalIdentifier,
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

      // Find existing user by email or phone
      let user = await prisma.user.findFirst({
        where: isEmail
          ? { email: finalIdentifier }
          : { phone: finalIdentifier },
      })

      if (user) {
        // Mark user verified
        await prisma.user.update({
          where: { id: user.id },
          data: isEmail ? { emailVerified: true } : { phoneVerified: true },
        })

        // Delete used code
        await prisma.verificationCode.deleteMany({
          where: { identifier: finalIdentifier },
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

        return NextResponse.json({
          success: true,
          verified: true,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            displayName: user.displayName,
          },
        })
      }

      // If user is registering new account, indicate code is valid so registration form can submit
      return NextResponse.json({
        success: true,
        verified: true,
        isNewUser: true,
      })
    }

    return NextResponse.json({ success: true, verified: true })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Verification failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
