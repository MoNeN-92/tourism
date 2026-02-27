// components/Header.tsx
'use client'

import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'
import { clearAdminAccessToken } from '@/lib/auth-token'

interface AuthUser {
  id?: string
  firstName?: string
  lastName?: string
  email?: string
  role?: 'USER' | 'ADMIN' | 'MODERATOR'
}

type AuthMode = 'guest' | 'user' | 'admin'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('guest')
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
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
    let cancelled = false
    const checkAuth = async () => {
      setIsAuthLoading(true)
      try {
        const userResponse = await api.get('/users/auth/me')
        if (!cancelled) {
          const user = userResponse.data ?? null
          setAuthUser(user)
          setAuthMode(
            user?.role === 'ADMIN' || user?.role === 'MODERATOR' ? 'admin' : 'user'
          )
        }
      } catch {
        if (!cancelled) {
          setAuthMode('guest')
          setAuthUser(null)
        }
      } finally {
        if (!cancelled) setIsAuthLoading(false)
      }
    }
    checkAuth()
    return () => { cancelled = true }
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
    router.push(segments.join('/'))
    setIsLangDropdownOpen(false)
  }

  const fullName = [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ').trim()
  const accountLabel = fullName || authUser?.email || t('myAccount')
  const accountInitials = accountLabel
    .split(' ').filter(Boolean).slice(0, 2)
    .map((part) => part[0]?.toUpperCase()).join('') || 'U'

  const handleLogout = async () => {
    try { await api.post('/users/auth/logout') } catch {}
    try { await api.post('/auth/logout') } catch {}
    finally {
      clearAdminAccessToken()
      setAuthMode('guest')
      setAuthUser(null)
      setIsMenuOpen(false)
      router.replace(`/${locale}`)
      router.refresh()
    }
  }

  const renderDesktopAuth = () => {
    if (isAuthLoading) {
      return <div className="ml-4 border-l pl-4 text-sm text-gray-500">{t('loading')}</div>
    }

    if (authMode === 'guest') {
      return (
        <div className="ml-4 border-l pl-4 flex items-center gap-2">
          <Link href={`/${locale}/account/login`}
            className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            {t('login')}
          </Link>
          <Link href={`/${locale}/account/register`}
            className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            {t('register')}
          </Link>
        </div>
      )
    }

    if (authMode === 'user') {
      return (
        <div className="ml-4 border-l pl-4 flex items-center gap-2">
          <Link href={`/${locale}/account/notifications`}
            className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 max-w-[220px]"
            title={accountLabel}>
            <span className="h-7 w-7 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {accountInitials}
            </span>
            <span className="truncate">{accountLabel}</span>
          </Link>
          <button onClick={handleLogout}
            className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            {t('logout')}
          </button>
        </div>
      )
    }

    // Admin - ლამაზი gradient ღილაკი
    return (
      <div className="ml-4 border-l pl-4 flex items-center gap-2">
        <Link href={`/${locale}/admin`}
          className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-all duration-300 hover:opacity-90 hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 50%, #1a8a6e 100%)' }}>
          {t('adminDashboard')}
        </Link>
        <button onClick={handleLogout}
          className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
          {t('logout')}
        </button>
      </div>
    )
  }

  const renderMobileAuth = () => {
    if (isAuthLoading) {
      return <div className="pt-4 border-t text-sm text-gray-500">{t('loading')}</div>
    }

    if (authMode === 'guest') {
      return (
        <div className="pt-4 border-t flex flex-col gap-2">
          <Link href={`/${locale}/account/login`}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-center"
            onClick={() => setIsMenuOpen(false)}>
            {t('login')}
          </Link>
          <Link href={`/${locale}/account/register`}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-center"
            onClick={() => setIsMenuOpen(false)}>
            {t('register')}
          </Link>
        </div>
      )
    }

    if (authMode === 'user') {
      return (
        <div className="pt-4 border-t flex flex-col gap-2">
          <Link href={`/${locale}/account/notifications`}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-center"
            onClick={() => setIsMenuOpen(false)}>
            {accountLabel}
          </Link>
          <button onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">
            {t('logout')}
          </button>
        </div>
      )
    }

    return (
      <div className="pt-4 border-t flex flex-col gap-2">
        <Link href={`/${locale}/admin`}
          className="px-4 py-2 rounded-lg text-white text-center font-medium transition-all"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 50%, #1a8a6e 100%)' }}
          onClick={() => setIsMenuOpen(false)}>
          {t('adminDashboard')}
        </Link>
        <button onClick={handleLogout}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">
          {t('logout')}
        </button>
      </div>
    )
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">

          {/* ლოგო - გრადიენტული ფერადი */}
          <Link href={`/${locale}`} className="flex flex-col items-center group transition-all duration-300">
            <div className="flex items-baseline tracking-tight justify-center">
              <span
                className="text-3xl font-serif font-bold"
                style={{
                  background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 60%, #1a8a6e 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Geo
              </span>
              <span
                className="text-3xl font-serif font-bold"
                style={{
                  background: 'linear-gradient(135deg, #B48C36 0%, #d4a843 50%, #c9973d 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Vibe
              </span>
            </div>
            <div className="flex items-center gap-2 -mt-1 w-full justify-center">
              <div className="h-[1px] w-4 bg-gradient-to-r from-transparent to-[#B48C36]"></div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400 whitespace-nowrap group-hover:text-[#B48C36] transition-colors duration-300">
                Luxury Private Tours
              </span>
              <div className="h-[1px] w-4 bg-gradient-to-l from-transparent to-[#B48C36]"></div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href={`/${locale}`} className="text-gray-700 hover:text-blue-600 transition-colors">{t('home')}</Link>
            <Link href={`/${locale}/tours`} className="text-gray-700 hover:text-blue-600 transition-colors">{t('tours')}</Link>
            <Link href={`/${locale}/about`} className="text-gray-700 hover:text-blue-600 transition-colors">{t('about')}</Link>
            <Link href={`/${locale}/blog`} className="text-gray-700 hover:text-blue-600 transition-colors">{t('blog')}</Link>
            <Link href={`/${locale}/contact`} className="text-gray-700 hover:text-blue-600 transition-colors">{t('contact')}</Link>
            <Link href={`/${locale}/faq`} className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm sm:text-base">{t('faq')}</Link>

            {/* ენის dropdown */}
            <div className="relative ml-4 border-l pl-4" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl">{currentLocale.flag}</span>
                <span className="text-sm font-medium text-gray-700">{currentLocale.name}</span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isLangDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border rounded-lg shadow-lg py-1 min-w-[120px]">
                  {otherLocales.map((loc) => (
                    <button key={loc.code} onClick={() => switchLocale(loc.code)}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors text-left">
                      <span className="text-xl">{loc.flag}</span>
                      <span className="text-sm font-medium text-gray-700">{loc.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {renderDesktopAuth()}
          </nav>

          {/* Mobile menu button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 p-2" aria-label="Toggle menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-4">
            <Link href={`/${locale}`} className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>{t('home')}</Link>
            <Link href={`/${locale}/tours`} className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>{t('tours')}</Link>
            <Link href={`/${locale}/about`} className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>{t('about')}</Link>
            <Link href={`/${locale}/blog`} className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>{t('blog')}</Link>
            <Link href={`/${locale}/contact`} className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>{t('contact')}</Link>

            <div className="flex flex-col gap-2 pt-4 border-t">
              <div className="text-sm font-medium text-gray-500 mb-1">{t('language')}</div>
              {locales.map((loc) => (
                <button key={loc.code}
                  onClick={() => { switchLocale(loc.code); setIsMenuOpen(false) }}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                    locale === loc.code ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                  <span className="text-xl">{loc.flag}</span>
                  <span>{loc.name}</span>
                </button>
              ))}
            </div>

            {renderMobileAuth()}
          </nav>
        )}
      </div>
    </header>
  )
}