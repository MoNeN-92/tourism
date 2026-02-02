// app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server'

export default async function Home() {
  const t = await getTranslations('home')
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        <p className="text-xl text-gray-600">{t('subtitle')}</p>
      </div>
    </div>
  )
}