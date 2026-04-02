'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import TourLocalizedFields from '@/components/admin/TourLocalizedFields'

export default function CreateTourPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [formData, setFormData] = useState({
    title_ka: '',
    title_en: '',
    title_ru: '',
    description_ka: '',
    description_en: '',
    description_ru: '',
    location_ka: '',
    location_en: '',
    location_ru: '',
    itinerary_ka: '',
    itinerary_en: '',
    itinerary_ru: '',
    highlights_ka: '',
    highlights_en: '',
    highlights_ru: '',
    idealFor_ka: '',
    idealFor_en: '',
    idealFor_ru: '',
    includes_ka: '',
    includes_en: '',
    includes_ru: '',
    excludes_ka: '',
    excludes_en: '',
    excludes_ru: '',
    pickup_ka: '',
    pickup_en: '',
    pickup_ru: '',
    bestSeason_ka: '',
    bestSeason_en: '',
    bestSeason_ru: '',
    duration: '',
    status: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const target = e.target as HTMLInputElement
    
    setFormData(prev => ({
      ...prev,
      [name]: target.type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }))
  }

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      status: e.target.checked
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post('/admin/tours', formData)
      router.push(`/${locale}/admin/tours`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tour')
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Tour</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-8">
          
          <TourLocalizedFields localeKey="ka" formData={formData} onChange={handleChange} />
          <TourLocalizedFields localeKey="en" formData={formData} onChange={handleChange} />
          <TourLocalizedFields localeKey="ru" formData={formData} onChange={handleChange} />

          {/* Common Fields */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">General Information</h2>

           

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                placeholder="e.g., 7 days"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="status"
                name="status"
                checked={formData.status}
                onChange={handleCheckbox}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="status" className="ml-2 text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Tour'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${locale}/admin/tours`)}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
