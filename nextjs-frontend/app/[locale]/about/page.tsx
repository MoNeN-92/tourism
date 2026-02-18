import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  
  const title = t('seo.title')
  const description = t('seo.description')
  const url = `https://vibegeorgia.com/${locale}/about`
  
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
        url: 'https://vibegeorgia.com/og-about.jpg',
        width: 1200,
        height: 630,
        alt: title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://vibegeorgia.com/og-about.jpg'],
    },
    alternates: {
      canonical: url,
      languages: {
        'ka': 'https://vibegeorgia.com/ka/about',
        'en': 'https://vibegeorgia.com/en/about',
        'ru': 'https://vibegeorgia.com/ru/about',
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function AboutPage() {
  const t = useTranslations('about')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Vibe Georgia',
    description: t('intro'),
    url: 'https://vibegeorgia.com',
    telephone: '+995596550099',
    email: '[email protected]',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tbilisi',
      addressCountry: 'GE',
    },
    foundingDate: '2010',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section with Tbilisi Background */}
        <section className="relative h-[400px] sm:h-[500px] lg:h-[600px]">
          <Image
            src="https://res.cloudinary.com/dj7qaif1i/image/upload/v1771399055/Tbilisi_panorama_nk1rmx.jpg"
            alt="Tbilisi Panorama"
            fill
            className="object-cover"
            priority
            sizes="100vw"
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