import { getTranslations } from 'next-intl/server'
import JsonLd from '@/components/JsonLd'
import { buildFaqSchema } from '@/lib/structured-data'

export default async function FaqHead({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })

  const items = [
    'booking.q1',
    'booking.q2',
    'booking.q3',
    'booking.q4',
    'tours.q1',
    'tours.q2',
    'tours.q3',
    'tours.q4',
    'payment.q1',
    'payment.q2',
    'payment.q3',
    'travel.q1',
    'travel.q2',
    'travel.q3',
    'travel.q4',
  ].map((key) => ({
    question: t(`${key}.question`),
    answer: t(`${key}.answer`),
  }))

  return <JsonLd data={buildFaqSchema(items)} />
}
