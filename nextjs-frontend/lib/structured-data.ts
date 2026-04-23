import {
  absoluteUrl,
  buildCanonicalUrl,
  SITE_ADDRESS,
  SITE_EMAIL,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_PHONE,
  SITE_SOCIAL_PROFILES,
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

export function buildTravelAgencySchema(params?: { description?: string }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#travelagency`,
    name: SITE_NAME,
    url: SITE_URL,
    ...(params?.description ? { description: params.description } : {}),
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(SITE_LOGO_PATH),
    },
    telephone: SITE_PHONE,
    email: SITE_EMAIL,
    address: SITE_ADDRESS,
    sameAs: [...SITE_SOCIAL_PROFILES],
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
    areaServed: {
      '@type': 'Country',
      name: 'Georgia',
    },
    knowsLanguage: ['ka', 'en', 'ru'],
  }
}

export function buildWebSiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: 'Travel planning, tours, partner hotels, and destination guides for Georgia.',
    publisher: {
      '@id': `${SITE_URL}/#travelagency`,
    },
    inLanguage: ['ka', 'en', 'ru'],
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

export function buildPersonSchema(params: {
  locale: string
  slug: string
  name: string
  description: string
  jobTitle: string
  knowsAbout?: string[]
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${buildCanonicalUrl(params.locale, `/authors/${params.slug}`)}#person`,
    name: params.name,
    url: buildCanonicalUrl(params.locale, `/authors/${params.slug}`),
    description: params.description,
    jobTitle: params.jobTitle,
    ...(params.knowsAbout && params.knowsAbout.length > 0
      ? { knowsAbout: params.knowsAbout }
      : {}),
    worksFor: travelAgencyReference(),
  }
}

export function buildCollectionPageSchema(params: {
  locale: string
  path: string
  name: string
  description: string
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: params.name,
    description: params.description,
    url: buildCanonicalUrl(params.locale, params.path),
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
  }
}

export function buildServiceSchema(params: {
  locale: string
  path: string
  name: string
  description: string
  serviceType: string
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: params.name,
    description: params.description,
    serviceType: params.serviceType,
    provider: travelAgencyReference(),
    areaServed: {
      '@type': 'Country',
      name: 'Georgia',
    },
    availableLanguage: ['ka', 'en', 'ru'],
    url: buildCanonicalUrl(params.locale, params.path),
  }
}

export function buildItemListSchema(params: {
  name: string
  url: string
  items: Array<{ name: string; url: string; description?: string }>
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: params.name,
    url: params.url,
    itemListElement: params.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: item.url,
      name: item.name,
      ...(item.description ? { description: item.description } : {}),
    })),
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

export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
