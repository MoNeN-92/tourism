import {
  absoluteUrl,
  buildCanonicalUrl,
  SITE_EMAIL,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_PHONE,
  SITE_URL,
} from '@/lib/seo'

type JsonLd = Record<string, unknown>

function travelAgencyReference(): JsonLd {
  return {
    '@type': 'TravelAgency',
    name: SITE_NAME,
    url: SITE_URL,
  }
}

export function buildTravelAgencySchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#travelagency`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(SITE_LOGO_PATH),
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: SITE_EMAIL,
        telephone: SITE_PHONE,
        areaServed: 'GE',
        availableLanguage: ['ka', 'en', 'ru'],
      },
    ],
  }
}

export function buildTouristTripSchema(params: {
  locale: string
  slug: string
  name: string
  description: string
  duration?: string | null
  itinerary?: string | null
  image?: string | null
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: params.name,
    description: params.description,
    url: buildCanonicalUrl(params.locale, `/tours/${params.slug}`),
    touristType: 'Leisure Traveler',
    ...(params.duration ? { duration: params.duration } : {}),
    ...(params.itinerary ? { itinerary: params.itinerary } : {}),
    ...(params.image ? { image: params.image } : {}),
    provider: travelAgencyReference(),
  }
}

export function buildHotelSchema(params: {
  locale: string
  slug: string
  name: string
  description: string
  address: string
  image?: string | null
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: params.name,
    description: params.description,
    url: buildCanonicalUrl(params.locale, `/partner-hotels/${params.slug}`),
    address: {
      '@type': 'PostalAddress',
      streetAddress: params.address,
      addressCountry: 'GE',
    },
    ...(params.image ? { image: params.image } : {}),
  }
}

export function buildBlogPostingSchema(params: {
  locale: string
  slug: string
  headline: string
  description: string
  image: string
  author: string
  datePublished: string
  dateModified: string
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: params.headline,
    description: params.description,
    image: [params.image],
    author: {
      '@type': 'Person',
      name: params.author,
    },
    datePublished: params.datePublished,
    dateModified: params.dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': buildCanonicalUrl(params.locale, `/blog/${params.slug}`),
    },
    publisher: travelAgencyReference(),
  }
}

export function buildFaqSchema(
  items: Array<{ question: string; answer: string }>,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
