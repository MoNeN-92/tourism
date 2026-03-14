'use client'

import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import { buildCloudinaryUrl } from '@/lib/cloudinary'

type UserRole = 'ADMIN' | 'MODERATOR'

interface PartnerHotelImage {
  id: string
  url: string
  publicId: string
  createdAt: string
}

interface PartnerHotelItem {
  id: string
  slug: string
  name: string
  starRating: number
  coverImageUrl: string
  coverImagePublicId: string
  shortDescription_ka: string
  shortDescription_en: string
  shortDescription_ru: string
  description_ka: string
  description_en: string
  description_ru: string
  address: string
  contactPhone: string
  website: string | null
  isVisible: boolean
  createdAt: string
  updatedAt: string
  images: PartnerHotelImage[]
}

interface GalleryImageDraft {
  id: string
  url: string
  publicId: string
  persisted: boolean
}

interface PartnerHotelForm {
  name: string
  starRating: number
  coverImageUrl: string
  coverImagePublicId: string
  shortDescription_ka: string
  shortDescription_en: string
  shortDescription_ru: string
  description_ka: string
  description_en: string
  description_ru: string
  address: string
  contactPhone: string
  website: string
  isVisible: boolean
  images: GalleryImageDraft[]
}

function emptyForm(): PartnerHotelForm {
  return {
    name: '',
    starRating: 4,
    coverImageUrl: '',
    coverImagePublicId: '',
    shortDescription_ka: '',
    shortDescription_en: '',
    shortDescription_ru: '',
    description_ka: '',
    description_en: '',
    description_ru: '',
    address: '',
    contactPhone: '',
    website: '',
    isVisible: true,
    images: [],
  }
}

function formatDate(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: unknown }).response !== null
  ) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    return response?.data?.message || fallback
  }

  return fallback
}

async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('image', file)

  const response = await api.post('/admin/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data as { secure_url: string; public_id: string }
}

