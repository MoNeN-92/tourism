'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'

interface SwipeGalleryImage {
  id: string
  src: string
  alt: string
}

interface SwipeGalleryProps {
  images: SwipeGalleryImage[]
  initialIndex?: number
  onClose?: () => void
}

const SWIPE_THRESHOLD = 50

export default function SwipeGallery({ images, initialIndex = 0, onClose }: SwipeGalleryProps) {
  const [index, setIndex] = useState(initialIndex)
  const touchStartX = useRef<number | null>(null)

  const currentImage = useMemo(() => images[index] || images[0], [images, index])

  if (!currentImage) {
    return null
  }

  const goNext = () => {
    setIndex((prev) => (prev + 1) % images.length)
  }

  const goPrev = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (event) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null
  }

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (event) => {
    if (touchStartX.current === null) {
      return
    }

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const deltaX = endX - touchStartX.current

    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      if (deltaX < 0) {
        goNext()
      } else {
        goPrev()
      }
    }

    touchStartX.current = null
  }

  return (
    <div className="relative w-full h-full" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 z-20 min-h-[44px] min-w-[44px] rounded-full bg-black/50 text-white"
          aria-label="Close gallery"
        >
          ×
        </button>
      )}

      <div className="absolute top-2 left-2 z-20 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
        {index + 1} / {images.length}
      </div>

      <Image
        src={currentImage.src}
        alt={currentImage.alt}
        fill
        className="object-contain"
        sizes="100vw"
        priority
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 min-h-[44px] min-w-[44px] rounded-full bg-black/50 text-white"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 min-h-[44px] min-w-[44px] rounded-full bg-black/50 text-white"
            aria-label="Next image"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}
