import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import JsonLd from '@/components/JsonLd'
import TestimonialsSection from '@/components/TestimonialsSection'
import { getLocalizedHotelField, getPartnerHotels } from '@/lib/partner-hotels'
import { getLocalizedTrustTestimonials, getTrustSignalsCopy, getTrustTestimonials } from '@/lib/trust-signals'
import {
  absoluteUrl,
  buildCanonicalUrl,
  localizedAlternates,
  openGraphLocale,
  SITE_NAME,
} from '@/lib/seo'
import { buildBreadcrumbSchema, buildHotelSchema, buildItemListSchema, buildServiceSchema } from '@/lib/structured-data'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'partnerHotels' })
  const title = `${t('title')} | Vibe Georgia`
  const description = t('subtitle')

  return {
    title,
    description,
    alternates: localizedAlternates(locale, '/partner-hotels'),
    openGraph: {
      title,
      description,
      url: buildCanonicalUrl(locale, '/partner-hotels'),
      siteName: SITE_NAME,
      locale: openGraphLocale(locale),
      type: 'website',
      images: [
        {
          url: absoluteUrl('/images/og-image.jpg'),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl('/images/og-image.jpg')],
    },
  }
}

export default async function PartnerHotelsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'partnerHotels' })
  const nav = await getTranslations({ locale, namespace: 'nav' })
  const [hotels, testimonials] = await Promise.all([getPartnerHotels(), getTrustTestimonials()])
  const trustCopy = getTrustSignalsCopy(locale)
  const localizedTestimonials = getLocalizedTrustTestimonials(testimonials, locale)

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: nav('home'), url: buildCanonicalUrl(locale) },
            { name: t('title'), url: buildCanonicalUrl(locale, '/partner-hotels') },
          ]),
          buildServiceSchema({
            locale,
            path: '/partner-hotels',
            name: t('title'),
            description: t('subtitle'),
            serviceType: 'Trusted accommodation partner network in Georgia',
          }),
          buildItemListSchema({
            name: t('title'),
            url: buildCanonicalUrl(locale, '/partner-hotels'),
            items: hotels.map((hotel) => ({
              name: hotel.name,
              url: buildCanonicalUrl(locale, `/partner-hotels/${hotel.slug}`),
              description: getLocalizedHotelField(hotel, 'shortDescription', locale),
            })),
          }),
          ...hotels.map((hotel) =>
            buildHotelSchema({
              locale,
              slug: hotel.slug,
              name: hotel.name,
              description: getLocalizedHotelField(hotel, 'shortDescription', locale),
              address: hotel.address,
              image: hotel.coverImageUrl ? buildCloudinaryUrl(hotel.coverImageUrl) : null,
            }),
          ),
        ]}
      />
      <div className="min-h-screen bg-[#f7f4ee]">
        <section className="border-b border-[#e5dfd4] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold tracking-tight text-[#101820] sm:text-6xl">
                {t('title')}
              </h1>
              <p className="mt-5 text-lg leading-8 text-[#556070]">{t('subtitle')}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {hotels.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {hotels.map((hotel) => (
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
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold text-[#101820]">{hotel.name}</h2>
                        <span className="rounded-full bg-[#efe8da] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6a6258]">
                          {hotel.starRating}/5
                        </span>
                      </div>
                      <p className="mt-4 text-sm font-medium uppercase tracking-[0.14em] text-[#6a6258]">
                        {hotel.address}
                      </p>
                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#576273]">
                        {getLocalizedHotelField(hotel, 'shortDescription', locale)}
                      </p>
                      <span className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-[#101820] px-5 text-sm font-medium text-white transition-colors group-hover:bg-[#0f6b66]">
                        {t('viewHotel')}
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-[#d3cab9] bg-white px-6 py-12 text-center text-[#687384]">
              {t('empty')}
            </div>
          )}
        </section>

        <TestimonialsSection
          locale={locale}
          title={trustCopy.testimonialsTitle}
          subtitle={trustCopy.testimonialsSubtitle}
          ctaLabel={trustCopy.testimonialCta}
          emptyLabel={trustCopy.emptyTestimonials}
          testimonials={localizedTestimonials}
        />
      </div>
    </>
  )
}
