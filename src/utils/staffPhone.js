/**
 * Normalize staff login phone to E.164 for `/auth/staff/request-otp` and `/auth/staff/login`.
 * Ten-digit Indian numbers default to `+91`.
 *
 * @param {string} input
 * @returns {string}
 */
export function normalizeStaffLoginPhone(input) {
  const digits = String(input || '').replace(/\D/g, '')
  if (!digits) {
    return ''
  }
  // Common local input in India: 0XXXXXXXXXX -> +91XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.slice(1)}`
  }
  if (digits.length === 10) {
    return `+91${digits}`
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`
  }
  if (digits.length >= 11 && digits.length <= 15) {
    return `+${digits}`
  }
  return digits.length >= 10 ? `+${digits}` : ''
}
