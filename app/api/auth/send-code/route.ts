import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email, phone, identifier } = await request.json()

    const rawTarget = identifier || phone || email
    if (!rawTarget) {
      return NextResponse.json({ error: 'A valid email or phone number is required' }, { status: 400 })
    }

    const normalizedTarget = rawTarget.trim().toLowerCase()

    // Validate email or phone
    const isEmail = normalizedTarget.includes('@')
    const cleanPhone = normalizedTarget.replace(/\s+/g, '')

    if (!isEmail && cleanPhone.length < 9) {
      return NextResponse.json({ error: 'Please enter a valid phone number (e.g. +254 712 345 678)' }, { status: 400 })
    }

    const finalIdentifier = isEmail ? normalizedTarget : cleanPhone

    // Generate secure 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    if (process.env.DATABASE_URL) {
      // Remove old codes for this identifier
      await prisma.verificationCode.deleteMany({
        where: { identifier: finalIdentifier },
      })

      // Store new code in Neon Postgres
      await prisma.verificationCode.create({
        data: {
          identifier: finalIdentifier,
          code,
          expiresAt,
        },
      })
    }

    console.log(`[Verification Code for ${finalIdentifier}]: ${code}`)

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${finalIdentifier}`,
      previewCode: code,
      isPhone: !isEmail,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to send verification code'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
