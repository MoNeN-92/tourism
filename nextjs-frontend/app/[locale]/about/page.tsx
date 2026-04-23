import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import ProgressiveImage from '@/components/ProgressiveImage'
import JsonLd from '@/components/JsonLd'
import PartnerMentionsSection from '@/components/PartnerMentionsSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import { getAuthorityHubCopy } from '@/lib/authority'
import { buildCloudinarySources } from '@/lib/cloudinary'
import { absoluteUrl, buildCanonicalUrl, localizedAlternates, openGraphLocale, SITE_NAME } from '@/lib/seo'
import { getPartnerHotels } from '@/lib/partner-hotels'
import { getLocalizedPartnerMentions, getLocalizedTrustTestimonials, getTrustSignalsCopy, getTrustTestimonials } from '@/lib/trust-signals'
import { buildBreadcrumbSchema, buildTravelAgencySchema } from '@/lib/structured-data'
import Link from 'next/link'

const HERO_IMAGE = buildCloudinarySources(
  'https://res.cloudinary.com/dj7qaif1i/image/upload/v1771399055/Tbilisi_panorama_nk1rmx.jpg',
)

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  const title = t('seo.title')
  const description = t('seo.description')

  return {
    title,
    description,
    keywords: t('seo.keywords'),
    authors: [{ name: SITE_NAME }],
    openGraph: {
      title,
      description,
      url: buildCanonicalUrl(locale, '/about'),
      siteName: SITE_NAME,
      locale: openGraphLocale(locale),
      type: 'website',
      images: [{
        url: absoluteUrl('/og-about.jpg'),
        width: 1200,
        height: 630,
        alt: title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl('/og-about.jpg')],
    },
    alternates: localizedAlternates(locale, '/about'),
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  const nav = await getTranslations({ locale, namespace: 'nav' })
  const authority = getAuthorityHubCopy(locale)
  const trustCopy = getTrustSignalsCopy(locale)
  const [hotels, testimonials] = await Promise.all([getPartnerHotels(), getTrustTestimonials()])
  const partnerMentions = getLocalizedPartnerMentions(hotels, locale, 3)
  const localizedTestimonials = getLocalizedTrustTestimonials(testimonials, locale)

  return (
    <>
      <JsonLd
        data={[
          buildTravelAgencySchema({ description: t('intro') }),
          buildBreadcrumbSchema([
            { name: nav('home'), url: buildCanonicalUrl(locale) },
            { name: t('title'), url: buildCanonicalUrl(locale, '/about') },
          ]),
        ]}
      />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section with Tbilisi Background */}
        <section className="relative h-[400px] sm:h-[500px] lg:h-[600px]">
          <ProgressiveImage
            src={HERO_IMAGE.src}
            lowResSrc={HERO_IMAGE.lowResSrc}
            alt="Tbilisi Panorama"
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-400/30" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl text-white">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                  {t('title')}
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-blue-100">
                  {t('subtitle')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto">
            <article className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {t('intro')}
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {t('experience')}
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {t('fullService')}
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* Services Section */}
        <section className="bg-white py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
                {t('servicesTitle')}
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-md">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">🏨</span>
                    <span className="text-lg text-gray-700">{t('services.hotels')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">🗺️</span>
                    <span className="text-lg text-gray-700">{t('services.tours')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">✈️</span>
                    <span className="text-lg text-gray-700">{t('services.transfers')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">🏢</span>
                    <span className="text-lg text-gray-700">{t('services.corporate')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">🛎️</span>
                    <span className="text-lg text-gray-700">{t('services.concierge')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    {authority.metricsTitle}
                  </h2>
                  <p className="mt-4 text-gray-600">{authority.summaryText}</p>
                </div>
                <Link
                  href={`/${locale}/travel-experts`}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-[#101820] px-5 text-sm font-medium text-[#101820] transition-colors hover:bg-[#101820] hover:text-white"
                >
                  {authority.inlineCtaLabel}
                </Link>
              </div>
              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {authority.metrics.map((metric) => (
                  <article key={metric.label} className="rounded-[24px] border border-[#e5dfd4] bg-[#f8f5ef] p-6 shadow-sm">
                    <p className="text-3xl font-semibold text-[#101820]">{metric.value}</p>
                    <h3 className="mt-4 text-lg font-semibold text-[#101820]">{metric.label}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#576273]">{metric.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <TestimonialsSection
          locale={locale}
          title={trustCopy.testimonialsTitle}
          subtitle={trustCopy.testimonialsSubtitle}
          ctaLabel={trustCopy.testimonialCta}
          emptyLabel={trustCopy.emptyTestimonials}
          testimonials={localizedTestimonials}
        />

        {partnerMentions.length > 0 ? (
          <PartnerMentionsSection
            locale={locale}
            title={trustCopy.partnerTitle}
            subtitle={trustCopy.partnerSubtitle}
            ctaLabel={trustCopy.partnerCta}
            partners={partnerMentions}
          />
        ) : null}

        {/* Why Choose Us Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
              {t('whyTitle')}
            </h2>
            <article className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {t('whyParagraph1')}
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {t('whyParagraph2')}
                </p>
                <p className="text-lg text-gray-700 leading-relaxed font-medium text-blue-700">
                  {t('whyConclusion')}
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>
    </>
  )
}
