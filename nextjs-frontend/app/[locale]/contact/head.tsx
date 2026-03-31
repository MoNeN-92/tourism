import { getTranslations } from 'next-intl/server'
import { buildCanonicalUrl, localizedAlternates, SITE_NAME } from '@/lib/seo'

export default async function ContactHead({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })
  const title = `${t('title')} | ${SITE_NAME}`
  const description = t('subtitle')
  const canonical = buildCanonicalUrl(locale, '/contact')

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {Object.entries(localizedAlternates(locale, '/contact').languages).map(([hrefLang, href]) => (
        <link key={hrefLang} rel="alternate" hrefLang={hrefLang} href={String(href)} />
      ))}
    </>
  )
}
