import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { absoluteUrl, buildCanonicalUrl, localizedAlternates, openGraphLocale, SITE_NAME } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import { buildFaqSchema } from '@/lib/structured-data'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })

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
      url: buildCanonicalUrl(locale, '/faq'),
      siteName: SITE_NAME,
      locale: openGraphLocale(locale),
      type: 'website',
      images: [{
        url: absoluteUrl('/og-faq.jpg'),
        width: 1200,
        height: 630,
        alt: title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteUrl('/og-faq.jpg')],
    },
    alternates: localizedAlternates(locale, '/faq'),
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });

  const faqs = [
    {
      category: t('booking.category'),
      questions: [
        { q: t('booking.q1.question'), a: t('booking.q1.answer') },
        { q: t('booking.q2.question'), a: t('booking.q2.answer') },
        { q: t('booking.q3.question'), a: t('booking.q3.answer') },
        { q: t('booking.q4.question'), a: t('booking.q4.answer') },
      ]
    },
    {
      category: t('tours.category'),
      questions: [
        { q: t('tours.q1.question'), a: t('tours.q1.answer') },
        { q: t('tours.q2.question'), a: t('tours.q2.answer') },
        { q: t('tours.q3.question'), a: t('tours.q3.answer') },
        { q: t('tours.q4.question'), a: t('tours.q4.answer') },
      ]
    },
    {
      category: t('payment.category'),
      questions: [
        { q: t('payment.q1.question'), a: t('payment.q1.answer') },
        { q: t('payment.q2.question'), a: t('payment.q2.answer') },
        { q: t('payment.q3.question'), a: t('payment.q3.answer') },
      ]
    },
    {
      category: t('travel.category'),
      questions: [
        { q: t('travel.q1.question'), a: t('travel.q1.answer') },
        { q: t('travel.q2.question'), a: t('travel.q2.answer') },
        { q: t('travel.q3.question'), a: t('travel.q3.answer') },
        { q: t('travel.q4.question'), a: t('travel.q4.answer') },
      ]
    },
  ]

  return (
    <>
      <JsonLd
        data={buildFaqSchema(
          faqs.flatMap((category) =>
            category.questions.map((item) => ({
              question: item.q,
              answer: item.a,
            })),
          ),
        )}
      />
      <main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                {t('title')}
              </h1>
              <p className="text-lg sm:text-xl text-blue-100">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    {categoryIndex === 0 && '📅'}
                    {categoryIndex === 1 && '🗺️'}
                    {categoryIndex === 2 && '💳'}
                    {categoryIndex === 3 && '✈️'}
                  </span>
                  {category.category}
                </h2>

                <div className="space-y-4">
                  {category.questions.map((item, qIndex) => (
                    <details
                      key={qIndex}
                      className="group bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      <summary className="flex items-center justify-between cursor-pointer p-5 sm:p-6 hover:bg-gray-50 transition-colors">
                        <h3 className="text-lg font-semibold text-gray-900 pr-4">
                          {item.q}
                        </h3>
                        <svg
                          className="w-6 h-6 text-blue-600 transform group-open:rotate-180 transition-transform flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2">
                        <p className="text-gray-700 leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
<section className="bg-blue-50 py-12 sm:py-16 relative">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="max-w-3xl mx-auto text-center relative z-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
        {t('contactTitle')}
      </h2>
      <p className="text-gray-600 mb-6">
        {t('contactSubtitle')}
      </p>
      
      {/* გამოვიყენოთ target="_top" რათა დავრწმუნდეთ, რომ ბმული 
        არ იბლოკება Frame-ის ან სხვა კონტეინერის მიერ 
      */}
   <a 
  href="mailto:info@vibegeorgia.com?subject=Question from FAQ"
  className="relative z-10 inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
>
  {t('contactButton')}
</a>
    </div>
  </div>
</section>
      </main>
    </>
  )
}
