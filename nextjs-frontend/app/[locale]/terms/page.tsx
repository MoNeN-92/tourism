import { useTranslations } from 'next-intl';

export default function TermsPage() {
  const t = useTranslations('Terms');

  return (
    <div className="container mx-auto px-4 py-20 text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">{t('title')}</h1>
      <div className="max-w-3xl mx-auto space-y-6 text-gray-300">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">{t('section1_title')}</h2>
          <p className="leading-relaxed">{t('section1_text')}</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">{t('section2_title')}</h2>
          <p className="leading-relaxed">{t('section2_text')}</p>
        </div>
      </div>
    </div>
  );
}