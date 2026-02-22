'use client'

// app/[locale]/admin/page.tsx
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'

export default function AdminDashboard() {
  const t = useTranslations('admin.dashboard')
  const [stats, setStats] = useState({
    totalTours: 0,
    activeTours: 0,
    draftTours: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [toursRes, blogsRes, usersRes, bookingsRes] = await Promise.all([
          api.get('/admin/tours'),
          api.get('/admin/blog'),
          api.get('/admin/users?page=1&pageSize=1000'),
          api.get('/admin/bookings'),
        ])

        const tours = toursRes.data
        const blogs = blogsRes.data
        const users = usersRes.data?.items || []
        const bookings = bookingsRes.data || []

        setStats({
          totalTours: tours.length,
          activeTours: tours.filter((t: any) => t.status === true).length,
          draftTours: tours.filter((t: any) => t.status === false).length,
          totalBlogs: blogs.length,
          publishedBlogs: blogs.filter((b: any) => b.published === true).length,
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => u.isActive === true).length,
          totalBookings: bookings.length,
          pendingBookings: bookings.filter((b: any) => b.status === 'PENDING').length,
          approvedBookings: bookings.filter((b: any) => b.status === 'APPROVED').length,
        })
      } catch (err) {
        console.error('Failed to fetch stats', err)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Tours</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Total Tours</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTours}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Active Tours</h3>
              <p className="text-3xl font-bold text-green-600">{stats.activeTours}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Draft Tours</h3>
              <p className="text-3xl font-bold text-gray-400">{stats.draftTours}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Blog</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Total Posts</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBlogs}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Published Posts</h3>
              <p className="text-3xl font-bold text-green-600">{stats.publishedBlogs}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">{t('usersTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">{t('totalUsers')}</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">{t('activeUsers')}</h3>
              <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">{t('bookingsTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">{t('totalBookings')}</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">{t('pendingBookings')}</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">{t('approvedBookings')}</h3>
              <p className="text-3xl font-bold text-green-600">{stats.approvedBookings}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
