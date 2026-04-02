import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/JsonLd'
import { type Locale } from '@/i18n/config'
import { buildCloudinarySources, buildCloudinaryUrl } from '@/lib/cloudinary'
import {
  COMMERCIAL_PAGE_SLUGS,
  getCommercialPage,
  isCommercialPageSlug,
} from '@/lib/commercial-pages'
import {
  buildCanonicalUrl,
  localizedAlternates,
  openGraphLocale,
  SITE_NAME,
} from '@/lib/seo'
import { buildBreadcrumbSchema, buildFaqSchema, buildTravelAgencySchema } from '@/lib/structured-data'

export const dynamicParams = false

type Params = { locale: Locale; slug: string }

function getPageUiCopy(locale: Locale) {
  if (locale === 'ka') {
    return {
      whyTitle: 'რატომ არის ეს გვერდი მნიშვნელოვანი დაგეგმვისთვის',
      contact: 'დაგვიკავშირდი',
      tours: 'ტურების ნახვა',
      startPlanning: 'დაგეგმვის დაწყება',
      guides: 'სამოგზაურო გზამკვლევების ნახვა',
    }
  }

  if (locale === 'ru') {
    return {
      whyTitle: 'Почему эта страница важна для планирования',
      contact: 'Связаться с нами',
      tours: 'Смотреть туры',
      startPlanning: 'Начать планирование',
      guides: 'Читать гиды',
    }
  }

  return {
    whyTitle: 'Why this page matters for planning',
    contact: 'Contact Vibe Georgia',
    tours: 'View Tours',
    startPlanning: 'Start planning',
    guides: 'Read travel guides',
  }
}

export function generateStaticParams() {
  return COMMERCIAL_PAGE_SLUGS.map((slug) => ({ slug }))
}

function getPageOr404(locale: Locale, slug: string) {
  if (!isCommercialPageSlug(slug)) notFound()
  return getCommercialPage(locale, slug)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const page = getPageOr404(locale, slug)
  const title = `${page.title} | ${SITE_NAME}`

  return {
    title,
    description: page.seoDescription,
    alternates: localizedAlternates(locale, `/${page.slug}`),
    openGraph: {
      title,
      description: page.seoDescription,
      url: buildCanonicalUrl(locale, `/${page.slug}`),
      siteName: SITE_NAME,
      locale: openGraphLocale(locale),
      type: 'website',
      images: [
        {
          url: buildCloudinaryUrl(page.heroImage),
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: page.seoDescription,
      images: [buildCloudinaryUrl(page.heroImage)],
    },
  }
}

export default async function CommercialPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { locale, slug } = await params
  const page = getPageOr404(locale, slug)
  const nav = await getTranslations({ locale, namespace: 'nav' })
  const ui = getPageUiCopy(locale)
  const hero = buildCloudinarySources(page.heroImage)

  return (
    <>
      <JsonLd
        data={[
          buildTravelAgencySchema({ description: page.seoDescription }),
          buildFaqSchema(page.faqs),
          buildBreadcrumbSchema([
            { name: nav('home'), url: buildCanonicalUrl(locale) },
            { name: page.title, url: buildCanonicalUrl(locale, `/${page.slug}`) },
          ]),
        ]}
      />
      <main className="min-h-screen bg-[#f7f4ee]">
        <section className="relative isolate overflow-hidden border-b border-[#e5dfd4] bg-[#101820]">
          <Image
            src={hero.src}
            blurDataURL={hero.lowResSrc}
            placeholder="blur"
            alt={page.title}
            fill
            priority
            sizes="100vw"
            quality={72}
            className="object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101820]/85 via-[#101820]/72 to-[#0f6b66]/60" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="max-w-3xl text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d5c4a0]">{page.eyebrow}</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">{page.title}</h1>
              <p className="mt-6 text-lg leading-8 text-white/85">{page.intro}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/${locale}/contact`} className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#101820] transition-colors hover:bg-[#f4efe4]">
                  {ui.contact}
                </Link>
                <Link href={`/${locale}/tours`} className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/30 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                  {ui.tours}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[28px] border border-[#e5dfd4] bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-[#101820]">{page.sectionTitle}</h2>
              <div className="mt-5 space-y-4 text-base leading-8 text-[#4f5f70]">
                {page.sectionParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>

            <aside className="rounded-[28px] border border-[#e5dfd4] bg-[#fffaf1] p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-[#101820]">{page.audienceTitle}</h2>
              <ul className="mt-5 space-y-4">
                {page.audiencePoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm leading-7 text-[#4f5f70]">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#0f6b66]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold tracking-tight text-[#101820]">{ui.whyTitle}</h2>
              <p className="mt-4 text-base leading-8 text-[#4f5f70]">{page.seoDescription}</p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {page.valuePoints.map((point) => (
                <div key={point} className="rounded-[24px] border border-[#e5dfd4] bg-[#f8f5ef] p-6 shadow-sm">
                  <p className="text-sm font-medium leading-7 text-[#243748]">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-[#d9cfbe] bg-[#101820] px-8 py-10 text-white shadow-lg">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold tracking-tight">{page.faqTitle}</h2>
              <div className="mt-8 space-y-5">
                {page.faqs.map((item) => (
                  <article key={item.question} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="text-lg font-semibold">{item.question}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/80">{item.answer}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/contact`} className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#d5c4a0] px-6 text-sm font-semibold text-[#101820] transition-colors hover:bg-[#e3d2ae]">
                {ui.startPlanning}
              </Link>
              <Link href={`/${locale}/blog`} className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                {ui.guides}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
