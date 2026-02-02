// app/[locale]/admin/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const locale = params.locale as string
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if current page is login page
  const isLoginPage = pathname.endsWith('/admin/login')

  useEffect(() => {
    // Skip auth check on login page
    if (isLoginPage) {
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    
    if (!token) {
      router.push(`/${locale}/admin/login`)
    } else {
      setIsAuthenticated(true)
    }
    
    setLoading(false)
  }, [router, locale, isLoginPage])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push(`/${locale}/admin/login`)
  }

  // Render login page without admin layout
  if (isLoginPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
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
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href={`/${locale}/admin`}
                className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/admin/tours`}
                className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Tours
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}