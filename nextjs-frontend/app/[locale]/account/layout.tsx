'use client'

import { useEffect, useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'
import { clearAdminAccessToken } from '@/lib/auth-token'

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const locale = params.locale as string
  const t = useTranslations('account.layout')

  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)

  const isAuthPage = pathname.endsWith('/account/login') || pathname.endsWith('/account/register')

  useEffect(() => {
    let cancelled = false

    if (isAuthPage) {
      setLoading(false)
      return
    }

    const checkAuth = async () => {
      try {
        const response = await api.get('/users/auth/me')
        if (!cancelled) {
          setIsAuthenticated(true)
          setUser(response.data)
        }
      } catch {
        if (!cancelled) {
          setIsAuthenticated(false)
          const nextPath = encodeURIComponent(pathname)
          router.replace(`/${locale}/account/login?next=${nextPath}`)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      cancelled = true
    }
  }, [isAuthPage, locale, pathname, router])

  const handleLogout = async () => {
    try {
      await api.post('/users/auth/logout')
    } catch {
      // Best effort logout.
    }

    clearAdminAccessToken()
    router.replace(`/${locale}/account/login`)
    router.refresh()
  }

  if (isAuthPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('loading')}</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          <aside className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit">
            <div className="border-b pb-4 mb-4">
              <p className="text-sm text-gray-500">{t('title')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-600 break-all">{user?.email}</p>
            </div>

            <nav className="space-y-2">
              <Link
                href={`/${locale}/account/notifications`}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {t('notifications')}
              </Link>
            </nav>

            <button
              onClick={handleLogout}
              className="mt-5 w-full px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors"
            >
              {t('logout')}
            </button>
          </aside>

          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
            {children}
          </section>
        </div>
      </div>
    </div>
  )
}
