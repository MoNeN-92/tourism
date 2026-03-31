import JsonLd from '@/components/JsonLd'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { buildHotelSchema } from '@/lib/structured-data'

interface PartnerHotel {
  slug: string
  name: string
  starRating: number
  coverImageUrl: string
  shortDescription_ka: string
  shortDescription_en: string
  shortDescription_ru: string
  address: string
}

function getLocalizedDescription(hotel: PartnerHotel, locale: string) {
  const key = `shortDescription_${locale}` as keyof PartnerHotel
  return (hotel[key] as string) || hotel.shortDescription_ka
}

async function getPartnerHotel(slug: string): Promise<PartnerHotel | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/partner-hotels/${slug}`, { cache: 'no-store' })

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch {
    return null
  }
}

export default async function PartnerHotelHead({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const hotel = await getPartnerHotel(slug)

  if (!hotel) {
    return null
  }

  return (
    <JsonLd
      data={buildHotelSchema({
        locale,
        slug: hotel.slug,
        name: hotel.name,
        description: getLocalizedDescription(hotel, locale),
        address: hotel.address,
        image: hotel.coverImageUrl ? buildCloudinaryUrl(hotel.coverImageUrl) : null,
        starRating: hotel.starRating,
      })}
    />
  )
}
