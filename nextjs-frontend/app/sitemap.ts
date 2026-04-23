import { MetadataRoute } from 'next'
import { defaultLocale, locales } from '@/i18n/config'
import { buildAuthorSlug } from '@/lib/authors'
import { COMMERCIAL_PAGE_SLUGS } from '@/lib/commercial-pages'
import { mockBlogPosts } from '@/lib/mockBlogData'
import { SITE_URL, localePath } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://api.vibegeorgia.com').replace(
    /\/+$/,
    '',
  )

  const now = new Date()
  const publicPaths = [
    '',
    '/tours',
    '/about',
    '/blog',
    '/contact',
    '/faq',
    '/travel-experts',
    '/partner-hotels',
    '/privacy',
    '/terms',
    ...COMMERCIAL_PAGE_SLUGS.map((slug) => `/${slug}`),
  ]

  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    publicPaths.map((path) => {
      const localizedPath = localePath(locale, path)
      return {
        url: `${SITE_URL}${localizedPath}`,
        lastModified: now,
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority: path === '' ? 1 : 0.8,
        alternates: {
          languages: buildLanguageAlternates(path),
        },
      }
    }),
  )

  const [tourRoutes, blogRoutes, partnerHotelRoutes, authorRoutes] = await Promise.all([
    getDynamicRoutes({
      apiUrl,
      contentPathPrefix: '/tours',
      endpoint: '/tours',
      changeFrequency: 'weekly',
      priority: 0.9,
    }),
    getDynamicRoutes({
      apiUrl,
      contentPathPrefix: '/blog',
      endpoint: '/blog',
      changeFrequency: 'weekly',
      priority: 0.7,
    }),
    getDynamicRoutes({
      apiUrl,
      contentPathPrefix: '/partner-hotels',
      endpoint: '/partner-hotels',
      changeFrequency: 'weekly',
      priority: 0.7,
    }),
    getAuthorRoutes({
      apiUrl,
      changeFrequency: 'monthly',
      priority: 0.5,
    }),
  ])

  return [...staticRoutes, ...tourRoutes, ...blogRoutes, ...partnerHotelRoutes, ...authorRoutes]
}

type DynamicContentItem = {
  slug: string
  updatedAt?: string
}

async function getDynamicRoutes({
  apiUrl,
  contentPathPrefix,
  endpoint,
  changeFrequency,
  priority,
}: {
  apiUrl: string
  contentPathPrefix: string
  endpoint: string
  changeFrequency: 'daily' | 'weekly' | 'monthly'
  priority: number
}): Promise<MetadataRoute.Sitemap> {
  const items = dedupeBySlug(await fetchDynamicItems(`${apiUrl}${endpoint}`))

  return locales.flatMap((locale) =>
    items.map((item) => {
      const path = localePath(locale, `${contentPathPrefix}/${item.slug}`)
      return {
        url: `${SITE_URL}${path}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        changeFrequency,
        priority,
        alternates: {
          languages: buildLanguageAlternates(`${contentPathPrefix}/${item.slug}`),
        },
      }
    }),
  )
}

async function fetchDynamicItems(url: string): Promise<DynamicContentItem[]> {
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } })

    if (!response.ok) {
      return []
    }

    const payload: unknown = await response.json()

    if (!Array.isArray(payload)) {
      return []
    }

    const items: DynamicContentItem[] = []

    for (const item of payload) {
      if (!isDynamicContentItem(item)) {
        continue
      }

      items.push({
        slug: item.slug,
        updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : undefined,
      })
    }

    return items
  } catch {
    return []
  }
}

function isDynamicContentItem(value: unknown): value is DynamicContentItem {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as { slug?: unknown }
  return typeof candidate.slug === 'string' && candidate.slug.trim().length > 0
}

function buildLanguageAlternates(pathAfterLocale: string): Record<string, string> {
  const normalizedPath =
    pathAfterLocale.startsWith('/') || pathAfterLocale === ''
      ? pathAfterLocale
      : `/${pathAfterLocale}`

  const entries: Array<[string, string]> = locales.map((locale) => [
    locale,
    `${SITE_URL}${localePath(locale, normalizedPath)}`,
  ])

  entries.push(['x-default', `${SITE_URL}${localePath(defaultLocale, normalizedPath)}`])

  return Object.fromEntries(entries)
}

function dedupeBySlug(items: DynamicContentItem[]): DynamicContentItem[] {
  const unique = new Map<string, DynamicContentItem>()

  for (const item of items) {
    if (!unique.has(item.slug)) {
      unique.set(item.slug, item)
    }
  }

  return Array.from(unique.values())
}

type AuthorRouteItem = {
  author_en: string
  updatedAt?: string
}

async function getAuthorRoutes({
  apiUrl,
  changeFrequency,
  priority,
}: {
  apiUrl: string
  changeFrequency: 'daily' | 'weekly' | 'monthly'
  priority: number
}): Promise<MetadataRoute.Sitemap> {
  const items = await fetchAuthorItems(`${apiUrl}/blog`)
  const fallbackItems = mockBlogPosts.map((post) => ({
    author_en: post.author_en,
    updatedAt: post.publishedDate,
  }))
  const uniqueAuthors = dedupeAuthorRoutes([...items, ...fallbackItems])

  return locales.flatMap((locale) =>
    uniqueAuthors.map((item) => {
      const authorSlug = buildAuthorSlug(item.author_en)
      const path = localePath(locale, `/authors/${authorSlug}`)

      return {
        url: `${SITE_URL}${path}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        changeFrequency,
        priority,
        alternates: {
          languages: buildLanguageAlternates(`/authors/${authorSlug}`),
        },
      }
    }),
  )
}

async function fetchAuthorItems(url: string): Promise<AuthorRouteItem[]> {
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } })

    if (!response.ok) {
      return []
    }

    const payload: unknown = await response.json()

    if (!Array.isArray(payload)) {
      return []
    }

    const items: AuthorRouteItem[] = []

    for (const item of payload) {
      if (typeof item !== 'object' || item === null) {
        continue
      }

      const candidate = item as {
        author_en?: unknown
        updatedAt?: unknown
        publishedAt?: unknown
      }

      if (typeof candidate.author_en !== 'string' || candidate.author_en.trim().length === 0) {
        continue
      }

      items.push({
        author_en: candidate.author_en,
        updatedAt:
          typeof candidate.updatedAt === 'string'
            ? candidate.updatedAt
            : typeof candidate.publishedAt === 'string'
              ? candidate.publishedAt
              : undefined,
      })
    }

    return items
  } catch {
    return []
  }
}

function dedupeAuthorRoutes(items: AuthorRouteItem[]): AuthorRouteItem[] {
  const unique = new Map<string, AuthorRouteItem>()

  for (const item of items) {
    const key = buildAuthorSlug(item.author_en)

    if (!unique.has(key)) {
      unique.set(key, item)
    }
  }

  return Array.from(unique.values())
}
