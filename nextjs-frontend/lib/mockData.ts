// lib/mockData.ts
import { mockBlogPosts } from './mockBlogData'

// დაამატე ეს interface და mockTours array შენს არსებულ mockData.ts ფაილში

export interface MockTour {
  id: string
  slug: string
  title_ka: string
  title_en: string
  title_ru: string
  excerpt_ka: string
  excerpt_en: string
  excerpt_ru: string
  coverImage: string
  duration: string
  price: number
}

export const mockTours: MockTour[] = [
  {
    id: '1',
    slug: 'svaneti-trek',
    title_ka: 'სვანეთის ტრეკინგი',
    title_en: 'Svaneti Trekking',
    title_ru: 'Треккинг в Сванетии',
    excerpt_ka: 'დაუვიწყარი ტრეკინგი სვანეთის მთებში',
    excerpt_en: 'Unforgettable trekking in Svaneti mountains',
    excerpt_ru: 'Незабываемый треккинг в горах Сванетии',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    duration: '7 დღე',
    price: 850,
  },
  {
    id: '2',
    slug: 'kazbegi-adventure',
    title_ka: 'ყაზბეგის თავგადასავალი',
    title_en: 'Kazbegi Adventure',
    title_ru: 'Приключение в Казбеги',
    excerpt_ka: 'ზამთრის თავგადასავალი ყაზბეგის მთებში',
    excerpt_en: 'Winter adventure in Kazbegi mountains',
    excerpt_ru: 'Зимнее приключение в горах Казбеги',
    coverImage: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80',
    duration: '3 დღე',
    price: 350,
  },
  {
    id: '3',
    slug: 'batumi-getaway',
    title_ka: 'ბათუმის შვებულება',
    title_en: 'Batumi Getaway',
    title_ru: 'Отдых в Батуми',
    excerpt_ka: 'დასასვენებელი ტური ბათუმის სანაპიროზე',
    excerpt_en: 'Relaxing tour on Batumi coast',
    excerpt_ru: 'Расслабляющий тур на побережье Батуми',
    coverImage: 'https://images.unsplash.com/photo-1502301103665-0b95cc738daf?w=800&q=80',
    duration: '5 დღე',
    price: 550,
  },
  {
    id: '4',
    slug: 'wine-tour-kakheti',
    title_ka: 'ღვინის ტური კახეთში',
    title_en: 'Wine Tour in Kakheti',
    title_ru: 'Винный тур в Кахетии',
    excerpt_ka: 'ღვინის დეგუსტაცია კახეთის ვენახებში',
    excerpt_en: 'Wine tasting in Kakheti vineyards',
    excerpt_ru: 'Дегустация вина на виноградниках Кахетии',
    coverImage: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
    duration: '2 დღე',
    price: 250,
  },
]

export { mockBlogPosts }