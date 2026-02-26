'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'

type BookingLifecycleStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
type BookingServiceStatus = 'PENDING' | 'COMPLETED'
type AdminRole = 'ADMIN' | 'MODERATOR'
type Currency = 'GEL' | 'USD' | 'EUR'
type PaymentAmountMode = 'FLAT' | 'PERCENT'
type CarType = 'SEDAN' | 'SUV' | 'MINIVAN' | 'MINIBUS' | 'BUS' | 'LUXURY'

interface ChangeRequest {
  id: string
  requestedDate: string
  reason: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  adminNote: string | null
  createdAt: string
}

interface BookingTourItem {
  id: string
  tourId: string
  desiredDate: string
  adults: number
  children: number
  carType: CarType
  tour: {
    id: string
    slug: string
    title_ka: string
    title_en: string
    title_ru: string
  }
}

interface BookingHotelRoom {
  id: string
  roomType: string
  guestCount: number
}

interface BookingHotelService {
  id: string
  hotelId: string
  checkIn: string | null
  checkOut: string | null
  notes: string | null
  sendRequestToHotel: boolean
  hotel: {
    id: string
    name: string
    email: string
  }
  rooms: BookingHotelRoom[]
}

interface Booking {
  id: string
  userId: string | null
  guestName: string | null
  guestEmail: string | null
  guestPhone: string | null
  tours: BookingTourItem[]
  tourId: string | null
  desiredDate: string | null
  adults: number | null
  children: number | null
  roomType: string | null
  hotelService: BookingHotelService | null
  hotelName: string | null
  hotelCheckIn: string | null
  hotelCheckOut: string | null
  hotelRoomType: string | null
  hotelGuests: number | null
  hotelNotes: string | null
  totalPrice: number
  amountPaid: number
  amountPaidMode: PaymentAmountMode
  amountPaidPercent: number | null
  currency: Currency
  balanceDue: number
  note: string | null
  adminNote: string | null
  serviceStatus: BookingServiceStatus
  status: BookingLifecycleStatus
  approvedAt: string | null
  rejectedAt: string | null
  cancelledAt: string | null
  isDeleted: boolean
  deletedAt: string | null
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

interface HotelOption {
  id: string
  name: string
  email: string
}

interface BookingFormTour {
  tourId: string
  desiredDate: string
  adults: number
  children: number
  carType: CarType
}

interface BookingFormRoom {
  roomType: string
  guestCount: number
}

interface BookingForm {
  userId: string
  guestName: string
  guestEmail: string
  guestPhone: string
  tours: BookingFormTour[]
  includeHotel: boolean
  hotelId: string
  hotelCheckIn: string
  hotelCheckOut: string
  sendRequestToHotel: boolean
  hotelRooms: BookingFormRoom[]
  hotelNotes: string
  totalPrice: number
  amountPaid: number
  amountPaidMode: PaymentAmountMode
  amountPaidPercent: number
  currency: Currency
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

const CAR_TYPE_OPTIONS: Array<{ value: CarType; label: string }> = [
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'MINIVAN', label: 'Minivan' },
  { value: 'MINIBUS', label: 'Minibus' },
  { value: 'BUS', label: 'Bus' },
  { value: 'LUXURY', label: 'Luxury' },
]

function emptyTourRow(): BookingFormTour {
  return {
    tourId: '',
    desiredDate: new Date().toISOString().slice(0, 10),
    adults: 1,
    children: 0,
    carType: 'SEDAN',
  }
}

function emptyRoomRow(): BookingFormRoom {
  return {
    roomType: 'Standard',
    guestCount: 1,
  }
}

function emptyForm(): BookingForm {
  return {
    userId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    tours: [emptyTourRow()],
    includeHotel: false,
    hotelId: '',
    hotelCheckIn: '',
    hotelCheckOut: '',
    sendRequestToHotel: false,
    hotelRooms: [emptyRoomRow()],
    hotelNotes: '',
    totalPrice: 0,
    amountPaid: 0,
    amountPaidMode: 'FLAT',
    amountPaidPercent: 0,
    currency: 'GEL',
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

function formatCurrency(value: number, currency: Currency): string {
  return `${value.toFixed(2)} ${currency}`
}

function getErrorMessage(error: unknown, fallback: string): string {
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

export default function AdminBookingsPage() {
  const params = useParams()
  const locale = (params.locale as string) || 'ka'

  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<AdminUserOption[]>([])
  const [tours, setTours] = useState<AdminTourOption[]>([])
  const [hotels, setHotels] = useState<HotelOption[]>([])
  const [adminRole, setAdminRole] = useState<AdminRole>('ADMIN')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<'' | BookingLifecycleStatus>('')
  const [filterServiceStatus, setFilterServiceStatus] = useState<'' | BookingServiceStatus>('')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active')

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [form, setForm] = useState<BookingForm>(emptyForm())
  const [submitLoading, setSubmitLoading] = useState(false)

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
        (booking.hotelService?.hotel?.name || booking.hotelName || '').toLowerCase().includes(term) ||
        (booking.tours[0]?.tour?.title_en || booking.tour?.title_en || '').toLowerCase().includes(term)
      )
    })
  }, [bookings, filterServiceStatus, filterStatus, search])

  const liveAmountPaid =
    form.amountPaidMode === 'PERCENT'
      ? (Math.max(0, form.totalPrice) * Math.min(100, Math.max(0, form.amountPaidPercent))) / 100
      : Math.max(0, form.amountPaid)

  const liveBalanceDue = Math.max(0, form.totalPrice - liveAmountPaid)

  const fetchAdminProfile = async () => {
    try {
      const response = await api.get('/admin/profile')
      setAdminRole((response.data?.admin?.role as AdminRole) || 'ADMIN')
    } catch {
      setAdminRole('ADMIN')
    }
  }

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
      const basePath = activeTab === 'trash' ? '/admin/bookings/trash' : '/admin/bookings'
      const response = await api.get(`${basePath}${query ? `?${query}` : ''}`)
      setBookings(response.data)
      setError('')
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Failed to load bookings'))
    } finally {
      setLoading(false)
    }
  }

  const fetchCreateOptions = async () => {
    try {
      const [usersResponse, toursResponse, hotelsResponse] = await Promise.all([
        api.get('/admin/users?page=1&pageSize=1000'),
        api.get('/admin/tours'),
        api.get('/admin/hotels'),
      ])

      const userItems = (usersResponse.data?.items || []) as AdminUserOption[]
      const tourItems = (toursResponse.data || []) as AdminTourOption[]
      const hotelItems = (hotelsResponse.data || []) as HotelOption[]

      setUsers(userItems)
      setTours(tourItems)
      setHotels(hotelItems)

      setForm((previous) => ({
        ...previous,
        tours: previous.tours.map((item) => ({
          ...item,
          tourId: item.tourId || tourItems[0]?.id || '',
        })),
        hotelId: previous.hotelId || hotelItems[0]?.id || '',
      }))
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Failed to load users/tours/hotels'))
    }
  }

  useEffect(() => {
    fetchAdminProfile()
    fetchCreateOptions()
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [filterStatus, filterServiceStatus, activeTab])

  const applyUserSelection = (userId: string) => {
    const selectedUser = users.find((item) => item.id === userId)

    if (!selectedUser) {
      setForm((previous) => ({
        ...previous,
        userId: '',
        guestName: '',
        guestEmail: '',
        guestPhone: '',
      }))
      return
    }

    setForm((previous) => ({
      ...previous,
      userId,
      guestName: `${selectedUser.firstName} ${selectedUser.lastName}`.trim(),
      guestEmail: selectedUser.email,
      guestPhone: selectedUser.phone,
    }))
  }

  const openCreateModal = () => {
    setEditingBooking(null)
    setForm((previous) => {
      const next = emptyForm()
      return {
        ...next,
        tours: next.tours.map((item) => ({ ...item, tourId: tours[0]?.id || item.tourId })),
        hotelId: hotels[0]?.id || '',
        currency: previous.currency,
      }
    })
    setShowFormModal(true)
  }

  const openEditModal = (booking: Booking) => {
    setEditingBooking(booking)

    const bookingTours: BookingFormTour[] =
      booking.tours.length > 0
        ? booking.tours.map((item) => ({
            tourId: item.tourId,
            desiredDate: toDateInput(item.desiredDate),
            adults: toNumber(item.adults, 1),
            children: toNumber(item.children, 0),
            carType: item.carType,
          }))
        : booking.tourId
          ? [
              {
                tourId: booking.tourId,
                desiredDate: toDateInput(booking.desiredDate),
                adults: toNumber(booking.adults, 1),
                children: toNumber(booking.children, 0),
                carType: 'SEDAN',
              },
            ]
          : [emptyTourRow()]

    const hasHotel = Boolean(booking.hotelService || booking.hotelName)

    const rooms: BookingFormRoom[] = booking.hotelService?.rooms?.length
      ? booking.hotelService.rooms.map((room) => ({
          roomType: room.roomType,
          guestCount: room.guestCount,
        }))
      : booking.hotelRoomType
        ? [
            {
              roomType: booking.hotelRoomType,
              guestCount: toNumber(booking.hotelGuests, 1),
            },
          ]
        : [emptyRoomRow()]

    setForm({
      userId: booking.user?.id || booking.userId || '',
      guestName: booking.guestName || '',
      guestEmail: booking.guestEmail || '',
      guestPhone: booking.guestPhone || '',
      tours: bookingTours,
      includeHotel: hasHotel,
      hotelId: booking.hotelService?.hotelId || '',
      hotelCheckIn: toDateInput(booking.hotelService?.checkIn || booking.hotelCheckIn),
      hotelCheckOut: toDateInput(booking.hotelService?.checkOut || booking.hotelCheckOut),
      sendRequestToHotel: Boolean(booking.hotelService?.sendRequestToHotel),
      hotelRooms: rooms,
      hotelNotes: booking.hotelService?.notes || booking.hotelNotes || '',
      totalPrice: toNumber(booking.totalPrice, 0),
      amountPaid: toNumber(booking.amountPaid, 0),
      amountPaidMode: booking.amountPaidMode || 'FLAT',
      amountPaidPercent: toNumber(booking.amountPaidPercent, 0),
      currency: booking.currency || 'GEL',
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

  const addTourRow = () => {
    setForm((previous) => ({
      ...previous,
      tours: [...previous.tours, { ...emptyTourRow(), tourId: tours[0]?.id || '' }],
    }))
  }

  const removeTourRow = (index: number) => {
    setForm((previous) => ({
      ...previous,
      tours: previous.tours.length <= 1 ? previous.tours : previous.tours.filter((_, idx) => idx !== index),
    }))
  }

  const addRoomRow = () => {
    setForm((previous) => ({
      ...previous,
      hotelRooms: [...previous.hotelRooms, emptyRoomRow()],
    }))
  }

  const removeRoomRow = (index: number) => {
    setForm((previous) => ({
      ...previous,
      hotelRooms:
        previous.hotelRooms.length <= 1
          ? previous.hotelRooms
          : previous.hotelRooms.filter((_, idx) => idx !== index),
    }))
  }

  const validateForm = (): string | null => {
    const hasIdentity = Boolean(form.userId || form.guestName.trim() || form.guestEmail.trim() || form.guestPhone.trim())
    const activeTours = form.tours.filter((item) => item.tourId.trim().length > 0)

    if (!hasIdentity) {
      return 'Please choose a user or enter guest contact details.'
    }

    if (activeTours.length === 0 && !form.includeHotel) {
      return 'Please select at least one service (tour or hotel).'
    }

    if (activeTours.some((item) => !item.tourId || !item.desiredDate)) {
      return 'Every tour row must have tour and desired date.'
    }

    if (form.includeHotel && !form.hotelId) {
      return 'Please select a hotel from the registry.'
    }

    if (form.includeHotel && form.hotelRooms.some((room) => !room.roomType.trim() || room.guestCount < 1)) {
      return 'Each hotel room row needs room type and guest count.'
    }

    if (form.amountPaidMode === 'PERCENT' && (form.amountPaidPercent < 0 || form.amountPaidPercent > 100)) {
      return 'Paid percent must be between 0 and 100.'
    }

    if (form.totalPrice < 0 || liveAmountPaid < 0) {
      return 'Price fields must be zero or positive.'
    }

    return null
  }

  const buildPayload = () => {
    return {
      userId: form.userId || undefined,
      guestName: form.guestName.trim() || undefined,
      guestEmail: form.guestEmail.trim() || undefined,
      guestPhone: form.guestPhone.trim() || undefined,
      tours: form.tours
        .filter((tour) => tour.tourId && tour.desiredDate)
        .map((tour) => ({
          tourId: tour.tourId,
          desiredDate: tour.desiredDate,
          adults: tour.adults,
          children: tour.children,
          carType: tour.carType,
        })),
      ...(form.includeHotel
        ? {
            hotelService: {
              hotelId: form.hotelId,
              checkIn: form.hotelCheckIn || undefined,
              checkOut: form.hotelCheckOut || undefined,
              notes: form.hotelNotes.trim() || undefined,
              sendRequestToHotel: form.sendRequestToHotel,
              rooms: form.hotelRooms.map((room) => ({
                roomType: room.roomType.trim(),
                guestCount: room.guestCount,
              })),
            },
          }
        : { hotelService: null }),
      totalPrice: form.totalPrice,
      amountPaid: liveAmountPaid,
      amountPaidMode: form.amountPaidMode,
      amountPaidPercent: form.amountPaidMode === 'PERCENT' ? form.amountPaidPercent : null,
      currency: form.currency,
      status: form.status,
      serviceStatus: form.serviceStatus,
      note: form.note.trim() || undefined,
      adminNote: form.adminNote.trim() || undefined,
    }
  }

  const handleSubmit = async () => {
    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitLoading(true)

    try {
      const payload = buildPayload()

      if (editingBooking) {
        await api.patch(`/admin/bookings/${editingBooking.id}`, payload)
      } else {
        await api.post('/admin/bookings', payload)
      }

      await fetchBookings()
      closeFormModal()
      setError('')
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Booking save failed'))
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (bookingId: string) => {
    if (!window.confirm('Move this booking to trash?')) {
      return
    }

    try {
      await api.delete(`/admin/bookings/${bookingId}`)
      await fetchBookings()
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Delete failed'))
    }
  }

  const handleRestore = async (bookingId: string) => {
    try {
      await api.post(`/admin/bookings/${bookingId}/restore`)
      await fetchBookings()
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Restore failed'))
    }
  }

  const handlePermanentDelete = async (bookingId: string) => {
    if (!window.confirm('Permanently delete this booking? This cannot be undone.')) {
      return
    }

    try {
      await api.delete(`/admin/bookings/${bookingId}/permanent`)
      await fetchBookings()
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Permanent delete failed'))
    }
  }

  const handleToggleServiceStatus = async (booking: Booking) => {
    const nextStatus: BookingServiceStatus = booking.serviceStatus === 'PENDING' ? 'COMPLETED' : 'PENDING'

    try {
      await api.patch(`/admin/bookings/${booking.id}`, {
        serviceStatus: nextStatus,
      })
      await fetchBookings()
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Service status update failed'))
    }
  }

  const handleApprove = async (bookingId: string) => {
    try {
      await api.post(`/admin/bookings/${bookingId}/approve`, {
        adminNote: 'Approved by admin/moderator',
      })
      await fetchBookings()
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Approve failed'))
    }
  }

  const handleReject = async (bookingId: string) => {
    try {
      await api.post(`/admin/bookings/${bookingId}/reject`, {
        adminNote: 'Rejected by admin/moderator',
      })
      await fetchBookings()
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'Reject failed'))
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
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={openCreateModal}
              className="min-h-[44px] px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
            >
              New Booking
            </button>
            <button
              onClick={fetchBookings}
              className="min-h-[44px] px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`min-h-[44px] px-4 rounded-lg text-sm font-medium ${
              activeTab === 'active' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('trash')}
            className={`min-h-[44px] px-4 rounded-lg text-sm font-medium ${
              activeTab === 'trash' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Trash
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer, booking, tour, hotel..."
            className="xl:col-span-2 border border-gray-300 rounded-lg px-3 py-2 min-h-[44px] text-sm"
          />

          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value as '' | BookingLifecycleStatus)}
            className="border border-gray-300 rounded-lg px-3 py-2 min-h-[44px] text-sm"
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
            className="border border-gray-300 rounded-lg px-3 py-2 min-h-[44px] text-sm"
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
              const hotelName = booking.hotelService?.hotel?.name || booking.hotelName

              return (
                <article key={booking.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
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
                          <span className="font-medium">Tours:</span> {booking.tours.length || (booking.tour ? 1 : 0)}
                        </div>
                        <div>
                          <span className="font-medium">Hotel:</span> {hotelName || '—'}
                        </div>
                        {activeTab === 'trash' && (
                          <div>
                            <span className="font-medium">Deleted:</span> {formatDate(booking.deletedAt)}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-500">Total</span>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(booking.totalPrice, booking.currency)}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-500">Paid</span>
                          <div className="font-semibold text-emerald-700">
                            {formatCurrency(booking.amountPaid, booking.currency)}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-500">Balance</span>
                          <div className="font-semibold text-amber-700">
                            {formatCurrency(booking.balanceDue, booking.currency)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row xl:flex-col gap-2 flex-wrap xl:w-[240px]">
                      {activeTab === 'active' ? (
                        <>
                          <button
                            onClick={() => openEditModal(booking)}
                            className="min-h-[44px] px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Edit
                          </button>

                          {adminRole === 'ADMIN' && (
                            <button
                              onClick={() => handleDelete(booking.id)}
                              className="min-h-[44px] px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Move to Trash
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleServiceStatus(booking)}
                            className="min-h-[44px] px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Mark {booking.serviceStatus === 'PENDING' ? 'Completed' : 'Pending'}
                          </button>

                          {booking.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(booking.id)}
                                className="min-h-[44px] px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(booking.id)}
                                className="min-h-[44px] px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(booking.id)}
                            className="min-h-[44px] px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            Restore
                          </button>

                          {adminRole === 'ADMIN' && (
                            <button
                              onClick={() => handlePermanentDelete(booking.id)}
                              className="min-h-[44px] px-3 py-1.5 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors"
                            >
                              Delete Permanently
                            </button>
                          )}
                        </>
                      )}

                      <Link
                        href={`/${locale}/admin/bookings/${booking.id}/invoice`}
                        className="min-h-[44px] px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300 transition-colors text-center"
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
        <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl p-4 sm:p-6 my-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingBooking ? 'Edit Booking' : 'Create Booking'}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-2 border rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Customer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Existing user</label>
                    <select
                      value={form.userId}
                      onChange={(event) => applyUserSelection(event.target.value)}
                      className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                    >
                      <option value="">No account</option>
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
                      className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest phone</label>
                    <input
                      value={form.guestPhone}
                      onChange={(event) => setForm((prev) => ({ ...prev, guestPhone: event.target.value }))}
                      className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest email</label>
                    <input
                      type="email"
                      value={form.guestEmail}
                      onChange={(event) => setForm((prev) => ({ ...prev, guestEmail: event.target.value }))}
                      className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Tours</h3>
                  <button
                    type="button"
                    onClick={addTourRow}
                    className="min-h-[44px] px-3 text-sm rounded-lg bg-blue-100 text-blue-700"
                  >
                    Add Tour
                  </button>
                </div>

                <div className="space-y-3">
                  {form.tours.map((tourRow, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Tour #{index + 1}</span>
                        {form.tours.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTourRow(index)}
                            className="text-xs text-red-600 min-h-[44px] px-2"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <select
                        value={tourRow.tourId}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            tours: prev.tours.map((item, idx) =>
                              idx === index ? { ...item, tourId: event.target.value } : item,
                            ),
                          }))
                        }
                        className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Select tour</option>
                        {tours.map((tour) => (
                          <option key={tour.id} value={tour.id}>
                            {getTourOptionTitle(tour)}
                          </option>
                        ))}
                      </select>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={tourRow.desiredDate}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              tours: prev.tours.map((item, idx) =>
                                idx === index ? { ...item, desiredDate: event.target.value } : item,
                              ),
                            }))
                          }
                          className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />

                        <select
                          value={tourRow.carType}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              tours: prev.tours.map((item, idx) =>
                                idx === index ? { ...item, carType: event.target.value as CarType } : item,
                              ),
                            }))
                          }
                          className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          {CAR_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={tourRow.adults}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              tours: prev.tours.map((item, idx) =>
                                idx === index ? { ...item, adults: Number(event.target.value) } : item,
                              ),
                            }))
                          }
                          className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="Adults"
                        />
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={tourRow.children}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              tours: prev.tours.map((item, idx) =>
                                idx === index ? { ...item, children: Number(event.target.value) } : item,
                              ),
                            }))
                          }
                          className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="Children"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Hotel & Rooms</h3>
                  <input
                    type="checkbox"
                    checked={form.includeHotel}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        includeHotel: event.target.checked,
                      }))
                    }
                    className="h-5 w-5"
                  />
                </div>

                {form.includeHotel && (
                  <div className="space-y-3">
                    <select
                      value={form.hotelId}
                      onChange={(event) => setForm((prev) => ({ ...prev, hotelId: event.target.value }))}
                      className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select hotel</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name} ({hotel.email})
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={form.hotelCheckIn}
                        onChange={(event) => setForm((prev) => ({ ...prev, hotelCheckIn: event.target.value }))}
                        className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="date"
                        value={form.hotelCheckOut}
                        onChange={(event) => setForm((prev) => ({ ...prev, hotelCheckOut: event.target.value }))}
                        className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.sendRequestToHotel}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, sendRequestToHotel: event.target.checked }))
                        }
                        className="h-5 w-5"
                      />
                      Send Request to Hotel?
                    </label>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Rooms</span>
                      <button
                        type="button"
                        onClick={addRoomRow}
                        className="min-h-[44px] px-3 text-sm rounded-lg bg-blue-100 text-blue-700"
                      >
                        Add Room
                      </button>
                    </div>

                    <div className="space-y-2">
                      {form.hotelRooms.map((room, index) => (
                        <div key={index} className="grid grid-cols-[1fr_110px_80px] gap-2 items-center">
                          <input
                            value={room.roomType}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                hotelRooms: prev.hotelRooms.map((item, idx) =>
                                  idx === index ? { ...item, roomType: event.target.value } : item,
                                ),
                              }))
                            }
                            className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="Room type"
                          />
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={room.guestCount}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                hotelRooms: prev.hotelRooms.map((item, idx) =>
                                  idx === index ? { ...item, guestCount: Number(event.target.value) } : item,
                                ),
                              }))
                            }
                            className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeRoomRow(index)}
                            className="min-h-[44px] px-2 text-xs rounded-lg bg-gray-200 text-gray-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <textarea
                      value={form.hotelNotes}
                      onChange={(event) => setForm((prev) => ({ ...prev, hotelNotes: event.target.value }))}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Hotel notes"
                    />
                  </div>
                )}
              </div>

              <div className="border rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Financials</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.totalPrice}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, totalPrice: Number(event.target.value) }))
                      }
                      className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Total price"
                    />

                    <select
                      value={form.currency}
                      onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value as Currency }))}
                      className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="GEL">GEL</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={form.amountPaidMode}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, amountPaidMode: event.target.value as PaymentAmountMode }))
                      }
                      className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="FLAT">Flat amount</option>
                      <option value="PERCENT">Percent (%)</option>
                    </select>

                    {form.amountPaidMode === 'PERCENT' ? (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        value={form.amountPaidPercent}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, amountPaidPercent: Number(event.target.value) }))
                        }
                        className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder="Paid %"
                      />
                    ) : (
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={form.amountPaid}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, amountPaid: Number(event.target.value) }))
                        }
                        className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder="Amount paid"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2">
                      Paid: <span className="font-semibold">{formatCurrency(liveAmountPaid, form.currency)}</span>
                    </div>
                    <div className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2">
                      Balance: <span className="font-semibold">{formatCurrency(liveBalanceDue, form.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Status & Notes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        status: event.target.value as BookingLifecycleStatus,
                      }))
                    }
                    className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  <select
                    value={form.serviceStatus}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        serviceStatus: event.target.value as BookingServiceStatus,
                      }))
                    }
                    className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                  </select>

                  <textarea
                    value={form.note}
                    onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm md:col-span-2"
                    placeholder="Customer note"
                  />

                  <textarea
                    value={form.adminNote}
                    onChange={(event) => setForm((prev) => ({ ...prev, adminNote: event.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm md:col-span-2"
                    placeholder="Admin note"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button
                onClick={handleSubmit}
                disabled={submitLoading}
                className="min-h-[44px] flex-1 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {submitLoading ? 'Saving...' : editingBooking ? 'Update booking' : 'Create booking'}
              </button>
              <button
                onClick={closeFormModal}
                className="min-h-[44px] flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
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
