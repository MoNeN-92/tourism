import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import JsonLd from '@/components/JsonLd'
import PartnerMentionsSection from '@/components/PartnerMentionsSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import { absoluteUrl, buildCanonicalUrl, localizedAlternates, openGraphLocale, SITE_NAME } from '@/lib/seo'
import { getAuthorityHubCopy } from '@/lib/authority'
import { getPartnerHotels } from '@/lib/partner-hotels'
import {
  getLocalizedPartnerMentions,
  getLocalizedTrustTestimonials,
  getTrustSignalsCopy,
  getTrustTestimonials,
} from '@/lib/trust-signals'
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildFaqSchema,
  buildItemListSchema,
  buildServiceSchema,
  buildTravelAgencySchema,
} from '@/lib/structured-data'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const copy = getAuthorityHubCopy(locale)
  const title = `${copy.title} | ${SITE_NAME}`

  return {
    title,
    description: copy.subtitle,
    alternates: localizedAlternates(locale, '/travel-experts'),
    openGraph: {
      title,
      description: copy.subtitle,
      url: buildCanonicalUrl(locale, '/travel-experts'),
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
      description: copy.subtitle,
      images: [absoluteUrl('/images/og-image.jpg')],
    },
  }
}

export default async function TravelExpertsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const nav = await getTranslations({ locale, namespace: 'nav' })
  const copy = getAuthorityHubCopy(locale)
  const trustCopy = getTrustSignalsCopy(locale)
  const [hotels, testimonials] = await Promise.all([getPartnerHotels(), getTrustTestimonials()])
  const partnerMentions = getLocalizedPartnerMentions(hotels, locale, 3)
  const localizedTestimonials = getLocalizedTrustTestimonials(testimonials, locale)

  return (
    <>
      <JsonLd
        data={[
          buildTravelAgencySchema({ description: copy.subtitle }),
          buildCollectionPageSchema({
            locale,
            path: '/travel-experts',
            name: copy.title,
            description: copy.subtitle,
          }),
          buildServiceSchema({
            locale,
            path: '/travel-experts',
            name: copy.title,
            description: copy.subtitle,
            serviceType: 'Travel planning and destination support in Georgia',
          }),
          buildItemListSchema({
            name: trustCopy.testimonialsTitle,
            url: buildCanonicalUrl(locale, '/travel-experts'),
            items: localizedTestimonials.map((testimonial) => ({
              name: testimonial.personName,
              url: testimonial.sourceSlug
                ? buildCanonicalUrl(locale, `/blog/${testimonial.sourceSlug}`)
                : buildCanonicalUrl(locale, '/travel-experts'),
              description: testimonial.quote,
            })),
          }),
          buildItemListSchema({
            name: trustCopy.partnerTitle,
            url: buildCanonicalUrl(locale, '/partner-hotels'),
            items: partnerMentions.map((partner) => ({
              name: partner.name,
              url: buildCanonicalUrl(locale, `/partner-hotels/${partner.slug}`),
              description: partner.description,
            })),
          }),
          buildFaqSchema(copy.faqs),
          buildBreadcrumbSchema([
            { name: nav('home'), url: buildCanonicalUrl(locale) },
            { name: copy.title, url: buildCanonicalUrl(locale, '/travel-experts') },
          ]),
        ]}
      />
      <main className="min-h-screen bg-[#f6f3ee]">
        <section className="border-b border-[#e5dfd4] bg-[#101820] py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d5c4a0]">
                {copy.heroEyebrow}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
                {copy.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/80">{copy.subtitle}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[28px] border border-[#e5dfd4] bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-[#101820]">{copy.summaryTitle}</h2>
              <p className="mt-5 text-base leading-8 text-[#4f5f70]">{copy.summaryText}</p>
            </article>

            <aside className="rounded-[28px] border border-[#e5dfd4] bg-[#fffaf1] p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-[#101820]">{copy.regionsTitle}</h2>
              <ul className="mt-5 space-y-4">
                {copy.regions.map((region) => (
                  <li key={region} className="flex items-start gap-3 text-sm leading-7 text-[#4f5f70]">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#0f6b66]" />
                    <span>{region}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold tracking-tight text-[#101820]">
                {copy.metricsTitle}
              </h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {copy.metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-[24px] border border-[#e5dfd4] bg-[#f8f5ef] p-6 shadow-sm"
                >
                  <p className="text-3xl font-semibold tracking-tight text-[#101820]">{metric.value}</p>
                  <h3 className="mt-4 text-lg font-semibold text-[#101820]">{metric.label}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#576273]">{metric.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-[#101820]">
              {copy.standardsTitle}
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {copy.standards.map((standard) => (
              <article
                key={standard.title}
                className="rounded-[28px] border border-[#e5dfd4] bg-white p-8 shadow-sm"
              >
                <h3 className="text-2xl font-semibold text-[#101820]">{standard.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#576273]">{standard.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[32px] border border-[#d9cfbe] bg-[#101820] px-8 py-10 text-white shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d5c4a0]">
                {copy.travelerStory.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                {copy.travelerStoryTitle}
              </h2>
              <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <h3 className="text-2xl font-semibold">{copy.travelerStory.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/80">{copy.travelerStory.excerpt}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-lg font-semibold">{copy.travelerStory.person}</p>
                  <p className="mt-3 text-sm leading-7 text-white/70">{copy.travelerStory.meta}</p>
                  <Link
                    href={`/${locale}/blog/${copy.travelerStory.postSlug}`}
                    className="mt-6 inline-flex min-h-[46px] items-center rounded-full bg-[#d5c4a0] px-5 text-sm font-semibold text-[#101820] transition-colors hover:bg-[#e3d2ae]"
                  >
                    {copy.inlineCtaLabel}
                  </Link>
                </div>
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

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-[#101820]">{copy.faqTitle}</h2>
          </div>
          <div className="mt-10 space-y-5">
            {copy.faqs.map((item) => (
              <article
                key={item.question}
                className="rounded-[24px] border border-[#e5dfd4] bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-[#101820]">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[#576273]">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[32px] border border-[#d9cfbe] bg-[#fffaf1] px-8 py-10 shadow-sm">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-semibold tracking-tight text-[#101820]">
                  {copy.title}
                </h2>
                <p className="mt-4 text-base leading-8 text-[#4f5f70]">{copy.summaryText}</p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/${locale}/contact`}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#101820] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0f6b66]"
                >
                  {copy.primaryCtaLabel}
                </Link>
                <Link
                  href={`/${locale}/tours`}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#101820] px-6 text-sm font-semibold text-[#101820] transition-colors hover:bg-[#101820] hover:text-white"
                >
                  {copy.secondaryCtaLabel}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
