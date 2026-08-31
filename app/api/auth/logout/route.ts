import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { AUTH_COOKIE_NAME } from '@/lib/custom-auth'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (token && process.env.DATABASE_URL) {
      await prisma.session.deleteMany({
        where: { token },
      }).catch(() => {})
    }

    cookieStore.delete(AUTH_COOKIE_NAME)

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Logout failed'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
