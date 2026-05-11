const DEFAULT_GA_MEASUREMENT_ID = 'G-ZNGHZ2EQ9P'

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || DEFAULT_GA_MEASUREMENT_ID

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || ''

type ConsentValue = 'granted' | 'denied'

function isBrowser() {
  return typeof window !== 'undefined'
}

function ensureAnalyticsRuntime() {
  if (!isBrowser() || !GA_MEASUREMENT_ID) {
    return
  }

  window.dataLayer = window.dataLayer || []
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }
}

export function initializeAnalytics() {
  if (!isBrowser() || !GA_MEASUREMENT_ID || window.gaLoaded) {
    return
  }

  ensureAnalyticsRuntime()
  window.gaLoaded = true
  window.gtag?.('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500,
  })
  window.gtag?.('js', new Date())
  window.gtag?.('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
  })
}

export function updateAnalyticsConsent(enabled: boolean) {
  if (!isBrowser() || !GA_MEASUREMENT_ID || typeof window.gtag !== 'function') {
    return
  }

  const analyticsStorage: ConsentValue = enabled ? 'granted' : 'denied'

  window.gtag('consent', 'update', {
    analytics_storage: analyticsStorage,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
}

export function trackAnalyticsPageView(pagePath: string) {
  if (!isBrowser() || !GA_MEASUREMENT_ID || typeof window.gtag !== 'function') {
    return
  }

  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_location: window.location.href,
    send_to: GA_MEASUREMENT_ID,
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

export function trackMetaPixelEvent(
  eventName: string,
  parameters?: Record<string, string | number | boolean>,
) {
  if (!isBrowser() || !META_PIXEL_ID || typeof window.fbq !== 'function') {
    return
  }

  if (parameters) {
    window.fbq('track', eventName, parameters)
    return
  }

  window.fbq('track', eventName)
}
