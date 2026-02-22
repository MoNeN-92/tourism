'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'

interface TourImage {
  id: string
  url: string
  publicId: string
  createdAt: string
}

export default function EditTourPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const tourId = params.id as string

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
    duration: '',
    status: true,
  })
  const [images, setImages] = useState<TourImage[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    fetchTour()
  }, [tourId])

  const fetchTour = async () => {
    try {
      setFetching(true)
      const response = await api.get(`/admin/tours/${tourId}`)
      const tour = response.data
      
      setFormData({
        title_ka: tour.title_ka || '',
        title_en: tour.title_en || '',
        title_ru: tour.title_ru || '',
        description_ka: tour.description_ka || '',
        description_en: tour.description_en || '',
        description_ru: tour.description_ru || '',
        location_ka: tour.location_ka || '',
        location_en: tour.location_en || '',
        location_ru: tour.location_ru || '',
        duration: tour.duration || '',
        status: tour.status ?? true,
      })

      if (tour.images && Array.isArray(tour.images)) {
        setImages(tour.images)
      }

      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tour')
    } finally {
      setFetching(false)
    }
  }

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      setSelectedFiles(files)
      setUploadError('')
    }
  }

  const handleImageUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one image')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadProgress(0)

    const uploaded: TourImage[] = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      try {
        const formDataObj = new FormData()
        formDataObj.append('image', file)

        const uploadResponse = await api.post('/admin/uploads', formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        const { secure_url, public_id } = uploadResponse.data

        const attachResponse = await api.post(`/admin/tours/${tourId}/images`, {
          url: secure_url,
          publicId: public_id,
        })

        uploaded.push(attachResponse.data)
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100))
      } catch (err: any) {
        setUploadError(`Failed to upload "${file.name}": ${err.response?.data?.message || 'Unknown error'}`)
      }
    }

    if (uploaded.length > 0) {
      setImages(prev => [...prev, ...uploaded])
    }

    setSelectedFiles([])
    setUploading(false)
    setUploadProgress(0)

    const fileInput = document.getElementById('image-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return

    try {
      await api.delete(`/admin/tours/images/${imageId}`)
      setImages(prev => prev.filter(img => img.id !== imageId))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete image')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.put(`/admin/tours/${tourId}`, formData)
      router.push(`/${locale}/admin/tours`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update tour')
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading tour...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Tour</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-8">
          
          {/* Georgian Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🇬🇪 Georgian (ქართული)</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title_ka" className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input type="text" id="title_ka" name="title_ka" value={formData.title_ka} onChange={handleChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label htmlFor="description_ka" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea id="description_ka" name="description_ka" value={formData.description_ka} onChange={handleChange} required rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label htmlFor="location_ka" className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input type="text" id="location_ka" name="location_ka" value={formData.location_ka} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
            </div>
          </div>

          {/* English Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🇬🇧 English</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title_en" className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input type="text" id="title_en" name="title_en" value={formData.title_en} onChange={handleChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label htmlFor="description_en" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea id="description_en" name="description_en" value={formData.description_en} onChange={handleChange} required rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label htmlFor="location_en" className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input type="text" id="location_en" name="location_en" value={formData.location_en} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
            </div>
          </div>

          {/* Russian Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🇷🇺 Russian (Русский)</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title_ru" className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input type="text" id="title_ru" name="title_ru" value={formData.title_ru} onChange={handleChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label htmlFor="description_ru" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea id="description_ru" name="description_ru" value={formData.description_ru} onChange={handleChange} required rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label htmlFor="location_ru" className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input type="text" id="location_ru" name="location_ru" value={formData.location_ru} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
            </div>
          </div>

          {/* Common Fields */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">General Information</h2>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
              <input type="text" id="duration" name="duration" value={formData.duration} onChange={handleChange} required placeholder="e.g., 7 days"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="status" name="status" checked={formData.status} onChange={handleCheckbox}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="status" className="ml-2 text-sm font-medium text-gray-700">Active</label>
            </div>
          </div>

          {/* Images Section */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📷 Images</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Images (can select multiple)
                  </label>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    multiple
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Accepted formats: JPG, PNG, GIF, WebP (Max 5MB each). Hold Ctrl/Cmd to select multiple.
                  </p>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected {selectedFiles.length} file(s):</p>
                    <ul className="space-y-1">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <span>🖼️</span>
                          <span>{file.name}</span>
                          <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {uploading && uploadProgress > 0 && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={selectedFiles.length === 0 || uploading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading
                    ? `Uploading ${uploadProgress}%...`
                    : selectedFiles.length > 1
                    ? `Upload ${selectedFiles.length} Images`
                    : 'Upload Image'}
                </button>

                {uploadError && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {uploadError}
                  </div>
                )}
              </div>
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img src={image.url} alt="Tour" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No images uploaded yet</div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex gap-4">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? 'Updating...' : 'Update Tour'}
            </button>
            <button type="button" onClick={() => router.push(`/${locale}/admin/tours`)}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}