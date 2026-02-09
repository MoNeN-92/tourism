import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { mockBlogPosts, mockTours } from '@/lib/mockData'
import type { Metadata } from 'next'

interface Tour {
  id: string
  slug: string
  title_ka: string
  title_en: string
  title_ru: string
  excerpt_ka: string
  excerpt_en: string
  excerpt_ru: string
  coverImage: string
  duration: string
  price?: number
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

function getLocalizedField<T extends Tour | BlogPost>(
  item: T,
  field: 'title' | 'excerpt',
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

  const featuredTours = mockTours.slice(0, 4)
  const latestPosts = mockBlogPosts.slice(0, 3)

  const destinations = [
    {
      name: t('destinations.svaneti'),
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    },
    {
      name: t('destinations.kazbegi'),
      image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80',
    },
    {
      name: t('destinations.batumi'),
      image: 'https://images.unsplash.com/photo-1502301103665-0b95cc738daf?w=800&q=80',
    },
    {
      name: t('destinations.tbilisi'),
      image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
    },
    {
      name: t('destinations.kakheti'),
      image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
    },
    {
      name: t('destinations.gudauri'),
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
    },
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
    email: '[email protected]',
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
          description: getLocalizedField(tour, 'excerpt', locale),
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
            src="https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1920&q=80"
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
                <Link
                  href={`/${locale}/tours`}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  {t('hero.ctaViewTours')}
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {featuredTours.map((tour) => {
                const title = getLocalizedField(tour, 'title', locale)
                const excerpt = getLocalizedField(tour, 'excerpt', locale)

                return (
                  <article
                    key={tour.id}
                    className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Link href={`/${locale}/tours/${tour.slug}`}>
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={tour.coverImage}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{excerpt}</p>
                      </div>
                    </Link>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t('whyChooseUs.title')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                {t('whyChooseUs.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <article className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4" aria-hidden="true">🎯</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('whyChooseUs.expertise.title')}
                </h3>
                <p className="text-gray-600">{t('whyChooseUs.expertise.description')}</p>
              </article>

              <article className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4" aria-hidden="true">🛡️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('whyChooseUs.safety.title')}
                </h3>
                <p className="text-gray-600">{t('whyChooseUs.safety.description')}</p>
              </article>

              <article className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4" aria-hidden="true">⭐</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('whyChooseUs.quality.title')}
                </h3>
                <p className="text-gray-600">{t('whyChooseUs.quality.description')}</p>
              </article>

              <article className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4" aria-hidden="true">💬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('whyChooseUs.support.title')}
                </h3>
                <p className="text-gray-600">{t('whyChooseUs.support.description')}</p>
              </article>
            </div>
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t('destinations.title')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                {t('destinations.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {destinations.map((destination, index) => (
                <article
                  key={index}
                  className="group relative h-48 sm:h-56 lg:h-64 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <Image
                    src={destination.image}
                    alt={`${destination.name} - ${t('destinations.subtitle')}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {destination.name}
                    </h3>
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
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t('latestBlog.title')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                {t('latestBlog.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8">
              {latestPosts.map((post) => {
                const title = getLocalizedField(post, 'title', locale)
                const excerpt = getLocalizedField(post, 'excerpt', locale)
                const formattedDate = formatDate(post.publishedDate, locale)

                return (
                  <article
                    key={post.id}
                    className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <Link href={`/${locale}/blog/${post.slug}`}>
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.coverImage}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-5">
                        <time className="text-sm text-gray-500 mb-2 block" dateTime={post.publishedDate}>
                          📅 {formattedDate}
                        </time>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{excerpt}</p>
                      </div>
                    </Link>
                  </article>
                )
              })}
            </div>

            <div className="text-center">
              <Link
                href={`/${locale}/blog`}
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {t('latestBlog.viewAll')}
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-lg sm:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto opacity-90">
              {t('cta.subtitle')}
            </p>
            <Link
              href={`/${locale}/tours`}
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              {t('cta.button')}
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}