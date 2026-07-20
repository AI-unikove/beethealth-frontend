import api from './api.service'

export function createStaff(data) {
  return api.post('/staff', data)
}

// GET EMPLOYEES WITH PAGINATION + SEARCH + FILTER
export function getEmployees(params) {
  return api.get('/staff', { params })
}

// UPDATE EMPLOYEE STATUS (active / inactive)
export function updateEmployeeStatus(id, status) {
  return api.patch(`/staff/${id}/status`, { status })
}

// UPDATE EMPLOYEE (name, email, phone, role, branch, status)
export function updateEmployee(id, payload) {
  return api.patch(`/staff/${id}`, payload)
}
