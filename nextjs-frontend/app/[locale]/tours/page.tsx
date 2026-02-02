// app/[locale]/tours/page.tsx
import { getTranslations } from 'next-intl/server'
import TourCard from '@/components/TourCard'

interface Tour {
  id: string
  slug: string
  title: string
  description: string
  price: number
  duration: string
}

async function getTours(locale: string) {
  try {
    const res = await fetch(`http://localhost:3001/tours?locale=${locale}`, {
      cache: 'no-store'
    })
    if (!res.ok) return []
    return res.json()
  } catch (error) {
    return []
  }
}

export default async function ToursPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const tours: Tour[] = await getTours(locale)
  const t = await getTranslations('tours')

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-600">{t('subtitle')}</p>
      </div>
      
      {tours.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">{t('noTours')}</p>
          <p className="text-gray-400 text-sm mt-2">{t('checkBack')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  )
}