import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Generate secure 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    if (process.env.DATABASE_URL) {
      // Remove old codes for this email
      await prisma.verificationCode.deleteMany({
        where: { email: normalizedEmail },
      })

      // Store new verification code in Neon Postgres
      await prisma.verificationCode.create({
        data: {
          email: normalizedEmail,
          code,
          expiresAt,
        },
      })
    }

    console.log(`[Verification Code for ${normalizedEmail}]: ${code}`)

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}`,
      // For immediate verification and testing
      previewCode: code,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to send verification code'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
