import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/*/admin/',
          '/*/account/',
          '/admin/',
          '/account/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/*/admin/', '/*/account/', '/admin/', '/account/', '/api/'],
      },
      {
        userAgent: 'bingbot',
        allow: '/',
        disallow: ['/*/admin/', '/*/account/', '/admin/', '/account/', '/api/'],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: ['/*/admin/', '/*/account/', '/admin/', '/account/', '/api/'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/*/admin/', '/*/account/', '/admin/', '/account/', '/api/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/*/admin/', '/*/account/', '/admin/', '/account/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
