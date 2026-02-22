'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import api from '@/lib/api'

interface CalendarBooking {
  id: string
  desiredDate: string
  adults: number
  children: number
  roomType: string
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  tour: {
    title_ka: string
    title_en: string
    title_ru: string
  }
}

interface CalendarDay {
  date: string
  bookingCount: number
  bookings: CalendarBooking[]
}

interface CalendarResponse {
  month: string
  summary: {
    total: number
    approved: number
    pending: number
    rejected: number
    cancelled: number
  }
  days: CalendarDay[]
}

function currentMonthValue() {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

export default function AdminCalendarPage() {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const t = useTranslations('admin.calendar')
  const [month, setMonth] = useState(currentMonthValue())
  const [data, setData] = useState<CalendarResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const getTourTitle = (tour: CalendarBooking['tour']) => {
    if (locale === 'ka') return tour.title_ka || tour.title_en
    if (locale === 'ru') return tour.title_ru || tour.title_en
    return tour.title_en || tour.title_ka
  }

  const selectedDay = useMemo(() => {
    if (!data || !selectedDate) {
      return null
    }

    return data.days.find((day) => day.date === selectedDate) || null
  }, [data, selectedDate])

  const fetchCalendar = async (targetMonth: string) => {
    try {
      setLoading(true)
      const response = await api.get(`/admin/bookings/calendar?month=${targetMonth}`)
      setData(response.data)
      setError('')

      if (response.data?.days?.length > 0) {
        const firstDayWithBookings = response.data.days.find((day: CalendarDay) => day.bookingCount > 0)
        setSelectedDate(firstDayWithBookings ? firstDayWithBookings.date : response.data.days[0].date)
      }
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || t('loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalendar(month)
  }, [month])

  const dayHeaders = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    const monday = new Date(Date.UTC(2024, 0, 1))
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday)
      date.setUTCDate(monday.getUTCDate() + index)
      return formatter.format(date)
    })
  }, [locale])

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <div className="flex gap-2">
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300"
            />
            <button
              onClick={() => fetchCalendar(month)}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              {t('refresh')}
            </button>
          </div>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700">{error}</div>}

        {loading ? (
          <p className="text-gray-600">{t('loading')}</p>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <div className="bg-white border rounded-lg p-3">
                <p className="text-xs text-gray-500">{t('total')}</p>
                <p className="text-xl font-bold">{data.summary.total}</p>
              </div>
              <div className="bg-white border rounded-lg p-3">
                <p className="text-xs text-gray-500">{t('approved')}</p>
                <p className="text-xl font-bold text-green-600">{data.summary.approved}</p>
              </div>
              <div className="bg-white border rounded-lg p-3">
                <p className="text-xs text-gray-500">{t('pending')}</p>
                <p className="text-xl font-bold text-yellow-600">{data.summary.pending}</p>
              </div>
              <div className="bg-white border rounded-lg p-3">
                <p className="text-xs text-gray-500">{t('rejected')}</p>
                <p className="text-xl font-bold text-red-600">{data.summary.rejected}</p>
              </div>
              <div className="bg-white border rounded-lg p-3">
                <p className="text-xs text-gray-500">{t('cancelled')}</p>
                <p className="text-xl font-bold text-gray-700">{data.summary.cancelled}</p>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-4 mb-6">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayHeaders.map((header) => (
                  <div key={header} className="text-xs font-semibold text-gray-500 text-center py-1">
                    {header}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {data.days.map((day) => {
                  const dayNumber = Number(day.date.slice(-2))
                  const isActive = day.date === selectedDate

                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      className={`min-h-[88px] border rounded-lg p-2 text-left transition-colors ${
                        isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">{dayNumber}</span>
                        {day.bookingCount > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            {day.bookingCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{t('approvedLabel', { count: day.bookingCount })}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-white border rounded-xl p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {selectedDate ? t('bookingsOn', { date: formatDate(selectedDate) }) : t('selectDate')}
              </h2>

              {!selectedDay || selectedDay.bookings.length === 0 ? (
                <p className="text-sm text-gray-600">{t('noBookings')}</p>
              ) : (
                <div className="space-y-3">
                  {selectedDay.bookings.map((booking) => (
                    <article key={booking.id} className="border rounded-lg p-3">
                      <p className="font-semibold text-gray-900">{getTourTitle(booking.tour)}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.user.firstName} {booking.user.lastName} | {booking.user.email} | {booking.user.phone}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {t('adults')}: {booking.adults} | {t('children')}: {booking.children} |{' '}
                        {t('room')}: {booking.roomType}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
