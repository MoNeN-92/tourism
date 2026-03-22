// next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  // ✅ FIX: /ka და /ka/* → root-ზე 301 redirect
  // Nginx-ის გარდა Next.js-შიც უნდა იყოს, რომ SSR დონეზე სწორად მუშაობდეს
  async redirects() {
    return [
      {
        source: '/ka',
        destination: '/',
        permanent: true, // 301 — Google-ს ეტყვის: "ეს URL სამუდამოდ გადავიდა"
      },
      {
        source: '/ka/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ]
  },

  images: {
    loader: 'custom',
    loaderFile: './lib/imageLoader.ts',
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'api.visitbatumi.com', pathname: '/**' },
      { protocol: 'https', hostname: 'dynamic-media-cdn.tripadvisor.com', pathname: '/**' },
    ],
  },
}

export default withNextIntl(nextConfig)