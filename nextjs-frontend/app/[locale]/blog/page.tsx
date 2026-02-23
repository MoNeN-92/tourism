import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import BlogPageClient from './BlogPageClient'
import { absoluteUrl, localizedAlternates, openGraphLocale } from '@/lib/seo'
import { buildCloudinaryUrl } from '@/lib/cloudinary'

const BLOG_OG_IMAGE = buildCloudinaryUrl(
  'https://res.cloudinary.com/dj7qaif1i/image/upload/v1771054787/tourism-platform/osepfgijh6dcvq0lztim.jpg',
)

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  const title = `${t('title')} | Vibe Georgia`
  const description = t('subtitle')

  return {
    title,
    description,
    alternates: localizedAlternates(locale, '/blog'),
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/${locale}/blog`),
      siteName: 'Vibe Georgia',
      locale: openGraphLocale(locale),
      type: 'website',
      images: [
        {
          url: BLOG_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [BLOG_OG_IMAGE],
    },
  }
}

export default function BlogPage() {
  return <BlogPageClient />
}
