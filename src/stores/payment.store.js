import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPayments, notifyPayment } from '@/services/payment.service'

export const usePaymentStore = defineStore('payment', () => {
  const payments = ref([])
  const loading = ref(false)
  const error = ref(null)
  const total = ref(0)

  async function fetchPayments(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await getPayments(params)
      const items = response.data ?? response.payments ?? response ?? []
      payments.value = Array.isArray(items) ? items : []
      total.value =
        response.pagination?.total ?? response.total ?? response.totalCount ?? payments.value.length
      return payments.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch payments'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function sendNotification(paymentId) {
    try {
      return await notifyPayment(paymentId)
    } catch (err) {
      error.value = err.message || 'Failed to send notification'
      throw err
    }
  }

  return { payments, loading, error, total, fetchPayments, sendNotification }
})
