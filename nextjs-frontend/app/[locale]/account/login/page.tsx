'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

type LoginMode = 'customer' | 'staff'

export default function AccountLoginPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = params.locale as string
  const t = useTranslations('account.login')

  const [mode, setMode] = useState<LoginMode>('customer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const customerNext = searchParams.get('next') || `/${locale}/account/notifications`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const targetPath = mode === 'staff' ? '/auth/staff/login' : '/users/auth/login'

      const response = await fetch(`${apiUrl}${targetPath}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data?.message || t('loginFailed'))
        return
      }

      if (mode === 'staff') {
        router.replace(`/${locale}/admin/bookings`)
      } else {
        router.replace(customerNext)
      }

      router.refresh()
    } catch {
      setError(t('requestFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="mb-5">
          <div className="inline-flex w-full rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setMode('customer')}
              className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                mode === 'customer' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setMode('staff')}
              className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                mode === 'staff' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Staff
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {mode === 'staff' ? 'Staff Login' : t('title')}
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          {mode === 'staff' ? 'Sign in as moderator/staff' : t('subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? t('signingIn') : mode === 'staff' ? 'Sign in as staff' : t('signIn')}
          </button>
        </form>

        {mode === 'customer' && (
          <p className="text-sm text-gray-600 mt-5">
            {t('noAccount')}{' '}
            <Link
              href={`/${locale}/account/register?next=${encodeURIComponent(customerNext)}`}
              className="text-blue-600 hover:text-blue-700"
            >
              {t('createOne')}
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
