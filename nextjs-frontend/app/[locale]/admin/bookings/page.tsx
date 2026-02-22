'use client'

// app/[locale]/admin/bookings/page.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'

interface Booking {
  id: string
  desiredDate: string
  adults: number
  children: number
  roomType: string
  note: string | null
  adminNote: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  approvedAt: string | null
  rejectedAt: string | null
  cancelledAt: string | null
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  tour: {
    id: string
    title_ka: string
    title_en: string
    title_ru: string
    slug: string
  }
  changeRequests: ChangeRequest[]
}

interface ChangeRequest {
  id: string
  requestedDate: string
  reason: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  adminNote: string | null
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-700',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'განხილვაში',
  APPROVED: 'დამტკიცებული',
  REJECTED: 'უარყოფილი',
  CANCELLED: 'გაუქმებული',
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  single: 'ერთადგილიანი',
  double: 'ორადგილიანი',
  twin: 'ტვინი',
  triple: 'სამადგილიანი',
  family: 'საოჯახო',
}

export default function AdminBookingsPage() {
  const params = useParams()
  const locale = (params.locale as string) || 'ka'

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'reschedule' | 'note' | 'change_request' | ''>('')
  const [adminNote, setAdminNote] = useState('')
  const [newDate, setNewDate] = useState('')
  const [selectedChangeRequest, setSelectedChangeRequest] = useState<ChangeRequest | null>(null)

  const getTourTitle = (tour: Booking['tour']) => {
    if (locale === 'ka') return tour.title_ka || tour.title_en
    if (locale === 'ru') return tour.title_ru || tour.title_en
    return tour.title_en || tour.title_ka
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const query = filterStatus ? `?status=${filterStatus}` : ''
      const response = await api.get(`/admin/bookings${query}`)
      setBookings(response.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'ჯავშნების ჩატვირთვა ვერ მოხერხდა')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [filterStatus])

  const openModal = (type: typeof modalType, booking: Booking, changeRequest?: ChangeRequest) => {
    setSelectedBooking(booking)
    setModalType(type)
    setAdminNote('')
    setNewDate(booking.desiredDate.slice(0, 10))
    setSelectedChangeRequest(changeRequest || null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedBooking(null)
    setAdminNote('')
    setNewDate('')
    setSelectedChangeRequest(null)
  }

  const handleApprove = async () => {
    if (!selectedBooking) return
    setActionLoading(true)
    try {
      await api.post(`/admin/bookings/${selectedBooking.id}/approve`, { adminNote })
      await fetchBookings()
      closeModal()
    } catch (err: any) {
      alert(err.response?.data?.message || 'შეცდომა')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedBooking) return
    setActionLoading(true)
    try {
      await api.post(`/admin/bookings/${selectedBooking.id}/reject`, { adminNote })
      await fetchBookings()
      closeModal()
    } catch (err: any) {
      alert(err.response?.data?.message || 'შეცდომა')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!selectedBooking || !newDate) return
    setActionLoading(true)
    try {
      await api.patch(`/admin/bookings/${selectedBooking.id}`, {
        desiredDate: new Date(newDate).toISOString(),
        adminNote,
      })
      await fetchBookings()
      closeModal()
    } catch (err: any) {
      alert(err.response?.data?.message || 'შეცდომა')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveNote = async () => {
    if (!selectedBooking) return
    setActionLoading(true)
    try {
      await api.patch(`/admin/bookings/${selectedBooking.id}`, { adminNote })
      await fetchBookings()
      closeModal()
    } catch (err: any) {
      alert(err.response?.data?.message || 'შეცდომა')
    } finally {
      setActionLoading(false)
    }
  }

  const handleChangeRequestDecision = async (approve: boolean) => {
    if (!selectedChangeRequest) return
    setActionLoading(true)
    try {
      const endpoint = approve
        ? `/admin/bookings/change-requests/${selectedChangeRequest.id}/approve`
        : `/admin/bookings/change-requests/${selectedChangeRequest.id}/reject`
      await api.post(endpoint, { adminNote })
      await fetchBookings()
      closeModal()
    } catch (err: any) {
      alert(err.response?.data?.message || 'შეცდომა')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">ჯავშნების მართვა</h1>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700"
            >
              <option value="">ყველა სტატუსი</option>
              <option value="PENDING">განხილვაში</option>
              <option value="APPROVED">დამტკიცებული</option>
              <option value="REJECTED">უარყოფილი</option>
              <option value="CANCELLED">გაუქმებული</option>
            </select>
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              განახლება
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">იტვირთება...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">ჯავშნები არ არის</div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  
                  {/* Left: Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-lg">{getTourTitle(booking.tour)}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[booking.status]}`}>
                        {STATUS_LABELS[booking.status]}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                      <div>👤 <span className="font-medium">{booking.user.firstName} {booking.user.lastName}</span></div>
                      <div>📧 {booking.user.email}</div>
                      <div>📞 {booking.user.phone}</div>
                      <div>📅 <span className="font-medium">{formatDate(booking.desiredDate)}</span></div>
                      <div>👥 მოზრდილი: {booking.adults} | ბავშვი: {booking.children}</div>
                      <div>🛏️ {ROOM_TYPE_LABELS[booking.roomType] || booking.roomType}</div>
                    </div>

                    {booking.note && (
                      <div className="text-sm bg-gray-50 rounded-lg px-3 py-2 text-gray-700">
                        💬 მომხმარებლის შენიშვნა: {booking.note}
                      </div>
                    )}

                    {booking.adminNote && (
                      <div className="text-sm bg-blue-50 rounded-lg px-3 py-2 text-blue-700">
                        📝 ადმინის შენიშვნა: {booking.adminNote}
                      </div>
                    )}

                    {/* Change Requests */}
                    {booking.changeRequests && booking.changeRequests.filter(cr => cr.status === 'PENDING').length > 0 && (
                      <div className="mt-2">
                        {booking.changeRequests.filter(cr => cr.status === 'PENDING').map(cr => (
                          <div key={cr.id} className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm">
                            <span className="font-medium text-yellow-800">📆 თარიღის შეცვლის მოთხოვნა: </span>
                            <span className="text-yellow-700">{formatDate(cr.requestedDate)}</span>
                            {cr.reason && <span className="text-yellow-600"> — {cr.reason}</span>}
                            <button
                              onClick={() => openModal('change_request', booking, cr)}
                              className="ml-2 text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-900 px-2 py-0.5 rounded transition-colors"
                            >
                              განხილვა
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row lg:flex-col gap-2 flex-wrap">
                    {booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => openModal('approve', booking)}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          ✓ დამტკიცება
                        </button>
                        <button
                          onClick={() => openModal('reject', booking)}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          ✗ უარყოფა
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => openModal('reschedule', booking)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      📅 გადატანა
                    </button>
                    <button
                      onClick={() => openModal('note', booking)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      📝 შენიშვნა
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            
            {/* Approve */}
            {modalType === 'approve' && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">ჯავშნის დამტკიცება</h2>
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">{getTourTitle(selectedBooking.tour)}</span><br/>
                  {selectedBooking.user.firstName} {selectedBooking.user.lastName} — {formatDate(selectedBooking.desiredDate)}
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">შენიშვნა (არასავალდებულო)</label>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 mb-4"
                  placeholder="შეიყვანეთ შენიშვნა..."
                />
                <div className="flex gap-3">
                  <button onClick={handleApprove} disabled={actionLoading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {actionLoading ? 'იტვირთება...' : 'დამტკიცება'}
                  </button>
                  <button onClick={closeModal} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                    გაუქმება
                  </button>
                </div>
              </>
            )}

            {/* Reject */}
            {modalType === 'reject' && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">ჯავშნის უარყოფა</h2>
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">{getTourTitle(selectedBooking.tour)}</span><br/>
                  {selectedBooking.user.firstName} {selectedBooking.user.lastName} — {formatDate(selectedBooking.desiredDate)}
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">მიზეზი (არასავალდებულო)</label>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 mb-4"
                  placeholder="უარყოფის მიზეზი..."
                />
                <div className="flex gap-3">
                  <button onClick={handleReject} disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                    {actionLoading ? 'იტვირთება...' : 'უარყოფა'}
                  </button>
                  <button onClick={closeModal} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                    გაუქმება
                  </button>
                </div>
              </>
            )}

            {/* Reschedule */}
            {modalType === 'reschedule' && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">თარიღის გადატანა</h2>
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">{getTourTitle(selectedBooking.tour)}</span><br/>
                  {selectedBooking.user.firstName} {selectedBooking.user.lastName}
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">ახალი თარიღი</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 mb-3"
                />
                <label className="block text-sm font-medium text-gray-700 mb-1">შენიშვნა (არასავალდებულო)</label>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 mb-4"
                  placeholder="გადატანის მიზეზი..."
                />
                <div className="flex gap-3">
                  <button onClick={handleReschedule} disabled={actionLoading || !newDate}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {actionLoading ? 'იტვირთება...' : 'გადატანა'}
                  </button>
                  <button onClick={closeModal} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                    გაუქმება
                  </button>
                </div>
              </>
            )}

            {/* Note */}
            {modalType === 'note' && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">შენიშვნის დამატება</h2>
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">{getTourTitle(selectedBooking.tour)}</span><br/>
                  {selectedBooking.user.firstName} {selectedBooking.user.lastName}
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">ადმინის შენიშვნა</label>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 mb-4"
                  placeholder={selectedBooking.adminNote || 'შეიყვანეთ შენიშვნა...'}
                  defaultValue={selectedBooking.adminNote || ''}
                />
                <div className="flex gap-3">
                  <button onClick={handleSaveNote} disabled={actionLoading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {actionLoading ? 'იტვირთება...' : 'შენახვა'}
                  </button>
                  <button onClick={closeModal} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                    გაუქმება
                  </button>
                </div>
              </>
            )}

            {/* Change Request */}
            {modalType === 'change_request' && selectedChangeRequest && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">თარიღის შეცვლის მოთხოვნა</h2>
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-700 space-y-1">
                  <p><span className="font-medium">ტური:</span> {getTourTitle(selectedBooking.tour)}</p>
                  <p><span className="font-medium">მომხმარებელი:</span> {selectedBooking.user.firstName} {selectedBooking.user.lastName}</p>
                  <p><span className="font-medium">მიმდინარე თარიღი:</span> {formatDate(selectedBooking.desiredDate)}</p>
                  <p><span className="font-medium">მოთხოვნილი თარიღი:</span> {formatDate(selectedChangeRequest.requestedDate)}</p>
                  {selectedChangeRequest.reason && <p><span className="font-medium">მიზეზი:</span> {selectedChangeRequest.reason}</p>}
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-1">შენიშვნა (არასავალდებულო)</label>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 mb-4"
                  placeholder="შენიშვნა..."
                />
                <div className="flex gap-3">
                  <button onClick={() => handleChangeRequestDecision(true)} disabled={actionLoading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {actionLoading ? 'იტვირთება...' : '✓ დამტკიცება'}
                  </button>
                  <button onClick={() => handleChangeRequestDecision(false)} disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                    {actionLoading ? 'იტვირთება...' : '✗ უარყოფა'}
                  </button>
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                    გაუქმება
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}