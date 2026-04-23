'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getAuthorityHubCopy } from '@/lib/authority'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import SwipeGallery from '@/components/SwipeGallery'
import { trackMetaPixelEvent } from '@/lib/tracking'

interface TourImage {
  id: string
  url: string
  publicId: string
  createdAt: string
}

interface RelatedTourCard {
  slug: string
  title: string
  description: string
  duration: string
  imageUrl: string | null
}

interface RelatedBlogCard {
  slug: string
  title: string
  excerpt: string
  imageUrl: string | null
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
  itinerary_ka?: string | null
  itinerary_en?: string | null
  itinerary_ru?: string | null
  highlights_ka?: string | null
  highlights_en?: string | null
  highlights_ru?: string | null
  idealFor_ka?: string | null
  idealFor_en?: string | null
  idealFor_ru?: string | null
  includes_ka?: string | null
  includes_en?: string | null
  includes_ru?: string | null
  excludes_ka?: string | null
  excludes_en?: string | null
  excludes_ru?: string | null
  pickup_ka?: string | null
  pickup_en?: string | null
  pickup_ru?: string | null
  bestSeason_ka?: string | null
  bestSeason_en?: string | null
  bestSeason_ru?: string | null
  duration: string
  status: boolean
  images: TourImage[]
  createdAt: string
  updatedAt: string
}

