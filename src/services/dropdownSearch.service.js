import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

function mapDropdownOption(o) {
  return typeof o === 'string' ? o : (o?.value ?? o?.title ?? o?.label ?? '')
}

function parseDropdownResponseBody(body) {
  const data = body?.data ?? body
  if (!data || data.success === false) {
    return []
  }
  const options = data?.options ?? data?.results ?? []
  if (!Array.isArray(options)) {
    return []
  }
  return options.map(mapDropdownOption).filter(Boolean)
}

export async function searchDropdownOptions({ category, query, limit = 50 }) {
  const q = (query || '').trim()
  if (!q) {
    return []
  }
  try {
    const response = await axios.post(`${API_URL}/dropdown-search`, {
      category,
      query: q,
      limit: limit || 50,
    })
    return parseDropdownResponseBody(response?.data ?? response)
  } catch {
    return []
  }
}
