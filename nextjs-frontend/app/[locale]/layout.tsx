import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/config'
import Script from 'next/script'
import '../globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'

// 1. ვქმნით generateMetadata ფუნქციას დინამიური ენებისთვის
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibegeorgia.com'
  
  // ვაკონტროლებთ ენების ფორმატს (ka-GE, en-US, ru-RU)
  const langMap: { [key: string]: string } = {
    ka: 'ka-GE',
    en: 'en-US',
    ru: 'ru-RU',
  }

  return {
    title: {
      default: 'Vibe Georgia | Unique Tours & Travel Experiences',
      template: '%s | Vibe Georgia'
    },
    description: 'Explore Georgia with Vibe Georgia. We offer unique tours, local experiences, and hidden gems across the country.',
    keywords: ['travel Georgia', 'Tbilisi tours', 'Georgian wine tours', 'mountain adventures', 'Vibe Georgia tours'],
    authors: [{ name: 'Vibe Georgia' }],
    metadataBase: new URL(baseUrl),
    
    // ✅ სწორი hreflang კონფიგურაცია
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'ka-GE': `${baseUrl}/ka`,
        'en-US': `${baseUrl}/en`,
        'ru-RU': `${baseUrl}/ru`,
        'x-default': `${baseUrl}/en`, // ნაგულისხმევი ენა
      },
    },

    icons: {
      icon: [
        { url: '/images/favicon.ico' },
        { url: '/images/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/images/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    manifest: '/manifest.json',

    openGraph: {
      title: 'Vibe Georgia - Discover the Caucasus',
      description: 'Unforgettable travel experiences in the heart of Georgia.',
      url: `${baseUrl}/${locale}`,
      siteName: 'Vibe Georgia',
      images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Vibe Georgia Tours' }],
      locale: langMap[locale] || 'en_US',
      type: 'website',
    },
    verification: { 
      google: 'sc-domain:vibegeorgia.com',
      // Yandex-ის ვერიფიკაცია უკვე Cloudflare-ში დაამატეთ, აქ აღარ გვჭირდება
    },
    robots: { index: true, follow: true }
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!locales.includes(locale as any)) notFound()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className="antialiased">
        {/* ✅ TBT-ის ოპტიმიზაცია: GA არ აფერხებს საიტის გახსნას */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-ZNGHZ2EQ9P`}
          strategy="lazyOnload" 
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZNGHZ2EQ9P');
          `}
        </Script>

        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieBanner />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}