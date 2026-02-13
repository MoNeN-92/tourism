import { MetadataRoute } from 'next'
import { mockBlogPosts } from '@/lib/mockBlogData' // დარწმუნდი, რომ გზა სწორია

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://vibegeorgia.com'
  const locales = ['en', 'ka', 'ru']
  const staticPages = ['', '/tours', '/about', '/blog', '/contact']

  // 1. სტატიკური გვერდების გენერაცია ყველა ენისთვის
  const staticRoutes = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  )

  // 2. დინამიური ბლოგ-პოსტების გენერაცია (Tbilisi, Kazbegi და ა.შ.)
  const blogRoutes = locales.flatMap((locale) =>
    mockBlogPosts.map((post) => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.publishedDate || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  )

  return [...staticRoutes, ...blogRoutes]
}