import JsonLd from '@/components/JsonLd'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { mockBlogPosts, type BlogPost } from '@/lib/mockBlogData'
import { buildBlogPostingSchema } from '@/lib/structured-data'

interface ApiBlogPost {
  slug: string
  title_ka: string
  title_en: string
  title_ru: string
  excerpt_ka: string
  excerpt_en: string
  excerpt_ru: string
  author_ka: string
  author_en: string
  author_ru: string
  coverImage: string
  publishedAt: string | null
  updatedAt?: string | null
}

function getLocalizedField(
  post: BlogPost | ApiBlogPost,
  field: 'title' | 'excerpt' | 'author',
  locale: string,
) {
  const key = `${field}_${locale}` as keyof typeof post
  const fallback = `${field}_ka` as keyof typeof post
  return (post[key] as string) || (post[fallback] as string) || ''
}

async function getPost(slug: string): Promise<{ post: BlogPost | ApiBlogPost; isApi: boolean } | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/blog/${slug}`, { cache: 'no-store' })

    if (response.ok) {
      return { post: await response.json(), isApi: true }
    }
  } catch {
    // Ignore API failures and fall back to mock data.
  }

  const mockPost = mockBlogPosts.find((item) => item.slug === slug)
  if (!mockPost) {
    return null
  }

  return { post: mockPost, isApi: false }
}

export default async function BlogPostHead({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const result = await getPost(slug)

  if (!result) {
    return null
  }

  const { post, isApi } = result
  const publishedAt = isApi
    ? (post as ApiBlogPost).publishedAt || new Date().toISOString()
    : (post as BlogPost).publishedDate
  const updatedAt = isApi
    ? (post as ApiBlogPost).updatedAt || publishedAt
    : (post as BlogPost).publishedDate

  return (
    <JsonLd
      data={buildBlogPostingSchema({
        locale,
        slug,
        headline: getLocalizedField(post, 'title', locale),
        description: getLocalizedField(post, 'excerpt', locale),
        image: buildCloudinaryUrl(post.coverImage),
        author: getLocalizedField(post, 'author', locale),
        datePublished: publishedAt,
        dateModified: updatedAt,
      })}
    />
  )
}
