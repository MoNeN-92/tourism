import { locales, type Locale } from '@/i18n/config'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vibegeorgia.com').replace(/\/+$/, '')

function asLocale(value: string): Locale {
  if (locales.includes(value as Locale)) {
    return value as Locale
  }

  return 'ka'
}

function normalizedPath(path: string): string {
  if (!path) {
    return ''
  }

  if (path === '/') {
    return ''
  }

  return path.startsWith('/') ? path : `/${path}`
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${normalizedPath(path)}`
}

export function localePath(locale: string, pathAfterLocale = ''): string {
  const safeLocale = asLocale(locale)
  return `/${safeLocale}${normalizedPath(pathAfterLocale)}`
}

export function localizedAlternates(locale: string, pathAfterLocale = '') {
  const canonicalPath = localePath(locale, pathAfterLocale)

  return {
    canonical: absoluteUrl(canonicalPath),
    languages: Object.fromEntries(
      locales.map((currentLocale) => [currentLocale, absoluteUrl(localePath(currentLocale, pathAfterLocale))]),
    ),
  }
}

export function openGraphLocale(locale: string): 'ka_GE' | 'en_US' | 'ru_RU' {
  if (locale === 'en') return 'en_US'
  if (locale === 'ru') return 'ru_RU'
  return 'ka_GE'
}
