'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import api from '@/lib/api'

type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
type RoomType = 'single' | 'double' | 'twin' | 'triple' | 'family'

interface Booking {
  id: string
  desiredDate: string
  adults: number
  children: number
  roomType: RoomType
  note?: string | null
  adminNote?: string | null
  status: BookingStatus
  createdAt: string
  tour: {
    id: string
    slug: string
    title_ka: string
    title_en: string
    title_ru: string
  }
  changeRequests: Array<{
    id: string
    requestedDate: string
    reason?: string | null
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
    adminNote?: string | null
  }>
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
}

function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10)
}

function getStatusStyle(status: BookingStatus) {
  if (status === 'APPROVED') return 'bg-green-100 text-green-800'
  if (status === 'REJECTED') return 'bg-red-100 text-red-800'
  if (status === 'CANCELLED') return 'bg-gray-100 text-gray-700'
  return 'bg-yellow-100 text-yellow-800'
}

export default function AccountBookingsPage() {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const t = useTranslations('account.bookings')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)
  const [changeTarget, setChangeTarget] = useState<Booking | null>(null)
  const [requestedDate, setRequestedDate] = useState('')
  const [changeReason, setChangeReason] = useState('')

  const getTourTitle = (tour: Booking['tour']) => {
    if (locale === 'ka') return tour.title_ka || tour.title_en
    if (locale === 'ru') return tour.title_ru || tour.title_en
    return tour.title_en || tour.title_ka
  }

  const pendingCount = useMemo(
    () => bookings.filter((booking) => booking.status === 'PENDING').length,
    [bookings],
  )

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/bookings/my')
      setBookings(response.data)
      setError('')
    } catch {
      setError(t('failedLoad'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const confirmCancel = async () => {
    if (!cancelTarget) return
    try {
      setProcessingId(cancelTarget.id)
      await api.post(`/bookings/${cancelTarget.id}/cancel`)
      await fetchBookings()
      setCancelTarget(null)
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || t('cancelFailed'))
    } finally {
      setProcessingId(null)
    }
  }

  const submitChangeRequest = async () => {
    if (!changeTarget || !requestedDate) return
    try {
      setProcessingId(changeTarget.id)
      await api.post(`/bookings/${changeTarget.id}/change-request`, {
        requestedDate,
        reason: changeReason,
      })
      await fetchBookings()
      setChangeTarget(null)
      setRequestedDate('')
      setChangeReason('')
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || t('changeFailed'))
    } finally {
      setProcessingId(null)
    }
  }

  const openCancelDialog = (booking: Booking) => {
    setChangeTarget(null)
    setCancelTarget(booking)
  }

  const openChangeDialog = (booking: Booking) => {
    setCancelTarget(null)
    setChangeTarget(booking)
    setRequestedDate(toDateInputValue(booking.desiredDate))
    setChangeReason('')
  }

  if (loading) {
    return <p className="text-gray-600">{t('loading')}</p>
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-600 mt-1">{t('pendingRequests', { count: pendingCount })}</p>
        </div>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          {t('refresh')}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-gray-600">{t('noBookings')}</div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const canEdit = booking.status === 'PENDING' || booking.status === 'APPROVED'

            return (
              <article key={booking.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{getTourTitle(booking.tour)}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('date')}: {formatDate(booking.desiredDate)} | {t('room')}:{' '}
                      {t(`roomType.${booking.roomType}`)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('adults')}: {booking.adults} | {t('children')}: {booking.children}
                    </p>
                    {booking.note && (
                      <p className="text-sm text-gray-600 mt-1">
                        {t('yourNote')}: {booking.note}
                      </p>
                    )}
                    {booking.adminNote && (
                      <p className="text-sm text-gray-600 mt-1">
                        {t('adminNote')}: {booking.adminNote}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(booking.status)}`}>
                      {t(`status.${booking.status}`)}
                    </span>
                    {canEdit && (
                      <>
                        <button
                          onClick={() => openCancelDialog(booking)}
                          disabled={processingId === booking.id}
                          className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          {t('cancel')}
                        </button>
                        <button
                          onClick={() => openChangeDialog(booking)}
                          disabled={processingId === booking.id}
                          className="px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                        >
                          {t('requestDateChange')}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {booking.changeRequests.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('changeRequests')}</h3>
                    <div className="space-y-2">
                      {booking.changeRequests.map((request) => (
                        <div key={request.id} className="text-sm text-gray-600">
                          {t('requested')}: {formatDate(request.requestedDate)} | {t('statusLabel')}:{' '}
                          {t(`status.${request.status}`)}
                          {request.reason ? ` | ${t('reason')}: ${request.reason}` : ''}
                          {request.adminNote ? ` | ${t('admin')}: ${request.adminNote}` : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('cancel')}</h3>
            <p className="text-sm text-gray-600 mt-2">{t('cancelConfirm')}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {t('close')}
              </button>
              <button
                onClick={confirmCancel}
                disabled={processingId === cancelTarget.id}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {processingId === cancelTarget.id ? t('saving') : t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {changeTarget && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('requestDateChange')}</h3>
            <p className="text-sm text-gray-600 mt-2">
              {getTourTitle(changeTarget.tour)} | {t('date')}: {formatDate(changeTarget.desiredDate)}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptNewDate')}</label>
                <input
                  type="date"
                  value={requestedDate}
                  onChange={(event) => setRequestedDate(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptReason')}</label>
                <textarea
                  value={changeReason}
                  onChange={(event) => setChangeReason(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setChangeTarget(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {t('close')}
              </button>
              <button
                onClick={submitChangeRequest}
                disabled={!requestedDate || processingId === changeTarget.id}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {processingId === changeTarget.id ? t('saving') : t('requestDateChange')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
