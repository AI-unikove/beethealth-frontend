const REMEMBER_ME_KEY = 'bh_remember_me'
const SESSION_KEYS = ['bh_access_token', 'bh_refresh_token', 'bh_user', 'bh_permissions']

function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
    return null
  }

  try {
    const payload = token.split('.')[1]
    const normalized = payload.replaceAll('-', '+').replaceAll('_', '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

function parseStoredJson(value, fallback) {
  if (!value) return fallback

  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export function getRememberMePreference() {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true'
}

export function setRememberMePreference(rememberMe) {
  localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false')
}

export function getAuthStorage() {
  return localStorage
}

export function getStoredValue(key, fallback = '') {
  const sessionValue = sessionStorage.getItem(key)
  const localValue = localStorage.getItem(key)
  const value = localValue ?? sessionValue

  if (fallback !== '' && value == null) {
    return fallback
  }

  return value || fallback
}

export function getStoredJson(key, fallback = null) {
  const sessionValue = sessionStorage.getItem(key)
  const localValue = localStorage.getItem(key)
  return parseStoredJson(localValue ?? sessionValue, fallback)
}

export function persistAuthSession(data = {}, rememberMe = false) {
  setRememberMePreference(rememberMe)
  SESSION_KEYS.forEach((key) => sessionStorage.removeItem(key))

  if (data.accessToken) localStorage.setItem('bh_access_token', data.accessToken)
  if (data.refreshToken) localStorage.setItem('bh_refresh_token', data.refreshToken)
  localStorage.setItem('bh_user', JSON.stringify(data.user || null))
  localStorage.setItem('bh_permissions', JSON.stringify(data.user?.permissions || []))
}

export function updateStoredUserSession(user) {
  const targetStorage = getAuthStorage()
  targetStorage.setItem('bh_user', JSON.stringify(user || null))
  targetStorage.setItem('bh_permissions', JSON.stringify(user?.permissions || []))
}

export function updateStoredTokens(accessToken, refreshToken) {
  const targetStorage = getAuthStorage()
  if (accessToken) targetStorage.setItem('bh_access_token', accessToken)
  if (refreshToken) targetStorage.setItem('bh_refresh_token', refreshToken)
}

export function isJwtExpired(token, offsetSeconds = 0) {
  const payload = decodeJwtPayload(token)
  const exp = Number(payload?.exp)

  if (!Number.isFinite(exp)) {
    return false
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  return exp <= nowSeconds + Number(offsetSeconds || 0)
}

export function clearStoredSession() {
  SESSION_KEYS.forEach((key) => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })
}
