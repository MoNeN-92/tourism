import JsonLd from '@/components/JsonLd'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { buildTouristTripSchema } from '@/lib/structured-data'

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

function getLocalizedValue(tour: TourItem, field: 'title' | 'description' | 'location', locale: string) {
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

export default async function ToursHead({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const tours = await getTours()

  if (tours.length === 0) {
    return null
  }

  return (
    <JsonLd
      data={tours.map((tour) =>
        buildTouristTripSchema({
          locale,
          slug: tour.slug,
          name: getLocalizedValue(tour, 'title', locale),
          description: getLocalizedValue(tour, 'description', locale),
          duration: tour.duration,
          itinerary: getLocalizedValue(tour, 'location', locale) || null,
          image: tour.images[0]?.url ? buildCloudinaryUrl(tour.images[0].url) : null,
        }),
      )}
    />
  )
}
