import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/navigation'

/**
 * Multi-tenant routing middleware.
 * Supports:
 * 1. Path-based tenancy: /[creatorSlug]/...
 * 2. Subdomain tenancy: {creatorSlug}.platform.com -> rewrites to /[creatorSlug]/...
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Exclude static files, API routes, and Next.js internals
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check for custom subdomain (e.g. mkurugenzi.platform.com)
  const currentHost =
    process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).host
      : 'localhost:3000'

  const hostWithoutPort = hostname.split(':')[0]
  const baseHostWithoutPort = currentHost.split(':')[0]

  if (
    hostWithoutPort !== baseHostWithoutPort &&
    hostWithoutPort.endsWith(`.${baseHostWithoutPort}`)
  ) {
    const subdomain = hostWithoutPort.replace(`.${baseHostWithoutPort}`, '')
    if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
      // Rewrite subdomain to path-based tenant route
      return NextResponse.rewrite(
        new URL(`/${subdomain}${url.pathname === '/' ? '' : url.pathname}`, request.url),
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json).*)'],
}
