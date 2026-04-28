import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './i18n/config'
import { SITE_HOSTNAME, WWW_SITE_HOSTNAME } from './lib/seo'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  alternateLinks: false,
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

function getCurrentLocale(pathname: string): string {
  const segments = pathname.split('/')
  return locales.includes((segments[1] || '') as (typeof locales)[number])
    ? segments[1]
    : defaultLocale
}

function isAdminRoute(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  return segments[1] === 'admin' && segments[2] !== 'login'
}

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '')
}

async function getAuthenticatedUserRole(request: NextRequest): Promise<string | null> {
  const cookieHeader = request.headers.get('cookie')

  if (!cookieHeader) {
    return null
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/users/auth/me`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        cookie: cookieHeader,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const role = data?.role

    if (role === 'ADMIN' || role === 'MODERATOR' || role === 'USER' || role === 'DRIVER' || role === 'GUIDE') {
      return role
    }

    return null
  } catch {
    return null
  }
}

export default async function proxy(request: NextRequest) {
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

  if (isAdminRoute(pathname)) {
    const token = request.cookies.get('token')?.value
    const currentLocale = getCurrentLocale(pathname)

    if (!token) {
      const loginUrl = new URL(`/${currentLocale}/account/login`, request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = await getAuthenticatedUserRole(request)
    const partnerRoles = new Set(['DRIVER', 'GUIDE'])

    if (role !== 'ADMIN' && role !== 'MODERATOR') {
      if (role && partnerRoles.has(role)) {
        return NextResponse.redirect(new URL(`/${currentLocale}/account/calendar`, request.url))
      }

      if (role === 'USER') {
        return NextResponse.redirect(new URL(`/${currentLocale}/account/notifications`, request.url))
      }

      const loginUrl = new URL(`/${currentLocale}/account/login`, request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
