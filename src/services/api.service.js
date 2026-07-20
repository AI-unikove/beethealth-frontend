import axios from 'axios'
import {
  clearStoredSession,
  getStoredValue,
  updateStoredTokens,
  updateStoredUserSession,
} from '@/utils/authStorage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 300000,
})

let refreshPromise = null

function getAccessToken() {
  return getStoredValue('bh_access_token', '')
}

function getRefreshToken() {
  return getStoredValue('bh_refresh_token', '')
}

function getRefreshPromise(refreshToken) {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = axios
    .post(`${API_URL}/auth/staff/refresh`, { refreshToken })
    .then((refreshResponse) => {
      const { accessToken, refreshToken: nextRefreshToken, user } = refreshResponse.data || {}

      if (!accessToken || !nextRefreshToken) {
        throw new Error('Failed to refresh session')
      }

      updateStoredTokens(accessToken, nextRefreshToken)
      if (user) updateStoredUserSession(user)

      return accessToken
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {}
    const status = error?.response?.status

    if (status !== 401 || originalRequest._retry) {
      throw error
    }

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearStoredSession()
      throw error
    }

    originalRequest._retry = true

    try {
      const accessToken = await getRefreshPromise(refreshToken)
      originalRequest.headers = originalRequest.headers || {}
      originalRequest.headers.Authorization = `Bearer ${accessToken}`

      return api(originalRequest)
    } catch (refreshError) {
      clearStoredSession()
      throw refreshError
    }
  },
)

export default api
