import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './i18n/config'

type AdminRole = 'ADMIN' | 'MODERATOR'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')

    if (parts.length < 2) {
      return null
    }

    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const decoded = atob(padded)

    return JSON.parse(decoded)
  } catch {
    return null
  }
}

function getLocaleFromPath(pathname: string): string {
  const pathnameLocale = pathname.split('/')[1]
  return locales.includes(pathnameLocale as (typeof locales)[number])
    ? pathnameLocale
    : defaultLocale
}

function isAdminOnlyRoute(pathname: string): boolean {
  return (
    pathname.includes('/admin/users') ||
    pathname.includes('/admin/tours') ||
    pathname.includes('/admin/blog')
  )
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  const locale = getLocaleFromPath(pathname)
  const isAdminRoute = pathname.includes('/admin') && !pathname.includes('/admin/login')

  if (isAdminRoute) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      const loginUrl = new URL(`/${locale}/admin/login`, request.url)
      return NextResponse.redirect(loginUrl)
    }

    const payload = decodeJwtPayload(token)
    const role = payload?.role as AdminRole | undefined

    if (role !== 'ADMIN' && role !== 'MODERATOR') {
      const loginUrl = new URL(`/${locale}/admin/login`, request.url)
      return NextResponse.redirect(loginUrl)
    }

    if (isAdminOnlyRoute(pathname) && role !== 'ADMIN') {
      const fallbackUrl = new URL(`/${locale}/admin/bookings`, request.url)
      return NextResponse.redirect(fallbackUrl)
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|sitemap\\.xml|robots\\.txt|manifest\\.json|[\\w-]+\\.\\w+).*)',
  ],
}
