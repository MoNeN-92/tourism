import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
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
    description: t('story.content'),
    url: 'https://vibegeorgia.com',
    telephone: '+995596550099',
    email: '[email protected]',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tbilisi',
      addressCountry: 'GE',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                {t('title')}
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-blue-100">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Company Story Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto">
            <article className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t('story.title')}
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                {t('story.content')}
              </p>
            </article>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="bg-white py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                {/* Mission */}
                <article className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-md">
                  <div className="text-4xl sm:text-5xl mb-4" aria-hidden="true">🎯</div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                    {t('mission.title')}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {t('mission.content')}
                  </p>
                </article>

                {/* Vision */}
                <article className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-md">
                  <div className="text-4xl sm:text-5xl mb-4" aria-hidden="true">🌟</div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                    {t('vision.title')}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {t('vision.content')}
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-8 sm:mb-12 lg:mb-16">
              {t('whyChooseUs.title')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {/* Local Expertise */}
              <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 sm:p-8 text-center">
                <div className="text-4xl sm:text-5xl mb-4" aria-hidden="true">🗺️</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                  {t('whyChooseUs.expertise.title')}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t('whyChooseUs.expertise.description')}
                </p>
              </article>

              {/* Experienced Guides */}
              <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 sm:p-8 text-center">
                <div className="text-4xl sm:text-5xl mb-4" aria-hidden="true">👥</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                  {t('whyChooseUs.guides.title')}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t('whyChooseUs.guides.description')}
                </p>
              </article>

              {/* Unique Destinations */}
              <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 sm:p-8 text-center">
                <div className="text-4xl sm:text-5xl mb-4" aria-hidden="true">🏔️</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                  {t('whyChooseUs.destinations.title')}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t('whyChooseUs.destinations.description')}
                </p>
              </article>

              {/* Safety */}
              <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 sm:p-8 text-center">
                <div className="text-4xl sm:text-5xl mb-4" aria-hidden="true">🛡️</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                  {t('whyChooseUs.safety.title')}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t('whyChooseUs.safety.description')}
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-gray-100 py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t('team.title')}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
                {t('team.description')}
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}