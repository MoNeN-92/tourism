// app/[locale]/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { mockBlogPosts, blogContentData, type BlogPost } from '@/lib/mockBlogData'
import { absoluteUrl, localizedAlternates, openGraphLocale } from '@/lib/seo'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import ShareButtons from '@/components/ShareButtons'

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

  const mockPost = mockBlogPosts.find(p => p.slug === slug)
  if (mockPost) return { post: mockPost, isApi: false }

  return null
}

function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  return mockBlogPosts.filter(post => post.slug !== currentSlug).slice(0, limit)
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const result = await getPostBySlug(slug)

  if (!result) {
    return {
      title: 'Post Not Found | Vibe Georgia',
      alternates: localizedAlternates(locale, `/blog/${slug}`),
      robots: { index: false, follow: true },
    }
  }

  const { post } = result
  const title = getLocalizedField(post, 'title', locale)
  const excerpt = getLocalizedField(post, 'excerpt', locale)
  const imageUrl = buildCloudinaryUrl(post.coverImage)

  return {
    title,
    description: excerpt,
    alternates: localizedAlternates(locale, `/blog/${slug}`),
    openGraph: {
      title,
      description: excerpt,
      url: absoluteUrl(`/${locale}/blog/${slug}`),
      siteName: 'Vibe Georgia',
      locale: openGraphLocale(locale),
      type: 'article',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: excerpt,
      images: [imageUrl],
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
        <Image
          src={buildCloudinaryUrl(post.coverImage)}
          alt={title}
          fill
          className="object-cover opacity-70"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute top-6 left-6">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white transition-colors shadow-lg"
          >
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

            {/* Share Buttons - Client Component */}
            <ShareButtons
              url={pageUrl}
              title={title}
              label={t('shareArticle')}
            />
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
                        <Image
                          src={buildCloudinaryUrl(relatedPost.coverImage)}
                          alt={relatedTitle}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
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