'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'

interface UserItem {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  isActive: boolean
  lastLoginAt?: string | null
  createdAt: string
}

interface UsersResponse {
  items: UserItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface UserEditForm {
  firstName: string
  lastName: string
  phone: string
}

function formatDate(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

export default function AdminUsersPage() {
  const t = useTranslations('admin.users')
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [editForm, setEditForm] = useState<UserEditForm>({
    firstName: '',
    lastName: '',
    phone: '',
  })

  const fetchUsers = async (searchValue = search) => {
    try {
      setLoading(true)
      const query = searchValue ? `?search=${encodeURIComponent(searchValue)}` : ''
      const response = await api.get(`/admin/users${query}`)
      setData(response.data)
      setError('')
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || t('loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers('')
  }, [])

  const handleToggleActive = async (item: UserItem) => {
    try {
      setActionId(item.id)
      await api.patch(`/admin/users/${item.id}`, {
        isActive: !item.isActive,
      })
      await fetchUsers()
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || t('failedUpdate'))
    } finally {
      setActionId(null)
    }
  }

  const handleEdit = async () => {
    if (!editingUser) return
    try {
      if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.phone.trim()) {
        setError(t('validationRequired'))
        return
      }

      setActionId(editingUser.id)
      await api.patch(`/admin/users/${editingUser.id}`, {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        phone: editForm.phone.trim(),
      })
      await fetchUsers()
      setEditingUser(null)
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || t('failedEdit'))
    } finally {
      setActionId(null)
    }
  }

  const openEditDialog = (item: UserItem) => {
    setEditForm({
      firstName: item.firstName,
      lastName: item.lastName,
      phone: item.phone,
    })
    setEditingUser(item)
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className="px-3 py-2 rounded-lg border border-gray-300 min-w-[240px]"
            />
            <button
              onClick={() => fetchUsers()}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              {t('search')}
            </button>
          </div>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700">{error}</div>}

        {loading ? (
          <p className="text-gray-600">{t('loading')}</p>
        ) : data && data.items.length > 0 ? (
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('user')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('phone')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('lastLogin')}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">
                        {item.firstName} {item.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{item.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.lastLoginAt ? formatDate(item.lastLoginAt) : t('never')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleToggleActive(item)}
                          disabled={actionId === item.id}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-60"
                        >
                          {item.isActive ? t('deactivate') : t('activate')}
                        </button>
                        <button
                          onClick={() => openEditDialog(item)}
                          disabled={actionId === item.id}
                          className="px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                        >
                          {t('edit')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">{t('noUsers')}</p>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('edit')}</h2>
            <p className="text-sm text-gray-600 mt-1">{editingUser.email}</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptFirstName')}</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptLastName')}</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptPhone')}</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {t('close')}
              </button>
              <button
                onClick={handleEdit}
                disabled={actionId === editingUser.id}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {actionId === editingUser.id ? t('saving') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
