// app/[locale]/layout.tsx
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/config'
import { GoogleAnalytics } from '@next/third-parties/google'
import '../globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  title: {
    default: 'Vibe Georgia | Unique Tours & Travel Experiences',
    template: '%s | Vibe Georgia'
  },
  description: 'Explore Georgia with Vibe Georgia. We offer unique tours, local experiences, and hidden gems across the country.',
  keywords: ['travel Georgia', 'Tbilisi tours', 'Georgian wine tours', 'mountain adventures', 'Vibe Georgia tours'],
  authors: [{ name: 'Vibe Georgia' }],
  metadataBase: new URL('https://vibegeorgia.com'),
  
  // ✅ აიქონების დამატებული სექცია
  icons: {
    icon: [
      { url: '/images/favicon.ico' }, // თუ favicon პირდაპირ public-შია, დატოვე '/favicon.ico'
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
    url: 'https://vibegeorgia.com',
    siteName: 'Vibe Georgia',
    images: [
      {
        url: '/images/og-image.jpg', // მივუთითე images საქაღალდე
        width: 1200,
        height: 630,
        alt: 'Vibe Georgia Tours',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  verification: {
    google: 'sc-domain:vibegeorgia.com',
  },
  robots: {
    index: true,
    follow: true,
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
  
  if (!locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
  <link rel="alternate" hrefLang="ka" href={`https://vibegeorgia.com/ka`} />
  <link rel="alternate" hrefLang="en" href={`https://vibegeorgia.com/en`} />
  <link rel="alternate" hrefLang="ru" href={`https://vibegeorgia.com/ru`} />
  <link rel="alternate" hrefLang="x-default" href="https://vibegeorgia.com/en" />
</head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <CookieBanner />
          </div>
        </NextIntlClientProvider>
        
        <GoogleAnalytics gaId="G-ZNGHZ2EQ9P" />
      </body>
    </html>
  )
}
