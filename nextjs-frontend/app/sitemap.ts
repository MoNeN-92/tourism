import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://vibegeorgia.com'
  const locales = ['en', 'ka', 'ru']
  const pages = ['', '/tours', '/about', '/blog', '/contact']

  const routes = locales.flatMap((locale) =>
    pages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  )

  return routes
}