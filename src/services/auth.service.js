import api from './api.service'

/**
 * Request SMS OTP for staff login (backend sends via MSG91).
 * @param {{ phone: string }} payload — `phone` should be E.164 (use `normalizeStaffLoginPhone`).
 */
export async function requestStaffOtp(payload) {
  const response = await api.post('/auth/staff/request-otp', payload)
  return response.data
}

export async function loginStaff(payload) {
  const response = await api.post('/auth/staff/login', payload)
  return response.data
}

export async function logoutStaff(refreshToken) {
  const response = await api.post('/auth/staff/logout', { refreshToken })
  return response.data
}

export async function getCurrentStaff() {
  const response = await api.get('/auth/staff/me')
  return response.data
}
