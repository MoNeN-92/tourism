import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Mail, Phone, Facebook } from 'lucide-react'

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations('footer')
  const authorityLabel =
    locale === 'ka' ? 'რატომ გვირჩევენ' : locale === 'ru' ? 'Почему нам доверяют' : 'Why Trust Us'

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* 1. კომპანიის შესახებ */}
          <div className="space-y-4">
            <h3 className="text-white text-2xl font-bold tracking-tight">Vibe Georgia</h3>
            <p className="text-sm leading-relaxed max-w-xs text-gray-400">
              {t('description')}
            </p>
          </div>

          {/* 2. კონტაქტი */}
          <div>
            <h4 className="text-base text-white font-semibold mb-6 uppercase tracking-wider">
              {t('contact')}
            </h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href="mailto:info@vibegeorgia.com"
                  className="flex items-center gap-3 hover:text-blue-400 transition-colors group w-fit"
                  aria-label="Send an email to info@vibegeorgia.com"
                >
                  <div className="bg-gray-800 p-2 rounded-lg group-hover:bg-blue-900/30 transition-colors">
                    <Mail size={16} className="text-gray-400 group-hover:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium">info@vibegeorgia.com</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/995596550099"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-green-400 transition-colors group w-fit"
                  aria-label="Contact us on WhatsApp"
                >
                  <div className="bg-gray-800 p-2 rounded-lg group-hover:bg-green-900/30 transition-colors">
                    <Phone size={16} className="text-gray-400 group-hover:text-green-400" />
                  </div>
                  <span className="text-sm font-medium">+995 596 55 00 99</span>
                </a>
              </li>
            </ul>
          </div>

          {/* 3. სოციალური ქსელები */}
          <div>
            <h4 className="text-base text-white font-semibold mb-6 uppercase tracking-wider">
              {t('followUs')}
            </h4>
            <div className="flex gap-4">
              <a 
                href="https://www.facebook.com/vibegeorgia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-3 rounded-xl text-gray-400 hover:bg-[#1877F2] hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg inline-flex items-center justify-center"
                aria-label="Follow us on Facebook"
              >
                <Facebook size={20} />
              </a>
              {/* Instagram და Telegram სექცია თუ დაგჭირდება, დაამატე aria-label-ით */}
            </div>
          </div>
        </div>

        {/* ქვედა ზოლი - გასწორებული SEO & Accessibility-სთვის */}
        <div className="border-t border-gray-800/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] uppercase tracking-widest text-gray-500">
          <p>&copy; {new Date().getFullYear()} Vibe Georgia. {t('rights')}</p>
          <div className="flex gap-6">
            <Link
              href={`/${locale}/travel-experts`}
              className="hover:text-white transition-colors"
              aria-label="View why travelers trust Vibe Georgia"
            >
              {authorityLabel}
            </Link>
            <Link 
              href={`/${locale}/privacy`} 
              className="hover:text-white transition-colors"
              aria-label="View our Privacy Policy"
            >
              {t('privacyPolicy') || 'Privacy Policy'}
            </Link>
            <Link 
              href={`/${locale}/terms`} 
              className="hover:text-white transition-colors"
              aria-label="View our Terms of Service"
            >
              {t('termsOfService') || 'Terms of Service'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
