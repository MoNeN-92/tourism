'use client'

// components/ProgressiveImage.tsx
import { useState } from 'react'
import Image from 'next/image'
import { buildCloudinarySources, buildCloudinaryUrl } from '@/lib/cloudinary'

interface ProgressiveImageProps {
  src: string
  lowResSrc?: string
  alt: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  className?: string
}

export default function ProgressiveImage({
  src,
  lowResSrc,
  alt,
  fill = true,
  priority = false,
  sizes = '100vw',
  className = 'object-cover',
}: ProgressiveImageProps) {
  const [highResLoaded, setHighResLoaded] = useState(false)
  const generatedSources = buildCloudinarySources(src)
  const highResSrc = buildCloudinaryUrl(src)
  const blurSrc = lowResSrc || generatedSources.lowResSrc

  return (
    <>
      {/* დაბალი ხარისხი - ყოველთვის ჩანს სანამ მაღალი არ ჩაიტვირთება */}
      <Image
        src={blurSrc}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={`${className} transition-opacity duration-500 ${
          highResLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ filter: 'blur(8px)', transform: 'scale(1.05)' }}
      />

      {/* მაღალი ხარისხი - ჩაიტვირთება ფონში */}
      <Image
        src={highResSrc}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={`${className} transition-opacity duration-700 ${
          highResLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setHighResLoaded(true)}
      />
    </>
  )
}
