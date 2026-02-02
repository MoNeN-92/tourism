// i18n/request.ts
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale || 'ka'
  
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})