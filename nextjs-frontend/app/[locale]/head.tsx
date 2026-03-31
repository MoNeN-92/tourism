import JsonLd from '@/components/JsonLd'
import {
  buildLocalBusinessSchema,
  buildOrganizationSchema,
} from '@/lib/structured-data'

export default function LocaleHead() {
  return (
    <>
      <JsonLd data={buildOrganizationSchema()} />
      <JsonLd data={buildLocalBusinessSchema()} />
    </>
  )
}
