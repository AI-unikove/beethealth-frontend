const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export async function getClinicFormConfig(clinicId) {
  try {
    const response = await fetch(`${API_BASE_URL}/clinics/${clinicId}/form-config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error || `HTTP ${response.status}: Failed to fetch form configuration`,
      )
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Invalid configuration response')
    }

    if (!data.config?.typeformId && data.config?.isTypeformEnabled) {
      throw new Error('Typeform is enabled but no form ID is configured')
    }

    return data
  } catch (err) {
    throw new Error(err.message || 'Unable to load form configuration. Please contact support.')
  }
}

export async function createClient(clinicId, additionalData = {}) {
  try {
    const payload = {
      clinicId,
      onboardingStatus: 'in_progress',
      profile: {
        fullName: additionalData.fullName || 'Pending',
        email: additionalData.email || 'pending@onboarding.com',
        ...additionalData.profile,
      },
      ...additionalData,
    }

    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to create client`)
    }

    const data = await response.json()

    const clientId = data.clientId || data.data?._id || data.data?.id || data._id || data.id

    if (!clientId) {
      throw new Error('Client created but ID not found in response')
    }

    return clientId
  } catch (err) {
    throw new Error(err.message || 'Unable to create your profile. Please try again.')
  }
}

export async function updateClinicTypeformConfig(clinicId, config, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/clinics/${clinicId}/typeform-config`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to update configuration`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to update configuration')
    }

    return data
  } catch (err) {
    throw new Error(err.message || 'Unable to update Typeform configuration')
  }
}

export function isValidClinicId(clinicId) {
  if (!clinicId || typeof clinicId !== 'string') {
    return false
  }
  // MongoDB ObjectId is 24 hex characters
  return /^[0-9a-fA-F]{24}$/.test(clinicId)
}

export function buildTypeformUrl(typeformId, hiddenFields = {}) {
  const baseUrl = `https://form.typeform.com/to/${typeformId}`
  const params = new URLSearchParams()

  Object.entries(hiddenFields).forEach(([key, value]) => {
    if (value) {
      params.append(key, value)
    }
  })

  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

export default {
  getClinicFormConfig,
  createClient,
  updateClinicTypeformConfig,
  isValidClinicId,
  buildTypeformUrl,
}
