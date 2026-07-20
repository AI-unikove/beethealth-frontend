import api from './api.service'

export const getPayments = async (params = {}) => {
  const response = await api.get('/payments', { params })
  return response.data
}

export const notifyPayment = async (paymentId) => {
  const response = await api.post(`/payments/${paymentId}/notify`)
  return response.data
}
