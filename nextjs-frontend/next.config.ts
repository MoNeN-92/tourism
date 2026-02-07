// next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    // 1. ძველი მეთოდი (საიმედოობისთვის)
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    // 2. ახალი მეთოდი (დეტალური დაშვებით)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // ეს მნიშვნელოვანია! უშვებს ნებისმიერ ქვედირექტორიას
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)