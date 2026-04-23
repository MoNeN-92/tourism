import { blogContentData, mockBlogPosts } from '@/lib/mockBlogData'
import { type PartnerHotel } from '@/lib/partner-hotels'

export interface TrustTestimonial {
  id: string
  quote_ka: string
  quote_en: string
  quote_ru: string
  personName: string
  role_ka: string
  role_en: string
  role_ru: string
  sourceSlug?: string
  sourceLabel_ka: string
  sourceLabel_en: string
  sourceLabel_ru: string
  verified_ka: string
  verified_en: string
  verified_ru: string
}

export interface LocalizedTrustTestimonial {
  id: string
  quote: string
  personName: string
  role: string
  sourceSlug?: string
  sourceLabel: string
  verifiedLabel: string
}

export interface LocalizedPartnerMention {
  id: string
  slug: string
  name: string
  description: string
  address: string
  starRating: number
  coverImageUrl: string
}

type TrustCopy = {
  testimonialsTitle: string
  testimonialsSubtitle: string
  partnerTitle: string
  partnerSubtitle: string
  partnerCta: string
  testimonialCta: string
  emptyTestimonials: string
}

function localizedField<T extends object>(
  record: T,
  baseKey: string,
  locale: string,
): string {
  const source = record as Record<string, string | undefined>

  return source[`${baseKey}_${locale}`] || source[`${baseKey}_ka`] || ''
}

function fallbackTestimonials(): TrustTestimonial[] {
  const robertPost = mockBlogPosts.find((post) => post.slug === 'robert-slovakia-travel-story-georgia')
  const robertStory = blogContentData['robert-slovakia-travel-story-georgia']

  if (!robertPost || !robertStory) {
    return []
  }

  return [
    {
      id: 'robert-slovakia-story',
      quote_ka: 'საქართველო მრავალფეროვანი, უნიკალური და მეგობრული ქვეყანაა.',
      quote_en: 'Georgia is diverse, unique, and friendly.',
      quote_ru: 'Грузия многогранная, уникальная и дружелюбная.',
      personName: robertPost.author_en,
      role_ka: 'მოგზაური სლოვაკეთიდან',
      role_en: 'Traveler from Slovakia',
      role_ru: 'Путешественник из Словакии',
      sourceSlug: robertPost.slug,
      sourceLabel_ka: 'რეალური მოგზაურის ისტორია',
      sourceLabel_en: 'Real traveler story',
      sourceLabel_ru: 'Реальная история путешественника',
      verified_ka: 'დადასტურებული პირველი წყარო',
      verified_en: 'Verified first-hand source',
      verified_ru: 'Подтвержденный источник из первых рук',
    },
  ]
}

function isTrustTestimonial(value: unknown): value is TrustTestimonial {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.quote_ka === 'string' &&
    typeof candidate.quote_en === 'string' &&
    typeof candidate.quote_ru === 'string' &&
    typeof candidate.personName === 'string' &&
    typeof candidate.role_ka === 'string' &&
    typeof candidate.role_en === 'string' &&
    typeof candidate.role_ru === 'string'
  )
}

export async function getTrustTestimonials(): Promise<TrustTestimonial[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/testimonials/public`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return fallbackTestimonials()
    }

    const payload: unknown = await response.json()

    if (!Array.isArray(payload)) {
      return fallbackTestimonials()
    }

    const testimonials = payload.filter(isTrustTestimonial)

    return testimonials.length > 0 ? testimonials : fallbackTestimonials()
  } catch {
    return fallbackTestimonials()
  }
}

export function getLocalizedTrustTestimonials(
  testimonials: TrustTestimonial[],
  locale: string,
): LocalizedTrustTestimonial[] {
  return testimonials.map((testimonial) => ({
    id: testimonial.id,
    quote: localizedField(testimonial, 'quote', locale),
    personName: testimonial.personName,
    role: localizedField(testimonial, 'role', locale),
    sourceSlug: testimonial.sourceSlug,
    sourceLabel: localizedField(testimonial, 'sourceLabel', locale),
    verifiedLabel: localizedField(testimonial, 'verified', locale),
  }))
}

export function getLocalizedPartnerMentions(
  hotels: PartnerHotel[],
  locale: string,
  limit = 3,
): LocalizedPartnerMention[] {
  return hotels.slice(0, limit).map((hotel) => ({
    id: hotel.id,
    slug: hotel.slug,
    name: hotel.name,
    description:
      localizedField(hotel as unknown as Record<string, string>, 'shortDescription', locale) ||
      localizedField(hotel as unknown as Record<string, string>, 'description', locale),
    address: hotel.address,
    starRating: hotel.starRating,
    coverImageUrl: hotel.coverImageUrl,
  }))
}

export function getTrustSignalsCopy(locale: string): TrustCopy {
  if (locale === 'ka') {
    return {
      testimonialsTitle: 'მოგზაურის ისტორიები და დასამოწმებელი feedback',
      testimonialsSubtitle:
        'აქ ვაჩვენებთ მხოლოდ იმ guest signals-ს, რომლებიც რეალურ ისტორიას, წყაროს ან CMS-იდან მოწოდებულ feedback-ს ეყრდნობა.',
      partnerTitle: 'პარტნიორული ქსელი, რომელიც აძლიერებს ნდობას',
      partnerSubtitle:
        'როდესაც სასტუმროები და ადგილობრივი სერვისები ერთ ხარისხიან ქსელად მუშაობს, მოგზაურობის შესრულებაც უფრო საიმედო ხდება.',
      partnerCta: 'ყველა პარტნიორი სასტუმროს ნახვა',
      testimonialCta: 'მოგზაურის ისტორიის ნახვა',
      emptyTestimonials: 'რეალური traveler feedback აქ გამოჩნდება, როგორც კი CMS-ში დაემატება.',
    }
  }

  if (locale === 'ru') {
    return {
      testimonialsTitle: 'Истории путешественников и подтверждаемый feedback',
      testimonialsSubtitle:
        'Здесь мы показываем только те guest signals, которые опираются на реальную историю, источник или feedback из CMS.',
      partnerTitle: 'Партнерская сеть, усиливающая доверие',
      partnerSubtitle:
        'Когда отели и локальные сервисы работают как единая качественная сеть, исполнение поездки становится заметно надежнее.',
      partnerCta: 'Смотреть все партнерские отели',
      testimonialCta: 'Открыть историю путешественника',
      emptyTestimonials: 'Здесь появится реальный feedback путешественников, как только он будет добавлен в CMS.',
    }
  }

  return {
    testimonialsTitle: 'Traveler stories and verifiable feedback',
    testimonialsSubtitle:
      'This section is CMS-ready and only surfaces guest proof that comes from a real story, a source page, or future structured feedback.',
    partnerTitle: 'A partner network that strengthens trust',
    partnerSubtitle:
      'Reliable travel delivery depends on hotels and local operators as much as on route planning. These partners reinforce the onsite authority signal.',
    partnerCta: 'View all partner hotels',
    testimonialCta: 'Open traveler story',
    emptyTestimonials: 'Real traveler feedback will appear here as soon as it is added in the CMS.',
  }
}