function getLocalizedField(
  tour: TourDetail,
  field:
    | 'title'
    | 'description'
    | 'location'
    | 'itinerary'
    | 'highlights'
    | 'idealFor'
    | 'includes'
    | 'excludes'
    | 'pickup'
    | 'bestSeason',
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

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getSectionLabels(locale: string) {
  if (locale === 'ka') {
    return {
      itinerary: 'მარშრუტი',
      highlights: 'მთავარი აქცენტები',
      idealFor: 'ვისთვის არის საუკეთესო',
      includes: 'რა შედის',
      excludes: 'რა არ შედის',
      pickup: 'აყვანა / შეხვედრის ადგილი',
      bestSeason: 'საუკეთესო სეზონი',
      gallery: 'გალერეა',
      relatedTours: 'მსგავსი ტურები',
      relatedPosts: 'სამოგზაურო გზამკვლევები',
      contactCtaTitle: 'გჭირდება დახმარება სწორი ტურის არჩევაში?',
      contactCtaText:
        'მოგვწერე შენი თარიღები, ინტერესები და მოგზაურობის სტილი, და დაგეხმარებით საქართველოში სწორი მარშრუტის შერჩევაში.',
      contactCtaButton: 'დაგვიკავშირდი',
      toursCtaButton: 'ყველა ტურის ნახვა',
    }
  }

  if (locale === 'ru') {
    return {
      itinerary: 'Маршрут',
      highlights: 'Главные акценты',
      idealFor: 'Для кого лучше всего',
      includes: 'Что включено',
      excludes: 'Что не включено',
      pickup: 'Место встречи / трансфер',
      bestSeason: 'Лучший сезон',
      gallery: 'Галерея',
      relatedTours: 'Похожие туры',
      relatedPosts: 'Путеводители',
      contactCtaTitle: 'Нужна помощь с выбором тура?',
      contactCtaText:
        'Напишите нам ваши даты, интересы и стиль путешествия, и мы поможем подобрать подходящий маршрут по Грузии.',
      contactCtaButton: 'Связаться с нами',
      toursCtaButton: 'Смотреть все туры',
    }
  }

  return {
    itinerary: 'Itinerary',
    highlights: 'Highlights',
    idealFor: 'Ideal For',
    includes: 'What Is Included',
    excludes: 'What Is Not Included',
    pickup: 'Pickup / Meeting Point',
    bestSeason: 'Best Season',
    gallery: 'Gallery',
    relatedTours: 'Related Tours',
    relatedPosts: 'Travel Guides',
    contactCtaTitle: 'Need help choosing the right tour?',
    contactCtaText:
      'Tell us your travel dates, style, and interests, and we will help you build the right route in Georgia.',
    contactCtaButton: 'Contact Us',
    toursCtaButton: 'View All Tours',
  }
}

interface TourDetailClientProps {
  tour: TourDetail
  locale: string
  relatedTours: RelatedTourCard[]
  relatedPosts: RelatedBlogCard[]
}

export default function TourDetailClient({
  tour,
  locale,
  relatedTours,
  relatedPosts,
}: TourDetailClientProps) {
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
  const itinerary = getLocalizedField(tour, 'itinerary', locale)
  const highlights = splitLines(getLocalizedField(tour, 'highlights', locale))
  const idealFor = splitLines(getLocalizedField(tour, 'idealFor', locale))
  const includes = splitLines(getLocalizedField(tour, 'includes', locale))
  const excludes = splitLines(getLocalizedField(tour, 'excludes', locale))
  const pickup = getLocalizedField(tour, 'pickup', locale)
  const bestSeason = getLocalizedField(tour, 'bestSeason', locale)
  const labels = getSectionLabels(locale)
  const authority = getAuthorityHubCopy(locale)

  useEffect(() => {
    trackMetaPixelEvent('ViewContent', {
      content_ids: tour.id,
      content_name: title,
      content_type: 'product',
    })
  }, [title, tour.id])

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

          {(itinerary || highlights.length > 0 || idealFor.length > 0 || includes.length > 0 || excludes.length > 0 || pickup || bestSeason) && (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 lg:p-8 mt-6 sm:mt-8">
              <div className="grid gap-6 lg:grid-cols-2">
                {itinerary && (
                  <section className="lg:col-span-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{labels.itinerary}</h2>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{itinerary}</p>
                  </section>
                )}

                {highlights.length > 0 && (
                  <section>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{labels.highlights}</h2>
                    <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                      {highlights.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {idealFor.length > 0 && (
                  <section>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{labels.idealFor}</h2>
                    <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                      {idealFor.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {includes.length > 0 && (
                  <section>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{labels.includes}</h2>
                    <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                      {includes.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-2 w-2 rounded-full bg-green-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {excludes.length > 0 && (
                  <section>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{labels.excludes}</h2>
                    <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                      {excludes.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-2 w-2 rounded-full bg-red-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {pickup && (
                  <section>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{labels.pickup}</h2>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{pickup}</p>
                  </section>
                )}

                {bestSeason && (
                  <section>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{labels.bestSeason}</h2>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{bestSeason}</p>
                  </section>
                )}
              </div>
            </div>
          )}

          {(relatedTours.length > 0 || relatedPosts.length > 0) && (
            <div className="grid gap-6 mt-6 sm:mt-8 lg:grid-cols-2">
              {relatedTours.length > 0 && (
                <section className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 lg:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{labels.relatedTours}</h2>
                  <div className="space-y-4">
                    {relatedTours.map((item) => (
                      <a
                        key={item.slug}
                        href={`/${locale}/tours/${item.slug}`}
                        className="flex gap-4 rounded-xl border border-gray-100 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                      >
                        <div className="relative h-24 w-28 overflow-hidden rounded-lg bg-gray-100 shrink-0">
                          {item.imageUrl ? (
                            <Image
                              src={buildCloudinaryUrl(item.imageUrl)}
                              alt={item.title}
                              fill
                              sizes="112px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                          <p className="mt-2 text-sm text-gray-500">⏱️ {item.duration}</p>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.description}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {relatedPosts.length > 0 && (
                <section className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 lg:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{labels.relatedPosts}</h2>
                  <div className="space-y-4">
                    {relatedPosts.map((item) => (
                      <a
                        key={item.slug}
                        href={`/${locale}/blog/${item.slug}`}
                        className="flex gap-4 rounded-xl border border-gray-100 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                      >
                        <div className="relative h-24 w-28 overflow-hidden rounded-lg bg-gray-100 shrink-0">
                          {item.imageUrl ? (
                            <Image
                              src={buildCloudinaryUrl(item.imageUrl)}
                              alt={item.title}
                              fill
                              sizes="112px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-3">{item.excerpt}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          <section className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl border border-[#e5dfd4] bg-[#fffaf1] px-5 py-6 sm:px-8 sm:py-8 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b6f3d]">
                  {authority.heroEyebrow}
                </p>
                <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-[#101820]">
                  {authority.title}
                </h2>
                <p className="mt-3 text-sm sm:text-base leading-7 text-[#576273]">
                  {authority.summaryText}
                </p>
              </div>
              <Link
                href={`/${locale}/travel-experts`}
                className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[#101820] px-6 text-sm font-semibold text-[#101820] transition-colors hover:bg-[#101820] hover:text-white"
              >
                {authority.inlineCtaLabel}
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {authority.metrics.map((metric) => (
                <article key={metric.label} className="rounded-2xl border border-[#e5dfd4] bg-white p-5">
                  <p className="text-2xl font-semibold text-[#101820]">{metric.value}</p>
                  <h3 className="mt-3 text-base font-semibold text-[#101820]">{metric.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#576273]">{metric.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl bg-[#101820] px-5 py-6 sm:px-8 sm:py-8 text-white shadow-lg">
            <div className="max-w-3xl">
              <h2 className="text-2xl sm:text-3xl font-bold">{labels.contactCtaTitle}</h2>
              <p className="mt-3 text-sm sm:text-base leading-7 text-white/80">{labels.contactCtaText}</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={`/${locale}/contact`}
                className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#101820] transition-colors hover:bg-[#f3efe5]"
              >
                {labels.contactCtaButton}
              </a>
              <a
                href={`/${locale}/tours`}
                className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {labels.toursCtaButton}
              </a>
            </div>
          </section>

          {tour.images.length > 1 && (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 lg:p-8 mt-6 sm:mt-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">📷 {labels.gallery}</h2>
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
