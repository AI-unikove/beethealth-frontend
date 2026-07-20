import api from './api.service'

export const createRecipe = async (recipeData) => {
  const response = await api.post('/recipes', recipeData)
  return response.data
}

export const getRecipes = async (params = {}) => {
  const response = await api.get('/recipes', { params })
  return response.data
}

export const deleteRecipe = async (recipeId) => {
  const response = await api.delete(`/recipes/${recipeId}`)
  return response.data
}

export const editRecipe = async (recipeId, recipeData) => {
  const response = await api.put(`/recipes/${recipeId}`, recipeData)
  return response.data
}

export const getRecipe = async (recipeId) => {
  const response = await api.get(`/recipes/${recipeId}`)
  return response.data
}

function throwIfExtractFailed(body) {
  if (!body || body.success !== false) {
    return
  }
  const message = body.error || body.message || 'Invalid document.'
  throw Object.assign(new Error(message), { response: { data: body } })
}

function buildExtractResult(data) {
  return {
    ingredients: data?.ingredients ?? [],
    macros: data?.macros ?? {},
    recipeCuisine: data?.recipeCuisine ?? null,
    recipeTags: Array.isArray(data?.recipeTags) ? data.recipeTags : [],
  }
}

export const extractRecipeContent = async (payload) => {
  const response = await api.post('/recipes/extract', payload)
  const body = response?.data ?? response
  throwIfExtractFailed(body)
  const data = body?.data ?? body
  return buildExtractResult(data)
}

function toSimilarRecipeEntry(item) {
  if (item == null) {
    return null
  }
  if (typeof item === 'string') {
    const name = item.trim()
    return name ? { id: null, name } : null
  }
  if (item && typeof item === 'object') {
    const v = item.name ?? item.title ?? item.recipeName ?? item.value
    if (v == null || !String(v).trim()) {
      return null
    }
    const name = String(v).trim()
    const rawId = item._id ?? item.id ?? item.recipeId
    const id = rawId != null && rawId !== '' ? String(rawId) : null
    return { id, name }
  }
  return null
}

function parseSimilarRecipes(data) {
  const raw = data?.similar ?? data?.similarNames ?? data?.matches ?? []
  return (Array.isArray(raw) ? raw : []).map(toSimilarRecipeEntry).filter(Boolean)
}

export const checkRecipeName = async (name) => {
  const trimmed = typeof name === 'string' ? name.trim() : ''
  if (!trimmed) {
    return { exists: false, similar: [] }
  }
  try {
    const response = await api.post('/recipes/check-name', { name: trimmed })
    const body = response?.data ?? response
    const data = body?.data ?? body
    return {
      exists: !!data?.exists,
      similar: parseSimilarRecipes(data),
    }
  } catch {
    return { exists: false, similar: [] }
  }
}
