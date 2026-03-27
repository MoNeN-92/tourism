import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './i18n/config'

type AdminRole = 'ADMIN' | 'MODERATOR'

// ✅ გადაწყვეტილება: ვიყენებთ 'always'. 
// ეს ნიშნავს, რომ URL იქნება /ka, /en, /ru. 
// ეს აგვარებს Google-ის ერორს, რადგან თითოეულ ენას აქვს თავისი მკაფიო მისამართი.
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // შევცვალეთ 'always'-ზე სტაბილურობისთვის
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

function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/')
  const pathnameLocale = segments[1]
  return locales.includes(pathnameLocale as any) ? pathnameLocale : defaultLocale
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

  // 1. გამოვტოვოთ სტატიკური ფაილები და API
  if (
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  const locale = getLocaleFromPath(pathname)
  const isAdminRoute = pathname.includes('/admin') && !pathname.includes('/admin/login')

  // 2. ადმინ პანელის დაცვა
  if (isAdminRoute) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      // ✅ ყოველთვის ვიყენებთ locale-ს პრეფიქსს რედაირექტისთვის
      const loginUrl = new URL(`/${locale}/account/login`, request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const payload = decodeJwtPayload(token)
    const role = payload?.role as AdminRole | undefined

    if (role !== 'ADMIN' && role !== 'MODERATOR') {
      const accountUrl = new URL(`/${locale}/account/notifications`, request.url)
      return NextResponse.redirect(accountUrl)
    }

    if (isAdminOnlyRoute(pathname) && role !== 'ADMIN') {
      const fallbackUrl = new URL(`/${locale}/admin/bookings`, request.url)
      return NextResponse.redirect(fallbackUrl)
    }
  }

  // 3. თუ მომხმარებელი შედის პირდაპირ root-ზე (/), გადავიყვანოთ default ენაზე (/en ან /ka)
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // ✅ მატჩერი, რომელიც მოიცავს ყველა საჭირო გვერდს
    '/((?!api|_next|_vercel|sitemap\\.xml|robots\\.txt|manifest\\.json|[\\w-]+\\.\\w+).*)',
  ],
}