import { reactive, computed, ref, watch } from 'vue'
import { useRecipesStore } from '@/stores/recipes.store'
import { uploadFile } from '@/services/gcp.service'
import { extractRecipeContent } from '@/services/recipes.service'
import { filterAndRankSimilarNames } from '@/utils/phonetic'

const DOCUMENT_FORMATS = Object.freeze({
  WRITEUP: 'writeup',
  LINK: 'link',
  DOCUMENT: 'document',
})

export function useRecipeForm(options = {}) {
  const recipesStore = useRecipesStore()

  const form = reactive({
    recipeName: (options.initialRecipeName && String(options.initialRecipeName).trim()) || '',
    recipeCuisine: null,
    recipeTags: [],
    recipeDocumentFormat: DOCUMENT_FORMATS.WRITEUP,
    recipeDocument: '',
    /** For writeup mode: structured ingredients then combined into document on save */
    ingredients: [],
    /** For writeup mode: instructions text (or full recipe text) */
    recipeInstructions: '',
    calories: '',
    protein: '',
    carbohydrates: '',
    fats: '',
    fiber: '',
  })

  const selectedFile = ref(null)
  const uploading = ref(false)
  const uploadError = ref(null)
  const duplicateError = ref(null)
  const similarRecipeNames = ref([])
  const extractLoading = ref(false)
  const extractError = ref(null)

  const MIN_CONTENT_LENGTH_FOR_EXTRACT = 30

  function mapExtractedIngredient(i) {
    return {
      name: String(i?.name ?? '').trim(),
      quantity: String(i?.quantity ?? '').trim(),
    }
  }

  function normalizeRecipeTag(t) {
    return typeof t === 'object' && t !== null ? (t.name ?? t.value ?? t) : String(t ?? '').trim()
  }

  function applyExtractMacros(macros) {
    if (!Object.keys(macros).length) {
      return
    }
    form.calories = macros.calories ?? form.calories ?? ''
    form.protein = macros.protein ?? form.protein ?? ''
    form.carbohydrates = macros.carbohydrates ?? form.carbohydrates ?? ''
    form.fats = macros.fats ?? form.fats ?? ''
    form.fiber = macros.fiber ?? form.fiber ?? ''
  }

  function applyExtractCuisine(recipeCuisine) {
    if (recipeCuisine == null || String(recipeCuisine).trim() === '') {
      return
    }
    form.recipeCuisine =
      typeof recipeCuisine === 'object' ? recipeCuisine : String(recipeCuisine).trim()
  }

  function applyExtractTags(tags) {
    if (!Array.isArray(tags) || !tags.length) {
      return
    }
    form.recipeTags = tags.map(normalizeRecipeTag).filter(Boolean)
  }

  function applyExtractResult(result) {
    if (result.ingredients?.length) {
      form.ingredients = result.ingredients.map(mapExtractedIngredient)
    }
    applyExtractMacros(result.macros ?? {})
    applyExtractCuisine(result.recipeCuisine)
    applyExtractTags(result.recipeTags)
  }

  function getExtractPayload() {
    const isWriteup = form.recipeDocumentFormat === DOCUMENT_FORMATS.WRITEUP
    const isLink = form.recipeDocumentFormat === DOCUMENT_FORMATS.LINK
    const content = isWriteup
      ? (form.recipeInstructions || '').trim()
      : (form.recipeDocument || '').trim()
    const hasContent = isWriteup
      ? content.length >= MIN_CONTENT_LENGTH_FOR_EXTRACT
      : content.length > 0
    const missingMessage = isWriteup
      ? 'Add recipe instructions (at least 30 characters) to fill with AI.'
      : 'Paste a link or upload a document to fill with AI.'
    const type = isWriteup ? 'text' : isLink ? 'url' : 'document'
    return { content, hasContent, missingMessage, type }
  }

  async function fillWithBeetAi() {
    const { content, hasContent, missingMessage, type } = getExtractPayload()
    extractError.value = null
    if (!hasContent) {
      extractError.value = missingMessage
      return
    }
    extractLoading.value = true
    extractError.value = null
    try {
      const result = await extractRecipeContent({ type, content })
      applyExtractResult(result)
    } catch (err) {
      const data = err.response?.data
      extractError.value =
        data?.error || data?.message || err.message || 'Could not extract recipe. Try again.'
    } finally {
      extractLoading.value = false
    }
  }

  const NAME_CHECK_DEBOUNCE_MS = 300
  const MIN_NAME_LENGTH_FOR_SUGGESTIONS = 2
  let duplicateCheckTimer = null
  watch(
    () => form.recipeName,
    (name) => {
      duplicateError.value = null
      similarRecipeNames.value = []
      if (duplicateCheckTimer) clearTimeout(duplicateCheckTimer)
      const trimmed = (name || '').trim()
      if (!trimmed || trimmed.length < MIN_NAME_LENGTH_FOR_SUGGESTIONS) return
      duplicateCheckTimer = setTimeout(async () => {
        duplicateCheckTimer = null
        try {
          const { exists, similar } = await recipesStore.checkRecipeName(trimmed)
          const raw = Array.isArray(similar) ? similar : []
          const rawSimilar = raw.filter((s) => {
            const str =
              typeof s === 'string'
                ? s.trim()
                : String(s?.name ?? s?.title ?? s?.recipeName ?? s ?? '').trim()
            return str && !str.includes(',')
          })
          similarRecipeNames.value = filterAndRankSimilarNames(trimmed, rawSimilar, { limit: 10 })
          if (exists) duplicateError.value = 'This recipe already exists.'
        } catch {
          /* name check failed, ignore */
        }
      }, NAME_CHECK_DEBOUNCE_MS)
    },
  )

  function hasAtLeastOneNamedIngredient() {
    const list = form.ingredients || []
    return list.some((ing) => String(ing?.name ?? '').trim().length > 0)
  }

  const isFormValid = computed(() => {
    const nameValid = !!form.recipeName?.trim()
    const cuisineValid = !!form.recipeCuisine
    const ingredientsValid = hasAtLeastOneNamedIngredient()
    if (uploading.value) return false
    return nameValid && cuisineValid && ingredientsValid
  })

  /** When Write text: effective document is ingredients list + instructions */
  const effectiveRecipeDocument = computed(() => {
    if (form.recipeDocumentFormat !== DOCUMENT_FORMATS.WRITEUP) return form.recipeDocument
    const parts = []
    if (form.ingredients?.length) {
      parts.push(
        `Ingredients:\n${form.ingredients
          .filter((i) => i?.name?.trim())
          .map(
            (i) =>
              `- ${(i.name || '').trim()}${(i.quantity || '').trim() ? ` (${(i.quantity || '').trim()})` : ''}`,
          )
          .join('\n')}`,
      )
    }
    if (form.recipeInstructions?.trim()) {
      parts.push(`Recipe:\n${form.recipeInstructions.trim()}`)
    }
    return parts.join('\n\n') || form.recipeDocument || ''
  })

  function switchDocumentFormat(newFormat) {
    if (form.recipeDocumentFormat !== newFormat) {
      form.recipeDocument = ''
      form.recipeInstructions = ''
      form.ingredients = []
      selectedFile.value = null
    }
    form.recipeDocumentFormat = newFormat
    uploadError.value = null
  }

  function addIngredient() {
    form.ingredients = [...(form.ingredients || []), { name: '', quantity: '' }]
  }

  function removeIngredient(index) {
    const list = [...(form.ingredients || [])]
    list.splice(index, 1)
    form.ingredients = list
  }

  async function onDocumentFileSelected(files) {
    const file = Array.isArray(files) ? files[0] : files
    if (!file) {
      selectedFile.value = null
      form.recipeDocument = ''
      uploadError.value = null
      return
    }
    selectedFile.value = file
    const isPdf = file.type === 'application/pdf'
    const isImage = typeof file.type === 'string' && file.type.startsWith('image/')
    if (!isPdf && !isImage) {
      uploadError.value = 'Only PDF or image files are allowed'
      selectedFile.value = null
      form.recipeDocument = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      uploadError.value = 'File size must be less than 10MB'
      selectedFile.value = null
      form.recipeDocument = ''
      return
    }
    try {
      uploading.value = true
      uploadError.value = null
      const publicUrl = await uploadFile(file)
      form.recipeDocument = publicUrl
    } catch (error) {
      uploadError.value =
        error.response?.data?.message || error.message || 'Upload failed. Please try again.'
      selectedFile.value = null
      form.recipeDocument = ''
    } finally {
      uploading.value = false
    }
  }

  function buildPayload(isDraft = false) {
    const document =
      form.recipeDocumentFormat === DOCUMENT_FORMATS.WRITEUP
        ? (form.recipeInstructions?.trim() ?? '')
        : form.recipeDocument
    const ingredients = (form.ingredients || []).map((ing) => ({
      name: String(ing?.name ?? '').trim(),
      quantity: String(ing?.quantity ?? '').trim(),
    }))
    const payload = {
      recipeName: form.recipeName.trim(),
      recipeCuisine: form.recipeCuisine,
      recipeTags: form.recipeTags || [],
      recipeDocumentFormat: form.recipeDocumentFormat,
      recipeDocument: document,
      ingredients,
      macros: {
        calories: form.calories || '',
        protein: form.protein || '',
        carbohydrates: form.carbohydrates || '',
        fats: form.fats || '',
        fiber: form.fiber || '',
      },
    }
    if (isDraft) payload.isDraft = true
    return payload
  }

  function resetForm(initialName = '') {
    form.recipeName = initialName
    form.recipeCuisine = null
    form.recipeTags = []
    form.recipeDocument = ''
    form.recipeDocumentFormat = DOCUMENT_FORMATS.WRITEUP
    form.ingredients = []
    form.recipeInstructions = ''
    form.calories = ''
    form.protein = ''
    form.carbohydrates = ''
    form.fats = ''
    form.fiber = ''
    selectedFile.value = null
    uploadError.value = null
    duplicateError.value = null
    similarRecipeNames.value = []
    extractError.value = null
  }

  return {
    form,
    selectedFile,
    uploading,
    uploadError,
    duplicateError,
    similarRecipeNames,
    extractLoading,
    extractError,
    isFormValid,
    effectiveRecipeDocument,
    DOCUMENT_FORMATS,
    recipesStore,
    switchDocumentFormat,
    addIngredient,
    removeIngredient,
    onDocumentFileSelected,
    fillWithBeetAi,
    buildPayload,
    resetForm,
  }
}
