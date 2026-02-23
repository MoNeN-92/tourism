'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import InvoicePrint, { type InvoicePayload } from './InvoicePrint'

export default function BookingInvoicePage() {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const bookingId = params.id as string

  const [invoice, setInvoice] = useState<InvoicePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await api.get(`/admin/bookings/${bookingId}/invoice`)
        setInvoice(response.data)
        setError('')
      } catch (requestError: any) {
        setError(requestError?.response?.data?.message || 'Failed to load invoice')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [bookingId])

  if (loading) {
    return <div className="p-8 text-gray-600">Loading invoice...</div>
  }

  if (!invoice) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto bg-white border rounded-xl p-6">
          <p className="text-red-700">{error || 'Invoice not found'}</p>
          <Link href={`/${locale}/admin/bookings`} className="inline-block mt-4 text-blue-600 hover:underline">
            Back to bookings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto flex flex-wrap gap-2 justify-between items-center mb-4 print:hidden">
        <Link href={`/${locale}/admin/bookings`} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
          Back to bookings
        </Link>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Print Invoice
        </button>
      </div>

      <InvoicePrint locale={locale} invoice={invoice} />
    </div>
  )
}
