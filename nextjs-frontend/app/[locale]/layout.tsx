// app/[locale]/layout.tsx
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/config'
import { GoogleAnalytics } from '@next/third-parties/google' // იმპორტი ანალიტიკისთვის
import '../globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Vibe Georgia | Unique Tours & Travel Experiences',
    template: '%s | Vibe Georgia'
  },
  description: 'Explore Georgia with Vibe Georgia. We offer unique tours, local experiences, and hidden gems across the country.',
  keywords: ['travel Georgia', 'Tbilisi tours', 'Georgian wine tours', 'mountain adventures', 'Vibe Georgia tours'],
  authors: [{ name: 'Vibe Georgia' }],
  metadataBase: new URL('https://vibegeorgia.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'ka-GE': '/ka',
      'ru-RU': '/ru',
    },
  },
  openGraph: {
    title: 'Vibe Georgia - Discover the Caucasus',
    description: 'Unforgettable travel experiences in the heart of Georgia.',
    url: 'https://vibegeorgia.com',
    siteName: 'Vibe Georgia',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Vibe Georgia Tours',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  verification: {
    // შენი Google Search Console კოდი
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
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </NextIntlClientProvider>
        
        {/* Google Analytics - ჩასმულია body-ს ბოლოში ოპტიმიზაციისთვის */}
        <GoogleAnalytics gaId="G-ZNGHZ2EQ9P" />
      </body>
    </html>
  )
}