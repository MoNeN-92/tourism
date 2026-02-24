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
  // Cloudinary სურათები - width და quality transformation ვამატებთ
  if (src.includes('res.cloudinary.com')) {
    const q = quality || 75

    // თუ უკვე transformation აქვს (f_auto,q_auto ან blur placeholder)
    // ამოვიღოთ ძველი transformation და ახალი ჩავსვათ
    const uploadIndex = src.indexOf('/upload/')
    if (uploadIndex !== -1) {
      const afterUpload = src.slice(uploadIndex + 8)

      // version ან public id-ის დასაწყისი (v123... ან პირდაპირ folder/...)
      const versionMatch = afterUpload.match(/^((?:[a-zA-Z_,:.0-9]+\/)*)(v\d+\/.+|[^/]+\/.+)$/)

      if (versionMatch) {
        const publicPath = versionMatch[2] || afterUpload
        const baseUrl = src.slice(0, uploadIndex + 8)
        return `${baseUrl}w_${width},q_${q},f_auto,c_limit/${publicPath}`
      }

      // fallback - transformation-ს ვამატებთ პირდაპირ
      return src.replace('/upload/', `/upload/w_${width},q_${q},f_auto,c_limit/`)
    }

    return src
  }

  // Unsplash სურათები
  if (src.includes('unsplash.com')) {
    const base = src.split('?')[0]
    return `${base}?w=${width}&q=${quality || 75}&auto=format&fit=crop`
  }

  // დანარჩენი სურათები - პირდაპირ URL
  return src
}