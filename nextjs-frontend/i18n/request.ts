import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale } from './config'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  
  // თუ locale ცარიელია ან არ არის მხარდაჭერილ ენებში (მაგ. 'manifest.json')
  // ვიყენებთ defaultLocale-ს (ka)
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }
  
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})