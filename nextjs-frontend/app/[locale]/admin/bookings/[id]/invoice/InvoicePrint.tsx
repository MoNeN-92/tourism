import { buildCloudinaryUrl } from '@/lib/cloudinary'

export interface InvoicePayload {
  logoUrl: string
  bookingId: string
  issuedAt: string
  customer: {
    name: string
    email: string | null
    phone: string | null
  }
  services: {
    tour: {
      id: string
      slug: string
      title_ka: string
      title_en: string
      title_ru: string
      desiredDate: string | null
      adults: number | null
      children: number | null
      roomType: string | null
    } | null
    hotel: {
      name: string
      checkIn: string | null
      checkOut: string | null
      roomType: string | null
      guests: number | null
      notes: string | null
    } | null
  }
  financials: {
    totalPrice: number
    amountPaid: number
    balanceDue: number
  }
  admin: {
    note: string | null
    serviceStatus: string
    bookingStatus: string
  }
}

interface InvoicePrintProps {
  locale: string
  invoice: InvoicePayload
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getTourTitle(locale: string, invoice: InvoicePayload): string {
  const tour = invoice.services.tour

  if (!tour) {
    return 'N/A'
  }

  if (locale === 'ka') return tour.title_ka || tour.title_en
  if (locale === 'ru') return tour.title_ru || tour.title_en
  return tour.title_en || tour.title_ka
}

export default function InvoicePrint({ locale, invoice }: InvoicePrintProps) {
  const logo = buildCloudinaryUrl(invoice.logoUrl)

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 text-gray-900">
      <header className="flex items-start justify-between border-b border-gray-200 pb-6 mb-6">
        <div>
          <img src={logo} alt="Vibe Georgia" className="h-14 w-auto" />
          <p className="text-sm text-gray-600 mt-2">Vibe Georgia</p>
          <p className="text-sm text-gray-600">info@vibegeorgia.com | +995 596 55 00 99</p>
        </div>

        <div className="text-right">
          <h1 className="text-2xl font-bold">Invoice</h1>
          <p className="text-sm text-gray-600 mt-1">Booking: #{invoice.bookingId.slice(0, 8)}</p>
          <p className="text-sm text-gray-600">Issued: {formatDate(invoice.issuedAt)}</p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <article className="border border-gray-200 rounded-xl p-4">
          <h2 className="font-semibold mb-2">Customer</h2>
          <p className="text-sm">Name: {invoice.customer.name}</p>
          <p className="text-sm">Email: {invoice.customer.email || 'N/A'}</p>
          <p className="text-sm">Phone: {invoice.customer.phone || 'N/A'}</p>
        </article>

        <article className="border border-gray-200 rounded-xl p-4">
          <h2 className="font-semibold mb-2">Booking Status</h2>
          <p className="text-sm">Lifecycle: {invoice.admin.bookingStatus}</p>
          <p className="text-sm">Service: {invoice.admin.serviceStatus}</p>
          {invoice.admin.note && <p className="text-sm mt-1">Admin note: {invoice.admin.note}</p>}
        </article>
      </section>

      <section className="border border-gray-200 rounded-xl p-4 mb-6">
        <h2 className="font-semibold mb-3">Service Details</h2>

        {invoice.services.tour && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Tour</h3>
            <p className="text-sm">Title: {getTourTitle(locale, invoice)}</p>
            <p className="text-sm">Date: {formatDate(invoice.services.tour.desiredDate)}</p>
            <p className="text-sm">
              Guests: Adults {invoice.services.tour.adults ?? 0}, Children {invoice.services.tour.children ?? 0}
            </p>
            <p className="text-sm">Room type: {invoice.services.tour.roomType || 'N/A'}</p>
          </div>
        )}

        {invoice.services.hotel && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Hotel</h3>
            <p className="text-sm">Name: {invoice.services.hotel.name}</p>
            <p className="text-sm">Check-in: {formatDate(invoice.services.hotel.checkIn)}</p>
            <p className="text-sm">Check-out: {formatDate(invoice.services.hotel.checkOut)}</p>
            <p className="text-sm">Room type: {invoice.services.hotel.roomType || 'N/A'}</p>
            <p className="text-sm">Guests: {invoice.services.hotel.guests || 0}</p>
            {invoice.services.hotel.notes && <p className="text-sm">Notes: {invoice.services.hotel.notes}</p>}
          </div>
        )}

        {!invoice.services.tour && !invoice.services.hotel && (
          <p className="text-sm text-gray-600">No service details available.</p>
        )}
      </section>

      <section className="border border-gray-200 rounded-xl p-4">
        <h2 className="font-semibold mb-3">Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-gray-500">Total Cost</p>
            <p className="font-semibold">{invoice.financials.totalPrice.toFixed(2)}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg px-3 py-2">
            <p className="text-emerald-700">Amount Paid</p>
            <p className="font-semibold text-emerald-700">{invoice.financials.amountPaid.toFixed(2)}</p>
          </div>
          <div className="bg-amber-50 rounded-lg px-3 py-2">
            <p className="text-amber-700">Remaining Balance</p>
            <p className="font-semibold text-amber-700">{invoice.financials.balanceDue.toFixed(2)}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
