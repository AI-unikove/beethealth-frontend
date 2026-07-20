import api from './api.service'

export async function getBranches(params = {}) {
  const response = await api.get('/branches', { params })
  return response.data
}

export async function getBranchById(id) {
  const response = await api.get(`/branches/${id}`)
  return response.data
}

export async function createBranch(payload) {
  const response = await api.post('/branches', payload)
  return response.data
}

export async function updateBranch(id, payload) {
  const response = await api.put(`/branches/${id}`, payload)
  return response.data
}

export async function toggleBranchStatus(id) {
  const response = await api.patch(`/branches/${id}/toggle-status`)
  return response.data
}

export async function deleteBranch(id) {
  const response = await api.delete(`/branches/${id}`)
  return response.data
}

// GET ALL CLIENTS OF A BRANCH (paginated)
export async function getBranchClients(branchId, params = {}) {
  const response = await api.get(`/branches/${branchId}/clients`, { params })
  return response.data
}
