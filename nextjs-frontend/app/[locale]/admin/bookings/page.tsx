'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import api from '@/lib/api'

type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
type RoomType = 'single' | 'double' | 'twin' | 'triple' | 'family'
type NoteActionType = 'approve' | 'reject' | 'approveChange' | 'rejectChange'

interface BookingChangeRequest {
  id: string
  requestedDate: string
  reason?: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  adminNote?: string | null
}

interface Booking {
  id: string
  desiredDate: string
  adults: number
  children: number
  roomType: RoomType
  note?: string | null
  adminNote?: string | null
  status: BookingStatus
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  tour: {
    id: string
    slug: string
    title_ka: string
    title_en: string
    title_ru: string
  }
  changeRequests: BookingChangeRequest[]
}

interface NoteDialogState {
  type: NoteActionType
  bookingId?: string
  requestId?: string
}

interface EditFormState {
  desiredDate: string
  adults: string
  children: string
  roomType: RoomType
  adminNote: string
}

function toDateOnly(value: string) {
  return new Date(value).toISOString().slice(0, 10)
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
}

function badgeClass(status: BookingStatus) {
  if (status === 'APPROVED') return 'bg-green-100 text-green-800'
  if (status === 'REJECTED') return 'bg-red-100 text-red-800'
  if (status === 'CANCELLED') return 'bg-gray-100 text-gray-700'
  return 'bg-yellow-100 text-yellow-800'
}

const ROOM_TYPES: RoomType[] = ['single', 'double', 'twin', 'triple', 'family']

