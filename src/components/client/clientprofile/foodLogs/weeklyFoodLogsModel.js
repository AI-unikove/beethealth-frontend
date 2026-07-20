/**
 * Maps assigned-plan API payloads (`days` → `meals` → `items`) into weekly table rows.
 * API shape: mealType "Breakfast" | "Morning Snack" | "Lunch" | "Evening Snack" | "Dinner", items: { name, quantity, measurement }
 */

const WEEKDAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

/** Column order when those meal types exist in the plan */
export const CANONICAL_MEAL_ORDER = [
  'Breakfast',
  'Morning Snack',
  'Lunch',
  'Evening Snack',
  'Dinner',
]

function normalizeDayToken(dayStr) {
  return String(dayStr || '')
    .trim()
    .toLowerCase()
    .replace(/\./g, '')
}

function dayOrderIndex(dayStr) {
  const n = normalizeDayToken(dayStr)
  if (!n) return 99
  const idx = WEEKDAY_ORDER.findIndex((d) => n === d || n.startsWith(d.slice(0, 3)))
  return idx === -1 ? 99 : idx
}

export function sortPlanDaysByWeek(days) {
  if (!Array.isArray(days)) return []
  return [...days].sort((a, b) => dayOrderIndex(a?.day) - dayOrderIndex(b?.day))
}

export function toShortDayLabel(dayStr) {
  const raw = String(dayStr || '').trim()
  if (!raw) return '—'
  const n = normalizeDayToken(raw)
  const match = WEEKDAY_ORDER.find((d) => n === d || n.startsWith(d.slice(0, 3)))
  if (match) return match.slice(0, 3).replace(/^./, (c) => c.toUpperCase())
  return raw.length <= 4 ? raw : raw.slice(0, 3)
}

function mealTypesMatch(a, b) {
  return (
    String(a || '')
      .trim()
      .toLowerCase() ===
    String(b || '')
      .trim()
      .toLowerCase()
  )
}

/**
 * Ordered meal column keys: canonical order first, then any extra `mealType` strings from the API.
 */
export function resolveMealSlots(plan) {
  const labels = new Set()
  for (const day of plan?.days || []) {
    for (const meal of day?.meals || []) {
      const t = String(meal?.mealType || '').trim()
      if (t) labels.add(t)
    }
  }

  if (labels.size === 0) {
    return []
  }

  const ordered = []
  for (const canonical of CANONICAL_MEAL_ORDER) {
    const found = [...labels].find((l) => mealTypesMatch(l, canonical))
    if (found) ordered.push(canonical)
  }
  for (const l of labels) {
    if (!CANONICAL_MEAL_ORDER.some((c) => mealTypesMatch(l, c))) {
      ordered.push(l)
    }
  }
  return ordered
}

function findMealForSlot(meals, slotLabel) {
  const list = Array.isArray(meals) ? meals : []
  return list.find((m) => mealTypesMatch(m?.mealType, slotLabel)) ?? null
}

function getItemDisplayName(rawItem) {
  if (!rawItem) return ''
  const n =
    rawItem.name ??
    rawItem.itemName ??
    rawItem.label ??
    rawItem.title ??
    rawItem?.recipe?.recipeName ??
    rawItem?.recipe?.name ??
    ''
  return String(n).trim()
}

/** Quant. column: `quantity` + `measurement` per API (e.g. "1 Nos") */
function formatQuantityLine(rawItem) {
  if (!rawItem) return ''
  const q = rawItem.quantity
  const m = String(rawItem.measurement || '').trim()
  if (q != null && String(q).trim() !== '') {
    return m ? `${String(q).trim()} ${m}`.trim() : String(q).trim()
  }
  if (m) return m
  const num = rawItem.assignedQuantity
  if (num != null && Number.isFinite(Number(num))) {
    return [String(num), m].filter(Boolean).join(' ').trim()
  }
  return '—'
}

/**
 * Portion text we expect in the Quant. column (some APIs mistakenly put this in `name`).
 */
