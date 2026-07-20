import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getEnums } from '@/services/enums.service'

export const useEnumsStore = defineStore('enums', () => {
  const enums = ref({})
  const loading = ref(false)
  const error = ref(null)
  const customCuisines = ref([])
  const customTags = ref([])

  const baseCuisines = computed(() => enums.value.recipe?.cuisines ?? [])
  const baseTags = computed(() => enums.value.recipe?.tags ?? [])
  const cuisines = computed(() => [
    ...baseCuisines.value,
    ...(customCuisines.value || []).filter((c) => c && !baseCuisines.value.includes(c)),
  ])
  const tags = computed(() => [
    ...baseTags.value,
    ...(customTags.value || []).filter((t) => t && !baseTags.value.includes(t)),
  ])

  function addCustomCuisine(value) {
    const v = value != null ? String(value).trim() : ''
    if (!v || customCuisines.value.includes(v)) return
    customCuisines.value = [...customCuisines.value, v]
  }

  function addCustomTag(value) {
    const v = value != null ? String(value).trim() : ''
    if (!v || customTags.value.includes(v)) return
    customTags.value = [...customTags.value, v]
  }

  async function fetchAllEnums() {
    loading.value = true
    error.value = null
    try {
      const response = await getEnums()
      const data = response?.data ?? response ?? {}
      enums.value = typeof data === 'object' && data !== null ? data : {}
      customCuisines.value = []
      customTags.value = []
      return enums.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch enums'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function resetStore() {
    enums.value = {}
    customCuisines.value = []
    customTags.value = []
    loading.value = false
    error.value = null
  }

  return {
    enums,
    loading,
    error,
    cuisines,
    tags,
    baseCuisines,
    baseTags,
    addCustomCuisine,
    addCustomTag,
    fetchAllEnums,
    clearError,
    resetStore,
  }
})
