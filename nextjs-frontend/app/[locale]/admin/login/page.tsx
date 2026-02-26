'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function AdminLoginRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string

  useEffect(() => {
    router.replace(`/${locale}/account/login?next=${encodeURIComponent(`/${locale}/admin`)}`)
  }, [locale, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 text-gray-600">
      Redirecting...
    </div>
  )
}
