import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './i18n/config'

type AdminRole = 'ADMIN' | 'MODERATOR'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // ინარჩუნებს /ka, /en, /ru სტრუქტურას
})

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

  // 1. ჯერ ვუშვებთ intlMiddleware-ს, რომ მან მართოს ენები
  const response = intlMiddleware(request)

  // 2. ადმინ პანელის შემოწმება
  const isAdminRoute = pathname.includes('/admin') && !pathname.includes('/admin/login')
  if (isAdminRoute) {
    const token = request.cookies.get('token')?.value
    const segments = pathname.split('/')
    const currentLocale = locales.includes(segments[1] as any) ? segments[1] : defaultLocale

    if (!token) {
      return NextResponse.redirect(new URL(`/${currentLocale}/account/login?next=${pathname}`, request.url))
    }

    const payload = decodeJwtPayload(token)
    const role = payload?.role as AdminRole | undefined
    if (role !== 'ADMIN' && role !== 'MODERATOR') {
      return NextResponse.redirect(new URL(`/${currentLocale}/account/notifications`, request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}