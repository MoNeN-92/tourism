// middleware.ts
import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './i18n/config'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
})

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extract locale from pathname
  const pathnameLocale = pathname.split('/')[1];
  const locale = locales.includes(pathnameLocale as any) ? pathnameLocale : defaultLocale;
  
  // Check if route is admin (excluding login)
  const isAdminRoute = pathname.includes('/admin') && !pathname.includes('/admin/login');
  
  if (isAdminRoute) {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}