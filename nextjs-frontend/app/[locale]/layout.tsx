import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/config'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import '../globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieBannerMount from '@/components/CookieBannerMount'
import JsonLd from '@/components/JsonLd'
import { buildTravelAgencySchema, buildWebSiteSchema } from '@/lib/structured-data'

type HeaderAuthUser = {
  id?: string
  firstName?: string
  lastName?: string
  email?: string
  role?: 'USER' | 'ADMIN' | 'MODERATOR' | 'DRIVER' | 'GUIDE'
}

async function getInitialHeaderAuth(): Promise<{
  mode: 'guest' | 'user' | 'admin'
  user: HeaderAuthUser | null
}> {
  const cookieStore = await cookies()
  const hasAuthCookie = cookieStore.has('token') || cookieStore.has('user_token')

  if (!hasAuthCookie) {
    return { mode: 'guest', user: null }
  }

  const cookieHeader = cookieStore.toString()

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/users/auth/me`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return { mode: 'guest', user: null }
    }

    const user = (await response.json()) as HeaderAuthUser
    const mode = user?.role === 'ADMIN' || user?.role === 'MODERATOR' ? 'admin' : 'user'

    return { mode, user }
  } catch {
    return { mode: 'guest', user: null }
  }
}

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
  if (!locales.includes(locale as (typeof locales)[number])) notFound()

  const messages = await getMessages()
  const headerAuth = await getInitialHeaderAuth()
  const organizationDescriptions: Record<string, string> = {
    ka: 'Vibe Georgia აერთიანებს ტურების დაგეგმვას, პარტნიორ სასტუმროებს, ტრანსფერს და რეალურ სამოგზაურო გზამკვლევებს საქართველოს მასშტაბით.',
    en: 'Vibe Georgia combines route planning, partner hotels, transfers, and first-hand travel guidance across Georgia.',
    ru: 'Vibe Georgia объединяет планирование маршрутов, партнерские отели, трансферы и практические гиды по Грузии.',
  }

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <JsonLd
            data={[
              buildTravelAgencySchema({
                description: organizationDescriptions[locale] || organizationDescriptions.en,
              }),
              buildWebSiteSchema(),
            ]}
          />
          <div className="min-h-screen flex flex-col">
            <Header locale={locale} initialAuthMode={headerAuth.mode} initialAuthUser={headerAuth.user} />
            <main className="flex-1">{children}</main>
            <Footer locale={locale} />
            <CookieBannerMount />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