export default function AdminPartnerHotelsPage() {
  const [items, setItems] = useState<PartnerHotelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<UserRole>('MODERATOR')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<PartnerHotelItem | null>(null)
  const [form, setForm] = useState<PartnerHotelForm>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)

  const persistedImages = useMemo(() => form.images.filter((image) => image.persisted), [form.images])
  const pendingImages = useMemo(() => form.images.filter((image) => !image.persisted), [form.images])

  const load = async () => {
    try {
      setLoading(true)
      const [hotelsResponse, meResponse] = await Promise.all([
        api.get('/admin/partner-hotels'),
        api.get('/users/auth/me'),
      ])

      setItems((hotelsResponse.data || []) as PartnerHotelItem[])
      setUserRole((meResponse.data?.role as UserRole | undefined) || 'MODERATOR')
      setError('')
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Failed to load partner hotels'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreateModal = () => {
    setEditingItem(null)
    setForm(emptyForm())
    setError('')
    setShowModal(true)
  }

  const openEditModal = (item: PartnerHotelItem) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      starRating: item.starRating,
      coverImageUrl: item.coverImageUrl,
      coverImagePublicId: item.coverImagePublicId,
      shortDescription_ka: item.shortDescription_ka,
      shortDescription_en: item.shortDescription_en,
      shortDescription_ru: item.shortDescription_ru,
      description_ka: item.description_ka,
      description_en: item.description_en,
      description_ru: item.description_ru,
      address: item.address,
      contactPhone: item.contactPhone,
      website: item.website || '',
      isVisible: item.isVisible,
      images: item.images.map((image) => ({
        id: image.id,
        url: image.url,
        publicId: image.publicId,
        persisted: true,
      })),
    })
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setSubmitting(false)
    setCoverUploading(false)
    setGalleryUploading(false)
  }

  const validateForm = () => {
    if (!form.name.trim()) return 'Hotel name is required.'
    if (!form.coverImageUrl || !form.coverImagePublicId) return 'Cover image is required.'
    if (!form.shortDescription_ka.trim() || !form.shortDescription_en.trim() || !form.shortDescription_ru.trim()) {
      return 'Short descriptions are required in KA / EN / RU.'
    }
    if (!form.description_ka.trim() || !form.description_en.trim() || !form.description_ru.trim()) {
      return 'Full descriptions are required in KA / EN / RU.'
    }
    if (!form.address.trim() || !form.contactPhone.trim()) return 'Address and contact phone are required.'
    return null
  }

  const handleCoverUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setCoverUploading(true)
      const uploaded = await uploadImage(file)
      setForm((prev) => ({
        ...prev,
        coverImageUrl: uploaded.secure_url,
        coverImagePublicId: uploaded.public_id,
      }))
      setError('')
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Cover image upload failed'))
    } finally {
      setCoverUploading(false)
      event.target.value = ''
    }
  }

  const handleGalleryUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    try {
      setGalleryUploading(true)
      const nextImages: GalleryImageDraft[] = []

      for (const file of files) {
        const uploaded = await uploadImage(file)

        if (editingItem) {
          const attachResponse = await api.post(`/admin/partner-hotels/${editingItem.id}/images`, {
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
          })

          nextImages.push({
            id: attachResponse.data.id,
            url: attachResponse.data.url,
            publicId: attachResponse.data.publicId,
            persisted: true,
          })
        } else {
          nextImages.push({
            id: `${uploaded.public_id}-${Date.now()}-${Math.random()}`,
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
            persisted: false,
          })
        }
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...nextImages],
      }))
      setError('')

      if (editingItem) {
        await load()
      }
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Gallery upload failed'))
    } finally {
      setGalleryUploading(false)
      event.target.value = ''
    }
  }

  const handleDeleteImage = async (image: GalleryImageDraft) => {
    try {
      if (image.persisted) {
        setActionId(image.id)
        await api.delete(`/admin/partner-hotels/images/${image.id}`)
      }

      setForm((prev) => ({
        ...prev,
        images: prev.images.filter((item) => item.id !== image.id),
      }))
      setError('')
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Image delete failed'))
    } finally {
      setActionId(null)
    }
  }

  const handleToggleVisibility = async (item: PartnerHotelItem) => {
    try {
      setActionId(item.id)
      await api.patch(`/admin/partner-hotels/${item.id}`, {
        isVisible: !item.isVisible,
      })
      await load()
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Visibility update failed'))
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (item: PartnerHotelItem) => {
    if (userRole !== 'ADMIN') return
    if (!window.confirm(`Delete partner hotel "${item.name}"?`)) return

    try {
      setActionId(item.id)
      await api.delete(`/admin/partner-hotels/${item.id}`)
      await load()
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Delete failed'))
    } finally {
      setActionId(null)
    }
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        name: form.name.trim(),
        starRating: form.starRating,
        coverImageUrl: form.coverImageUrl,
        coverImagePublicId: form.coverImagePublicId,
        shortDescription_ka: form.shortDescription_ka.trim(),
        shortDescription_en: form.shortDescription_en.trim(),
        shortDescription_ru: form.shortDescription_ru.trim(),
        description_ka: form.description_ka.trim(),
        description_en: form.description_en.trim(),
        description_ru: form.description_ru.trim(),
        address: form.address.trim(),
        contactPhone: form.contactPhone.trim(),
        website: form.website.trim() || undefined,
        isVisible: form.isVisible,
      }

      if (editingItem) {
        await api.patch(`/admin/partner-hotels/${editingItem.id}`, payload)
      } else {
        const response = await api.post('/admin/partner-hotels', payload)
        const createdHotelId = response.data.id as string

        for (const image of pendingImages) {
          await api.post(`/admin/partner-hotels/${createdHotelId}/images`, {
            url: image.url,
            publicId: image.publicId,
          })
        }
      }

      await load()
      closeModal()
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Save failed'))
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partner Hotels</h1>
            <p className="text-sm text-gray-500 mt-1">Manage the public hotel showcase shown on the homepage.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Create Partner Hotel
          </button>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700">{error}</div>}

        {loading ? (
          <p className="text-gray-600">Loading partner hotels...</p>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
                  <div className="relative h-56 md:h-full bg-gray-100">
                    {item.coverImageUrl ? (
                      <img
                        src={buildCloudinaryUrl(item.coverImageUrl)}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                            {item.starRating}/5 stars
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              item.isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {item.isVisible ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-3">{item.shortDescription_en}</p>
                      </div>

                      <div className="text-sm text-gray-500">
                        Updated
                        <div className="font-medium text-gray-700">{formatDate(item.updatedAt)}</div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div>
                        <span className="font-medium text-gray-900">Address:</span> {item.address}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Phone:</span> {item.contactPhone}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Website:</span> {item.website || '—'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Gallery:</span> {item.images.length} images
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="min-h-[44px] px-4 py-2 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleVisibility(item)}
                        disabled={actionId === item.id}
                        className="min-h-[44px] px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                      >
                        {item.isVisible ? 'Hide on site' : 'Show on site'}
                      </button>
                      {userRole === 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={actionId === item.id}
                          className="min-h-[44px] px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            No partner hotels yet.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/45 p-4 overflow-y-auto">
          <div className="mx-auto my-4 w-full max-w-6xl rounded-3xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {editingItem ? 'Edit Partner Hotel' : 'Create Partner Hotel'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Cover image, translations, gallery, and visibility all live here.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="min-h-[44px] min-w-[44px] rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                X
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-0">
              <div className="border-b xl:border-b-0 xl:border-r border-gray-200 p-5 sm:p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover image</label>
                  <label className="flex min-h-[220px] cursor-pointer items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center hover:border-blue-400 hover:bg-blue-50/40">
                    <input
                      id="partner-hotel-cover-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                    {form.coverImageUrl ? (
                      <img
                        src={buildCloudinaryUrl(form.coverImageUrl)}
                        alt="Cover preview"
                        className="h-56 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">
                        {coverUploading ? 'Uploading cover...' : 'Click to upload cover image'}
                      </span>
                    )}
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hotel name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                      className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Star rating</label>
                    <select
                      value={form.starRating}
                      onChange={(event) => setForm((prev) => ({ ...prev, starRating: Number(event.target.value) }))}
                      className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3 py-2"
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value} / 5
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                      className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact phone</label>
                    <input
                      type="text"
                      value={form.contactPhone}
                      onChange={(event) => setForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
                      className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={form.website}
                      onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
                      className="w-full min-h-[44px] rounded-xl border border-gray-300 px-3 py-2"
                      placeholder="https://example.com"
                    />
                  </div>

                  <label className="inline-flex min-h-[44px] items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.isVisible}
                      onChange={(event) => setForm((prev) => ({ ...prev, isVisible: event.target.checked }))}
                      className="h-5 w-5"
                    />
                    Visible on site
                  </label>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short description (KA)</label>
                    <textarea
                      rows={4}
                      value={form.shortDescription_ka}
                      onChange={(event) => setForm((prev) => ({ ...prev, shortDescription_ka: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short description (EN)</label>
                    <textarea
                      rows={4}
                      value={form.shortDescription_en}
                      onChange={(event) => setForm((prev) => ({ ...prev, shortDescription_en: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short description (RU)</label>
                    <textarea
                      rows={4}
                      value={form.shortDescription_ru}
                      onChange={(event) => setForm((prev) => ({ ...prev, shortDescription_ru: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full description (KA)</label>
                    <textarea
                      rows={8}
                      value={form.description_ka}
                      onChange={(event) => setForm((prev) => ({ ...prev, description_ka: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full description (EN)</label>
                    <textarea
                      rows={8}
                      value={form.description_en}
                      onChange={(event) => setForm((prev) => ({ ...prev, description_en: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full description (RU)</label>
                    <textarea
                      rows={8}
                      value={form.description_ru}
                      onChange={(event) => setForm((prev) => ({ ...prev, description_ru: event.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Gallery</h3>
                      <p className="text-sm text-gray-500">
                        Upload one or more images. New hotels will attach pending images after the first save.
                      </p>
                    </div>
                    <label className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                      <input
                        id="partner-hotel-gallery-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                        className="hidden"
                      />
                      {galleryUploading ? 'Uploading...' : 'Add Gallery Images'}
                    </label>
                  </div>

                  {form.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      {form.images.map((image) => (
                        <div key={image.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                          <img
                            src={buildCloudinaryUrl(image.url)}
                            alt="Partner hotel gallery"
                            className="h-32 w-full object-cover"
                          />
                          <div className="flex items-center justify-between gap-2 p-2">
                            <span
                              className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                                image.persisted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {image.persisted ? 'Saved' : 'Pending'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(image)}
                              disabled={actionId === image.id}
                              className="min-h-[36px] rounded-lg border border-red-300 px-3 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                      No gallery images uploaded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-200 px-5 py-4 sm:px-6">
              <div className="text-sm text-gray-500">
                Persisted: {persistedImages.length} image(s) | Pending: {pendingImages.length} image(s)
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={closeModal}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || coverUploading || galleryUploading}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Partner Hotel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
