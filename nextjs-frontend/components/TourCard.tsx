// components/TourCard.tsx
'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

interface Tour {
  id: string
  title: string
  description: string
  price: number
  duration: string
  image?: string // დავამატოთ image ინტერფეისში
}

interface TourCardProps {
  tour: Tour
}

export default function TourCard({ tour }: TourCardProps) {
  const t = useTranslations('tours')
  
  // თუ ბაზიდან სურათი არ მოვიდა, გამოვიყენოთ fallback სურათი
  const tourImage = tour.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80";
  
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="relative h-48 w-full bg-gray-200">
        <Image
          src={tourImage} // ახლა უკვე დინამიურ ლინკს იყენებს
          alt={tour.title}
          fill
          unoptimized // ეს აგვარებს 400 ერორს
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {tour.title}
        </h3>
        <p className="text-gray-600 mb-6 line-clamp-2 text-sm leading-relaxed flex-1">
          {tour.description}
        </p>
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-blue-600">
              ${tour.price}
            </span>
            <span className="text-sm text-gray-500">{t('perPerson')}</span>
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {tour.duration}
          </div>
        </div>
      </div>
    </div>
  )
}