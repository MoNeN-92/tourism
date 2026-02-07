// next.config.ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    // ძველი მეთოდი (loader-ის გარეშე), რომელიც უფრო მარტივია
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    // ახალი მეთოდი უფრო გაშლილი სახით
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // ეს ნებისმიერ ჰოსტს დაუშვებს (დიაგნოსტიკისთვის)
      },
    ],
  },
}

export default withNextIntl(nextConfig)