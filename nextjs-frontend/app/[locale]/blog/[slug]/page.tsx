// app/[locale]/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { mockBlogPosts, blogContentData, type BlogPost } from '@/lib/mockBlogData'
import { allowMockContent } from '@/lib/content-policy'

interface ApiBlogPost {
  id: string
  slug: string
  title_ka: string
  title_en: string
  title_ru: string
  excerpt_ka: string
  excerpt_en: string
  excerpt_ru: string
  content_ka: string
  content_en: string
  content_ru: string
  author_ka: string
  author_en: string
  author_ru: string
  coverImage: string
  publishedAt: string | null
  published: boolean
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
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString(
    locale === 'ka' ? 'ka-GE' : locale === 'ru' ? 'ru-RU' : 'en-US',
    options
  )
}

async function getPostBySlug(slug: string): Promise<{ post: BlogPost | ApiBlogPost; isApi: boolean } | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const res = await fetch(`${apiUrl}/blog/${slug}`, { cache: 'no-store' })
    if (res.ok) {
      const apiPost: ApiBlogPost = await res.json()
      return { post: apiPost, isApi: true }
    }
  } catch (err) {
    // API ვერ მოიტანა, mock-ზე გადავდივართ
  }

  if (allowMockContent()) {
    const mockPost = mockBlogPosts.find(p => p.slug === slug)
    if (mockPost) return { post: mockPost, isApi: false }
  }

  return null
}

function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  if (!allowMockContent()) {
    return []
  }

  return mockBlogPosts.filter(post => post.slug !== currentSlug).slice(0, limit)
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const result = await getPostBySlug(slug)
  if (!result) return { title: 'Post Not Found' }

  const { post } = result
  const title = getLocalizedField(post, 'title', locale)
  const excerpt = getLocalizedField(post, 'excerpt', locale)

  return {
  title,
  description: excerpt,
  openGraph: {
    title,
    description: excerpt,
    url: `https://vibegeorgia.com/${locale}/blog/${slug}`,
    siteName: 'Vibe Georgia',
    type: 'article',
    images: [
      {
        url: post.coverImage,
        width: 1200,
        height: 630,
        alt: title,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: excerpt,
    images: [post.coverImage],
  },
}
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const t = await getTranslations('blog')

  const result = await getPostBySlug(slug)
  if (!result) notFound()

  const { post, isApi } = result

  const title = getLocalizedField(post, 'title', locale)
  const excerpt = getLocalizedField(post, 'excerpt', locale)
  const author = getLocalizedField(post, 'author', locale)

  const publishedDate = isApi
    ? (post as ApiBlogPost).publishedAt || new Date().toISOString()
    : (post as BlogPost).publishedDate

  const formattedDate = formatDate(publishedDate, locale)
  const relatedPosts = getRelatedPosts(slug)
  const pageUrl = `https://vibegeorgia.com/${locale}/blog/${slug}`

  let content: {
    intro: string
    section1Title?: string
    section1Content?: string
    section2Title?: string
    section2Content?: string
    listItems?: string[]
    conclusion?: string
  } | null = null

  if (isApi) {
    const apiPost = post as ApiBlogPost
    const contentText =
      (apiPost[`content_${locale}` as keyof ApiBlogPost] as string) || apiPost.content_ka
    content = { intro: contentText }
  } else {
    const mockContent = blogContentData[slug]?.[locale] || blogContentData[slug]?.ka
    if (!mockContent) notFound()
    content = mockContent
  }

  if (!content) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gray-900">
        <Image src={post.coverImage} alt={title} fill
          className="object-cover opacity-70" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute top-6 left-6">
          <Link href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white transition-colors shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">{t('backToBlog')}</span>
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 lg:-mt-24 pb-12 sm:pb-16 lg:pb-20 relative z-10">
        <article className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 mb-8">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2"><span>📅</span><span>{formattedDate}</span></div>
              <div className="flex items-center gap-2"><span>✍️</span><span>{author}</span></div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">{title}</h1>

            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8 border-l-4 border-blue-600 pl-6">
              {excerpt}
            </p>

            {/* Share Buttons */}
            <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">{t('shareArticle')}:</span>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`}
                target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(title)}`}
                target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Article Body */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 mb-8">
            <div className="prose prose-lg max-w-none">
              {isApi ? (
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {content.intro}
                </div>
              ) : (
                <>
                  <p className="text-gray-700 leading-relaxed mb-6">{content.intro}</p>
                  {content.section1Title && (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{content.section1Title}</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">{content.section1Content}</p>
                    </>
                  )}
                  {content.section2Title && (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{content.section2Title}</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">{content.section2Content}</p>
                    </>
                  )}
                  {content.listItems && content.listItems.length > 0 && (
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      {content.listItems.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {content.conclusion && (
                    <p className="text-gray-700 leading-relaxed">{content.conclusion}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('relatedPosts')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => {
                  const relatedTitle = getLocalizedField(relatedPost, 'title', locale)
                  const relatedDate = formatDate(relatedPost.publishedDate, locale)
                  return (
                    <Link key={relatedPost.id} href={`/${locale}/blog/${relatedPost.slug}`} className="group block">
                      <div className="relative h-40 rounded-lg overflow-hidden mb-3">
                        <Image src={relatedPost.coverImage} alt={relatedTitle} fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{relatedDate}</p>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedTitle}
                      </h3>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  )
}
