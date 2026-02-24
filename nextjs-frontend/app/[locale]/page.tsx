import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { mockBlogPosts } from '@/lib/mockData'
import type { Metadata } from 'next'
import { buildCloudinaryUrl } from '@/lib/cloudinary'

// --- Interfaces ---
interface TourImage {
  id: string
  url: string
  publicId: string
  createdAt: string
}

interface Tour {
  id: string
  slug: string
  title_ka: string
  title_en: string
  title_ru: string
  description_ka: string
  description_en: string
  description_ru: string
  location_ka: string | null
  location_en: string | null
  location_ru: string | null
  duration: string
  status: boolean
  images: TourImage[]
  createdAt: string
  updatedAt: string
}

interface BlogPost {
  id: string
  slug: string
  title_ka: string
  title_en: string
  title_ru: string
  excerpt_ka: string
  excerpt_en: string
  excerpt_ru: string
  coverImage: string
  publishedDate: string
}

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

// --- Helper Functions ---
function getLocalizedField<T extends Tour | BlogPost>(
  item: T,
  field: 'title' | 'excerpt' | 'description' | 'location',
  locale: string
): string {
  const fieldMap: Record<string, keyof T> = {
    ka: `${field}_ka` as keyof T,
    en: `${field}_en` as keyof T,
    ru: `${field}_ru` as keyof T,
  }
  const localizedFieldKey = fieldMap[locale] || fieldMap['ka']
  const localizedValue = item[localizedFieldKey]
  const fallbackValue = item[`${field}_ka` as keyof T]
  return (localizedValue as string) || (fallbackValue as string) || ''
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
  return date.toLocaleDateString(
    locale === 'ka' ? 'ka-GE' : locale === 'ru' ? 'ru-RU' : 'en-US',
    options
  )
}

function formatDuration(duration: string, locale: string): string {
  const value = String(duration || '').trim()
  if (!value) return ''
  if (/^\d+$/.test(value)) {
    const days = Number(value)
    const labels = { ka: 'დღე', en: days === 1 ? 'day' : 'days', ru: 'дნ.' }
    return `${days} ${labels[locale as keyof typeof labels] || labels.en}`
  }
  return value
}

// --- Data Fetching ---
async function getFeaturedTours(): Promise<Tour[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const res = await fetch(`${apiUrl}/tours`, { cache: 'no-store', next: { revalidate: 0 } })
    if (!res.ok) return []
    const allTours: Tour[] = await res.json()
    const activeTours = allTours.filter(tour => tour.status === true)
    const shuffled = [...activeTours].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(4, shuffled.length))
  } catch (error) {
    return []
  }
}

async function getLatestBlogPosts(): Promise<BlogPost[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const res = await fetch(`${apiUrl}/blog`, { cache: 'no-store' })
    if (!res.ok) return mockBlogPosts.slice(0, 3)
    const apiPosts: ApiBlogPost[] = await res.json()
    const normalized: BlogPost[] = apiPosts.map(p => ({
      id: p.id,
      slug: p.slug,
      title_ka: p.title_ka, title_en: p.title_en, title_ru: p.title_ru,
      excerpt_ka: p.excerpt_ka, excerpt_en: p.excerpt_en, excerpt_ru: p.excerpt_ru,
      coverImage: p.coverImage,
      publishedDate: p.publishedAt || new Date().toISOString(),
    }))
    const apiSlugs = new Set(normalized.map(p => p.slug))
    const filteredMock = mockBlogPosts.filter(p => !apiSlugs.has(p.slug))
    return [...normalized, ...filteredMock].slice(0, 3)
  } catch (error) {
    return mockBlogPosts.slice(0, 3)
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  const title = t('seo.title')
  const description = t('seo.description')
  const url = `https://vibegeorgia.com/${locale}`
  return {
    title,
    description,
    keywords: t('seo.keywords'),
    alternates: {
      canonical: url,
      languages: {
        'ka': 'https://vibegeorgia.com/ka',
        'en': 'https://vibegeorgia.com/en',
        'ru': 'https://vibegeorgia.com/ru',
        'x-default': 'https://vibegeorgia.com/en',
      },
    },
  }
}

// --- Component ---
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('home')

  const featuredTours = await getFeaturedTours()
  const latestPosts = await getLatestBlogPosts()

  const destinations = [
    { name: t('destinations.svaneti'), image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' },
    { name: t('destinations.kazbegi'), image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80' },
    { name: t('destinations.batumi'), image: 'https://api.visitbatumi.com/media/image/ec568ecc98e84a9db0c9d34c051c2191.jpg' },
    { name: t('destinations.tbilisi'), image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/13/b0/81/77/narikala-fortress-largejpg.jpg?w=700&h=-1&s=1' },
    { name: t('destinations.kakheti'), image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80' },
    { name: t('destinations.gudauri'), image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section - OPTIMIZED FOR LCP */}
      <section className="relative h-[500px] sm:h-[600px] lg:h-[700px]">
        <Image
          src="https://res.cloudinary.com/dj7qaif1i/image/upload/f_auto,q_auto,w_1920/v1771396197/cover_1_secna5.jpg"
          alt={t('hero.imageAlt')}
          priority={true}
          fill
          sizes="100vw"
          fetchPriority="high"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl sm:text-7xl font-bold mb-6">{t('hero.title')}</h1>
            <p className="text-lg sm:text-2xl mb-10 max-w-3xl mx-auto">{t('hero.subtitle')}</p>
            <div className="flex gap-4 justify-center">
              <Link href={`/${locale}/tours`} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-colors">
                {t('hero.ctaViewTours')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-bold text-center mb-12">{t('featuredTours.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredTours.map((tour) => (
              <article key={tour.id} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
                <Link href={`/${locale}/tours/${tour.slug}`}>
                  <div className="relative h-48">
                    <Image
                      src={buildCloudinaryUrl(tour.images[0]?.url || '')}
                      alt={getLocalizedField(tour, 'title', locale)}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2">{getLocalizedField(tour, 'title', locale)}</h3>
                    <p className="text-sm text-gray-500">⏱️ {formatDuration(tour.duration, locale)}</p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-12">{t('destinations.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {destinations.map((dest, i) => (
              <div key={i} className="group relative h-64 rounded-xl overflow-hidden shadow-lg">
                <Image src={dest.image} alt={dest.name} fill sizes="33vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">{dest.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 bg-white">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl sm:text-5xl font-bold text-center mb-12">{t('latestBlog.title')}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {latestPosts.map((post) => (
        /* 👇 აქ წავშალე 'border' კლასი */
        <article key={post.id} className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
          <Link href={`/${locale}/blog/${post.slug}`}>
            <div className="relative h-48">
              <Image 
                src={buildCloudinaryUrl(post.coverImage)} 
                alt={getLocalizedField(post, 'title', locale)} 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="p-5">
              <time className="text-xs text-gray-400">{formatDate(post.publishedDate, locale)}</time>
              <h3 className="font-bold mt-2">{getLocalizedField(post, 'title', locale)}</h3>
            </div>
          </Link>
        </article>
      ))}
    </div>
  </div>
</section>
    </div>
  )
}