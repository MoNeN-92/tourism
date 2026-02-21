'use client'

// app/[locale]/admin/blog/create/page.tsx
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

export default function AdminBlogCreatePage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    slug: '',
    title_ka: '', title_en: '', title_ru: '',
    excerpt_ka: '', excerpt_en: '', excerpt_ru: '',
    content_ka: '', content_en: '', content_ru: '',
    author_ka: '', author_en: '', author_ru: '',
    coverImage: '',
    published: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      await api.post('/admin/blog', form)
      router.push(`/${locale}/admin/blog`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/${locale}/admin/blog`} className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">New Blog Post</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Slug & Cover */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">General</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input name="slug" value={form.slug} onChange={handleChange} required
                placeholder="my-blog-post-slug"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL *</label>
              <input name="coverImage" value={form.coverImage} onChange={handleChange} required
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={form.published}
                onChange={e => setForm(prev => ({ ...prev, published: e.target.checked }))}
                className="w-4 h-4 text-blue-600" />
              <label htmlFor="published" className="text-sm font-medium text-gray-700">Published</label>
            </div>
          </div>

          {/* Titles */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Title</h2>
            {(['ka', 'en', 'ru'] as const).map(lang => (
              <div key={lang}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title ({lang.toUpperCase()}) *</label>
                <input name={`title_${lang}`} value={form[`title_${lang}`]} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>

          {/* Author */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Author</h2>
            {(['ka', 'en', 'ru'] as const).map(lang => (
              <div key={lang}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author ({lang.toUpperCase()}) *</label>
                <input name={`author_${lang}`} value={form[`author_${lang}`]} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>

          {/* Excerpts */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Excerpt</h2>
            {(['ka', 'en', 'ru'] as const).map(lang => (
              <div key={lang}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt ({lang.toUpperCase()}) *</label>
                <textarea name={`excerpt_${lang}`} value={form[`excerpt_${lang}`]} onChange={handleChange} required
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Content</h2>
            {(['ka', 'en', 'ru'] as const).map(lang => (
              <div key={lang}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content ({lang.toUpperCase()}) *</label>
                <textarea name={`content_${lang}`} value={form[`content_${lang}`]} onChange={handleChange} required
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Create Post'}
            </button>
            <Link href={`/${locale}/admin/blog`}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}