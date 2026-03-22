import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, defaultLocale } from '@/i18n/config'
import Script from 'next/script'
import '../globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibegeorgia.com'

/**
 * locale → canonical URL
 *
 * 'as-needed' prefix რეჟიმში:
 *   ka → https://vibegeorgia.com        (root, prefix გარეშე)
 *   en → https://vibegeorgia.com/en
 *   ru → https://vibegeorgia.com/ru
 */
function getCanonicalUrl(locale: string, path = ''): string {
  if (locale === defaultLocale) {
    return `${BASE_URL}${path}`
  }
  return `${BASE_URL}/${locale}${path}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  // OpenGraph locale format: ka_GE, en_US, ru_RU
  const ogLocaleMap: Record<string, string> = {
    ka: 'ka_GE',
    en: 'en_US',
    ru: 'ru_RU',
  }

  return {
    title: {
      default: 'Vibe Georgia | Unique Tours & Travel Experiences',
      template: '%s | Vibe Georgia',
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
    authors: [{ name: 'Vibe Georgia' }],
    metadataBase: new URL(BASE_URL),

    alternates: {
      // ✅ ka → root, en → /en, ru → /ru
      canonical: getCanonicalUrl(locale),

      languages: {
        // ✅ ka hreflang → root-ზე (არა /ka — ის redirect-ია!)
        'ka':        BASE_URL,
        'ka-GE':     BASE_URL,

        'en':        `${BASE_URL}/en`,
        'en-US':     `${BASE_URL}/en`,

        'ru':        `${BASE_URL}/ru`,
        'ru-RU':     `${BASE_URL}/ru`,

        // ✅ x-default = root (Georgian არის default locale)
        'x-default': BASE_URL,
      },
    },

    icons: {
      icon: [
        { url: `${BASE_URL}/favicon.ico`, type: 'image/x-icon' },
        { url: `${BASE_URL}/images/icon-192.png`, sizes: '192x192', type: 'image/png' },
        { url: `${BASE_URL}/images/icon-512.png`, sizes: '512x512', type: 'image/png' },
      ],
      shortcut: [`${BASE_URL}/favicon.ico`],
      apple: [
        { url: `${BASE_URL}/images/apple-touch-icon.png`, sizes: '180x180', type: 'image/png' },
      ],
    },

    manifest: `${BASE_URL}/manifest.json`,

    openGraph: {
      title: 'Vibe Georgia - Discover the Caucasus',
      description: 'Unforgettable travel experiences in the heart of Georgia.',
      // ✅ OG url-იც canonical ლოგიკით
      url: getCanonicalUrl(locale),
      siteName: 'Vibe Georgia',
      images: [
        {
          url: `${BASE_URL}/images/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Vibe Georgia Tours',
        },
      ],
      locale: ogLocaleMap[locale] ?? 'ka_GE',
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
        {/* ✅ FIX: ადრე ორი ერთნაირი <Script> იყო (lazyOnload + afterInteractive).
            დარჩა მხოლოდ afterInteractive — სწორი სტრატეგია GTM-ისთვის */}
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
              // მომხმარებლის მოქმედების გარეშეც 5 წამში ჩაიტვირთოს
              setTimeout(loadGA, 5000);
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