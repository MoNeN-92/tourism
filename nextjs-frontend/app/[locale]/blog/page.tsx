'use client'

// app/[locale]/blog/page.tsx
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { mockBlogPosts, type BlogPost } from '@/lib/mockBlogData'
import api from '@/lib/api'

interface ApiBlogPost {
  id: string
  slug: string
  title_ka: string
  title_en: string
  title_ru: string
  excerpt_ka: string
  excerpt_en: string
  excerpt_ru: string
  coverImage: string
  publishedAt: string | null
  author_ka: string
  author_en: string
  author_ru: string
}

function getLocalizedField(
  post: BlogPost | ApiBlogPost,
  field: 'title' | 'excerpt' | 'author',
  locale: string
): string {
  const key = `${field}_${locale}` as keyof typeof post
  const fallback = `${field}_ka` as keyof typeof post
  return (post[key] as string) || (post[fallback] as string) || ''
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString)
  const day = date.getDate()
  const year = date.getFullYear()
  const monthIndex = date.getMonth()

  const months = {
    ka: ['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    ru: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
  }

  const monthNames = months[locale as keyof typeof months] || months.en
  const month = monthNames[monthIndex]

  if (locale === 'ka') return `${day} ${month}, ${year}`
  if (locale === 'ru') return `${day} ${month} ${year}`
  return `${month} ${day}, ${year}`
}

function normalizeApiPost(post: ApiBlogPost): BlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title_ka: post.title_ka,
    title_en: post.title_en,
    title_ru: post.title_ru,
    excerpt_ka: post.excerpt_ka,
    excerpt_en: post.excerpt_en,
    excerpt_ru: post.excerpt_ru,
    coverImage: post.coverImage,
    publishedDate: post.publishedAt || new Date().toISOString(),
    author_ka: post.author_ka,
    author_en: post.author_en,
    author_ru: post.author_ru,
  }
}

export default function BlogPage() {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('blog')

  const [apiPosts, setApiPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    const fetchApiPosts = async () => {
      try {
        const response = await api.get('/blog')
        const normalized = response.data.map(normalizeApiPost)
        setApiPosts(normalized)
      } catch (err) {
        console.error('Failed to fetch blog posts from API', err)
      }
    }
    fetchApiPosts()
  }, [])

  const apiSlugs = new Set(apiPosts.map(p => p.slug))
  const filteredMock = mockBlogPosts.filter(p => !apiSlugs.has(p.slug))
  const posts = [...apiPosts, ...filteredMock]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero - სურათით */}
      <div className="relative h-48 sm:h-56 lg:h-64">
        <Image
          src="https://res.cloudinary.com/dj7qaif1i/image/upload/v1771054787/tourism-platform/osepfgijh6dcvq0lztim.jpg"
          alt="Blog Hero"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl mb-3 sm:mb-4 text-white">
                {t('title')}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-white/90">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        {posts.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="text-6xl mb-6">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('noPosts')}</h2>
            <p className="text-gray-600">{t('noPostsDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const title = getLocalizedField(post, 'title', locale)
              const excerpt = getLocalizedField(post, 'excerpt', locale)
              const author = getLocalizedField(post, 'author', locale)
              const date = formatDate(post.publishedDate, locale)

              return (
                <Link
                  key={post.id}
                  href={`/${locale}/blog/${post.slug}`}
                  className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gray-200">
                    <Image
                      src={post.coverImage}
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="flex flex-col flex-grow p-5 sm:p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <span>📅</span>
                      <time dateTime={post.publishedDate}>{date}</time>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors sm:text-xl">
                      {title}
                    </h3>

                    <p className="text-gray-600 mb-5 line-clamp-3 flex-grow text-sm sm:text-base">
                      {excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>✍️</span>
                        <span>{author}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                        <span>{t('readMore')}</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}