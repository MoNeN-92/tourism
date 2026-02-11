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
  
  // 1. გამოვტოვოთ სტატიკური ფაილები (manifest.json, favicon.ico, images და ა.შ.)
  if (
    pathname.includes('.') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // 2. ენის ექსტრაქცია URL-დან
  const pathnameLocale = pathname.split('/')[1];
  const locale = locales.includes(pathnameLocale as any) ? pathnameLocale : defaultLocale;
  
  // 3. ადმინ პანელის დაცვა
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
  // მატჩერი, რომელიც გამორიცხავს სტანდარტულ სერვისულ მისამართებს
  matcher: ['/((?!api|_next|_vercel|[\\w-]+\\.\\w+).*)']
}