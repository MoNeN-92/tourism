'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { mockBlogPosts, type BlogPost } from '@/lib/mockBlogData'

/**
 * Returns localized field value with fallback to Georgian
 */
function getLocalizedField(
  post: BlogPost,
  field: 'title' | 'excerpt' | 'author',
  locale: string
): string {
  const fieldMap: Record<string, keyof BlogPost> = {
    ka: `${field}_ka` as keyof BlogPost,
    en: `${field}_en` as keyof BlogPost,
    ru: `${field}_ru` as keyof BlogPost,
  }

  const key = fieldMap[locale] || fieldMap['ka']
  const value = post[key]
  const fallback = post[`${field}_ka` as keyof BlogPost]

  return (value as string) || (fallback as string) || ''
}

/**
 * Formats date in a consistent way across server and client
 */
function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString)
  const day = date.getDate()
  const year = date.getFullYear()
  const monthIndex = date.getMonth()

  const months = {
    ka: [
      'იანვარი',
      'თებერვალი',
      'მარტი',
      'აპრილი',
      'მაისი',
      'ივნისი',
      'ივლისი',
      'აგვისტო',
      'სექტემბერი',
      'ოქტომბერი',
      'ნოემბერი',
      'დეკემბერი',
    ],
    en: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    ru: [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря',
    ],
  }

  const monthNames = months[locale as keyof typeof months] || months.en
  const month = monthNames[monthIndex]

  if (locale === 'ka') {
    return `${day} ${month}, ${year}`
  }

  if (locale === 'ru') {
    return `${day} ${month} ${year}`
  }

  // default English
  return `${month} ${day}, ${year}`
}

export default function BlogPage() {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('blog')

  const posts = mockBlogPosts

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl mb-3 sm:mb-4">
              {t('title')}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100">
              {t('subtitle')}
            </p>
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
                  {/* Image */}
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

                  {/* Content */}
                  <div className="flex flex-col flex-grow p-5 sm:p-6">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <span>📅</span>
                      <time dateTime={post.publishedDate}>{date}</time>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors sm:text-xl">
                      {title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-5 line-clamp-3 flex-grow text-sm sm:text-base">
                      {excerpt}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>✍️</span>
                        <span>{author}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                        <span>{t('readMore')}</span>
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
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