export default function AdminBookingsPage() {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const t = useTranslations('admin.bookings')
  const [items, setItems] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<BookingStatus | 'ALL'>('ALL')
  const [actionId, setActionId] = useState<string | null>(null)
  const [noteDialog, setNoteDialog] = useState<NoteDialogState | null>(null)
  const [noteValue, setNoteValue] = useState('')
  const [editTarget, setEditTarget] = useState<Booking | null>(null)
  const [editForm, setEditForm] = useState<EditFormState>({
    desiredDate: '',
    adults: '1',
    children: '0',
    roomType: 'double',
    adminNote: '',
  })

  const getTourTitle = (tour: Booking['tour']) => {
    if (locale === 'ka') return tour.title_ka || tour.title_en
    if (locale === 'ru') return tour.title_ru || tour.title_en
    return tour.title_en || tour.title_ka
  }

  const visibleItems = useMemo(() => {
    if (status === 'ALL') {
      return items
    }
    return items.filter((item) => item.status === status)
  }, [items, status])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/bookings')
      setItems(response.data)
      setError('')
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || t('loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const openNoteDialog = (dialog: NoteDialogState) => {
    setEditTarget(null)
    setNoteDialog(dialog)
    setNoteValue('')
  }

  const openEditDialog = (booking: Booking) => {
    setNoteDialog(null)
    setEditTarget(booking)
    setEditForm({
      desiredDate: toDateOnly(booking.desiredDate),
      adults: String(booking.adults),
      children: String(booking.children),
      roomType: booking.roomType,
      adminNote: booking.adminNote || '',
    })
  }

  const getNoteDialogTitle = (dialogType: NoteActionType) => {
    if (dialogType === 'approve') return t('approve')
    if (dialogType === 'reject') return t('reject')
    if (dialogType === 'approveChange') return `${t('approve')} • ${t('pendingChangeRequests')}`
    return `${t('reject')} • ${t('pendingChangeRequests')}`
  }

  const getNoteErrorMessage = (dialogType: NoteActionType) => {
    if (dialogType === 'approve') return t('approveFailed')
    if (dialogType === 'reject') return t('rejectFailed')
    if (dialogType === 'approveChange') return t('approveChangeFailed')
    return t('rejectChangeFailed')
  }

  const submitNoteAction = async () => {
    if (!noteDialog) return

    const targetId = noteDialog.bookingId || noteDialog.requestId
    if (!targetId) return

    try {
      setActionId(targetId)
      if (noteDialog.type === 'approve') {
        await api.post(`/admin/bookings/${targetId}/approve`, { adminNote: noteValue })
      } else if (noteDialog.type === 'reject') {
        await api.post(`/admin/bookings/${targetId}/reject`, { adminNote: noteValue })
      } else if (noteDialog.type === 'approveChange') {
        await api.post(`/admin/bookings/change-requests/${targetId}/approve`, { adminNote: noteValue })
      } else {
        await api.post(`/admin/bookings/change-requests/${targetId}/reject`, { adminNote: noteValue })
      }

      await fetchBookings()
      setNoteDialog(null)
      setNoteValue('')
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || getNoteErrorMessage(noteDialog.type))
    } finally {
      setActionId(null)
    }
  }

  const submitEdit = async () => {
    if (!editTarget) return

    const adults = Number(editForm.adults)
    const children = Number(editForm.children)

    if (!editForm.desiredDate || Number.isNaN(adults) || adults < 1 || Number.isNaN(children) || children < 0) {
      setError(t('editValidation'))
      return
    }

    try {
      setActionId(editTarget.id)
      await api.patch(`/admin/bookings/${editTarget.id}`, {
        desiredDate: editForm.desiredDate,
        adults,
        children,
        roomType: editForm.roomType,
        adminNote: editForm.adminNote,
      })
      await fetchBookings()
      setEditTarget(null)
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || t('editFailed'))
    } finally {
      setActionId(null)
    }
  }

  if (loading) {
    return <p className="text-gray-600 p-8">{t('loading')}</p>
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <div className="flex flex-wrap gap-2">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as BookingStatus | 'ALL')}
              className="px-3 py-2 rounded-lg border border-gray-300"
            >
              <option value="ALL">{t('allStatuses')}</option>
              <option value="PENDING">{t('pending')}</option>
              <option value="APPROVED">{t('approved')}</option>
              <option value="REJECTED">{t('rejected')}</option>
              <option value="CANCELLED">{t('cancelled')}</option>
            </select>
            <button
              onClick={fetchBookings}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              {t('refresh')}
            </button>
          </div>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700">{error}</div>}

        <div className="space-y-4">
          {visibleItems.map((booking) => {
            const pendingChangeRequests = booking.changeRequests.filter(
              (request) => request.status === 'PENDING',
            )

            return (
              <article key={booking.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{getTourTitle(booking.tour)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {booking.user.firstName} {booking.user.lastName} | {booking.user.email} | {booking.user.phone}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('date')}: {formatDate(booking.desiredDate)} | {t('adults')}: {booking.adults} |{' '}
                      {t('children')}: {booking.children} | {t('room')}: {booking.roomType}
                    </p>
                    {booking.note && (
                      <p className="text-sm text-gray-600 mt-1">
                        {t('userNote')}: {booking.note}
                      </p>
                    )}
                    {booking.adminNote && (
                      <p className="text-sm text-gray-600 mt-1">
                        {t('adminNote')}: {booking.adminNote}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass(booking.status)}`}>
                      {t(booking.status.toLowerCase())}
                    </span>
                    {booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => openNoteDialog({ type: 'approve', bookingId: booking.id })}
                          disabled={actionId === booking.id}
                          className="px-3 py-1.5 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-60"
                        >
                          {t('approve')}
                        </button>
                        <button
                          onClick={() => openNoteDialog({ type: 'reject', bookingId: booking.id })}
                          disabled={actionId === booking.id}
                          className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          {t('reject')}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => openEditDialog(booking)}
                      disabled={actionId === booking.id}
                      className="px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                    >
                      {t('edit')}
                    </button>
                  </div>
                </div>

                {pendingChangeRequests.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('pendingChangeRequests')}</h3>
                    <div className="space-y-2">
                      {pendingChangeRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-lg p-3"
                        >
                          <p className="text-sm text-gray-700">
                            {t('requestFor')} {formatDate(request.requestedDate)}
                            {request.reason ? ` | ${t('reason')}: ${request.reason}` : ''}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openNoteDialog({ type: 'approveChange', requestId: request.id })}
                              disabled={actionId === request.id}
                              className="px-3 py-1.5 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-60"
                            >
                              {t('approve')}
                            </button>
                            <button
                              onClick={() => openNoteDialog({ type: 'rejectChange', requestId: request.id })}
                              disabled={actionId === request.id}
                              className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60"
                            >
                              {t('reject')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            )
          })}

          {visibleItems.length === 0 && <p className="text-gray-600">{t('noItems')}</p>}
        </div>
      </div>

      {noteDialog && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900">{getNoteDialogTitle(noteDialog.type)}</h2>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {noteDialog.type === 'reject' || noteDialog.type === 'rejectChange'
                  ? t('promptRejectionNote')
                  : t('promptOptionalAdminNote')}
              </label>
              <textarea
                value={noteValue}
                onChange={(event) => setNoteValue(event.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setNoteDialog(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {t('close')}
              </button>
              <button
                onClick={submitNoteAction}
                disabled={actionId === (noteDialog.bookingId || noteDialog.requestId)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {actionId === (noteDialog.bookingId || noteDialog.requestId)
                  ? t('saving')
                  : noteDialog.type === 'approve' || noteDialog.type === 'approveChange'
                  ? t('approve')
                  : t('reject')}
              </button>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('edit')}</h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptDesiredDate')}</label>
                <input
                  type="date"
                  value={editForm.desiredDate}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, desiredDate: event.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptRoomType')}</label>
                <select
                  value={editForm.roomType}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, roomType: event.target.value as RoomType }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROOM_TYPES.map((roomType) => (
                    <option key={roomType} value={roomType}>
                      {roomType}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptAdults')}</label>
                <input
                  type="number"
                  min={1}
                  value={editForm.adults}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, adults: event.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptChildren')}</label>
                <input
                  type="number"
                  min={0}
                  value={editForm.children}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, children: event.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('promptAdminNote')}</label>
              <textarea
                rows={3}
                value={editForm.adminNote}
                onChange={(event) => setEditForm((prev) => ({ ...prev, adminNote: event.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditTarget(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {t('close')}
              </button>
              <button
                onClick={submitEdit}
                disabled={actionId === editTarget.id}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {actionId === editTarget.id ? t('saving') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
