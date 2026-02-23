import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TourDetailClient, { type TourDetail } from './TourDetailClient'
import { absoluteUrl, localizedAlternates, openGraphLocale } from '@/lib/seo'
import { buildCloudinaryUrl } from '@/lib/cloudinary'

function getLocalizedField(
  tour: TourDetail,
  field: 'title' | 'description' | 'location',
  locale: string,
): string {
  const fieldMap: Record<string, keyof TourDetail> = {
    ka: `${field}_ka` as keyof TourDetail,
    en: `${field}_en` as keyof TourDetail,
    ru: `${field}_ru` as keyof TourDetail,
  }

  const localizedFieldKey = fieldMap[locale] || fieldMap.ka
  const localizedValue = tour[localizedFieldKey]
  const fallbackValue = tour[`${field}_ka` as keyof TourDetail]

  return (localizedValue as string) || (fallbackValue as string) || ''
}

async function getTour(slug: string): Promise<TourDetail | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    const response = await fetch(`${apiUrl}/tours/${slug}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const tour = await getTour(slug)

  if (!tour) {
    return {
      title: 'Tour Not Found | Vibe Georgia',
      alternates: localizedAlternates(locale, `/tours/${slug}`),
      robots: {
        index: false,
        follow: true,
      },
    }
  }

  const title = `${getLocalizedField(tour, 'title', locale)} | Vibe Georgia`
  const description = getLocalizedField(tour, 'description', locale).slice(0, 160)
  const ogImage = buildCloudinaryUrl(tour.images[0]?.url || '')

  return {
    title,
    description,
    alternates: localizedAlternates(locale, `/tours/${slug}`),
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/${locale}/tours/${slug}`),
      siteName: 'Vibe Georgia',
      locale: openGraphLocale(locale),
      type: 'article',
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: getLocalizedField(tour, 'title', locale),
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function TourPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const tour = await getTour(slug)

  if (!tour) {
    notFound()
  }

  return <TourDetailClient locale={locale} tour={tour} />
}
