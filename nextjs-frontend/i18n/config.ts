// i18n/config.ts
export const locales = ['ka', 'en', 'ru'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'ka'