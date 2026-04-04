const DEFAULT_GA_MEASUREMENT_ID = 'G-ZNGHZ2EQ9P'

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || DEFAULT_GA_MEASUREMENT_ID

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || ''

function isBrowser() {
  return typeof window !== 'undefined'
}

export function loadAnalyticsScript() {
  if (!isBrowser() || !GA_MEASUREMENT_ID) {
    return
  }

  if (window.gaLoaded) {
    return
  }

  window.gaLoaded = true

  if (!document.querySelector(`script[data-ga-id="${GA_MEASUREMENT_ID}"]`)) {
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    script.async = true
    script.dataset.gaId = GA_MEASUREMENT_ID
    document.head.appendChild(script)
  }

  window.dataLayer = window.dataLayer || []
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }

  window.gtag('js', new Date())
}

export function trackAnalyticsPageView(pagePath: string) {
  if (!isBrowser() || !GA_MEASUREMENT_ID || typeof window.gtag !== 'function') {
    return
  }

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: pagePath,
  })
}

export function loadMetaPixelScript() {
  if (!isBrowser() || !META_PIXEL_ID) {
    return
  }

  if (window.metaPixelLoaded) {
    return
  }

  window.metaPixelLoaded = true

  if (typeof window.fbq !== 'function') {
    type FbqInstance = NonNullable<Window['fbq']>

    const fbq = function (...args: unknown[]) {
      if (typeof fbq.callMethod === 'function') {
        fbq.callMethod(...args)
        return
      }

      fbq.queue = fbq.queue || []
      fbq.queue.push(args)
    } as FbqInstance

    fbq.queue = []
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.push = (...args: unknown[]) => {
      fbq(...args)
    }

    window.fbq = fbq
    if (!window._fbq) {
      window._fbq = fbq
    }
  }

  if (!document.querySelector(`script[data-meta-pixel-id="${META_PIXEL_ID}"]`)) {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    script.dataset.metaPixelId = META_PIXEL_ID
    document.head.appendChild(script)
  }

  window.fbq?.('init', META_PIXEL_ID)
}

export function trackMetaPixelPageView() {
  if (!isBrowser() || !META_PIXEL_ID || typeof window.fbq !== 'function') {
    return
  }

  window.fbq('track', 'PageView')
}
