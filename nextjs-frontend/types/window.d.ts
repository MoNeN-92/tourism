type AnalyticsFn = (...args: unknown[]) => void

type FbqFn = AnalyticsFn & {
  callMethod?: AnalyticsFn
  queue?: unknown[][]
  loaded?: boolean
  version?: string
  push?: AnalyticsFn
}

declare global {
  interface Window {
    _fbq?: FbqFn
    dataLayer: unknown[]
    fbq?: FbqFn
    gaLoaded?: boolean
    gtag?: AnalyticsFn
    metaPixelLoaded?: boolean
  }
}

export {}
