import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ToursPageClient from './ToursPageClient'
import { absoluteUrl, buildCanonicalUrl, localizedAlternates, openGraphLocale } from '@/lib/seo'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import JsonLd from '@/components/JsonLd'
import { buildBreadcrumbSchema, buildTouristTripSchema } from '@/lib/structured-data'

const TOURS_OG_IMAGE = buildCloudinaryUrl(
  'https://res.cloudinary.com/dj7qaif1i/image/upload/v1771396197/cover_1_secna5.jpg',
)

interface TourItem {
  slug: string
  title_ka: string
  title_en: string
  title_ru: string
  description_ka: string
  description_en: string
  description_ru: string
  location_ka: string | null
  location_en: string | null
  location_ru: string | null
  duration: string
  images: Array<{ url: string }>
}

function getLocalizedValue(
  tour: TourItem,
  field: 'title' | 'description' | 'location',
  locale: string,
) {
  const key = `${field}_${locale}` as keyof TourItem
  const fallbackKey = `${field}_ka` as keyof TourItem
  return (tour[key] as string | null) || (tour[fallbackKey] as string | null) || ''
}

async function getTours(): Promise<TourItem[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/tours`, { cache: 'no-store' })

    if (!response.ok) {
      return []
    }

    return response.json()
  } catch {
    return []
  }
}

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

export default async function ToursPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const nav = await getTranslations({ locale, namespace: 'nav' })
  const t = await getTranslations({ locale, namespace: 'tours' })
  const tours = await getTours()
  const jsonLdData = [
    buildBreadcrumbSchema([
      { name: nav('home'), url: buildCanonicalUrl(locale) },
      { name: t('title'), url: buildCanonicalUrl(locale, '/tours') },
    ]),
    ...tours.map((tour) =>
      buildTouristTripSchema({
        locale,
        slug: tour.slug,
        name: getLocalizedValue(tour, 'title', locale),
        description: getLocalizedValue(tour, 'description', locale),
        duration: tour.duration,
        itinerary: getLocalizedValue(tour, 'location', locale) || null,
        image: tour.images[0]?.url ? buildCloudinaryUrl(tour.images[0].url) : null,
      }),
    ),
  ]

  return (
    <>
      <JsonLd data={jsonLdData} />
      <ToursPageClient />
    </>
  )
}
