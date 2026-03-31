import JsonLd from '@/components/JsonLd'
import { buildTravelAgencySchema } from '@/lib/structured-data'

export default function LocaleHead() {
  return <JsonLd data={buildTravelAgencySchema()} />
}
