// components/Header.tsx
'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const params = useParams()
  const pathname = usePathname()
  const t = useTranslations('nav')
  
  const locale = params.locale as string
  
  const locales = [
    { code: 'ka', name: 'ქარ' },
    { code: 'en', name: 'Eng' },
    { code: 'ru', name: 'Рус' }
  ]

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    return segments.join('/')
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href={`/${locale}`} className="text-2xl font-bold text-blue-600">
            Tourism Explorer
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href={`/${locale}`} className="text-gray-700 hover:text-blue-600 transition-colors">
              {t('home')}
            </Link>
            <Link href={`/${locale}/tours`} className="text-gray-700 hover:text-blue-600 transition-colors">
              {t('tours')}
            </Link>
            <Link href={`/${locale}/about`} className="text-gray-700 hover:text-blue-600 transition-colors">
              {t('about')}
            </Link>
            <Link href={`/${locale}/blog`} className="text-gray-700 hover:text-blue-600 transition-colors">
              {t('blog')}
            </Link>
            <Link href={`/${locale}/contact`} className="text-gray-700 hover:text-blue-600 transition-colors">
              {t('contact')}
            </Link>

            <div className="flex gap-2 ml-4 border-l pl-4">
              {locales.map((loc) => (
                <Link
                  key={loc.code}
                  href={switchLocale(loc.code)}
                  className={`px-2 py-1 rounded text-sm transition-colors ${
                    locale === loc.code
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {loc.name}
                </Link>
              ))}
            </div>

            <Link
              href={`/${locale}/admin/login`}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Admin
            </Link>
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 p-2"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-4">
            <Link href={`/${locale}`} className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
              {t('home')}
            </Link>
            <Link href={`/${locale}/tours`} className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
              {t('tours')}
            </Link>
            <Link href={`/${locale}/about`} className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
              {t('about')}
            </Link>
            <Link href={`/${locale}/blog`} className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
              {t('blog')}
            </Link>
            <Link href={`/${locale}/contact`} className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
              {t('contact')}
            </Link>
            
            <div className="flex gap-2 pt-4 border-t">
              {locales.map((loc) => (
                <Link
                  key={loc.code}
                  href={switchLocale(loc.code)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    locale === loc.code
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {loc.name}
                </Link>
              ))}
            </div>

            <Link
              href={`/${locale}/admin/login`}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}