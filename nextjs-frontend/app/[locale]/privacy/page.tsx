import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
  const t = useTranslations('Privacy');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8 sm:p-12">
          <h1 className="text-4xl font-bold mb-8 border-b border-gray-200 pb-4 text-gray-900">
            {t('title')}
          </h1>

          <div className="space-y-8 text-lg">
            <p className="italic text-gray-600">{t('intro')}</p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                {t('section1_title')}
              </h2>
              <p className="leading-relaxed text-gray-700">{t('section1_text')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                {t('section2_title')}
              </h2>
              <p className="leading-relaxed text-gray-700">{t('section2_text')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                {t('section3_title')}
              </h2>
              <p className="leading-relaxed text-gray-700">{t('section3_text')}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}