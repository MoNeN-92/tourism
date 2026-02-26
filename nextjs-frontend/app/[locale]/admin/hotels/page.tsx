'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'

type UserRole = 'USER' | 'MODERATOR' | 'ADMIN'

interface HotelItem {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

interface HotelForm {
  name: string
  email: string
}

function formatDate(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

export default function AdminHotelsPage() {
  const t = useTranslations('admin.hotels')
  const [items, setItems] = useState<HotelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<UserRole>('MODERATOR')
  const [form, setForm] = useState<HotelForm>({ name: '', email: '' })
  const [editingItem, setEditingItem] = useState<HotelItem | null>(null)
  const [editForm, setEditForm] = useState<HotelForm>({ name: '', email: '' })

  const load = async () => {
    try {
      setLoading(true)
      const [hotelsResponse, meResponse] = await Promise.all([
        api.get('/admin/hotels'),
        api.get('/users/auth/me'),
      ])

      setItems((hotelsResponse.data || []) as HotelItem[])
      setUserRole((meResponse.data?.role as UserRole | undefined) || 'MODERATOR')
      setError('')
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || t('loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError(t('validationRequired'))
      return
    }

    try {
      setActionId('create')
      await api.post('/admin/hotels', {
        name: form.name.trim(),
        email: form.email.trim(),
      })
      setForm({ name: '', email: '' })
      await load()
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || t('failedCreate'))
    } finally {
      setActionId(null)
    }
  }

  const openEditDialog = (item: HotelItem) => {
    setEditingItem(item)
    setEditForm({ name: item.name, email: item.email })
  }

  const handleUpdate = async () => {
    if (!editingItem) return

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setError(t('validationRequired'))
      return
    }

    try {
      setActionId(editingItem.id)
      await api.patch(`/admin/hotels/${editingItem.id}`, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
      })
      setEditingItem(null)
      await load()
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || t('failedUpdate'))
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (item: HotelItem) => {
    if (userRole !== 'ADMIN') return
    const accepted = window.confirm(t('confirmDelete', { name: item.name }))
    if (!accepted) return

    try {
      setActionId(item.id)
      await api.delete(`/admin/hotels/${item.id}`)
      await load()
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || t('failedDelete'))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('title')}</h1>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700">{error}</div>}

        <div className="bg-white border rounded-xl p-4 sm:p-5 mb-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('createTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-2">
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder={t('promptName')}
              className="min-h-[44px] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder={t('promptEmail')}
              className="min-h-[44px] px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCreate}
              disabled={actionId === 'create'}
              className="min-h-[44px] px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {actionId === 'create' ? t('saving') : t('create')}
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600">{t('loading')}</p>
        ) : items.length > 0 ? (
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('name')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('email')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('createdAt')}</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openEditDialog(item)}
                            disabled={actionId === item.id}
                            className="px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                          >
                            {t('edit')}
                          </button>
                          {userRole === 'ADMIN' && (
                            <button
                              onClick={() => handleDelete(item)}
                              disabled={actionId === item.id}
                              className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60"
                            >
                              {t('delete')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">{t('noHotels')}</p>
        )}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('editTitle')}</h2>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptName')}</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptEmail')}</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {t('close')}
              </button>
              <button
                onClick={handleUpdate}
                disabled={actionId === editingItem.id}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {actionId === editingItem.id ? t('saving') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
