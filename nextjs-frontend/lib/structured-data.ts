import {
  absoluteUrl,
  buildCanonicalUrl,
  SITE_ADDRESS,
  SITE_EMAIL,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_PHONE,
  SITE_URL,
} from '@/lib/seo'

type JsonLd = Record<string, unknown>

function organizationReference(): JsonLd {
  return {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  }
}

export function buildOrganizationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
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

export function buildLocalBusinessSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    url: SITE_URL,
    image: absoluteUrl(SITE_LOGO_PATH),
    logo: absoluteUrl(SITE_LOGO_PATH),
    email: SITE_EMAIL,
    telephone: SITE_PHONE,
    address: SITE_ADDRESS,
    areaServed: 'GE',
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
    provider: organizationReference(),
  }
}

export function buildHotelSchema(params: {
  locale: string
  slug: string
  name: string
  description: string
  address: string
  image?: string | null
  starRating?: number | null
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
    ...(typeof params.starRating === 'number'
      ? {
          starRating: {
            '@type': 'Rating',
            ratingValue: params.starRating,
            bestRating: 5,
          },
        }
      : {}),
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
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl(SITE_LOGO_PATH),
      },
    },
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
