'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

interface Tour {
  id: string
  title_ka: string
  title_en: string
  title_ru: string
  description_ka: string
  description_en: string
  description_ru: string
  slug: string
  price: number
  duration: string
  status: boolean
}

export default function ToursPage() {
  const params = useParams()
  const locale = params.locale as string
  
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTours()
  }, [])

  const fetchTours = async () => {
    try {
      const response = await api.get('/tours')
      setTours(response.data)
    } catch (err) {
      console.error('Failed to load tours:', err)
    } finally {
      setLoading(false)
    }
  }

  // Select title based on locale
  const getTitle = (tour: Tour) => {
    if (locale === 'ka') return tour.title_ka
    if (locale === 'ru') return tour.title_ru
    return tour.title_en
  }

  const getDescription = (tour: Tour) => {
    if (locale === 'ka') return tour.description_ka
    if (locale === 'ru') return tour.description_ru
    return tour.description_en
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-500">Loading tours...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          {locale === 'ka' ? 'ჩვენი ტურები' : locale === 'ru' ? 'Наши туры' : 'Our Tours'}
        </h1>

        {tours.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {locale === 'ka' ? 'ტურები არ არის' : locale === 'ru' ? 'Туров нет' : 'No tours available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <Link
                key={tour.id}
                href={`/${locale}/tours/${tour.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {getTitle(tour)}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {getDescription(tour)}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      ${tour.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      {tour.duration}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}