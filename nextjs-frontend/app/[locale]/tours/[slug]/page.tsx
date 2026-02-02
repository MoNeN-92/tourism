// app/[locale]/tours/[slug]/page.tsx
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

interface Tour {
  id: string
  slug: string
  title: string
  description: string
  price: number
  duration: string
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

export default async function TourPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
  const { slug } = await params
  const tour: Tour | null = await getTour(slug)
  const t = await getTranslations('tours')

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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="relative h-96 w-full rounded-xl overflow-hidden mb-8">
          <Image
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80"
            alt={tour.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {tour.title}
          </h1>

          <div className="flex gap-4 mb-6">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              {tour.duration}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-blue-600">
                ${tour.price}
              </span>
              <span className="text-sm text-gray-500">{t('perPerson')}</span>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed">
              {tour.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}