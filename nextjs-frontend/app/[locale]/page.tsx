// app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { mockBlogPosts } from '@/lib/mockData'
import type { Metadata } from 'next'
import { buildCloudinarySources, buildCloudinaryUrl } from '@/lib/cloudinary'
import { getCommercialPageSummaries } from '@/lib/commercial-pages'
import { buildCanonicalUrl, localizedAlternates, SITE_NAME } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import { buildTravelAgencySchema } from '@/lib/structured-data'

const HOMEPAGE_REVALIDATE_SECONDS = 300
const HERO_IMAGE = buildCloudinarySources(
  'https://res.cloudinary.com/dj7qaif1i/image/upload/v1771396197/cover_1_secna5.jpg',
)

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

interface PartnerHotelImage {
  id: string
  url: string
  publicId: string
  createdAt: string
}

interface PartnerHotel {
  id: string
  slug: string
  name: string
  starRating: number
  coverImageUrl: string
  shortDescription_ka: string
  shortDescription_en: string
  shortDescription_ru: string
  description_ka: string
  description_en: string
  description_ru: string
  address: string
  contactPhone: string
  website: string | null
  images: PartnerHotelImage[]
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
function getLocalizedField(
  item: any,
  field: 'title' | 'excerpt' | 'description' | 'location' | 'shortDescription',
  locale: string
): string {
  const fieldMap: Record<string, string> = {
    ka: `${field}_ka`,
    en: `${field}_en`,
    ru: `${field}_ru`,
  }
  const localizedFieldKey = fieldMap[locale] || fieldMap['ka']
  const localizedValue = item[localizedFieldKey]
  const fallbackValue = item[`${field}_ka`]
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

function getCommercialSectionCopy(locale: string) {
  if (locale === 'ka') {
    return {
      title: 'დაგეგმე მოგზაურობა ინტერესის მიხედვით',
      description:
        'აღმოაჩინე საქართველოს ყველაზე მნიშვნელოვანი სამოგზაურო მიმართულებები: კერძო ტურები, ღვინის მარშრუტები და გამორჩეული მთის გამოცდილებები.',
      cta: 'დაგეგმე Vibe Georgia-სთან',
      explore: 'გვერდის ნახვა',
    }
  }

  if (locale === 'ru') {
    return {
      title: 'Планируйте поездку по стилю путешествия',
      description:
        'Откройте самые важные туристические направления Грузии: частные туры, винные маршруты и знаковые горные впечатления.',
      cta: 'Планировать с Vibe Georgia',
      explore: 'Открыть страницу',
    }
  }

  return {
    title: 'Plan Your Trip by Travel Style',
    description:
      'Explore the most commercially important travel themes for Georgia, from private touring and wine routes to signature mountain destinations.',
    cta: 'Plan with Vibe Georgia',
    explore: 'Explore page',
  }
}

// --- Data Fetching ---
async function getFeaturedTours(): Promise<Tour[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const res = await fetch(`${apiUrl}/tours`, {
      next: { revalidate: HOMEPAGE_REVALIDATE_SECONDS },
    })
    if (!res.ok) return []
    const allTours: Tour[] = await res.json()
    const activeTours = allTours.filter((tour) => tour.status === true)
    const sorted = [...activeTours].sort((left, right) => {
      const leftTime = Date.parse(left.updatedAt || left.createdAt || '')
      const rightTime = Date.parse(right.updatedAt || right.createdAt || '')
      return rightTime - leftTime
    })
    return sorted.slice(0, Math.min(4, sorted.length))
  } catch {
    return []
  }
}

async function getLatestBlogPosts(): Promise<BlogPost[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const res = await fetch(`${apiUrl}/blog`, {
      next: { revalidate: HOMEPAGE_REVALIDATE_SECONDS },
    })
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
    return [...normalized, ...filteredMock]
      .sort((left, right) => Date.parse(right.publishedDate) - Date.parse(left.publishedDate))
      .slice(0, 3)
  } catch {
    return mockBlogPosts.slice(0, 3)
  }
}

async function getPartnerHotels(): Promise<PartnerHotel[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const res = await fetch(`${apiUrl}/partner-hotels`, {
      next: { revalidate: HOMEPAGE_REVALIDATE_SECONDS },
    })
    if (!res.ok) return []
    const hotels: PartnerHotel[] = await res.json()
    return [...hotels].sort((left, right) => left.name.localeCompare(right.name))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  const title = t('seo.title')
  const description = t('seo.description')
  return {
    title,
    description,
    keywords: t('seo.keywords'),
    alternates: localizedAlternates(locale),
    openGraph: {
      title,
      description,
      url: buildCanonicalUrl(locale),
      siteName: SITE_NAME,
      locale: locale === 'ka' ? 'ka_GE' : locale === 'ru' ? 'ru_RU' : 'en_US',
      type: 'website',
    },
  }
}

