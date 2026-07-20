import { defineStore } from 'pinia'
import { computed } from 'vue'
import {
  createRecipe,
  getRecipes,
  deleteRecipe,
  editRecipe,
  getRecipe,
  checkRecipeName as checkRecipeNameService,
} from '@/services/recipes.service'
import { createBaseCrudStore } from './baseCrudStore'

export const useRecipesStore = defineStore('recipes', () => {
  const base = createBaseCrudStore('recipes')

  const recipes = computed(() => (Array.isArray(base.items.value) ? base.items.value : []))
  const recipesCount = computed(() => base.itemsCount)
  const hasRecipes = computed(() => base.hasItems)

  async function addRecipe(recipeData) {
    base.setLoading(true)
    base.clearError()

    try {
      const newRecipe = await createRecipe(recipeData)
      base.addItemToList(newRecipe)
      base.closeDialog('create')
      return newRecipe
    } catch (err) {
      base.setError(err.message || 'Failed to create recipe')
      throw err
    } finally {
      base.setLoading(false)
    }
  }

  async function fetchAllRecipes(params = {}) {
    base.clearError()

    const limit = params.limit ?? base.pagination.itemsPerPage
    const skip = params.skip ?? (base.pagination.page - 1) * base.pagination.itemsPerPage
    const requestParams = { ...params, skip, limit }

    try {
      const response = await getRecipes(requestParams)
      const data = response?.data ?? response

      const items = extractRecipesFromResponse(data)
      base.setItems(items)

      const total = extractTotalFromResponse(response, items.length)
      base.setTotalItems(total)

      return base.items
    } catch (err) {
      base.setError(err.message || 'Failed to fetch recipes')
      throw err
    }
  }

  function extractRecipesFromResponse(data) {
    if (Array.isArray(data)) return data
    return data?.recipes ?? data?.data ?? []
  }

  function extractTotalFromResponse(response, defaultTotal) {
    return response?.total ?? response?.pagination?.total ?? defaultTotal
  }

  async function fetchRecipe(recipeId) {
    if (!recipeId) return

    base.setLoading(true)
    base.clearError()

    try {
      const res = await getRecipe(recipeId)
      const recipeData = res?.data ?? res
      base.setItem(recipeData)
      return recipeData
    } catch (err) {
      base.setError(err.message || 'Failed to get recipe')
      throw err
    } finally {
      base.setLoading(false)
    }
  }

  async function updateRecipe(recipeId, updatedData) {
    if (!recipeId) return

    base.setLoading(true)
    base.clearError()

    try {
      const editedData = await editRecipe(recipeId, updatedData)
      base.updateItemInList(recipeId, editedData?.data ?? editedData)
      base.closeDialog('edit')
      return true
    } catch (err) {
      base.setError(err.message || 'Failed to update recipe')
      throw err
    } finally {
      base.setLoading(false)
    }
  }

  async function removeRecipe(recipeId) {
    if (!recipeId) return

    base.setLoading(true)
    base.clearError()

    try {
      await deleteRecipe(recipeId)
      base.removeItemFromList(recipeId)
      base.closeDialog('delete')
      return true
    } catch (err) {
      base.setError(err.message || 'Failed to delete recipe')
      throw err
    } finally {
      base.setLoading(false)
    }
  }

  async function recipeExistsByName(recipeName) {
    const name = typeof recipeName === 'string' ? recipeName.trim() : ''
    if (!name) return false
    try {
      const { exists } = await checkRecipeNameService(name)
      return exists
    } catch {
      return false
    }
  }

  async function checkRecipeName(recipeName) {
    const name = typeof recipeName === 'string' ? recipeName.trim() : ''
    if (!name) return { exists: false, similar: [] }
    try {
      return await checkRecipeNameService(name)
    } catch {
      return { exists: false, similar: [] }
    }
  }

  return {
    crudKey: base.crudKey,
    items: base.items,
    item: base.item,
    editedItem: base.editedItem,
    loading: base.loading,
    error: base.error,
    visible: base.visible,
    pagination: base.pagination,
    search: base.search,
    itemsCount: base.itemsCount,
    hasItems: base.hasItems,
    isAnyDialogOpen: base.isAnyDialogOpen,
    setItems: base.setItems,
    setItem: base.setItem,
    setEditedItem: base.setEditedItem,
    updateEditedItemField: base.updateEditedItemField,
    resetItem: base.resetItem,
    resetEditedItem: base.resetEditedItem,
    setLoading: base.setLoading,
    setError: base.setError,
    clearError: base.clearError,
    setTotalItems: base.setTotalItems,
    openDialog: base.openDialog,
    closeDialog: base.closeDialog,
    closeAllDialogs: base.closeAllDialogs,
    addItemToList: base.addItemToList,
    updateItemInList: base.updateItemInList,
    removeItemFromList: base.removeItemFromList,
    recipes,
    recipesCount,
    hasRecipes,
    addRecipe,
    fetchAllRecipes,
    fetchRecipe,
    updateRecipe,
    removeRecipe,
    recipeExistsByName,
    checkRecipeName,
  }
})
