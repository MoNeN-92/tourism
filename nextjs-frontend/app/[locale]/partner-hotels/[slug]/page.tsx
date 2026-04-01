import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { buildCanonicalUrl, localizedAlternates, openGraphLocale, SITE_NAME } from '@/lib/seo'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import JsonLd from '@/components/JsonLd'
import { buildBreadcrumbSchema, buildHotelSchema } from '@/lib/structured-data'
import { getLocalizedHotelField, getPartnerHotel } from '@/lib/partner-hotels'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const hotel = await getPartnerHotel(slug)

  if (!hotel) {
    return {
      title: 'Partner Hotel Not Found | Vibe Georgia',
      alternates: localizedAlternates(locale, `/partner-hotels/${slug}`),
      robots: {
        index: false,
        follow: true,
      },
    }
  }

  const title = `${hotel.name} | Vibe Georgia`
  const description = getLocalizedHotelField(hotel, 'shortDescription', locale).slice(0, 160)
  const image = buildCloudinaryUrl(hotel.coverImageUrl)

  return {
    title,
    description,
    alternates: localizedAlternates(locale, `/partner-hotels/${slug}`),
    openGraph: {
      title,
      description,
      url: buildCanonicalUrl(locale, `/partner-hotels/${slug}`),
      siteName: SITE_NAME,
      locale: openGraphLocale(locale),
      type: 'website',
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: hotel.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function PartnerHotelPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'partnerHotels' })
  const nav = await getTranslations({ locale, namespace: 'nav' })
  const hotel = await getPartnerHotel(slug)

  if (!hotel) {
    notFound()
  }

  const description = getLocalizedHotelField(hotel, 'description', locale)
  const shortDescription = getLocalizedHotelField(hotel, 'shortDescription', locale)

  return (
    <>
      <JsonLd
        data={[
          buildHotelSchema({
            locale,
            slug: hotel.slug,
            name: hotel.name,
            description: shortDescription,
            address: hotel.address,
            image: hotel.coverImageUrl ? buildCloudinaryUrl(hotel.coverImageUrl) : null,
          }),
          buildBreadcrumbSchema([
            { name: nav('home'), url: buildCanonicalUrl(locale) },
            { name: t('title'), url: buildCanonicalUrl(locale, '/partner-hotels') },
            { name: hotel.name, url: buildCanonicalUrl(locale, `/partner-hotels/${hotel.slug}`) },
          ]),
        ]}
      />
      <div className="min-h-screen bg-[#f7f4ee]">
      <section className="relative overflow-hidden bg-[#101820] text-white">
        <div className="absolute inset-0">
          <Image
            src={buildCloudinaryUrl(hotel.coverImageUrl)}
            alt={hotel.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-55"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-[#101820]" />

        <div className="relative mx-auto flex min-h-[420px] max-w-7xl flex-col justify-end px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/partner-hotels`}
            className="mb-8 inline-flex min-h-[44px] w-fit items-center rounded-full border border-white/30 px-4 text-sm text-white/90 hover:bg-white/10"
          >
            {t('backToHotels')}
          </Link>

          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center rounded-full bg-white/12 px-3 py-1 text-sm font-medium text-white/90 backdrop-blur">
              {hotel.starRating}/5 {t('stars')}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">{hotel.name}</h1>
            <p className="mt-5 max-w-2xl text-lg text-white/88 sm:text-xl">{shortDescription}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="rounded-[28px] border border-[#e5dfd4] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold text-[#101820]">{t('overview')}</h2>
            <div className="mt-4 whitespace-pre-line text-base leading-8 text-[#384454]">{description}</div>

            {hotel.images.length > 0 && (
              <div className="mt-10">
                <h3 className="text-xl font-semibold text-[#101820]">{t('gallery')}</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {hotel.images.map((image) => (
                    <div key={image.id} className="relative h-64 overflow-hidden rounded-[24px] bg-[#efe8da]">
                      <Image
                        src={buildCloudinaryUrl(image.url)}
                        alt={hotel.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-[#e5dfd4] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#101820]">{t('contactTitle')}</h2>
              <dl className="mt-4 space-y-4 text-sm text-[#445062]">
                <div>
                  <dt className="font-medium text-[#101820]">{t('address')}</dt>
                  <dd className="mt-1">{hotel.address}</dd>
                </div>
                <div>
                  <dt className="font-medium text-[#101820]">{t('phone')}</dt>
                  <dd className="mt-1">
                    <a href={`tel:${hotel.contactPhone}`} className="hover:text-[#0f6b66]">
                      {hotel.contactPhone}
                    </a>
                  </dd>
                </div>
                {hotel.website && (
                  <div>
                    <dt className="font-medium text-[#101820]">{t('website')}</dt>
                    <dd className="mt-1 break-all">
                      <a
                        href={hotel.website}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#0f6b66]"
                      >
                        {hotel.website}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-[28px] border border-[#d9d2c5] bg-[#ebe2d2] p-6 text-[#101820] shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-[#6a6258]">{t('partnerBadge')}</p>
              <p className="mt-3 text-lg leading-7">{t('partnerIntro')}</p>
            </div>
          </aside>
        </div>
      </section>
      </div>
    </>
  )
}
