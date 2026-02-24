// lib/imageLoader.ts
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  // Cloudinary სურათები - პირდაპირ ვაბრუნებთ
  if (src.includes('res.cloudinary.com')) {
    return src
  }

  // სხვა ყველა სურათი - პირდაპირ URL-ს ვაბრუნებთ width param-ით თუ შეიძლება
  if (src.includes('unsplash.com')) {
    return `${src.split('?')[0]}?w=${width}&q=${quality || 80}&auto=format&fit=crop`
  }

  // დანარჩენი - URL უცვლელად
  return src
}