// next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**', // ნებისმიერი სურათი Unsplash-დან
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // ნებისმიერი სურათი Cloudinary-დან
      },
    ],
  },
}

export default withNextIntl(nextConfig)