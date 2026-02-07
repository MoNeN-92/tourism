// app/[locale]/tours/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface TourImage {
  id: string
  url: string
  publicId: string
  createdAt: string
}

interface Tour {
  id: string
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
  status: boolean
  images: TourImage[]
  createdAt: string
  updatedAt: string
}

function getLocalizedField(tour: Tour, field: 'title' | 'description' | 'location', locale: string): string {
  const fieldMap: Record<string, keyof Tour> = {
    ka: `${field}_ka` as keyof Tour,
    en: `${field}_en` as keyof Tour,
    ru: `${field}_ru` as keyof Tour,
  }

  const localizedFieldKey = fieldMap[locale] || fieldMap['ka']
  const localizedValue = tour[localizedFieldKey]
  const fallbackValue = tour[`${field}_ka` as keyof Tour]

  return (localizedValue as string) || (fallbackValue as string) || ''
}

async function getTours() {
  try {
    // განვიხილავთ ცვლადს, თუ არ არსებობს - ვიყენებთ ლოკალჰოსტს
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const res = await fetch(`${apiUrl}/tours`, {
      cache: 'no-store'
    })
    
    if (!res.ok) return []
    return res.json()
  } catch (error) {
    return []
  }
}

export default function ToursPage() {
  const params = useParams()
  const locale = params.locale as string

  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTours = async () => {
      const data = await getTours()
      setTours(data)
      setLoading(false)
    }
    fetchTours()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-gray-600">Loading tours...</p>
        </div>
      </div>
    )
  }

  if (tours.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">🏔️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Tours Available</h2>
          <p className="text-gray-600">Check back later for exciting tour packages!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Page Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Explore Tours
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Discover amazing destinations and unforgettable experiences
          </p>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {tours.map((tour) => {
            const title = getLocalizedField(tour, 'title', locale)
            const location = getLocalizedField(tour, 'location', locale)
            const coverImage = tour.images.length > 0 
              ? tour.images[0].url 
              : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'

            return (
              <Link
                key={tour.id}
                href={`/${locale}/tours/${tour.slug}`}
                className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden bg-gray-200">
                  <Image
                    src={coverImage}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Duration Badge */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
                    <span className="text-xs sm:text-sm font-medium text-gray-900 flex items-center gap-1">
                      ⏱️ {tour.duration}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5">
                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {title}
                  </h3>

                  {/* Location */}
                  {location && (
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm sm:text-base mb-3">
                      <span className="text-base">📍</span>
                      <span className="truncate">{location}</span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-500">View Details</span>
                    <svg 
                      className="w-5 h-5 text-blue-600 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}