function looksLikeQuantityLabelText(s) {
  const t = String(s || '').trim()
  if (!t || t === '—') return false
  if (/^\d+(\.\d+)?\s+[A-Za-z]{1,16}$/.test(t)) return true
  if (/^\d+\/\d+(\s+\w{1,12})?$/.test(t)) return true
  if (/^\d+(\.\d+)?\s*(g|ml|oz|lb|kg|Nos|nos|pc|pcs|cup)$/i.test(t)) return true
  if (/^\d+(\.\d+)?$/.test(t) && t.length <= 12) return true
  return false
}

/**
 * Free text that belongs in Dish, but appeared in the quantity field (swapped payload).
 */
function looksLikeDishTextInQuantityField(qtyLine) {
  const t = String(qtyLine || '').trim()
  if (!t || t === '—') return false
  if (looksLikeQuantityLabelText(t)) return false
  return /[a-zA-Z]/.test(t)
}

/**
 * Numeric id / amount stored in `name` while the real dish label sits in `quantity`.
 */
function looksLikeNumericPlacedInNameField(name) {
  const t = String(name || '').trim()
  return /^\d{4,}$/.test(t)
}

function looksLikeShortWordInQuantityField(qtyLine) {
  const t = String(qtyLine || '').trim()
  return /^[a-zA-Z][a-zA-Z\s'-]{1,40}$/.test(t) && !looksLikeQuantityLabelText(t)
}

/**
 * When `name` holds the portion and `quantity` holds the dish name (or similar), swap for display.
 */
function shouldSwapMisplacedQtyAndName(name, qtyLine) {
  if (looksLikeQuantityLabelText(name) && looksLikeDishTextInQuantityField(qtyLine)) {
    return true
  }
  if (looksLikeNumericPlacedInNameField(name) && looksLikeShortWordInQuantityField(qtyLine)) {
    return true
  }
  return false
}

function pairQtyDishFromRaw(raw) {
  let name = getItemDisplayName(raw)?.trim()
  let qtyLine = formatQuantityLine(raw)
  if (shouldSwapMisplacedQtyAndName(name, qtyLine)) {
    const tmp = name
    name = qtyLine
    qtyLine = tmp
  }
  return { qty: qtyLine || '—', dish: name || '—' }
}

function collectLinesForMeal(meal) {
  if (!meal) return []
  const lines = []
  const pushRaw = (raw) => {
    const { qty, dish } = pairQtyDishFromRaw(raw)
    if (dish !== '—' || (qty && qty !== '—')) {
      lines.push({ qty: qty || '—', dish: dish || '—' })
    }
  }

  const direct = Array.isArray(meal.items) ? meal.items : []
  if (direct.length) {
    direct.forEach(pushRaw)
  } else if (meal.options?.[0]?.items?.length) {
    meal.options[0].items.forEach(pushRaw)
  } else if (meal.recipe) {
    pushRaw({
      recipe: meal.recipe,
      quantity: meal.quantity,
      measurement: meal.measurement,
    })
  }

  return lines
}

/**
 * One meal column = parallel stacks of quantity + dish lines (multiple items stack vertically).
 * @param {Array<{ qty: string, dish: string }>} lines
 * @returns {{ lines: Array<{ qty: string, dish: string }> }}
 */
function formatSlotCells(lines) {
  if (!lines.length) {
    return { lines: [{ qty: '—', dish: '—' }] }
  }
  return { lines }
}

function formatMealSlot(meal) {
  return formatSlotCells(collectLinesForMeal(meal))
}

/**
 * @returns {{ mealSlots: string[], rows: Array<{ id: string, dayLabel: string, cells: Array<{ lines: Array<{ qty: string, dish: string }> }> }> }}
 */
export function buildWeeklyFoodLogRows(plan) {
  const days = sortPlanDaysByWeek(plan?.days)
  if (!days.length) {
    return { mealSlots: [], rows: [] }
  }

  const mealSlots = resolveMealSlots(plan)
  const slots = mealSlots.length ? mealSlots : ['Breakfast', 'Lunch', 'Dinner']

  const rows = days.map((dayPlan, index) => ({
    id: `week-day-${index}-${normalizeDayToken(dayPlan?.day) || index}`,
    dayLabel: toShortDayLabel(dayPlan?.day),
    cells: slots.map((slot) => formatMealSlot(findMealForSlot(dayPlan?.meals, slot))),
  }))

  return { mealSlots: slots, rows }
}
