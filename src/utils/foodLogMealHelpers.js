export function mealCardToneFromMealType(mealType) {
  const t = String(mealType || '')
    .trim()
    .toLowerCase()
  if (t.includes('breakfast')) return 'breakfast'
  if (t.includes('morning') && t.includes('snack')) return 'snack'
  if (t.includes('lunch')) return 'lunch'
  if (t.includes('evening') && t.includes('snack')) return 'snack'
  if (t.includes('dinner')) return 'dinner'
  if (t.includes('snack')) return 'snack'
  return 'other'
}

export function formatShortTimeFromRaw(raw) {
  if (raw == null || raw === '') return ''
  const d = raw instanceof Date ? raw : new Date(raw)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

/**
 * Turn relative API paths (/uploads/...) into absolute URLs so <img src> loads correctly.
 */
export function resolveAbsoluteImageUrl(url) {
  if (url == null || typeof url !== 'string') return ''
  const t = url.trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t) || t.startsWith('blob:') || t.startsWith('data:')) return t
  if (t.startsWith('//')) return `https:${t}`
  if (t.startsWith('/') && API_BASE) {
    return `${API_BASE}${t}`
  }
  return t
}

function firstUrlFromStringArray(arr) {
  if (!Array.isArray(arr)) return ''
  for (const x of arr) {
    if (typeof x === 'string' && x.trim()) return x.trim()
  }
  return ''
}

function stringImageCandidates(obj) {
  if (!obj || typeof obj !== 'object') return []
  const r = obj.recipe
  return [
    obj.imageUrl,
    obj.mealImage,
    obj.photoUrl,
    obj.thumbnailUrl,
    obj.picture,
    obj.heroImage,
    typeof obj.image === 'string' ? obj.image : null,
    r?.imageUrl,
    r?.mealImage,
    r?.photoUrl,
    r?.thumbnailUrl,
    typeof r?.image === 'string' ? r.image : null,
  ]
}

function resolveNestedImageUrlObjects(obj) {
  const rImg = obj?.recipe?.image
  if (rImg && typeof rImg === 'object' && typeof rImg.url === 'string' && rImg.url.trim()) {
    return resolveAbsoluteImageUrl(rImg.url.trim())
  }
  const oImg = obj?.image
  if (oImg && typeof oImg === 'object' && typeof oImg.url === 'string' && oImg.url.trim()) {
    return resolveAbsoluteImageUrl(oImg.url.trim())
  }
  return ''
}

/**
 * Picks first usable image URL from a meal item, tracked item, recipe, or meal object.
 */
export function coalesceMealImageUrl(obj) {
  if (!obj || typeof obj !== 'object') return ''
  const fromArrays =
    firstUrlFromStringArray(obj.mealPhotoUrls) ||
    firstUrlFromStringArray(obj.photoUrls) ||
    firstUrlFromStringArray(obj.images)
  if (fromArrays) {
    return resolveAbsoluteImageUrl(fromArrays)
  }
  for (const c of stringImageCandidates(obj)) {
    if (typeof c === 'string' && c.trim()) {
      return resolveAbsoluteImageUrl(c.trim())
    }
  }
  return resolveNestedImageUrlObjects(obj)
}

export function firstImageFromTrackedItems(items) {
  if (!Array.isArray(items)) return ''
  for (const it of items) {
    const u = coalesceMealImageUrl(it)
    if (u) return u
  }
  return ''
}

/** Meal-level image (e.g. logged photo) before falling back to planned items. */
export function firstImageFromMeal(meal) {
  return coalesceMealImageUrl(meal)
}

function calorieNumberFromUnknown(c) {
  if (c == null || c === '') return null
  if (typeof c === 'number' && Number.isFinite(c)) return c
  const n = Number.parseFloat(String(c).replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

// eslint-disable-next-line complexity -- aggregates calories across tracked item variants
export function sumCaloriesFromTrackedItems(items) {
  if (!Array.isArray(items)) return null
  let sum = 0
  let any = false
  for (const it of items) {
    const c =
      it?.calories ??
      it?.kcal ??
      it?.totalCalories ??
      it?.recipe?.calories ??
      it?.recipe?.caloriesPerServing ??
      it?.recipe?.totalCalories ??
      it?.recipe?.kcal
    const n = calorieNumberFromUnknown(c)
    if (n != null) {
      sum += n
      any = true
    }
  }
  return any ? sum : null
}

/**
 * Uses per-item totals when present; otherwise meal-level totals from the plan API.
 */
export function resolveMealTotalCalories(meal, trackedItems) {
  const fromItems = sumCaloriesFromTrackedItems(trackedItems)
  if (fromItems != null) return fromItems
  if (!meal || typeof meal !== 'object') return null
  const mealLevel =
    calorieNumberFromUnknown(meal.totalCalories) ??
    calorieNumberFromUnknown(meal.totalCalorie) ??
    calorieNumberFromUnknown(meal.estimatedCalories) ??
    calorieNumberFromUnknown(meal.calories) ??
    calorieNumberFromUnknown(meal.mealCalories) ??
    calorieNumberFromUnknown(meal.kcal)
  return mealLevel
}

export function formatMealCaloriesLabel(n) {
  if (n == null || !Number.isFinite(n)) return '—'
  return `${Math.round(n)} Kcal`
}

/**
 * Display label for a plan item — prefers API `name`, then tracked `itemName`, then recipe titles.
 */
export function getFoodLogItemDisplayName(obj) {
  if (!obj || typeof obj !== 'object') return 'Item'
  const n =
    obj.name ??
    obj.itemName ??
    obj.label ??
    obj.title ??
    obj?.recipe?.recipeName ??
    obj?.recipe?.name ??
    ''
  const s = String(n).trim()
  return s || 'Item'
}

export function collectTrackedItemsFromLog(log) {
  const direct = Array.isArray(log?.items) ? log.items : []
  const fromOptions = Array.isArray(log?.options)
    ? log.options.flatMap((o) => (Array.isArray(o?.items) ? o.items : []))
    : []
  return [...direct, ...fromOptions]
}

const SOMETHING_ELSE_TONES = ['breakfast', 'snack', 'lunch', 'dinner']

export function somethingElseCardTone(index) {
  return SOMETHING_ELSE_TONES[Math.abs(index) % SOMETHING_ELSE_TONES.length] || 'other'
}
