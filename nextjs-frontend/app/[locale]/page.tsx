// app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { mockBlogPosts } from '@/lib/mockData'
import type { Metadata } from 'next'

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
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  return date.toLocaleDateString(
    locale === 'ka' ? 'ka-GE' : locale === 'ru' ? 'ru-RU' : 'en-US',
    options
  )
}

async function getFeaturedTours(): Promise<Tour[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const res = await fetch(`${apiUrl}/tours`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    
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
    const res = await fetch(`${apiUrl}/blog`, {
      cache: 'no-store',
    })

    if (!res.ok) return []

    const apiPosts: ApiBlogPost[] = await res.json()

    // Convert to BlogPost format
    const normalized: BlogPost[] = apiPosts.map(p => ({
      id: p.id,
      slug: p.slug,
      title_ka: p.title_ka,
      title_en: p.title_en,
      title_ru: p.title_ru,
      excerpt_ka: p.excerpt_ka,
      excerpt_en: p.excerpt_en,
      excerpt_ru: p.excerpt_ru,
      coverImage: p.coverImage,
      publishedDate: p.publishedAt || new Date().toISOString(),
    }))

    // Merge: API first, then mock (no duplicates)
    const apiSlugs = new Set(normalized.map(p => p.slug))
    const filteredMock = mockBlogPosts.filter(p => !apiSlugs.has(p.slug))
    const merged = [...normalized, ...filteredMock]

    return merged.slice(0, 3)
  } catch (error) {
    // Fallback to mock only
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
    authors: [{ name: 'Vibe Georgia' }],
    openGraph: {
      title,
      description,
      url,
      siteName: 'Vibe Georgia',
      locale: locale === 'ka' ? 'ka_GE' : locale === 'ru' ? 'ru_RU' : 'en_US',
      type: 'website',
      images: [{
        url: 'https://vibegeorgia.com/og-home.jpg',
        width: 1200,
        height: 630,
        alt: title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://vibegeorgia.com/og-home.jpg'],
    },
    alternates: {
      canonical: url,
      languages: {
        'ka': 'https://vibegeorgia.com/ka',
        'en': 'https://vibegeorgia.com/en',
        'ru': 'https://vibegeorgia.com/ru',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Vibe Georgia',
    description: t('seo.description'),
    url: 'https://vibegeorgia.com',
    logo: 'https://vibegeorgia.com/logo.png',
    image: 'https://vibegeorgia.com/og-home.jpg',
    telephone: '+995596550099',
    email: 'info@vibegeorgia.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tbilisi',
      addressCountry: 'GE',
    },
    sameAs: [
      'https://facebook.com/vibegeorgia',
      'https://instagram.com/vibegeorgia',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Tours in Georgia',
      itemListElement: featuredTours.map((tour) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'TouristTrip',
          name: getLocalizedField(tour, 'title', locale),
          description: getLocalizedField(tour, 'description', locale),
        },
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[500px] sm:h-[600px] lg:h-[700px]">
          <Image
            src="https://res.cloudinary.com/dj7qaif1i/image/upload/v1771396197/cover_1_secna5.jpg"
            alt={t('hero.imageAlt')}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6">
                {t('hero.title')}
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-10 max-w-3xl mx-auto">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/${locale}/tours`} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors shadow-lg">
                  {t('hero.ctaViewTours')}
                </Link>
                <Link href={`/${locale}/contact`} className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors shadow-lg">
                  {t('hero.ctaContact')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Tours */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t('featuredTours.title')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                {t('featuredTours.subtitle')}
              </p>
            </div>

            {featuredTours.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {featuredTours.map((tour) => {
                  const title = getLocalizedField(tour, 'title', locale)
                  const description = getLocalizedField(tour, 'description', locale)
                  const coverImage = tour.images.length > 0
                    ? tour.images[0].url
                    : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'

                  return (
                    <article key={tour.id} className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <Link href={`/${locale}/tours/${tour.slug}`}>
                        <div className="relative h-48 overflow-hidden">
                          <Image src={coverImage} alt={title} fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
                          <div className="text-sm text-gray-500">⏱️ {tour.duration}</div>
                        </div>
                      </Link>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">{t('tours.noTours')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">{t('whyChooseUs.title')}</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">{t('whyChooseUs.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                { icon: '🎯', title: t('whyChooseUs.expertise.title'), desc: t('whyChooseUs.expertise.description') },
                { icon: '🛡️', title: t('whyChooseUs.safety.title'), desc: t('whyChooseUs.safety.description') },
                { icon: '⭐', title: t('whyChooseUs.quality.title'), desc: t('whyChooseUs.quality.description') },
                { icon: '💬', title: t('whyChooseUs.support.title'), desc: t('whyChooseUs.support.description') },
              ].map((item, i) => (
                <article key={i} className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">{t('destinations.title')}</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">{t('destinations.subtitle')}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {destinations.map((destination, index) => (
                <article key={index} className="group relative h-48 sm:h-56 lg:h-64 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer">
                  <Image src={destination.image} alt={destination.name} fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{destination.name}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Blog Posts */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">{t('latestBlog.title')}</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">{t('latestBlog.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8">
              {latestPosts.map((post) => {
                const title = getLocalizedField(post, 'title', locale)
                const excerpt = getLocalizedField(post, 'excerpt', locale)
                const formattedDate = formatDate(post.publishedDate, locale)

                return (
                  <article key={post.id} className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                    <Link href={`/${locale}/blog/${post.slug}`}>
                      <div className="relative h-48 overflow-hidden">
                        <Image src={post.coverImage} alt={title} fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      </div>
                      <div className="p-5">
                        <time className="text-sm text-gray-500 mb-2 block" dateTime={post.publishedDate}>
                          📅 {formattedDate}
                        </time>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{excerpt}</p>
                      </div>
                    </Link>
                  </article>
                )
              })}
            </div>

            <div className="text-center">
              <Link href={`/${locale}/blog`} className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                {t('latestBlog.viewAll')}
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">{t('cta.title')}</h2>
            <p className="text-lg sm:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto opacity-90">{t('cta.subtitle')}</p>
            <Link href={`/${locale}/tours`} className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors shadow-lg">
              {t('cta.button')}
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}