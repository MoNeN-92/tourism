const ADMIN_TOKEN_COOKIE_NAME = 'token'

export function clearAdminAccessToken() {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.removeItem(ADMIN_TOKEN_COOKIE_NAME)

  document.cookie = `${ADMIN_TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`
  document.cookie = `${ADMIN_TOKEN_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
}
