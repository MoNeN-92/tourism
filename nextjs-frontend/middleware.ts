import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './i18n/config'
import { SITE_HOSTNAME, WWW_SITE_HOSTNAME } from './lib/seo'

type AdminRole = 'ADMIN' | 'MODERATOR'

// 1. ინიციალიზაცია სწორი პარამეტრებით
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
})

function isLocalizedPath(pathname: string): boolean {
  const segments = pathname.split('/')
  return locales.includes((segments[1] || '') as (typeof locales)[number])
}

function shouldForceCanonicalHost(hostname: string): boolean {
  return hostname === SITE_HOSTNAME || hostname === WWW_SITE_HOSTNAME
}

function getNormalizedPathname(pathname: string): string {
  if (pathname === '/') {
    return `/${defaultLocale}`
  }

  if (!isLocalizedPath(pathname)) {
    return `/${defaultLocale}${pathname}`
  }

  return pathname
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const decoded = atob(padded)
    return JSON.parse(decoded)
  } catch {
    return null
  }
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

  const hostname = request.nextUrl.hostname.toLowerCase()
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const protocol = (forwardedProto || request.nextUrl.protocol.replace(':', '')).toLowerCase()
  const normalizedPathname = getNormalizedPathname(pathname)
  const shouldRedirectToCanonicalHost =
    shouldForceCanonicalHost(hostname) &&
    (hostname !== SITE_HOSTNAME || protocol !== 'https')

  if (shouldRedirectToCanonicalHost || normalizedPathname !== pathname) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.hostname = SITE_HOSTNAME
    url.port = ''
    url.pathname = normalizedPathname
    return NextResponse.redirect(url, 308)
  }

  const isAdminRoute = pathname.includes('/admin') && !pathname.includes('/admin/login')
  if (isAdminRoute) {
    const token = request.cookies.get('token')?.value
    const segments = pathname.split('/')
    const currentLocale = locales.includes(segments[1] as any) ? segments[1] : defaultLocale

    if (!token) {
      const loginUrl = new URL(`/${currentLocale}/account/login`, request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const payload = decodeJwtPayload(token)
    const role = payload?.role as AdminRole | undefined
    if (role !== 'ADMIN' && role !== 'MODERATOR') {
      return NextResponse.redirect(new URL(`/${currentLocale}/account/notifications`, request.url))
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
