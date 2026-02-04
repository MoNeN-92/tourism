import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  
  return {
    title: t('title'),
  }
}

export default function AboutPage() {
  const t = useTranslations('about')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              {t('title')}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-100">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Company Story Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              {t('story.title')}
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              {t('story.content')}
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              {/* Mission */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-md">
                <div className="text-4xl sm:text-5xl mb-4">🎯</div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {t('mission.title')}
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {t('mission.content')}
                </p>
              </div>

              {/* Vision */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-md">
                <div className="text-4xl sm:text-5xl mb-4">🌟</div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {t('vision.title')}
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {t('vision.content')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-8 sm:mb-12 lg:mb-16">
            {t('whyChooseUs.title')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Local Expertise */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 sm:p-8 text-center">
              <div className="text-4xl sm:text-5xl mb-4">🗺️</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                {t('whyChooseUs.expertise.title')}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t('whyChooseUs.expertise.description')}
              </p>
            </div>

            {/* Experienced Guides */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 sm:p-8 text-center">
              <div className="text-4xl sm:text-5xl mb-4">👥</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                {t('whyChooseUs.guides.title')}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t('whyChooseUs.guides.description')}
              </p>
            </div>

            {/* Unique Destinations */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 sm:p-8 text-center">
              <div className="text-4xl sm:text-5xl mb-4">🏔️</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                {t('whyChooseUs.destinations.title')}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t('whyChooseUs.destinations.description')}
              </p>
            </div>

            {/* Safety */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 sm:p-8 text-center">
              <div className="text-4xl sm:text-5xl mb-4">🛡️</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                {t('whyChooseUs.safety.title')}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t('whyChooseUs.safety.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-100 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              {t('team.title')}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
              {t('team.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}