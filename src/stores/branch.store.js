import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getBranches } from '@/services/branch.service'

export const useBranchStore = defineStore('branch', () => {
  const branches = ref([])
  const loading = ref(false)
  const error = ref(null)
  const branchesTotal = ref(0)
  const totalEmployees = ref(0)
  const totalClients = ref(0)

  const branchesCount = computed(() => branches.value.length)

  // eslint-disable-next-line complexity
  async function fetchAllBranches(params = {}) {
    loading.value = true
    error.value = null
    const limit = params.limit ?? 10
    const skip = params.skip ?? 0
    const requestParams = { ...params, skip, limit }

    try {
      const response = await getBranches(requestParams)
      const items = response.data ?? response.branches ?? response ?? []
      branches.value = Array.isArray(items) ? items : []
      branchesTotal.value =
        response.pagination?.total ??
        response.total ??
        response.totalCount ??
        response.totalRecords ??
        branches.value.length
      totalEmployees.value =
        response.summary?.totalEmployees ??
        response.totalEmployees ??
        branches.value.reduce((s, b) => s + Number(b.numberOfEmployees ?? 0), 0)
      totalClients.value =
        response.summary?.totalClients ??
        response.totalClients ??
        branches.value.reduce((s, b) => s + Number(b.numberOfClients ?? 0), 0)
      return branches.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch branches'
      throw err
    } finally {
      loading.value = false
    }
  }

  function addBranchToList(branch) {
    branches.value.unshift(branch)
    branchesTotal.value += 1
  }

  function clearError() {
    error.value = null
  }

  function resetStore() {
    branches.value = []
    loading.value = false
    error.value = null
    branchesTotal.value = 0
    totalEmployees.value = 0
    totalClients.value = 0
  }

  return {
    branches,
    loading,
    error,
    branchesTotal,
    totalEmployees,
    totalClients,
    branchesCount,
    fetchAllBranches,
    addBranchToList,
    clearError,
    resetStore,
  }
})
