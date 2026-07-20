/**
 * Normalize labels like "Evening_snack" for comparison / ordering.
 */
export function normalizeMealTypeLabel(s) {
  return String(s || '')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase()
}

export function parseLoggedAtMs(raw) {
  if (raw == null || raw === '') return 0
  const d = raw instanceof Date ? raw : new Date(raw)
  const t = d.getTime()
  return Number.isNaN(t) ? 0 : t
}

/**
 * Sort key for typical day order: breakfast → snacks → lunch → evening snack → dinner.
 * Lower values appear first.
 */
export function mealSlotSortOrder(mealTypeRaw) {
  const t = normalizeMealTypeLabel(mealTypeRaw)
  if (t.includes('breakfast')) return 10
  if (t.includes('morning') && t.includes('snack')) return 20
  if (t.includes('lunch')) return 30
  if (t.includes('afternoon') && t.includes('snack')) return 35
  if (t.includes('evening') && t.includes('snack')) return 40
  if (t.includes('dinner') || t.includes('supper')) return 50
  if (t.includes('snack')) return 45
  return 60
}
