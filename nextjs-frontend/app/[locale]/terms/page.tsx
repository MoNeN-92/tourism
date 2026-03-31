import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { localizedAlternates, SITE_NAME } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Terms' })

  return {
    title: `${t('title')} | ${SITE_NAME}`,
    description: t('section1_text'),
    alternates: localizedAlternates(locale, '/terms'),
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function TermsPage() {
  const t = useTranslations('Terms');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 sm:py-20">
        <h1 className="text-4xl font-bold mb-10 text-center text-gray-900">{t('title')}</h1>
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8 sm:p-12 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t('section1_title')}</h2>
            <p className="leading-relaxed text-gray-700">{t('section1_text')}</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t('section2_title')}</h2>
            <p className="leading-relaxed text-gray-700">{t('section2_text')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
