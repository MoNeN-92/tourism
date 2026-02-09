import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'], // თუ გაქვს ადმინ პანელი, აქ ჩაკეტე
    },
    sitemap: 'https://vibegeorgia.com/sitemap.xml',
  }
}