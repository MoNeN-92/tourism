const ADMIN_TOKEN_COOKIE_NAME = 'token'
const ADMIN_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

function getCookieSecureSuffix() {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.location.protocol === 'https:' ? '; Secure' : ''
}

export function persistAdminAccessToken(token: string) {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(ADMIN_TOKEN_COOKIE_NAME, token)

  document.cookie = `${ADMIN_TOKEN_COOKIE_NAME}=${encodeURIComponent(
    token,
  )}; Path=/; Max-Age=${ADMIN_TOKEN_MAX_AGE_SECONDS}; SameSite=Lax${getCookieSecureSuffix()}`
}

export function clearAdminAccessToken() {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.removeItem(ADMIN_TOKEN_COOKIE_NAME)

  document.cookie = `${ADMIN_TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`
  document.cookie = `${ADMIN_TOKEN_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${getCookieSecureSuffix()}`
}
