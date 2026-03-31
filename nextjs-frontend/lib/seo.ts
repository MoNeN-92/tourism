import { locales, defaultLocale, type Locale } from '@/i18n/config'

export const SITE_URL = 'https://vibegeorgia.com'
export const SITE_HOSTNAME = 'vibegeorgia.com'
export const WWW_SITE_HOSTNAME = 'www.vibegeorgia.com'
export const SITE_NAME = 'Vibe Georgia'
export const SITE_EMAIL = 'info@vibegeorgia.com'
export const SITE_PHONE = '+995596550099'
export const SITE_LOGO_PATH = '/images/icon-512.png'
export const SITE_SOCIAL_PROFILES = [
  'https://www.facebook.com/vibegeorgia',
  'https://www.instagram.com/vibegeorgia',
] as const
export const SITE_ADDRESS = {
  '@type': 'PostalAddress',
  addressLocality: 'Tbilisi',
  addressCountry: 'GE',
} as const

function asLocale(value: string): Locale {
  if (locales.includes(value as Locale)) {
    return value as Locale
  }
  return defaultLocale
}

function normalizedPath(path: string): string {
  if (!path) return ''
  if (path === '/') return ''
  return path.startsWith('/') ? path : `/${path}`
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  return `${SITE_URL}${normalizedPath(path)}`
}
export function localePath(locale: string, pathAfterLocale = ''): string {
  const safeLocale = asLocale(locale)
  const path = normalizedPath(pathAfterLocale)
  return `/${safeLocale}${path}`
}
export function buildCanonicalUrl(locale: string, pathAfterLocale = ''): string {
  return absoluteUrl(localePath(locale, pathAfterLocale))
}

export function localizedAlternates(locale: string, pathAfterLocale = '') {
  const canonical = buildCanonicalUrl(locale, pathAfterLocale)
  const languageEntries = locales.flatMap((currentLocale) => {
    const url = buildCanonicalUrl(currentLocale, pathAfterLocale)

    if (currentLocale === 'ka') {
      return [
        ['ka', url],
        ['ka-GE', url],
      ]
    }

    if (currentLocale === 'en') {
      return [
        ['en', url],
        ['en-US', url],
      ]
    }

    if (currentLocale === 'ru') {
      return [
        ['ru', url],
        ['ru-RU', url],
      ]
    }

    return [[currentLocale, url]]
  })

  return {
    canonical,
    languages: {
      ...Object.fromEntries(languageEntries),
      'x-default': buildCanonicalUrl(defaultLocale, pathAfterLocale),
    },
  }
}

export function openGraphLocale(locale: string): 'ka_GE' | 'en_US' | 'ru_RU' {
  if (locale === 'en') return 'en_US'
  if (locale === 'ru') return 'ru_RU'
  return 'ka_GE'
}
