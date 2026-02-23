const DEFAULT_CLOUD_NAME = 'dj7qaif1i'
const CLOUDINARY_BASE = `https://res.cloudinary.com/${DEFAULT_CLOUD_NAME}/image/upload`
const OPTIMIZED_TRANSFORM = 'f_auto,q_auto'
const BLUR_PLACEHOLDER_TRANSFORM = 'w_20,q_10,f_auto,e_blur:200'

function isTransformationSegment(value: string): boolean {
  return value.includes(',') || /^(?:[a-z]{1,3}_|q_|f_|e_|w_|h_|c_|g_|x_|y_|r_)/.test(value)
}

function normalizeCloudinaryPath(rawPath: string): string {
  const segments = rawPath.split('/').filter(Boolean)

  if (segments.length === 0) {
    return rawPath
  }

  if (/^v\d+$/.test(segments[0])) {
    return segments.join('/')
  }

  if (isTransformationSegment(segments[0])) {
    return segments.slice(1).join('/')
  }

  return segments.join('/')
}

function parseCloudinaryUrl(url: string): { cloudName: string; publicPath: string } | null {
  const match = url.match(/^https?:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(.+)$/)

  if (!match) {
    return null
  }

  const cloudName = match[1]
  const publicPath = normalizeCloudinaryPath(match[2])

  return {
    cloudName,
    publicPath,
  }
}

function asPublicPath(input: string): string {
  return input.replace(/^\/+/, '')
}

function buildUrl(cloudName: string, transform: string, publicPath: string): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicPath}`
}

export function buildCloudinaryUrl(input: string): string {
  if (!input) {
    return input
  }

  const parsed = parseCloudinaryUrl(input)

  if (parsed) {
    return buildUrl(parsed.cloudName, OPTIMIZED_TRANSFORM, parsed.publicPath)
  }

  if (/^https?:\/\//.test(input)) {
    return input
  }

  return buildUrl(DEFAULT_CLOUD_NAME, OPTIMIZED_TRANSFORM, asPublicPath(input))
}

export function buildCloudinarySources(input: string): { src: string; lowResSrc: string } {
  if (!input) {
    return { src: input, lowResSrc: input }
  }

  const parsed = parseCloudinaryUrl(input)

  if (parsed) {
    return {
      src: buildUrl(parsed.cloudName, OPTIMIZED_TRANSFORM, parsed.publicPath),
      lowResSrc: buildUrl(parsed.cloudName, BLUR_PLACEHOLDER_TRANSFORM, parsed.publicPath),
    }
  }

  if (/^https?:\/\//.test(input)) {
    return { src: input, lowResSrc: input }
  }

  const publicPath = asPublicPath(input)

  return {
    src: buildUrl(DEFAULT_CLOUD_NAME, OPTIMIZED_TRANSFORM, publicPath),
    lowResSrc: buildUrl(DEFAULT_CLOUD_NAME, BLUR_PLACEHOLDER_TRANSFORM, publicPath),
  }
}

export const CLOUDINARY = {
  baseUrl: CLOUDINARY_BASE,
  cloudName: DEFAULT_CLOUD_NAME,
  optimizedTransform: OPTIMIZED_TRANSFORM,
  blurTransform: BLUR_PLACEHOLDER_TRANSFORM,
}
