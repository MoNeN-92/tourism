import { locales, defaultLocale, type Locale } from '@/i18n/config'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vibegeorgia.com').replace(/\/+$/, '')

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
  return `${SITE_URL}${normalizedPath(path)}`
}

/**
 * ✅ FIX: localePath
 *
 * ადრე:  ka → /ka/tours/slug   (redirect URL — Google-ს canonical N/A ჩანდა)
 * ახლა:  ka → /tours/slug      (root, prefix გარეშე)
 *        en → /en/tours/slug
 *        ru → /ru/tours/slug
 *
 * რატომ: next-intl 'as-needed' რეჟიმში default locale (ka)
 * არასოდეს იღებს prefix-ს. /ka/* ავტომატურად redirect-დება /*-ზე,
 * ამიტომ Google ვერ პოულობს canonical-ს და წერს N/A.
 */
export function localePath(locale: string, pathAfterLocale = ''): string {
  const safeLocale = asLocale(locale)
  const path = normalizedPath(pathAfterLocale)

  // default locale (ka) → prefix გარეშე
  if (safeLocale === defaultLocale) {
    return path || '/'
  }

  // სხვა locale-ები → /en/..., /ru/...
  return `/${safeLocale}${path}`
}

/**
 * ✅ FIX: localizedAlternates
 *
 * მაგალითი locale=en, path=/tours/some-slug:
 *   canonical:          https://vibegeorgia.com/en/tours/some-slug
 *   languages:
 *     ka:               https://vibegeorgia.com/tours/some-slug      ← prefix გარეშე!
 *     ka-GE:            https://vibegeorgia.com/tours/some-slug
 *     en:               https://vibegeorgia.com/en/tours/some-slug
 *     en-US:            https://vibegeorgia.com/en/tours/some-slug
 *     ru:               https://vibegeorgia.com/ru/tours/some-slug
 *     ru-RU:            https://vibegeorgia.com/ru/tours/some-slug
 *     x-default:        https://vibegeorgia.com/tours/some-slug      ← root (ka = default)
 */
export function localizedAlternates(locale: string, pathAfterLocale = '') {
  const canonicalPath = localePath(locale, pathAfterLocale)

  // ყველა locale-ის URL-ი სწორი prefix-ებით
  const languageEntries = locales.flatMap((currentLocale) => {
    const url = absoluteUrl(localePath(currentLocale, pathAfterLocale))

    if (currentLocale === 'ka') {
      // ka-სთვის ორივე variant
      return [
        ['ka',    url],
        ['ka-GE', url],
      ]
    }
    if (currentLocale === 'en') {
      return [
        ['en',    url],
        ['en-US', url],
      ]
    }
    if (currentLocale === 'ru') {
      return [
        ['ru',    url],
        ['ru-RU', url],
      ]
    }
    return [[currentLocale, url]]
  })

  // x-default = default locale (ka) = root
  const xDefault = absoluteUrl(localePath(defaultLocale, pathAfterLocale))

  return {
    canonical: absoluteUrl(canonicalPath),
    languages: {
      ...Object.fromEntries(languageEntries),
      'x-default': xDefault,
    },
  }
}

export function openGraphLocale(locale: string): 'ka_GE' | 'en_US' | 'ru_RU' {
  if (locale === 'en') return 'en_US'
  if (locale === 'ru') return 'ru_RU'
  return 'ka_GE'
}