// --- Component ---
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('home')

  const [featuredTours, latestPosts, partnerHotels] = await Promise.all([
    getFeaturedTours(),
    getLatestBlogPosts(),
    getPartnerHotels(),
  ])
  const commercialPages = getCommercialPageSummaries(locale as 'ka' | 'en' | 'ru')
  const commercialSection = getCommercialSectionCopy(locale)

  return (
    <>
      <JsonLd data={buildTravelAgencySchema()} />
      <div className="min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative h-[500px] sm:h-[600px] lg:h-[700px]">
<Image
  src={HERO_IMAGE.src}
  blurDataURL={HERO_IMAGE.lowResSrc}
  placeholder="blur"
  alt={t('hero.imageAlt')}
  priority
  fetchPriority="high"
  fill
  className="object-cover"
  sizes="100vw"
  quality={70}
/>
  <div className="absolute inset-0 bg-black/20" />
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-4xl sm:text-7xl font-bold mb-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
        {t('hero.title')}
      </h1>
      <p className="text-lg sm:text-2xl mb-10 max-w-3xl mx-auto text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
        {t('hero.subtitle')}
      </p>
      <div className="flex gap-4 justify-center">
        <Link href={`/${locale}/tours`} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-colors">
          {t('hero.ctaViewTours')}
        </Link>
      </div>
    </div>
  </div>
</section>

      {/* 2. Featured Tours Section */}
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
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                      quality={60}
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

      {/* 3. Why Choose Us (Added here) */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">{t('whyChooseUs.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t('whyChooseUs.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🎯', title: t('whyChooseUs.expertise.title'), desc: t('whyChooseUs.expertise.description') },
              { icon: '🛡️', title: t('whyChooseUs.safety.title'), desc: t('whyChooseUs.safety.description') },
              { icon: '⭐', title: t('whyChooseUs.quality.title'), desc: t('whyChooseUs.quality.description') },
              { icon: '💬', title: t('whyChooseUs.support.title'), desc: t('whyChooseUs.support.description') },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-xl text-center shadow-sm hover:shadow-md transition-all">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#fffaf1]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-3xl sm:text-5xl font-bold text-[#101820]">
                {commercialSection.title}
              </h2>
              <p className="mt-3 text-[#556070]">
                {commercialSection.description}
              </p>
            </div>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex min-h-[44px] items-center rounded-full border border-[#101820] px-5 text-sm font-medium text-[#101820] transition-colors hover:bg-[#101820] hover:text-white"
            >
              {commercialSection.cta}
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {commercialPages.map((page) => (
              <article key={page.slug} className="rounded-[28px] border border-[#e5dfd4] bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                <h3 className="text-2xl font-semibold text-[#101820]">{page.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#576273]">{page.description}</p>
                <Link
                  href={`/${locale}/${page.slug}`}
                  className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-[#101820] px-5 text-sm font-medium text-white transition-colors hover:bg-[#0f6b66]"
                >
                  {commercialSection.explore}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Partner Hotels */}
      <section className="py-16 bg-[#f6f3ee]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl sm:text-5xl font-bold text-[#101820]">{t('partnerHotels.title')}</h2>
              <p className="mt-3 max-w-2xl text-[#556070]">{t('partnerHotels.subtitle')}</p>
            </div>
            <Link
              href={`/${locale}/partner-hotels`}
              className="inline-flex min-h-[44px] items-center rounded-full border border-[#101820] px-5 text-sm font-medium text-[#101820] transition-colors hover:bg-[#101820] hover:text-white"
            >
              {t('partnerHotels.viewAll')}
            </Link>
          </div>

          {partnerHotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {partnerHotels.map((hotel) => (
                <article
                  key={hotel.id}
                  className="group overflow-hidden rounded-[28px] border border-[#e5dfd4] bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <Link href={`/${locale}/partner-hotels/${hotel.slug}`}>
                    <div className="relative h-72 overflow-hidden">
                      <Image
                        src={buildCloudinaryUrl(hotel.coverImageUrl)}
                        alt={hotel.name}
                        fill
                        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                        quality={60}
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-semibold text-[#101820]">{hotel.name}</h3>
                        <span className="rounded-full bg-[#efe8da] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6a6258]">
                          {hotel.starRating}/5
                        </span>
                      </div>
                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#576273]">
                        {getLocalizedField(hotel, 'shortDescription', locale)}
                      </p>
                      <span className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-[#101820] px-5 text-sm font-medium text-white transition-colors group-hover:bg-[#0f6b66]">
                        {t('partnerHotels.viewHotel')}
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-[#d3cab9] bg-white px-6 py-12 text-center text-[#687384]">
              {t('partnerHotels.empty')}
            </div>
          )}
        </div>
      </section>
      {/* 5. Blog Section */}
<section className="py-16 bg-white">
  <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <h2 className="text-3xl sm:text-5xl font-bold mb-4">
        {t('blog.title')}
      </h2>
      <p className="text-gray-600 max-w-2xl mx-auto">
        {t('blog.subtitle')} {/* დავამატეთ ქვესათაური */}
      </p>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {latestPosts.length > 0 ? (
        latestPosts.map((post) => (
          <article 
            key={post.id} 
            className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
          >
            <Link href={`/${locale}/blog/${post.slug}`}>
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.coverImage || '/fallback-image.jpg'}
                  alt={getLocalizedField(post, 'title', locale)}
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  quality={60}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-5">
                <p className="text-xs text-blue-600 font-semibold mb-2 uppercase">
                  {formatDate(post.publishedDate, locale)}
                </p>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                  {getLocalizedField(post, 'title', locale)}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {getLocalizedField(post, 'excerpt', locale)}
                </p>
                <span className="text-blue-600 text-sm font-bold group-hover:underline">
                  {t('blog.readMore')} →
                </span>
              </div>
            </Link>
          </article>
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500">{t('blog.noPosts')}</p>
        </div>
      )}
    </div>
  </div>
</section>
      </div>
    </>
  )
}
