import JsonLd from '@/components/JsonLd'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { buildTouristTripSchema } from '@/lib/structured-data'

interface TourDetail {
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

function getLocalizedValue(tour: TourDetail, field: 'title' | 'description' | 'location', locale: string) {
  const key = `${field}_${locale}` as keyof TourDetail
  const fallbackKey = `${field}_ka` as keyof TourDetail
  return (tour[key] as string | null) || (tour[fallbackKey] as string | null) || ''
}

async function getTour(slug: string): Promise<TourDetail | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/tours/${slug}`, { cache: 'no-store' })

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch {
    return null
  }
}

export default async function TourHead({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const tour = await getTour(slug)

  if (!tour) {
    return null
  }

  return (
    <JsonLd
      data={buildTouristTripSchema({
        locale,
        slug: tour.slug,
        name: getLocalizedValue(tour, 'title', locale),
        description: getLocalizedValue(tour, 'description', locale),
        duration: tour.duration,
        itinerary: getLocalizedValue(tour, 'location', locale) || null,
        image: tour.images[0]?.url ? buildCloudinaryUrl(tour.images[0].url) : null,
      })}
    />
  )
}
