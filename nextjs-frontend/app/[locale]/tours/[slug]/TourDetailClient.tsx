'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import SwipeGallery from '@/components/SwipeGallery'

interface TourImage {
  id: string
  url: string
  publicId: string
  createdAt: string
}

export interface TourDetail {
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

interface TourDetailClientProps {
  tour: TourDetail
  locale: string
}

export default function TourDetailClient({ tour, locale }: TourDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

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

  const title = getLocalizedField(tour, 'title', locale)
  const description = getLocalizedField(tour, 'description', locale)
  const location = getLocalizedField(tour, 'location', locale)

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div
            className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] w-full rounded-lg sm:rounded-xl overflow-hidden mb-6 sm:mb-8 cursor-pointer shadow-lg"
            onClick={() => tour.images.length > 0 && openLightbox(0)}
          >
            {tour.images.length > 0 ? (
              <Image
                src={buildCloudinaryUrl(tour.images[0].url)}
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

          <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{title}</h1>

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

          {tour.images.length > 1 && (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 lg:p-8 mt-6 sm:mt-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">📷 Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {tour.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-md sm:rounded-lg overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => openLightbox(index)}
                  >
                    <Image
                      src={buildCloudinaryUrl(image.url)}
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

      {selectedImageIndex !== null && tour.images[selectedImageIndex] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={closeLightbox}>
          <div
            className="relative w-full h-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] p-2 sm:p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <SwipeGallery
              images={tour.images.map((image, index) => ({
                id: image.id,
                src: buildCloudinaryUrl(image.url),
                alt: `${title} - Image ${index + 1}`,
              }))}
              initialIndex={selectedImageIndex}
              onClose={closeLightbox}
            />
          </div>
        </div>
      )}
    </>
  )
}
