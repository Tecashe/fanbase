import { NextResponse } from 'next/server'
import { getGoogleOAuthUrl } from '@/lib/youtube'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const creatorSlug = searchParams.get('creatorSlug') || 'mkurugenzi'
    const origin = searchParams.get('origin') || undefined

    const url = getGoogleOAuthUrl(creatorSlug, origin)
    return NextResponse.json({ url })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to generate OAuth URL'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
