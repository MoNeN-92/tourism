import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import TourDetailClient, { type TourDetail } from './TourDetailClient'
import { mockBlogPosts, type BlogPost as MockBlogPost } from '@/lib/mockBlogData'
import { absoluteUrl, buildCanonicalUrl, localizedAlternates, openGraphLocale, localePath } from '@/lib/seo'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import JsonLd from '@/components/JsonLd'
import { buildBreadcrumbSchema, buildTouristTripSchema } from '@/lib/structured-data'

type RelatedTour = {
  slug: string
  title: string
  description: string
  duration: string
  imageUrl: string | null
}

type ApiBlogPost = {
  id: string
  slug: string
  title_ka: string
  title_en: string
  title_ru: string
  excerpt_ka: string
  excerpt_en: string
  excerpt_ru: string
  coverImage: string
}

type RelatedPost = {
  slug: string
  title: string
  excerpt: string
  imageUrl: string | null
}

function getLocalizedField(
  tour: TourDetail,
  field:
    | 'title'
    | 'description'
    | 'location'
    | 'itinerary'
    | 'highlights'
    | 'idealFor'
    | 'includes'
    | 'excludes'
    | 'pickup'
    | 'bestSeason',
  locale: string,
): string {
  const fieldMap: Record<string, keyof TourDetail> = {
    ka: `${field}_ka` as keyof TourDetail,
    en: `${field}_en` as keyof TourDetail,
    ru: `${field}_ru` as keyof TourDetail,
  }

  const localizedFieldKey = fieldMap[locale] || fieldMap.ka
  const localizedValue = tour[localizedFieldKey]
  const fallbackValue = tour[`${field}_ka` as keyof TourDetail]

  return (localizedValue as string) || (fallbackValue as string) || ''
}

async function getTour(slug: string): Promise<TourDetail | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    const response = await fetch(`${apiUrl}/tours/${slug}`, {
      cache: 'no-store',
    })

    if (!response.ok) return null

    return response.json()
  } catch {
    return null
  }
}

async function getAllTours(): Promise<TourDetail[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/tours`, {
      next: { revalidate: 300 },
    })

    if (!response.ok) return []
    return response.json()
  } catch {
    return []
  }
}

async function getAllBlogPosts(): Promise<Array<ApiBlogPost | MockBlogPost>> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/blog`, {
      next: { revalidate: 300 },
    })

    if (!response.ok) return mockBlogPosts

    const posts: ApiBlogPost[] = await response.json()
    const apiSlugs = new Set(posts.map((post) => post.slug))
    const fallbackPosts = mockBlogPosts.filter((post) => !apiSlugs.has(post.slug))

    return [...posts, ...fallbackPosts]
  } catch {
    return mockBlogPosts
  }
}

function scoreContentMatch(haystack: string, needles: string[]): number {
  const normalized = haystack.toLowerCase()
  let score = 0

  for (const needle of needles) {
    const token = needle.trim().toLowerCase()
    if (!token || token.length < 3) continue
    if (normalized.includes(token)) score += 1
  }

  return score
}

function buildRelatedTours(currentTour: TourDetail, tours: TourDetail[], locale: string): RelatedTour[] {
  const tokens = [
    getLocalizedField(currentTour, 'title', locale),
    getLocalizedField(currentTour, 'location', locale),
    getLocalizedField(currentTour, 'description', locale),
  ]
    .join(' ')
    .split(/[\s,.-]+/)

  return tours
    .filter((tour) => tour.slug !== currentTour.slug)
    .map((tour) => ({
      tour,
      score: scoreContentMatch(
        [
          getLocalizedField(tour, 'title', locale),
          getLocalizedField(tour, 'location', locale),
          getLocalizedField(tour, 'description', locale),
        ].join(' '),
        tokens,
      ),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ tour }) => ({
      slug: tour.slug,
      title: getLocalizedField(tour, 'title', locale),
      description: getLocalizedField(tour, 'description', locale).slice(0, 120),
      duration: tour.duration,
      imageUrl: tour.images[0]?.url || null,
    }))
}

function getLocalizedBlogField(
  post: ApiBlogPost | MockBlogPost,
  field: 'title' | 'excerpt',
  locale: string,
): string {
  const key = `${field}_${locale}` as keyof typeof post
  const fallbackKey = `${field}_ka` as keyof typeof post
  return (post[key] as string) || (post[fallbackKey] as string) || ''
}

function buildRelatedPosts(
  currentTour: TourDetail,
  posts: Array<ApiBlogPost | MockBlogPost>,
  locale: string,
): RelatedPost[] {
  const tokens = [
    getLocalizedField(currentTour, 'title', locale),
    getLocalizedField(currentTour, 'location', locale),
    getLocalizedField(currentTour, 'description', locale),
  ]
    .join(' ')
    .split(/[\s,.-]+/)

  return posts
    .map((post) => ({
      post,
      score: scoreContentMatch(
        `${getLocalizedBlogField(post, 'title', locale)} ${getLocalizedBlogField(post, 'excerpt', locale)}`,
        tokens,
      ),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ post }) => ({
      slug: post.slug,
      title: getLocalizedBlogField(post, 'title', locale),
      excerpt: getLocalizedBlogField(post, 'excerpt', locale).slice(0, 140),
      imageUrl: post.coverImage || null,
    }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const tour = await getTour(slug)

  if (!tour) {
    return {
      title: 'Tour Not Found | Vibe Georgia',
      alternates: localizedAlternates(locale, `/tours/${slug}`),
      robots: {
        index: false,
        follow: true,
      },
    }
  }

  const title = `${getLocalizedField(tour, 'title', locale)} | Vibe Georgia`
  const description = getLocalizedField(tour, 'description', locale).slice(0, 160)
  const ogImage = buildCloudinaryUrl(tour.images[0]?.url || '')

  return {
    title,
    description,
    alternates: localizedAlternates(locale, `/tours/${slug}`),

    openGraph: {
      title,
      description,
      url: absoluteUrl(localePath(locale, `/tours/${slug}`)),
      siteName: 'Vibe Georgia',
      locale: openGraphLocale(locale),
      type: 'article',
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: getLocalizedField(tour, 'title', locale),
            },
          ]
        : undefined,
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function TourPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const nav = await getTranslations({ locale, namespace: 'nav' })
  const toursT = await getTranslations({ locale, namespace: 'tours' })
  const [tour, tours, posts] = await Promise.all([getTour(slug), getAllTours(), getAllBlogPosts()])

  if (!tour) notFound()

  const relatedTours = buildRelatedTours(tour, tours, locale)
  const relatedPosts = buildRelatedPosts(tour, posts, locale)

  return (
    <>
      <JsonLd
        data={[
          buildTouristTripSchema({
            locale,
            slug: tour.slug,
            name: getLocalizedField(tour, 'title', locale),
            description: getLocalizedField(tour, 'description', locale),
            duration: tour.duration,
            itinerary:
              getLocalizedField(tour, 'itinerary', locale) ||
              getLocalizedField(tour, 'location', locale) ||
              null,
            image: tour.images[0]?.url ? buildCloudinaryUrl(tour.images[0].url) : null,
          }),
          buildBreadcrumbSchema([
            { name: nav('home'), url: buildCanonicalUrl(locale) },
            { name: toursT('title'), url: buildCanonicalUrl(locale, '/tours') },
            { name: getLocalizedField(tour, 'title', locale), url: buildCanonicalUrl(locale, `/tours/${tour.slug}`) },
          ]),
        ]}
      />
      <TourDetailClient locale={locale} tour={tour} relatedTours={relatedTours} relatedPosts={relatedPosts} />
    </>
  )
}
