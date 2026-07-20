import api from './api.service'

export const processPDF = async (formData) => {
  const response = await api.post('/ocr/process-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300000,
  })

  if (response.data.success) {
    return response
  }

  throw new Error(response.data.error || 'Processing failed')
}

export const createClient = async (clientData) => {
  const response = await api.post('/clients', clientData)
  return response.data
}

/**
 * List clients with pagination and server-side sort.
 * Query params: skip, limit, name (optional search), sort (see `CLIENT_SORT_VALUES` in `@/constants/clientListSort`).
 */
export const getClients = async (criteria = {}) => {
  const response = await api.get('/clients', { params: criteria })
  return response.data
}

export const getClientById = async (clientId) => {
  const response = await api.get(`/clients/${clientId}`)
  return response.data
}

export const updateClient = async (clientData) => {
  const payload = { ...clientData }
  const response = await api.post('/clients', payload)
  return response.data
}

export const deleteClient = async (clientId) => {
  const response = await api.delete(`/clients/${clientId}`)
  return response.data
}

// ASSIGN / REASSIGN nutritionist to a client. Pass nutritionistId = null to unassign.
export const assignClientNutritionist = async (clientId, nutritionistId) => {
  const response = await api.patch(`/clients/${clientId}/assign-nutritionist`, { nutritionistId })
  return response.data
}

export const getClientBodyMetrics = async (clientId) => {
  const response = await api.get(`/clients/${clientId}/body-metrics`)
  return response.data
}

export const logMealItemForPlan = async (planId, payload) => {
  const response = await api.put(`/assigned-plans/${planId}/log-item`, payload)
  return response.data
}

export const getClientNutritionProgress = async (clientId, options = {}) => {
  const params = {}
  if (options.period) params.period = options.period
  if (options.date) params.date = options.date
  const response = await api.get(`/clients/${clientId}/nutrition-progress`, { params })
  return response.data
}

export const getAssignedPlanByClientId = async (clientId, options = {}) => {
  const params = {}
  if (options.date) {
    params.date = options.date
  }
  const response = await api.get(`/assigned-plans/client/${clientId}`, { params })
  return response.data
}

/**
 * Add a dietary tag (specialDiet or dietaryRestriction) to multiple clients.
 * POST /clients/bulk/add-tag  { clientIds: string[], tag: string }
 */
export const addTagToClients = async (clientIds, tag) => {
  const response = await api.post('/clients/bulk/add-tag', { clientIds, tag })
  return response.data
}

/**
 * Mark multiple clients as highlighted (needs attention).
 * PATCH /clients/bulk/highlight  { clientIds: string[] }
 */
export const highlightClients = async (clientIds) => {
  const response = await api.patch('/clients/bulk/highlight', { clientIds })
  return response.data
}

/**
 * Put a single client's plan on hold.
 * PATCH /clients/:id/hold
 */
export const putClientOnHold = async (clientId) => {
  const response = await api.patch(`/clients/${clientId}/hold`)
  return response.data
}

/**
 * Add / update additional notes for a single client.
 * PATCH /clients/:id/notes  { notes: string }
 */
export const addClientNotes = async (clientId, notes) => {
  const response = await api.patch(`/clients/${clientId}/notes`, { notes })
  return response.data
}

/**
 * POST /clients/export/pdf  { clientIds: string[] }
 * Returns a PDF blob.
 */
export const exportClientsPdf = async (clientIds) => {
  const response = await api.post('/clients/export/pdf', { clientIds }, { responseType: 'blob' })
  return response.data
}
