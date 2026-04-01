export interface PartnerHotelImage {
  id: string
  url: string
  publicId: string
  createdAt: string
}

export interface PartnerHotel {
  id: string
  slug: string
  name: string
  starRating: number
  coverImageUrl: string
  shortDescription_ka: string
  shortDescription_en: string
  shortDescription_ru: string
  description_ka: string
  description_en: string
  description_ru: string
  address: string
  contactPhone: string
  website: string | null
  images: PartnerHotelImage[]
}

export function getLocalizedHotelField(
  hotel: PartnerHotel,
  field: 'shortDescription' | 'description',
  locale: string,
): string {
  const fieldMap: Record<string, keyof PartnerHotel> = {
    ka: `${field}_ka` as keyof PartnerHotel,
    en: `${field}_en` as keyof PartnerHotel,
    ru: `${field}_ru` as keyof PartnerHotel,
  }

  const localizedFieldKey = fieldMap[locale] || fieldMap.ka
  const localizedValue = hotel[localizedFieldKey]
  const fallbackValue = hotel[`${field}_ka` as keyof PartnerHotel]

  return (localizedValue as string) || (fallbackValue as string) || ''
}

export async function getPartnerHotels(): Promise<PartnerHotel[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/partner-hotels`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return []
    }

    return response.json()
  } catch {
    return []
  }
}

export async function getPartnerHotel(slug: string): Promise<PartnerHotel | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/partner-hotels/${slug}`, {
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
