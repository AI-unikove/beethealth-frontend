import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  processPDF,
  getClientBodyMetrics,
} from '@/services/client.service'
import { normalizeBodyMetricsToEntries } from '@/utils/bodyMetrics'

export const useClientStore = defineStore('client', () => {
  const clients = ref([])
  const currentClient = ref({})
  const loading = ref(false)
  const error = ref(null)
  const clientsTotal = ref(0)
  const bodyMetrics = ref([])

  const clientsCount = computed(() => clients.value.length)
  const hasClients = computed(() => clients.value.length > 0)

  async function processingPDF(formData) {
    try {
      const response = await processPDF(formData)
      return response
    } catch (err) {
      let errorMsg = 'Failed to process PDF'
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error
      } else if (err.code === 'ECONNABORTED') {
        errorMsg = 'Processing timeout. The PDF might be too large or complex.'
      }

      throw errorMsg
    }
  }
  async function fetchAllClients(params = {}) {
    error.value = null
    const limit = params.limit ?? 10
    const skip = params.skip ?? 0
    /** Pass through sort, name (search), and any future filters */
    const requestParams = { ...params, skip, limit }

    try {
      const response = await getClients(requestParams)
      const items = response.data ?? response.clients ?? response ?? []
      clients.value = Array.isArray(items) ? items : []
      clientsTotal.value =
        response.pagination?.total ??
        response.total ??
        response.totalCount ??
        response.totalRecords ??
        clients.value.length
      return clients.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch clients'
      throw err
    }
  }

  async function fetchClientById(clientId) {
    loading.value = true
    error.value = null

    try {
      const response = await getClientById(clientId)
      currentClient.value = response.data || response.client || response
      return currentClient.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch client'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addAndUpdateClient(clientData) {
    error.value = null

    try {
      const response = await updateClient(clientData)
      const newClient = response.data || response.client || response

      clients.value.push(newClient)

      return newClient
    } catch (err) {
      error.value = err.message || 'Failed to create client'
      throw err
    }
  }

  async function modifyClient(clientId, clientData) {
    loading.value = true
    error.value = null

    try {
      const response = await updateClient(clientId, clientData)
      const updatedClient = response.data || response.client || response

      const index = clients.value.findIndex((c) => c._id === clientId || c.id === clientId)
      if (index !== -1) {
        clients.value[index] = updatedClient
      }

      if (currentClient.value?._id === clientId || currentClient.value?.id === clientId) {
        currentClient.value = updatedClient
      }

      return updatedClient
    } catch (err) {
      error.value = err.message || 'Failed to update client'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function removeClient(clientId) {
    loading.value = true
    error.value = null

    try {
      await deleteClient(clientId)

      clients.value = clients.value.filter((c) => c._id !== clientId && c.id !== clientId)

      if (currentClient.value?._id === clientId || currentClient.value?.id === clientId) {
        currentClient.value = null
      }

      return true
    } catch (err) {
      error.value = err.message || 'Failed to delete client'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchClientBodyMetrics(clientId) {
    loading.value = true
    error.value = null

    try {
      const response = await getClientBodyMetrics(clientId)
      bodyMetrics.value = normalizeBodyMetricsToEntries(
        response?.data ?? response?.bodyMetrics ?? response,
      )
      return bodyMetrics.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch client body metrics'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function resetStore() {
    clients.value = []
    currentClient.value = null
    bodyMetrics.value = []
    loading.value = false
    error.value = null
  }

  return {
    clients,
    currentClient,
    bodyMetrics,
    loading,
    error,
    clientsTotal,

    clientsCount,
    hasClients,

    fetchAllClients,
    fetchClientById,
    addAndUpdateClient,
    modifyClient,
    removeClient,
    fetchClientBodyMetrics,
    clearError,
    resetStore,
    processingPDF,
  }
})
