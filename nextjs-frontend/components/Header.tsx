// components/Header.tsx
'use client'

import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)
  const langDropdownRef = useRef<HTMLDivElement>(null)
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('nav')
  
  const locale = params.locale as string
  
  const locales = [
    { code: 'ka', name: 'KA', flag: '🇬🇪' },
    { code: 'en', name: 'EN', flag: '🇬🇧' },
    { code: 'ru', name: 'RU', flag: '🇷🇺' }
  ]

  const currentLocale = locales.find(loc => loc.code === locale) || locales[0]
  const otherLocales = locales.filter(loc => loc.code !== locale)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      setIsLoggedIn(!!token)
    }

    checkAuth()
    
    window.addEventListener('storage', checkAuth)
    
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    router.push(newPath)
    setIsLangDropdownOpen(false)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
   <Link href={`/${locale}`} className="flex flex-col items-center group transition-all duration-300">
  {/* მთავარი ტექსტი - ცენტრში გასწორებული */}
  <div className="flex items-baseline tracking-tight justify-center">
    <span className="text-3xl font-serif font-bold text-gray-900">Geo</span>
    <span className="text-3xl font-serif font-bold text-[#B48C36]">Vibe</span>
  </div>
  
  {/* ქვედა სლოგანი - ხაზებით და ცენტრირებით */}
  <div className="flex items-center gap-2 -mt-1 w-full justify-center">
    <div className="h-[1px] w-4 bg-[#B48C36]"></div>
    <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500 whitespace-nowrap">
      Luxury Private Tours
    </span>
    <div className="h-[1px] w-4 bg-[#B48C36]"></div>
  </div>
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
          <Link 
  href={`/${locale}/faq`} 
  className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm sm:text-base"
>
  {t('faq')}
</Link>

            <div className="relative ml-4 border-l pl-4" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl">{currentLocale.flag}</span>
                <span className="text-sm font-medium text-gray-700">{currentLocale.name}</span>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isLangDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg py-1 min-w-[120px]">
                  {otherLocales.map((loc) => (
                    <button
                      key={loc.code}
                      onClick={() => switchLocale(loc.code)}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors text-left"
                    >
                      <span className="text-xl">{loc.flag}</span>
                      <span className="text-sm font-medium text-gray-700">{loc.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isLoggedIn && (
              <Link
                href={`/${locale}/admin`}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Dashboard
              </Link>
            )}
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
            
            <div className="flex flex-col gap-2 pt-4 border-t">
              <div className="text-sm font-medium text-gray-500 mb-1">Language</div>
              {locales.map((loc) => (
                <button
                  key={loc.code}
                  onClick={() => {
                    switchLocale(loc.code)
                    setIsMenuOpen(false)
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                    locale === loc.code
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{loc.flag}</span>
                  <span>{loc.name}</span>
                </button>
              ))}
            </div>

            {isLoggedIn && (
              <Link
                href={`/${locale}/admin`}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}