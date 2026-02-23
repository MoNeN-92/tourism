import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ToursPageClient from './ToursPageClient'
import { absoluteUrl, localizedAlternates, openGraphLocale } from '@/lib/seo'
import { buildCloudinaryUrl } from '@/lib/cloudinary'

const TOURS_OG_IMAGE = buildCloudinaryUrl(
  'https://res.cloudinary.com/dj7qaif1i/image/upload/v1771396197/cover_1_secna5.jpg',
)

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'tours' })
  const title = `${t('title')} | Vibe Georgia`
  const description = t('subtitle')

  return {
    title,
    description,
    alternates: localizedAlternates(locale, '/tours'),
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/${locale}/tours`),
      siteName: 'Vibe Georgia',
      locale: openGraphLocale(locale),
      type: 'website',
      images: [
        {
          url: TOURS_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [TOURS_OG_IMAGE],
    },
  }
}

export default function ToursPage() {
  return <ToursPageClient />
}
