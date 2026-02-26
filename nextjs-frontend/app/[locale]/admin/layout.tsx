'use client'

// app/[locale]/admin/layout.tsx
import { useEffect, useState } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'
import { clearAdminAccessToken } from '@/lib/auth-token'

type AdminRole = 'ADMIN' | 'MODERATOR'
type UserRole = 'USER' | 'ADMIN' | 'MODERATOR'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const locale = params.locale as string
  const t = useTranslations('admin.nav')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null)
  const [loading, setLoading] = useState(true)

  const isLoginPage = pathname.endsWith('/admin/login')

  useEffect(() => {
    let cancelled = false

    if (isLoginPage) {
      setLoading(false)
      return
    }

    const checkAuth = async () => {
      try {
        const response = await api.get('/users/auth/me')
        const role = (response.data?.role as UserRole | undefined) || 'USER'

        if (role !== 'ADMIN' && role !== 'MODERATOR') {
          if (!cancelled) {
            setIsAuthenticated(false)
            setAdminRole(null)
            router.replace(`/${locale}/account/notifications`)
          }
          return
        }

        if (!cancelled) {
          setIsAuthenticated(true)
          setAdminRole(role)
        }
      } catch {
        if (!cancelled) {
          setIsAuthenticated(false)
          setAdminRole(null)
          router.replace(
            `/${locale}/account/login?next=${encodeURIComponent(pathname || `/${locale}/admin`)}`,
          )
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
  }, [router, locale, isLoginPage, pathname])

  const handleLogout = async () => {
    try {
      await api.post('/users/auth/logout')
    } catch {
      // Best-effort logout to avoid blocking UI if API is temporarily unavailable.
    }

    try {
      await api.post('/auth/logout')
    } catch {
      // Best-effort logout to avoid blocking UI if API is temporarily unavailable.
    }

    clearAdminAccessToken()
    router.replace(`/${locale}/account/login`)
    router.refresh()
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">{t('loading')}</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href={`/${locale}/admin`}
                className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {t('dashboard')}
              </Link>
            </li>
            {adminRole === 'ADMIN' && (
              <li>
                <Link
                  href={`/${locale}/admin/tours`}
                  className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {t('tours')}
                </Link>
              </li>
            )}
            <li>
              <Link
                href={`/${locale}/admin/bookings`}
                className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {t('bookings')}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/admin/hotels`}
                className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {t('hotels')}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/admin/calendar`}
                className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {t('calendar')}
              </Link>
            </li>
            {adminRole === 'ADMIN' && (
              <>
                <li>
                  <Link
                    href={`/${locale}/admin/users`}
                    className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {t('users')}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/admin/blog`}
                    className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {t('blog')}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            {t('logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
