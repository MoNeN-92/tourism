import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vibegeorgia.com').replace(
    /\/+$/,
    '',
  )

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin',
          '/admin/',
          '/account',
          '/account/',
          '/*/admin',
          '/*/admin/',
          '/*/admin/*',
          '/*/account',
          '/*/account/',
          '/*/account/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: new URL(baseUrl).host,
  }
}
