import api from './api.service'

export const getEnums = async () => {
  const response = await api.get('/enums')
  return response.data
}

export const addEnumOptions = async (category, valueOrOptions) => {
  const options = Array.isArray(valueOrOptions)
    ? valueOrOptions.filter((o) => typeof o === 'string' && o.trim())
    : valueOrOptions != null && String(valueOrOptions).trim()
      ? [String(valueOrOptions).trim()]
      : []
  if (!category || typeof category !== 'string' || !category.trim() || options.length === 0) {
    return { success: false }
  }
  const response = await api.post('/enums', {
    category: category.trim(),
    options: options,
  })
  return response.data
}
