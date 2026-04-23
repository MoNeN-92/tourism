import type { Locale } from '@/i18n/config'

export interface AuthorSourcePost {
  slug: string
  coverImage: string
  publishedDate: string
  title_ka: string
  title_en: string
  title_ru: string
  excerpt_ka: string
  excerpt_en: string
  excerpt_ru: string
  author_ka: string
  author_en: string
  author_ru: string
}

export interface LocalizedAuthorPost {
  slug: string
  coverImage: string
  publishedDate: string
  title: string
  excerpt: string
}

export interface LocalizedAuthorProfile {
  slug: string
  name: string
  englishName: string
  description: string
  jobTitle: string
  focusAreas: string[]
  postCount: number
  posts: LocalizedAuthorPost[]
}

function getLocalizedField(
  post: AuthorSourcePost,
  field: 'title' | 'excerpt' | 'author',
  locale: Locale,
): string {
  const key = `${field}_${locale}` as keyof AuthorSourcePost
  const fallbackKey = `${field}_ka` as keyof AuthorSourcePost

  return (post[key] as string) || (post[fallbackKey] as string) || ''
}

export function buildAuthorSlug(name: string): string {
  const normalized = name
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'author'
}

function detectTopics(posts: AuthorSourcePost[]): string[] {
  const topics = new Set<string>()

  for (const post of posts) {
    const source = `${post.slug} ${post.title_en}`.toLowerCase()

    if (source.includes('svaneti')) topics.add('svaneti')
    if (source.includes('kazbegi')) topics.add('kazbegi')
    if (source.includes('batumi')) topics.add('batumi')
    if (source.includes('tbilisi')) topics.add('tbilisi')
    if (source.includes('wine') || source.includes('kakheti')) topics.add('wine')
    if (source.includes('gudauri')) topics.add('gudauri')
    if (source.includes('rabati') || source.includes('travel-story')) topics.add('traveler-stories')
  }

  if (topics.size === 0) {
    topics.add('georgia-travel')
  }

  return Array.from(topics)
}

function topicLabel(locale: Locale, topic: string): string {
  const dictionary: Record<string, Record<Locale, string>> = {
    svaneti: {
      ka: 'სვანეთი',
      en: 'Svaneti',
      ru: 'Сванетия',
    },
    kazbegi: {
      ka: 'ყაზბეგი',
      en: 'Kazbegi',
      ru: 'Казбеги',
    },
    batumi: {
      ka: 'ბათუმი',
      en: 'Batumi',
      ru: 'Батуми',
    },
    tbilisi: {
      ka: 'თბილისი',
      en: 'Tbilisi',
      ru: 'Тбилиси',
    },
    wine: {
      ka: 'ქართული ღვინო და კახეთი',
      en: 'Georgian wine and Kakheti',
      ru: 'грузинское вино и Кахетия',
    },
    gudauri: {
      ka: 'გუდაური',
      en: 'Gudauri',
      ru: 'Гудаури',
    },
    'traveler-stories': {
      ka: 'მოგზაურის გამოცდილებები',
      en: 'traveler experiences',
      ru: 'истории путешественников',
    },
    'georgia-travel': {
      ka: 'საქართველოში მოგზაურობა',
      en: 'travel in Georgia',
      ru: 'путешествия по Грузии',
    },
  }

  return dictionary[topic]?.[locale] || dictionary['georgia-travel'][locale]
}

function buildAuthorSummary(
  locale: Locale,
  authorName: string,
  focusAreas: string[],
  postCount: number,
): { description: string; jobTitle: string } {
  const firstFocus = focusAreas[0]

  if (authorName.toLowerCase().includes('robert')) {
    if (locale === 'ka') {
      return {
        jobTitle: 'მოგზაური კონტრიბუტორი',
        description: `${authorName} აზიარებს პირველწყაროსავით სამოგზაურო გამოცდილებას საქართველოს შესახებ და გვიზიარებს პრაქტიკულ რჩევებს ევროპელი მოგზაურის პერსპექტივიდან.`,
      }
    }

    if (locale === 'ru') {
      return {
        jobTitle: 'приглашенный путешественник',
        description: `${authorName} делится опытом поездки по Грузии из первых рук и практическими советами с точки зрения иностранного путешественника.`,
      }
    }

    return {
      jobTitle: 'traveler contributor',
      description: `${authorName} contributes first-hand travel notes about Georgia and shares practical recommendations from a guest perspective.`,
    }
  }

  if (locale === 'ka') {
    return {
      jobTitle: 'კონტრიბუტორი ავტორი',
      description: `${authorName} ამზადებს გზამკვლევებსა და სამოგზაურო მასალებს Vibe Georgia-სთვის. ძირითადი თემებია ${firstFocus}, ხოლო ჯამში გამოქვეყნებულია ${postCount} მასალა.`,
    }
  }

  if (locale === 'ru') {
    return {
      jobTitle: 'автор-гид',
      description: `${authorName} публикует гиды и материалы для Vibe Georgia. Основной фокус — ${firstFocus}, всего у автора ${postCount} публикаций.`,
    }
  }

  return {
    jobTitle: 'travel contributor',
    description: `${authorName} publishes destination and planning content for Vibe Georgia. The current focus includes ${firstFocus}, with ${postCount} published articles.`,
  }
}

export function getAllAuthorSlugs(posts: AuthorSourcePost[]): string[] {
  const slugs = new Set<string>()

  for (const post of posts) {
    slugs.add(buildAuthorSlug(post.author_en))
  }

  return Array.from(slugs)
}

export function getAuthorProfile(
  posts: AuthorSourcePost[],
  authorSlug: string,
  locale: Locale,
): LocalizedAuthorProfile | null {
  const matchingPosts = posts
    .filter((post) => buildAuthorSlug(post.author_en) === authorSlug)
    .sort((left, right) => Date.parse(right.publishedDate) - Date.parse(left.publishedDate))

  if (matchingPosts.length === 0) {
    return null
  }

  const focusAreas = detectTopics(matchingPosts).map((topic) => topicLabel(locale, topic))
  const authorName = getLocalizedField(matchingPosts[0], 'author', locale)
  const summary = buildAuthorSummary(locale, authorName, focusAreas, matchingPosts.length)

  return {
    slug: authorSlug,
    name: authorName,
    englishName: matchingPosts[0].author_en,
    description: summary.description,
    jobTitle: summary.jobTitle,
    focusAreas,
    postCount: matchingPosts.length,
    posts: matchingPosts.map((post) => ({
      slug: post.slug,
      coverImage: post.coverImage,
      publishedDate: post.publishedDate,
      title: getLocalizedField(post, 'title', locale),
      excerpt: getLocalizedField(post, 'excerpt', locale),
    })),
  }
}
