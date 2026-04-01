import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/config'
import Script from 'next/script'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import '../globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  // OpenGraph locale ფორმატი: ka_GE, en_US, ru_RU
  const ogLocaleMap: Record<string, string> = {
    ka: 'ka_GE',
    en: 'en_US',
    ru: 'ru_RU',
  }

  return {
    title: {
      default: `${SITE_NAME} | Unique Tours & Travel Experiences`,
      template: '%s',
    },
    description:
      'Explore Georgia with Vibe Georgia. We offer unique tours, local experiences, and hidden gems across the country.',
    keywords: [
      'travel Georgia',
      'Tbilisi tours',
      'Georgian wine tours',
      'mountain adventures',
      'Vibe Georgia tours',
    ],
    authors: [{ name: SITE_NAME }],
    metadataBase: new URL(SITE_URL),

    icons: {
      icon: [
        { url: `${SITE_URL}/favicon.ico`, type: 'image/x-icon' },
        { url: `${SITE_URL}/images/icon-192.png`, sizes: '192x192', type: 'image/png' },
        { url: `${SITE_URL}/images/icon-512.png`, sizes: '512x512', type: 'image/png' },
      ],
      shortcut: [`${SITE_URL}/favicon.ico`],
      apple: [
        { url: `${SITE_URL}/images/apple-touch-icon.png`, sizes: '180x180', type: 'image/png' },
      ],
    },

    manifest: `${SITE_URL}/manifest.json`,

    openGraph: {
      title: `${SITE_NAME} - Discover the Caucasus`,
      description: 'Unforgettable travel experiences in the heart of Georgia.',
      url: `${SITE_URL}/${locale}`,
      siteName: SITE_NAME,
      images: [
        {
          url: `${SITE_URL}/images/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} Tours`,
        },
      ],
      locale: ogLocaleMap[locale] ?? 'en_US',
      type: 'website',
    },

    verification: {
      google: 'sc-domain:vibegeorgia.com',
    },

    robots: { index: true, follow: true },
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
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
        {/* Google Analytics-ის ოპტიმიზებული ჩატვირთვა */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZNGHZ2EQ9P"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            (function() {
              const loadGA = () => {
                if (window.gaLoaded) return;
                window.gaLoaded = true;

                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-ZNGHZ2EQ9P', {
                  page_path: window.location.pathname,
                });

                window.removeEventListener('scroll', loadGA);
                window.removeEventListener('mousemove', loadGA);
                window.removeEventListener('touchstart', loadGA);
              };

              window.addEventListener('scroll', loadGA, { passive: true });
              window.addEventListener('mousemove', loadGA, { passive: true });
              window.addEventListener('touchstart', loadGA, { passive: true });
              setTimeout(loadGA, 4000); 
            })();
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
