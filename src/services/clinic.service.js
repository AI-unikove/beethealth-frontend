import api from './api.service'

export async function getClinics(params = {}) {
  const response = await api.get('/clinics', { params })
  return response.data
}

export async function getClinicById(id) {
  const response = await api.get(`/clinics/${id}`)
  return response.data
}

export async function createClinic(payload) {
  const response = await api.post('/clinics', payload)
  return response.data
}

export async function updateClinic(id, payload) {
  const response = await api.put(`/clinics/${id}`, payload)
  return response.data
}

export async function toggleClinicStatus(id) {
  const response = await api.patch(`/clinics/${id}/toggle-status`)
  return response.data
}

export async function deleteClinic(id) {
  const response = await api.delete(`/clinics/${id}`)
  return response.data
}
