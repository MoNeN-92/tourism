'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'

type BookingLifecycleStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
type BookingServiceStatus = 'PENDING' | 'COMPLETED'

interface ChangeRequest {
  id: string
  requestedDate: string
  reason: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  adminNote: string | null
  createdAt: string
}

interface Booking {
  id: string
  userId: string | null
  guestName: string | null
  guestEmail: string | null
  guestPhone: string | null
  tourId: string | null
  desiredDate: string | null
  adults: number | null
  children: number | null
  roomType: string | null
  hotelName: string | null
  hotelCheckIn: string | null
  hotelCheckOut: string | null
  hotelRoomType: string | null
  hotelGuests: number | null
  hotelNotes: string | null
  totalPrice: number
  amountPaid: number
  balanceDue: number
  note: string | null
  adminNote: string | null
  serviceStatus: BookingServiceStatus
  status: BookingLifecycleStatus
  approvedAt: string | null
  rejectedAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  } | null
  tour: {
    id: string
    title_ka: string
    title_en: string
    title_ru: string
    slug: string
  } | null
  changeRequests: ChangeRequest[]
}

interface AdminUserOption {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface AdminTourOption {
  id: string
  slug: string
  title_ka: string
  title_en: string
  title_ru: string
}

interface BookingForm {
  userId: string
  guestName: string
  guestEmail: string
  guestPhone: string
  includeTour: boolean
  tourId: string
  desiredDate: string
  adults: number
  children: number
  roomType: string
  includeHotel: boolean
  hotelName: string
  hotelCheckIn: string
  hotelCheckOut: string
  hotelRoomType: string
  hotelGuests: number
  hotelNotes: string
  totalPrice: number
  amountPaid: number
  status: BookingLifecycleStatus
  serviceStatus: BookingServiceStatus
  note: string
  adminNote: string
}

const STATUS_COLORS: Record<BookingLifecycleStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-700',
}

const STATUS_LABELS: Record<BookingLifecycleStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}

const SERVICE_STATUS_COLORS: Record<BookingServiceStatus, string> = {
  PENDING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  single: 'Single',
  double: 'Double',
  twin: 'Twin',
  triple: 'Triple',
  family: 'Family',
}

function emptyForm(): BookingForm {
  const today = new Date().toISOString().slice(0, 10)

  return {
    userId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    includeTour: true,
    tourId: '',
    desiredDate: today,
    adults: 1,
    children: 0,
    roomType: 'double',
    includeHotel: false,
    hotelName: '',
    hotelCheckIn: '',
    hotelCheckOut: '',
    hotelRoomType: '',
    hotelGuests: 1,
    hotelNotes: '',
    totalPrice: 0,
    amountPaid: 0,
    status: 'APPROVED',
    serviceStatus: 'PENDING',
    note: '',
    adminNote: '',
  }
}

function toDateInput(value: string | null | undefined): string {
  if (!value) {
    return ''
  }

  return value.slice(0, 10)
}

