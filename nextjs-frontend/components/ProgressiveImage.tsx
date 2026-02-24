'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { buildCloudinaryUrl } from '@/lib/cloudinary'

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
  const [isLoaded, setIsLoaded] = useState(false)

  // Cloudinary-ს ოპტიმიზირებული ლინკები
  const highResSrc = buildCloudinaryUrl(src)
  const blurSrc = lowResSrc || highResSrc.replace('/upload/', '/upload/w_40,q_10,f_auto/')

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* დაბალი ხარისხის Blur ფონი */}
      <Image
        src={blurSrc}
        alt={alt}
        fill={fill}
        sizes="20vw" // Blur-ისთვის დიდი ზომა არ გვჭირდება
        unoptimized
        className={`transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
        style={{ filter: 'blur(10px)', scale: '1.1' }}
      />

      {/* ძირითადი სურათი */}
      <Image
        src={highResSrc}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        fetchPriority={priority ? "high" : "low"}
        className={`transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  )
}