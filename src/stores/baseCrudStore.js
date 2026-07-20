import { ref, reactive, computed } from 'vue'

/**
 * Base CRUD Store Factory
 * @param {string} crudKey - Unique identifier (e.g., 'recipes', 'clients')
 */
export function createBaseCrudStore(crudKey) {
  // State
  const items = ref([])
  const item = ref(null)
  const editedItem = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const visible = reactive({
    create: false,
    edit: false,
    delete: false,
    view: false,
  })
  const pagination = reactive({
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
  })
  const search = ref('')

  // Computed
  const itemsCount = computed(() => items.value.length)
  const hasItems = computed(() => items.value.length > 0)
  const isAnyDialogOpen = computed(() => Object.values(visible).some((v) => v === true))

  // Setters
  const setItems = (data) => {
    items.value = Array.isArray(data) ? data : []
  }

  const setItem = (data) => {
    item.value = data
    editedItem.value = data ? JSON.parse(JSON.stringify(data)) : null
  }

  const setEditedItem = (data) => {
    editedItem.value = data
  }

  const updateEditedItemField = (fieldName, value) => {
    if (editedItem.value) {
      editedItem.value[fieldName] = value
    }
  }

  const resetItem = () => {
    item.value = null
    editedItem.value = null
  }

  const resetEditedItem = () => {
    editedItem.value = item.value ? JSON.parse(JSON.stringify(item.value)) : null
  }

  const setLoading = (value) => {
    loading.value = value
  }

  const setError = (message) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  const setTotalItems = (total) => {
    pagination.totalItems = total
  }

  // Dialog Management
  const openDialog = (dialogName, itemData = null) => {
    if (!Object.hasOwn(visible, dialogName)) {
      console.error(`Dialog "${dialogName}" does not exist in crudKey: ${crudKey}`)
      return
    }

    if (itemData) {
      setItem(itemData)
    }

    visible[dialogName] = true
  }

  const closeDialog = (dialogName, clearItem = true) => {
    if (!Object.hasOwn(visible, dialogName)) {
      console.error(`Dialog "${dialogName}" does not exist in crudKey: ${crudKey}`)
      return
    }

    visible[dialogName] = false

    if (clearItem && dialogName !== 'view') {
      resetItem()
    }
  }

  const closeAllDialogs = () => {
    Object.keys(visible).forEach((key) => {
      visible[key] = false
    })
    resetItem()
  }

  // List Management
  const addItemToList = (newItem) => {
    items.value.push(newItem)
  }

  const updateItemInList = (id, updatedData) => {
    const index = items.value.findIndex((i) => (i._id ?? i.id) === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updatedData }
    }
  }

  const removeItemFromList = (id) => {
    items.value = items.value.filter((i) => (i._id ?? i.id) !== id)
  }

  return {
    crudKey,
    items,
    item,
    editedItem,
    loading,
    error,
    visible,
    pagination,
    search,
    itemsCount,
    hasItems,
    isAnyDialogOpen,
    setItems,
    setItem,
    setEditedItem,
    updateEditedItemField,
    resetItem,
    resetEditedItem,
    setLoading,
    setError,
    clearError,
    setTotalItems,
    openDialog,
    closeDialog,
    closeAllDialogs,
    addItemToList,
    updateItemInList,
    removeItemFromList,
  }
}
