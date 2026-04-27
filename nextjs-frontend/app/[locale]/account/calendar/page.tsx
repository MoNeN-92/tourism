'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'

type AssignmentRole = 'DRIVER' | 'GUIDE'
type ServiceStatus = 'PENDING' | 'COMPLETED'

interface PartnerCalendarTour {
  id: string
  slug: string
  title_ka: string
  title_en: string
  title_ru: string
}

interface PartnerCalendarHotel {
  name: string
  checkIn: string | null
  checkOut: string | null
  rooms: Array<{
    roomType: string
    guestCount: number
  }>
}

interface PartnerCalendarBooking {
  id: string
  bookingId: string
  desiredDate: string
  hasAccess: boolean
  assignmentRole: AssignmentRole | null
  details: {
    serviceStatus: ServiceStatus
    carType: string
    adults: number
    children: number
    driverName: string | null
    guideName: string | null
    tour: PartnerCalendarTour
    hotel: PartnerCalendarHotel | null
  } | null
}

interface PartnerCalendarDay {
  date: string
  bookingCount: number
  accessibleCount: number
  bookings: PartnerCalendarBooking[]
}

interface PartnerCalendarResponse {
  month: string
  summary: {
    total: number
    accessible: number
    restricted: number
  }
  days: PartnerCalendarDay[]
}

function currentMonthValue() {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale === 'ka' ? 'ka-GE' : locale === 'ru' ? 'ru-RU' : 'en-US')
}

function getTourTitle(tour: PartnerCalendarTour, locale: string) {
  if (locale === 'ka') return tour.title_ka || tour.title_en
  if (locale === 'ru') return tour.title_ru || tour.title_en
  return tour.title_en || tour.title_ka
}

export default function AccountCalendarPage() {
  const params = useParams()
  const locale = (params.locale as string) || 'ka'
  const t = useTranslations('account.calendar')

  const [month, setMonth] = useState(currentMonthValue())
  const [data, setData] = useState<PartnerCalendarResponse | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadCalendar = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/bookings/partner-calendar?month=${month}`)

        if (cancelled) {
          return
        }

        const payload = response.data as PartnerCalendarResponse
        setData(payload)
        setError('')

        if (payload.days.length > 0) {
          const firstBusyDay = payload.days.find((day) => day.bookingCount > 0)
          setSelectedDate(firstBusyDay ? firstBusyDay.date : payload.days[0].date)
        } else {
          setSelectedDate(null)
        }

        setExpandedBookingId(null)
      } catch (requestError: unknown) {
        if (cancelled) {
          return
        }

        const responseMessage =
          typeof requestError === 'object' &&
          requestError !== null &&
          'response' in requestError &&
          typeof (requestError as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
            ? (requestError as { response?: { data?: { message?: string } } }).response?.data?.message
            : ''

        setError(responseMessage || t('loadFailed'))
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadCalendar()

    return () => {
      cancelled = true
    }
  }, [month, t])

  const selectedDay = data?.days.find((day) => day.date === selectedDate) || null

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300"
        />
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">{t('loading')}</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-white border rounded-lg p-3">
              <p className="text-xs text-gray-500">{t('visibleLabel')}</p>
              <p className="text-xl font-bold text-gray-900">{data.summary.total}</p>
            </div>
            <div className="bg-white border rounded-lg p-3">
              <p className="text-xs text-gray-500">{t('assignedLabel')}</p>
              <p className="text-xl font-bold text-emerald-700">{data.summary.accessible}</p>
            </div>
            <div className="bg-white border rounded-lg p-3">
              <p className="text-xs text-gray-500">{t('restrictedLabel')}</p>
              <p className="text-xl font-bold text-amber-700">{data.summary.restricted}</p>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 mb-6">
            <div className="grid grid-cols-7 gap-2">
              {data.days.map((day) => {
                const dayNumber = Number(day.date.slice(-2))
                const isActive = day.date === selectedDate

                return (
                  <button
                    key={day.date}
                    onClick={() => {
                      setSelectedDate(day.date)
                      setExpandedBookingId(null)
                    }}
                    className={`min-h-[88px] border rounded-lg p-2 text-left transition-colors ${
                      isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">{dayNumber}</span>
                      {day.bookingCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-900 text-white">
                          {day.bookingCount}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[11px] text-gray-500">
                      {t('assignedDayCount', { count: day.accessibleCount })}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {selectedDate ? t('bookingsOn', { date: formatDate(selectedDate, locale) }) : t('selectDate')}
            </h2>

            {!selectedDay || selectedDay.bookings.length === 0 ? (
              <p className="text-sm text-gray-600">{t('noBookings')}</p>
            ) : (
              <div className="space-y-3">
                {selectedDay.bookings.map((booking) => {
                  const isExpanded = expandedBookingId === booking.id

                  if (!booking.hasAccess || !booking.details) {
                    return (
                      <div
                        key={booking.id}
                        className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 opacity-80 cursor-not-allowed"
                        aria-disabled="true"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-700">{t('lockedBooking')}</p>
                            <p className="text-sm text-gray-500 mt-1">{t('lockedHint')}</p>
                          </div>
                          <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                            {t('restrictedBadge')}
                          </span>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <article key={booking.id} className="border rounded-xl p-4">
                      <button
                        type="button"
                        onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                        className="w-full text-left"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {getTourTitle(booking.details.tour, locale)}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {t('assignmentRole')}:{' '}
                              {t(
                                `assignmentRoleValue.${booking.assignmentRole === 'GUIDE' ? 'guide' : 'driver'}`,
                              )}
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                            {isExpanded ? t('hideDetails') : t('openDetails')}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            {t('date')}: <span className="font-medium">{formatDate(booking.desiredDate, locale)}</span>
                          </div>
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            {t('vehicle')}: <span className="font-medium">{booking.details.carType}</span>
                          </div>
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            {t('adults')}: <span className="font-medium">{booking.details.adults}</span>
                          </div>
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            {t('children')}: <span className="font-medium">{booking.details.children}</span>
                          </div>
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            {t('driver')}: <span className="font-medium">{booking.details.driverName || '—'}</span>
                          </div>
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            {t('guide')}: <span className="font-medium">{booking.details.guideName || '—'}</span>
                          </div>
                          <div className="rounded-lg bg-gray-50 px-3 py-2 md:col-span-2">
                            {t('serviceStatus')}:{' '}
                            <span className="font-medium">
                              {t(
                                `statusValue.${booking.details.serviceStatus === 'COMPLETED' ? 'completed' : 'pending'}`,
                              )}
                            </span>
                          </div>

                          {booking.details.hotel && (
                            <>
                              <div className="rounded-lg bg-gray-50 px-3 py-2 md:col-span-2">
                                {t('hotelName')}: <span className="font-medium">{booking.details.hotel.name}</span>
                              </div>
                              <div className="rounded-lg bg-gray-50 px-3 py-2">
                                {t('checkIn')}:{' '}
                                <span className="font-medium">
                                  {booking.details.hotel.checkIn
                                    ? formatDate(booking.details.hotel.checkIn, locale)
                                    : '—'}
                                </span>
                              </div>
                              <div className="rounded-lg bg-gray-50 px-3 py-2">
                                {t('checkOut')}:{' '}
                                <span className="font-medium">
                                  {booking.details.hotel.checkOut
                                    ? formatDate(booking.details.hotel.checkOut, locale)
                                    : '—'}
                                </span>
                              </div>
                              <div className="rounded-lg bg-gray-50 px-3 py-2 md:col-span-2">
                                {t('roomsCount')}:{' '}
                                <span className="font-medium">{booking.details.hotel.rooms.length}</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
