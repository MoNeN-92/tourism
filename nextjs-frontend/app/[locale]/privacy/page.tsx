import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
  const t = useTranslations('Privacy');

  return (
    <div className="container mx-auto px-4 py-24 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 border-b border-gray-700 pb-4">
          {t('title')}
        </h1>
        
        <div className="space-y-8 text-gray-300 text-lg">
          <p className="italic">{t('intro')}</p>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              {t('section1_title')}
            </h2>
            <p className="leading-relaxed">{t('section1_text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              {t('section2_title')}
            </h2>
            <p className="leading-relaxed">{t('section2_text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">
              {t('section3_title')}
            </h2>
            <p className="leading-relaxed">{t('section3_text')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}