function toNumber(value: number | null | undefined, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export default function AdminBookingsPage() {
  const params = useParams()
  const locale = (params.locale as string) || 'ka'

  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<AdminUserOption[]>([])
  const [tours, setTours] = useState<AdminTourOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<'' | BookingLifecycleStatus>('')
  const [filterServiceStatus, setFilterServiceStatus] = useState<'' | BookingServiceStatus>('')
  const [search, setSearch] = useState('')

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [form, setForm] = useState<BookingForm>(emptyForm())
  const [submitLoading, setSubmitLoading] = useState(false)

  const getTourTitle = (tour: Booking['tour']) => {
    if (!tour) return 'Hotel only'
    if (locale === 'ka') return tour.title_ka || tour.title_en
    if (locale === 'ru') return tour.title_ru || tour.title_en
    return tour.title_en || tour.title_ka
  }

  const getTourOptionTitle = (tour: AdminTourOption) => {
    if (locale === 'ka') return tour.title_ka || tour.title_en
    if (locale === 'ru') return tour.title_ru || tour.title_en
    return tour.title_en || tour.title_ka
  }

  const getUserLabel = (user: AdminUserOption) => `${user.firstName} ${user.lastName} (${user.email})`

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase()

    return bookings.filter((booking) => {
      if (filterStatus && booking.status !== filterStatus) {
        return false
      }

      if (filterServiceStatus && booking.serviceStatus !== filterServiceStatus) {
        return false
      }

      if (!term) {
        return true
      }

      const customerName = booking.user
        ? `${booking.user.firstName} ${booking.user.lastName}`
        : booking.guestName || ''

      return (
        booking.id.toLowerCase().includes(term) ||
        customerName.toLowerCase().includes(term) ||
        (booking.user?.email || booking.guestEmail || '').toLowerCase().includes(term) ||
        (booking.hotelName || '').toLowerCase().includes(term) ||
        (booking.tour?.title_en || booking.tour?.title_ka || booking.tour?.title_ru || '')
          .toLowerCase()
          .includes(term)
      )
    })
  }, [bookings, filterServiceStatus, filterStatus, search])

  const liveBalanceDue = Math.max(0, form.totalPrice - form.amountPaid)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()

      if (filterStatus) {
        queryParams.set('status', filterStatus)
      }

      if (filterServiceStatus) {
        queryParams.set('serviceStatus', filterServiceStatus)
      }

      const query = queryParams.toString()
      const response = await api.get(`/admin/bookings${query ? `?${query}` : ''}`)
      setBookings(response.data)
      setError('')
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const fetchCreateOptions = async () => {
    try {
      const [usersResponse, toursResponse] = await Promise.all([
        api.get('/admin/users?page=1&pageSize=1000'),
        api.get('/admin/tours'),
      ])

      const userItems = (usersResponse.data?.items || []) as AdminUserOption[]
      const tourItems = (toursResponse.data || []) as AdminTourOption[]

      setUsers(userItems)
      setTours(tourItems)

      setForm((previous) => ({
        ...previous,
        tourId: previous.tourId || tourItems[0]?.id || '',
      }))
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Failed to load users/tours')
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [filterStatus, filterServiceStatus])

  useEffect(() => {
    fetchCreateOptions()
  }, [])

  const openCreateModal = () => {
    setEditingBooking(null)
    setForm((previous) => ({
      ...emptyForm(),
      tourId: previous.tourId || tours[0]?.id || '',
    }))
    setShowFormModal(true)
  }

  const openEditModal = (booking: Booking) => {
    setEditingBooking(booking)
    setForm({
      userId: booking.user?.id || booking.userId || '',
      guestName: booking.guestName || '',
      guestEmail: booking.guestEmail || '',
      guestPhone: booking.guestPhone || '',
      includeTour: Boolean(booking.tourId),
      tourId: booking.tourId || tours[0]?.id || '',
      desiredDate: toDateInput(booking.desiredDate),
      adults: toNumber(booking.adults, 1),
      children: toNumber(booking.children, 0),
      roomType: booking.roomType || 'double',
      includeHotel: Boolean(
        booking.hotelName || booking.hotelCheckIn || booking.hotelCheckOut || booking.hotelRoomType,
      ),
      hotelName: booking.hotelName || '',
      hotelCheckIn: toDateInput(booking.hotelCheckIn),
      hotelCheckOut: toDateInput(booking.hotelCheckOut),
      hotelRoomType: booking.hotelRoomType || '',
      hotelGuests: toNumber(booking.hotelGuests, 1),
      hotelNotes: booking.hotelNotes || '',
      totalPrice: toNumber(booking.totalPrice, 0),
      amountPaid: toNumber(booking.amountPaid, 0),
      status: booking.status,
      serviceStatus: booking.serviceStatus,
      note: booking.note || '',
      adminNote: booking.adminNote || '',
    })
    setShowFormModal(true)
  }

  const closeFormModal = () => {
    setShowFormModal(false)
    setEditingBooking(null)
  }

  const validateForm = (): string | null => {
    const hasIdentity = Boolean(form.userId || form.guestName.trim() || form.guestEmail.trim() || form.guestPhone.trim())

    if (!hasIdentity) {
      return 'Please choose a user or enter guest contact details.'
    }

    if (!form.includeTour && !form.includeHotel) {
      return 'Please select at least one service (tour or hotel).'
    }

    if (form.includeTour && !form.tourId) {
      return 'Please choose a tour.'
    }

    if (form.includeTour && !form.desiredDate) {
      return 'Tour date is required.'
    }

    if (form.includeHotel && !form.hotelName.trim()) {
      return 'Hotel name is required when hotel service is enabled.'
    }

    if (form.totalPrice < 0 || form.amountPaid < 0) {
      return 'Price fields must be zero or positive.'
    }

    return null
  }

  const buildPayload = (forUpdate: boolean) => {
    const payload: Record<string, unknown> = {
      guestName: form.guestName.trim() || undefined,
      guestEmail: form.guestEmail.trim() || undefined,
      guestPhone: form.guestPhone.trim() || undefined,
      totalPrice: form.totalPrice,
      amountPaid: form.amountPaid,
      status: form.status,
      serviceStatus: form.serviceStatus,
      note: form.note.trim() || undefined,
      adminNote: form.adminNote.trim() || undefined,
    }

    if (form.userId) {
      payload.userId = form.userId
    } else if (forUpdate) {
      payload.userId = null
    }

    if (form.includeTour) {
      payload.tourId = form.tourId
      payload.desiredDate = form.desiredDate
      payload.adults = form.adults
      payload.children = form.children
      payload.roomType = form.roomType
    } else if (forUpdate) {
      payload.tourId = null
      payload.desiredDate = null
      payload.adults = null
      payload.children = null
      payload.roomType = null
    }

    if (form.includeHotel) {
      payload.hotelName = form.hotelName.trim()
      payload.hotelCheckIn = form.hotelCheckIn || undefined
      payload.hotelCheckOut = form.hotelCheckOut || undefined
      payload.hotelRoomType = form.hotelRoomType.trim() || undefined
      payload.hotelGuests = form.hotelGuests || undefined
      payload.hotelNotes = form.hotelNotes.trim() || undefined
    } else if (forUpdate) {
      payload.hotelName = null
      payload.hotelCheckIn = null
      payload.hotelCheckOut = null
      payload.hotelRoomType = null
      payload.hotelGuests = null
      payload.hotelNotes = null
    }

    return payload
  }

  const handleSubmit = async () => {
    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitLoading(true)

    try {
      if (editingBooking) {
        await api.patch(`/admin/bookings/${editingBooking.id}`, buildPayload(true))
      } else {
        await api.post('/admin/bookings', buildPayload(false))
      }

      await fetchBookings()
      closeFormModal()
      setError('')
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Booking save failed')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (bookingId: string) => {
    if (!window.confirm('Delete this booking? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`/admin/bookings/${bookingId}`)
      await fetchBookings()
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Delete failed')
    }
  }

  const handleToggleServiceStatus = async (booking: Booking) => {
    const nextStatus: BookingServiceStatus = booking.serviceStatus === 'PENDING' ? 'COMPLETED' : 'PENDING'

    try {
      await api.patch(`/admin/bookings/${booking.id}`, {
        serviceStatus: nextStatus,
      })
      await fetchBookings()
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Service status update failed')
    }
  }

  const handleApprove = async (bookingId: string) => {
    try {
      await api.post(`/admin/bookings/${bookingId}/approve`, {
        adminNote: 'Approved by admin',
      })
      await fetchBookings()
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Approve failed')
    }
  }

  const handleReject = async (bookingId: string) => {
    try {
      await api.post(`/admin/bookings/${bookingId}/reject`, {
        adminNote: 'Rejected by admin',
      })
      await fetchBookings()
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || 'Reject failed')
    }
  }

  const formatDate = (value: string | null) => {
    if (!value) return 'N/A'

    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
            >
              New Booking
            </button>
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer, booking, tour, hotel..."
            className="xl:col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />

          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value as '' | BookingLifecycleStatus)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All lifecycle statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={filterServiceStatus}
            onChange={(event) =>
              setFilterServiceStatus(event.target.value as '' | BookingServiceStatus)
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All service statuses</option>
            <option value="PENDING">Service Pending</option>
            <option value="COMPLETED">Service Completed</option>
          </select>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700">{error}</div>}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No bookings found</div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const customerName = booking.user
                ? `${booking.user.firstName} ${booking.user.lastName}`
                : booking.guestName || 'Guest customer'
              const customerEmail = booking.user?.email || booking.guestEmail || 'N/A'
              const customerPhone = booking.user?.phone || booking.guestPhone || 'N/A'
              const hasHotel = Boolean(booking.hotelName)
              const hasTour = Boolean(booking.tour)

              return (
                <article key={booking.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-lg">#{booking.id.slice(0, 8)}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[booking.status]}`}>
                          {STATUS_LABELS[booking.status]}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${SERVICE_STATUS_COLORS[booking.serviceStatus]}`}
                        >
                          Service {booking.serviceStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-700">
                        <div>
                          <span className="font-medium">Customer:</span> {customerName}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {customerEmail}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {customerPhone}
                        </div>

                        <div>
                          <span className="font-medium">Tour:</span> {hasTour ? getTourTitle(booking.tour) : '—'}
                        </div>
                        <div>
                          <span className="font-medium">Tour date:</span> {formatDate(booking.desiredDate)}
                        </div>
                        <div>
                          <span className="font-medium">Room:</span>{' '}
                          {booking.roomType ? ROOM_TYPE_LABELS[booking.roomType] || booking.roomType : '—'}
                        </div>

                        <div>
                          <span className="font-medium">Hotel:</span> {hasHotel ? booking.hotelName : '—'}
                        </div>
                        <div>
                          <span className="font-medium">Check-in:</span> {formatDate(booking.hotelCheckIn)}
                        </div>
                        <div>
                          <span className="font-medium">Check-out:</span> {formatDate(booking.hotelCheckOut)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-500">Total</span>
                          <div className="font-semibold text-gray-900">{booking.totalPrice.toFixed(2)}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-500">Paid</span>
                          <div className="font-semibold text-emerald-700">{booking.amountPaid.toFixed(2)}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-500">Balance</span>
                          <div className="font-semibold text-amber-700">{booking.balanceDue.toFixed(2)}</div>
                        </div>
                      </div>

                      {booking.note && (
                        <div className="text-sm bg-gray-50 rounded-lg px-3 py-2 text-gray-700">
                          Customer note: {booking.note}
                        </div>
                      )}

                      {booking.adminNote && (
                        <div className="text-sm bg-blue-50 rounded-lg px-3 py-2 text-blue-700">
                          Admin note: {booking.adminNote}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row xl:flex-col gap-2 flex-wrap xl:w-[220px]">
                      <button
                        onClick={() => openEditModal(booking)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => handleToggleServiceStatus(booking)}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Mark {booking.serviceStatus === 'PENDING' ? 'Completed' : 'Pending'}
                      </button>

                      {booking.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(booking.id)}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(booking.id)}
                            className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      <Link
                        href={`/${locale}/admin/bookings/${booking.id}/invoice`}
                        className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300 transition-colors text-center"
                      >
                        Invoice
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingBooking ? 'Edit Booking' : 'Create Booking'}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-2 border rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Customer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Existing user (optional)</label>
                    <select
                      value={form.userId}
                      onChange={(event) => setForm((prev) => ({ ...prev, userId: event.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                    >
                      <option value="">Guest checkout (no account)</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {getUserLabel(user)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest name</label>
                    <input
                      value={form.guestName}
                      onChange={(event) => setForm((prev) => ({ ...prev, guestName: event.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest phone</label>
                    <input
                      value={form.guestPhone}
                      onChange={(event) => setForm((prev) => ({ ...prev, guestPhone: event.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest email</label>
                    <input
                      type="email"
                      value={form.guestEmail}
                      onChange={(event) => setForm((prev) => ({ ...prev, guestEmail: event.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Tour Service</h3>
                  <input
                    type="checkbox"
                    checked={form.includeTour}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        includeTour: event.target.checked,
                      }))
                    }
                  />
                </div>

                {form.includeTour && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tour</label>
                      <select
                        value={form.tourId}
                        onChange={(event) => setForm((prev) => ({ ...prev, tourId: event.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Select tour</option>
                        {tours.map((tour) => (
                          <option key={tour.id} value={tour.id}>
                            {getTourOptionTitle(tour)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Desired date</label>
                      <input
                        type="date"
                        value={form.desiredDate}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, desiredDate: event.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Adults</label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={form.adults}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, adults: Number(event.target.value) }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Children</label>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={form.children}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, children: Number(event.target.value) }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Room type</label>
                        <select
                          value={form.roomType}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, roomType: event.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="single">Single</option>
                          <option value="double">Double</option>
                          <option value="twin">Twin</option>
                          <option value="triple">Triple</option>
                          <option value="family">Family</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Hotel Service</h3>
                  <input
                    type="checkbox"
                    checked={form.includeHotel}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        includeHotel: event.target.checked,
                      }))
                    }
                  />
                </div>

                {form.includeHotel && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hotel name</label>
                      <input
                        value={form.hotelName}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, hotelName: event.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Check-in</label>
                        <input
                          type="date"
                          value={form.hotelCheckIn}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, hotelCheckIn: event.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Check-out</label>
                        <input
                          type="date"
                          value={form.hotelCheckOut}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, hotelCheckOut: event.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Room type</label>
                        <input
                          value={form.hotelRoomType}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, hotelRoomType: event.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Guests</label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={form.hotelGuests}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, hotelGuests: Number(event.target.value) }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Hotel notes</label>
                      <textarea
                        value={form.hotelNotes}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, hotelNotes: event.target.value }))
                        }
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Financials</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Total price</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.totalPrice}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, totalPrice: Number(event.target.value) }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Amount paid</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.amountPaid}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, amountPaid: Number(event.target.value) }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Balance due</label>
                    <input
                      value={liveBalanceDue.toFixed(2)}
                      readOnly
                      className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Status & Notes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Lifecycle status</label>
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          status: event.target.value as BookingLifecycleStatus,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Service status</label>
                    <select
                      value={form.serviceStatus}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          serviceStatus: event.target.value as BookingServiceStatus,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Customer note</label>
                    <textarea
                      value={form.note}
                      onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Admin note</label>
                    <textarea
                      value={form.adminNote}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, adminNote: event.target.value }))
                      }
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSubmit}
                disabled={submitLoading}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {submitLoading ? 'Saving...' : editingBooking ? 'Update booking' : 'Create booking'}
              </button>
              <button
                onClick={closeFormModal}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
