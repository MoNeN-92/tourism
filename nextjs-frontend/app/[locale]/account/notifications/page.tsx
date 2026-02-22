'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

export default function AccountNotificationsPage() {
  const t = useTranslations('account.notifications')
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const [listResponse, countResponse] = await Promise.all([
        api.get('/notifications/my'),
        api.get('/notifications/my/unread-count'),
      ])

      setItems(listResponse.data)
      setUnreadCount(countResponse.data.count || 0)
      setError('')
    } catch {
      setError(t('failedLoad'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`)
      await fetchNotifications()
    } catch {
      setError(t('failedMarkRead'))
    }
  }

  const markAllRead = async () => {
    try {
      await api.post('/notifications/my/read-all')
      await fetchNotifications()
    } catch {
      setError(t('failedMarkAll'))
    }
  }

  if (loading) {
    return <p className="text-gray-600">{t('loading')}</p>
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-600 mt-1">{t('unread', { count: unreadCount })}</p>
        </div>
        <div className="flex gap-2">
          <button
          onClick={fetchNotifications}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          {t('refresh')}
        </button>
        <button
          onClick={markAllRead}
          className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
        >
          {t('markAllRead')}
        </button>
      </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-gray-600">{t('noNotifications')}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className={`border rounded-xl p-4 ${
                item.isRead ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.body}</p>
                  <p className="text-xs text-gray-500 mt-2">{formatDate(item.createdAt)}</p>
                </div>

                {!item.isRead && (
                  <button
                    onClick={() => markRead(item.id)}
                    className="px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    {t('markRead')}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
