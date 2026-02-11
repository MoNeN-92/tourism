import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/', 
        '/*/admin/', // ჩაკეტავს /ka/admin/, /en/admin/ და ა.შ.
        '/*/login/', // ჩაკეტავს /ka/login/, /en/login/ და ა.შ.
        '/admin/', 
        '/login/'
      ],
    },
    sitemap: 'https://vibegeorgia.com/sitemap.xml',
  }
}