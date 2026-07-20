import { unref, shallowRef, ref } from 'vue'
import { phoneticMatch, normalizeForPhonetic } from '@/utils/phonetic'
import { searchDropdownOptions } from '@/services/dropdownSearch.service'

const DEBOUNCE_MS = 500
const MIN_QUERY_LENGTH_FOR_API = 2

export function useDropdownSearch(options = {}) {
  const categoryRef = options.category
  const semanticMatchSet = shallowRef(new Set())
  const currentSearchTerm = ref('')
  let debounceTimer = null
  let lastRequestedQuery = ''

  function triggerSemanticSearch(queryText) {
    const q = (queryText || '').trim()
    currentSearchTerm.value = q
    const category = typeof categoryRef === 'function' ? categoryRef() : unref(categoryRef)
    if (!category) return
    if (q.length < MIN_QUERY_LENGTH_FOR_API) {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }
      lastRequestedQuery = ''
      semanticMatchSet.value = new Set()
      return
    }
    if (q === lastRequestedQuery) return
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      debounceTimer = null
      lastRequestedQuery = q
      const queryAtRequest = q
      try {
        const optionsList = await searchDropdownOptions({
          category,
          query: queryAtRequest,
          limit: 50,
        })
        if (currentSearchTerm.value === queryAtRequest) {
          semanticMatchSet.value = new Set(optionsList.map((v) => normalizeForPhonetic(String(v))))
        }
      } catch {
        if (currentSearchTerm.value === queryAtRequest) {
          semanticMatchSet.value = new Set()
        }
      }
    }, DEBOUNCE_MS)
  }

  function filter(filterableValue, searchTerm, item) {
    const q = (searchTerm || '').trim()
    if (!q) {
      return 0
    }
    triggerSemanticSearch(searchTerm)
    const text = (filterableValue ?? item?.title ?? item?.value ?? '').toString().trim()
    const textLower = text.toLowerCase()
    const qLower = q.toLowerCase()
    const textNorm = normalizeForPhonetic(text)
    const idx = textLower.indexOf(qLower)
    if (idx !== -1) {
      return idx
    }
    if (phoneticMatch(q, text)) {
      return 0
    }
    if (textNorm && semanticMatchSet.value.has(textNorm)) {
      return 0
    }
    return -1
  }

  return { filter }
}
