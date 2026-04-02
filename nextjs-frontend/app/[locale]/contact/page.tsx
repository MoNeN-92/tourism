import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ContactPageClient from './ContactPageClient'
import { absoluteUrl, buildCanonicalUrl, localizedAlternates, openGraphLocale, SITE_NAME } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })
  const title = `${t('title')} | ${SITE_NAME}`
  const description = t('subtitle')

  return {
    title,
    description,
    alternates: localizedAlternates(locale, '/contact'),
    openGraph: {
      title,
      description,
      url: buildCanonicalUrl(locale, '/contact'),
      siteName: SITE_NAME,
      locale: openGraphLocale(locale),
      type: 'website',
      images: [
        {
          url: absoluteUrl('/images/og-image.jpg'),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl('/images/og-image.jpg')],
    },
  }
}

export default function ContactPage() {
  return <ContactPageClient />
}
