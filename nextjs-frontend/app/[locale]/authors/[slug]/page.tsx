import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/JsonLd'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { getAuthorProfile, type AuthorSourcePost } from '@/lib/authors'
import { mockBlogPosts } from '@/lib/mockBlogData'
import { absoluteUrl, buildCanonicalUrl, localizedAlternates, openGraphLocale, SITE_NAME } from '@/lib/seo'
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildPersonSchema,
} from '@/lib/structured-data'

type ApiBlogPost = {
  id: string
  slug: string
  title_ka: string
  title_en: string
  title_ru: string
  excerpt_ka: string
  excerpt_en: string
  excerpt_ru: string
  coverImage: string
  publishedAt: string | null
  author_ka: string
  author_en: string
  author_ru: string
}

function normalizeApiPost(post: ApiBlogPost): AuthorSourcePost {
  return {
    slug: post.slug,
    coverImage: post.coverImage,
    publishedDate: post.publishedAt || new Date().toISOString(),
    title_ka: post.title_ka,
    title_en: post.title_en,
    title_ru: post.title_ru,
    excerpt_ka: post.excerpt_ka,
    excerpt_en: post.excerpt_en,
    excerpt_ru: post.excerpt_ru,
    author_ka: post.author_ka,
    author_en: post.author_en,
    author_ru: post.author_ru,
  }
}

async function getAllPosts(): Promise<AuthorSourcePost[]> {
  const fallback = mockBlogPosts.map((post) => ({
    slug: post.slug,
    coverImage: post.coverImage,
    publishedDate: post.publishedDate,
    title_ka: post.title_ka,
    title_en: post.title_en,
    title_ru: post.title_ru,
    excerpt_ka: post.excerpt_ka,
    excerpt_en: post.excerpt_en,
    excerpt_ru: post.excerpt_ru,
    author_ka: post.author_ka,
    author_en: post.author_en,
    author_ru: post.author_ru,
  }))

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/blog`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return fallback
    }

    const payload: unknown = await response.json()

    if (!Array.isArray(payload)) {
      return fallback
    }

    const normalized = payload
      .filter((item): item is ApiBlogPost => typeof item === 'object' && item !== null)
      .map(normalizeApiPost)

    const merged = new Map<string, AuthorSourcePost>()

    for (const post of [...normalized, ...fallback]) {
      if (!merged.has(post.slug)) {
        merged.set(post.slug, post)
      }
    }

    return Array.from(merged.values())
  } catch {
    return fallback
  }
}

function pageCopy(locale: string) {
  if (locale === 'ka') {
    return {
      allArticles: 'სტატიები',
      focusAreas: 'ძირითადი თემები',
      readArticle: 'სტატიის ნახვა',
      publishedArticles: (count: number) => `${count} გამოქვეყნებული მასალა Vibe Georgia-ზე.`,
    }
  }

  if (locale === 'ru') {
    return {
      allArticles: 'Статьи',
      focusAreas: 'Основные темы',
      readArticle: 'Открыть статью',
      publishedArticles: (count: number) => `${count} публикац${count === 1 ? 'ия' : count < 5 ? 'ии' : 'ий'} на Vibe Georgia.`,
    }
  }

  return {
    allArticles: 'Articles',
    focusAreas: 'Focus Areas',
    readArticle: 'Read Article',
    publishedArticles: (count: number) => `${count} published article${count === 1 ? '' : 's'} on Vibe Georgia.`,
  }
}

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(
    locale === 'ka' ? 'ka-GE' : locale === 'ru' ? 'ru-RU' : 'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const posts = await getAllPosts()
  const profile = getAuthorProfile(posts, slug, locale as 'ka' | 'en' | 'ru')

  if (!profile) {
    return {
      title: `Author Not Found | ${SITE_NAME}`,
      robots: { index: false, follow: true },
    }
  }

  const title = `${profile.name} | ${SITE_NAME}`

  return {
    title,
    description: profile.description,
    alternates: localizedAlternates(locale, `/authors/${slug}`),
    openGraph: {
      title,
      description: profile.description,
      url: buildCanonicalUrl(locale, `/authors/${slug}`),
      siteName: SITE_NAME,
      locale: openGraphLocale(locale),
      type: 'profile',
      images: [
        {
          url: absoluteUrl('/images/og-image.jpg'),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: profile.description,
      images: [absoluteUrl('/images/og-image.jpg')],
    },
  }
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const nav = await getTranslations({ locale, namespace: 'nav' })
  const blog = await getTranslations({ locale, namespace: 'blog' })
  const copy = pageCopy(locale)
  const posts = await getAllPosts()
  const profile = getAuthorProfile(posts, slug, locale as 'ka' | 'en' | 'ru')

  if (!profile) {
    notFound()
  }

  return (
    <>
      <JsonLd
        data={[
          buildPersonSchema({
            locale,
            slug,
            name: profile.name,
            description: profile.description,
            jobTitle: profile.jobTitle,
            knowsAbout: profile.focusAreas,
          }),
          buildCollectionPageSchema({
            locale,
            path: `/authors/${slug}`,
            name: profile.name,
            description: profile.description,
          }),
          buildBreadcrumbSchema([
            { name: nav('home'), url: buildCanonicalUrl(locale) },
            { name: blog('title'), url: buildCanonicalUrl(locale, '/blog') },
            { name: profile.name, url: buildCanonicalUrl(locale, `/authors/${slug}`) },
          ]),
        ]}
      />
      <main className="min-h-screen bg-[#f6f3ee]">
        <section className="border-b border-[#e5dfd4] bg-[#101820] py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d5c4a0]">
                {profile.jobTitle}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
                {profile.name}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/80">
                {profile.description}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <article className="rounded-[28px] border border-[#e5dfd4] bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-[#101820]">{copy.focusAreas}</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {profile.focusAreas.map((focus) => (
                  <span
                    key={focus}
                    className="rounded-full bg-[#f3efe5] px-4 py-2 text-sm font-medium text-[#243748]"
                  >
                    {focus}
                  </span>
                ))}
              </div>
            </article>

            <aside className="rounded-[28px] border border-[#e5dfd4] bg-[#fffaf1] p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-[#101820]">{copy.allArticles}</h2>
              <p className="mt-4 text-base leading-8 text-[#4f5f70]">
                {copy.publishedArticles(profile.postCount)}
              </p>
            </aside>
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold tracking-tight text-[#101820]">{copy.allArticles}</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {profile.posts.map((post) => (
                <article
                  key={post.slug}
                  className="overflow-hidden rounded-[28px] border border-[#e5dfd4] bg-white shadow-sm"
                >
                  <Link href={`/${locale}/blog/${post.slug}`} className="block">
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <Image
                        src={buildCloudinaryUrl(post.coverImage)}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a7367]">
                      {formatDate(post.publishedDate, locale)}
                    </p>
                    <Link href={`/${locale}/blog/${post.slug}`} className="block">
                      <h3 className="mt-3 text-2xl font-semibold text-[#101820]">{post.title}</h3>
                    </Link>
                    <p className="mt-4 text-sm leading-7 text-[#576273]">{post.excerpt}</p>
                    <Link
                      href={`/${locale}/blog/${post.slug}`}
                      className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-[#101820] px-5 text-sm font-medium text-white transition-colors hover:bg-[#0f6b66]"
                    >
                      {copy.readArticle}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
