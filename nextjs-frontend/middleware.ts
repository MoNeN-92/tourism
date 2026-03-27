import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './i18n/config'

type AdminRole = 'ADMIN' | 'MODERATOR'

// 1. ინიციალიზაცია სწორი პარამეტრებით
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale, // აქ ავტომატურად ჩაჯდება 'ka' შენი კონფიგიდან
  localePrefix: 'always'
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

  // სტატიკური ფაილების გატარება
  if (
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  // 2. მთავარი გვერდის (root) რევიზია: 
  // თუ მომხმარებელი შედის vibegeorgia.com-ზე, ვაგზავნით /ka-ზე
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }

  // 3. ადმინ პანელის დაცვის ლოგიკა
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