// app/[locale]/tours/[slug]/page.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

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

async function getTour(slug: string) {
  try {
    const res = await fetch(`http://localhost:3001/tours/${slug}`, {
      cache: 'no-store'
    })
    if (!res.ok) return null
    return res.json()
  } catch (error) {
    return null
  }
}

export default function TourPage() {
  const params = useParams()
  const slug = params.slug as string
  const locale = params.locale as string
  const t = useTranslations('tours')

  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchTour = async () => {
      const data = await getTour(slug)
      setTour(data)
      setLoading(false)
    }
    fetchTour()
  }, [slug])

  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedImageIndex])

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index)
  }

  const closeLightbox = () => {
    setSelectedImageIndex(null)
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (tour && selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % tour.images.length)
    }
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (tour && selectedImageIndex !== null) {
      setSelectedImageIndex(
        selectedImageIndex === 0 ? tour.images.length - 1 : selectedImageIndex - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('notFound')}</h1>
          <p className="text-gray-600">{t('notFoundDesc')}</p>
        </div>
      </div>
    )
  }

  const title = getLocalizedField(tour, 'title', locale)
  const description = getLocalizedField(tour, 'description', locale)
  const location = getLocalizedField(tour, 'location', locale)

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Image */}
          <div 
            className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] w-full rounded-lg sm:rounded-xl overflow-hidden mb-6 sm:mb-8 cursor-pointer shadow-lg"
            onClick={() => tour.images.length > 0 && openLightbox(0)}
          >
            {tour.images.length > 0 ? (
              <Image
                src={tour.images[0].url}
                alt={title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              />
            ) : (
              <Image
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80"
                alt={title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </div>

          {/* Tour Info Card */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {title}
            </h1>

            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-blue-50 text-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                ⏱️ {tour.duration}
              </div>
              {location && (
                <div className="bg-gray-50 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                  <span>📍</span>
                  <span className="truncate max-w-[150px] sm:max-w-none">{location}</span>
                </div>
              )}
            </div>

            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
              <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          </div>

          {/* Gallery Section */}
          {tour.images.length > 1 && (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 lg:p-8 mt-6 sm:mt-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                📷 Gallery
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {tour.images.map((image, index) => (
                  <div 
                    key={image.id} 
                    className="relative aspect-square rounded-md sm:rounded-lg overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => openLightbox(index)}
                  >
                    <Image
                      src={image.url}
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal - Responsive with Navigation */}
      {selectedImageIndex !== null && tour && tour.images[selectedImageIndex] && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white text-3xl sm:text-4xl lg:text-5xl font-light hover:text-gray-300 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-black/50 rounded-full"
            onClick={closeLightbox}
            aria-label="Close"
          >
            ×
          </button>

          {/* Image Counter */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 text-white text-sm sm:text-base bg-black/50 px-3 py-1.5 rounded-full z-20">
            {selectedImageIndex + 1} / {tour.images.length}
          </div>
          
          {/* Navigation Buttons */}
          {tour.images.length > 1 && (
            <>
              {/* Left Half - Previous */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1/2 cursor-w-resize flex items-center justify-start pl-2 sm:pl-4 group"
                onClick={goToPrevious}
              >
                <button
                  className="bg-black/50 text-white p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Previous"
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              {/* Right Half - Next */}
              <div
                className="absolute right-0 top-0 bottom-0 w-1/2 cursor-e-resize flex items-center justify-end pr-2 sm:pr-4 group"
                onClick={goToNext}
              >
                <button
                  className="bg-black/50 text-white p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Next"
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* Image Container */}
          <div className="relative w-full h-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] p-2 sm:p-4">
            <Image
              src={tour.images[selectedImageIndex].url}
              alt={`${title} - Image ${selectedImageIndex + 1}`}
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
              sizes="100vw"
              quality={100}
            />
          </div>
        </div>
      )}
    </>
  )
}