// app/[locale]/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { mockBlogPosts, blogContentData, type BlogPost } from '@/lib/mockBlogData'

function getLocalizedField(post: BlogPost, field: 'title' | 'excerpt' | 'author', locale: string): string {
  const fieldMap: Record<string, keyof BlogPost> = {
    ka: `${field}_ka` as keyof BlogPost,
    en: `${field}_en` as keyof BlogPost,
    ru: `${field}_ru` as keyof BlogPost,
  }

  const localizedFieldKey = fieldMap[locale] || fieldMap['ka']
  const localizedValue = post[localizedFieldKey]
  const fallbackValue = post[`${field}_ka` as keyof BlogPost]

  return (localizedValue as string) || (fallbackValue as string) || ''
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  
  return date.toLocaleDateString(locale === 'ka' ? 'ka-GE' : locale === 'ru' ? 'ru-RU' : 'en-US', options)
}

function getPost(slug: string): BlogPost | undefined {
  return mockBlogPosts.find(post => post.slug === slug)
}

function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  return mockBlogPosts.filter(post => post.slug !== currentSlug).slice(0, limit)
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const post = getPost(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const title = getLocalizedField(post, 'title', locale)
  const excerpt = getLocalizedField(post, 'excerpt', locale)
  
  return {
    title: title,
    description: excerpt,
    openGraph: {
      title: title,
      description: excerpt,
      images: [post.coverImage],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const t = await getTranslations('blog')
  
  const post = getPost(slug)

  if (!post) {
    notFound()
  }

  const title = getLocalizedField(post, 'title', locale)
  const excerpt = getLocalizedField(post, 'excerpt', locale)
  const author = getLocalizedField(post, 'author', locale)
  const formattedDate = formatDate(post.publishedDate, locale)
  const relatedPosts = getRelatedPosts(slug)
  
  // Get localized content
  const postContent = blogContentData[slug]?.[locale] || blogContentData[slug]?.ka

  if (!postContent) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Cover Image */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gray-900">
        <Image
          src={post.coverImage}
          alt={title}
          fill
          className="object-cover opacity-70"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Back Button */}
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
          {/* Article Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 mb-8">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✍️</span>
                <span>{author}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8 border-l-4 border-blue-600 pl-6">
              {excerpt}
            </p>

            {/* Share Buttons */}
            <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">{t('shareArticle')}:</span>
              <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                <span className="text-lg">𝕏</span>
              </button>
              <button className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
                <span className="text-lg">f</span>
              </button>
              <button className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors">
                <span className="text-lg">in</span>
              </button>
            </div>
          </div>

          {/* Article Body */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 mb-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                {postContent.intro}
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{postContent.section1Title}</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {postContent.section1Content}
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{postContent.section2Title}</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {postContent.section2Content}
              </p>

              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                {postContent.listItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <p className="text-gray-700 leading-relaxed">
                {postContent.conclusion}
              </p>
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
                    <Link
                      key={relatedPost.id}
                      href={`/${locale}/blog/${relatedPost.slug}`}
                      className="group block"
                    >
                      <div className="relative h-40 rounded-lg overflow-hidden mb-3">
                        <Image
                          src={relatedPost.coverImage}
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