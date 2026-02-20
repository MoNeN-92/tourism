import { MetadataRoute } from 'next'
import { mockBlogPosts } from '@/lib/mockBlogData'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vibegeorgia.com'
  const apiUrl = 'https://api.vibegeorgia.com'
  const locales = ['en', 'ka', 'ru']
  const staticPages = ['', '/tours', '/about', '/blog', '/contact']

  // 1. სტატიკური გვერდების გენერაცია
  const staticRoutes = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  )

  // 2. დინამიური ტურების წამოღება API-დან
  let tourRoutes: MetadataRoute.Sitemap = []
  try {
    const response = await fetch(`${apiUrl}/tours`, { next: { revalidate: 3600 } })
    
    if (response.ok) {
      const tours = await response.json()

      tourRoutes = locales.flatMap((locale) =>
        tours.map((tour: { slug: string; updatedAt?: string }) => ({
          url: `${baseUrl}/${locale}/tours/${tour.slug}`,
          lastModified: tour.updatedAt ? new Date(tour.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        }))
      )
    }
  } catch (error) {
    console.error("Sitemap: Error fetching tours from API", error)
  }

  // 3. ბლოგ-პოსტების გენერაცია mockBlogData-დან
  const blogRoutes = locales.flatMap((locale) =>
    mockBlogPosts.map((post) => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.publishedDate || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  )

  return [...staticRoutes, ...tourRoutes, ...blogRoutes]
}