'use client'

// app/[locale]/admin/blog/[id]/edit/page.tsx
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

export default function AdminBlogEditPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const id = params.id as string

  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/admin/blog/${id}`)
        const post = response.data
        setForm({
          slug: post.slug,
          title_ka: post.title_ka, title_en: post.title_en, title_ru: post.title_ru,
          excerpt_ka: post.excerpt_ka, excerpt_en: post.excerpt_en, excerpt_ru: post.excerpt_ru,
          content_ka: post.content_ka, content_en: post.content_en, content_ru: post.content_ru,
          author_ka: post.author_ka, author_en: post.author_en, author_ru: post.author_ru,
          coverImage: post.coverImage,
          published: post.published,
        })
      } catch (err) {
        setError('Failed to load post')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      await api.put(`/admin/blog/${id}`, form)
      router.push(`/${locale}/admin/blog`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/${locale}/admin/blog`} className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Blog Post</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">General</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input name="slug" value={form.slug} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL *</label>
              <input name="coverImage" value={form.coverImage} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {form.coverImage && (
                <img src={form.coverImage} alt="Cover preview"
                  className="mt-2 h-32 w-full object-cover rounded-lg" />
              )}
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
              {saving ? 'Saving...' : 'Save Changes'}
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