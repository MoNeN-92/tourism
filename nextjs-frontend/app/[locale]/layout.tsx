// app/[locale]/layout.tsx
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/config'
import Script from 'next/script' // ✅ ვიყენებთ Next Script-ს TBT-ის შესამცირებლად
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
  
  // ✅ SEO: Canonical და Hreflang ლოგიკა გადატანილია აქ
  alternates: {
    canonical: '/',
    languages: {
      'ka-GE': '/ka',
      'en-US': '/en',
      'ru-RU': '/ru',
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
    url: 'https://vibegeorgia.com',
    siteName: 'Vibe Georgia',
    images: [
      {
        url: '/images/og-image.jpg',
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
      <body className="antialiased">
        {/* ✅ Google Analytics-ის ოპტიმიზირებული ჩატვირთვა TBT-ის შესამცირებლად */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-ZNGHZ2EQ9P`}
          strategy="afterInteractive" 
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZNGHZ2EQ9P', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

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
      </body>
    </html>
  )
}