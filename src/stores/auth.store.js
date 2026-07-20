import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { loginStaff, logoutStaff, getCurrentStaff, requestStaffOtp } from '@/services/auth.service'
import { hasPermission } from '@/constants/permissions'
import {
  clearStoredSession,
  getRememberMePreference,
  getStoredJson,
  getStoredValue,
  persistAuthSession,
  updateStoredUserSession,
} from '@/utils/authStorage'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(getStoredValue('bh_access_token', ''))
  const refreshToken = ref(getStoredValue('bh_refresh_token', ''))
  const user = ref(getStoredJson('bh_user', null))
  const permissions = ref(getStoredJson('bh_permissions', []))
  const rememberMe = ref(getRememberMePreference())
  const loading = ref(false)
  const hydrated = ref(false)

  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value))

  function persistSession(data = {}, shouldRemember = false) {
    accessToken.value = data.accessToken || ''
    refreshToken.value = data.refreshToken || ''
    user.value = data.user || null
    permissions.value = data.user?.permissions || []
    rememberMe.value = shouldRemember

    persistAuthSession(data, shouldRemember)
  }

  function clearSession() {
    accessToken.value = ''
    refreshToken.value = ''
    user.value = null
    permissions.value = []
    clearStoredSession()
  }

  async function login(payload) {
    loading.value = true
    try {
      const data = await loginStaff(payload)
      persistSession(data || {}, Boolean(payload?.rememberMe))
      return user.value
    } finally {
      loading.value = false
    }
  }

  /** Ask backend to send OTP SMS (MSG91). Pass `{ phone }` with E.164 phone. */
  function requestOtp(payload) {
    return requestStaffOtp(payload)
  }

  async function hydrate() {
    if (!accessToken.value) {
      hydrated.value = true
      return
    }

    try {
      const response = await getCurrentStaff()
      const currentUser = response?.data || null
      user.value = currentUser
      permissions.value = currentUser?.permissions || []
      updateStoredUserSession(currentUser)
    } catch {
      clearSession()
    } finally {
      hydrated.value = true
    }
  }

  async function logout() {
    try {
      if (refreshToken.value) {
        await logoutStaff(refreshToken.value)
      }
    } catch {
      // Ignore logout API errors and clear local session anyway.
    } finally {
      clearSession()
    }
  }

  function can(requiredPermission) {
    return hasPermission(permissions.value, requiredPermission)
  }

  return {
    accessToken,
    refreshToken,
    user,
    permissions,
    rememberMe,
    loading,
    hydrated,
    isAuthenticated,
    login,
    requestOtp,
    hydrate,
    logout,
    can,
    clearSession,
  }
})
