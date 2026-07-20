import {
  formatShortTimeFromRaw,
  somethingElseCardTone,
  coalesceMealImageUrl,
  mealCardToneFromMealType,
} from '@/utils/foodLogMealHelpers'
import { dateKeyFromTimestamp } from '@/utils/foodLogDateNav'

function toFiniteNumber(v) {
  if (v == null || v === '') return null
  if (typeof v === 'number' && Number.isFinite(v)) return v
  const n = Number.parseFloat(String(v).replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

function titleWithoutDishNames(raw) {
  const mt = String(raw.mealType ?? '').trim()
  if (mt) {
    return mt.charAt(0).toUpperCase() + mt.slice(1).toLowerCase()
  }
  return 'Something else'
}

function pickLoggedAt(raw) {
  return raw.eatenAt ?? raw.loggedAt ?? raw.createdAt ?? raw.logTime ?? raw.timestamp ?? null
}

function pickCaloriesRaw(raw) {
  return (
    raw.calories ??
    raw.totalCalories ??
    raw.totalCalorie ??
    raw.estimatedCalories ??
    raw.mealCalories ??
    raw.kcal ??
    raw.energy
  )
}

function sumCaloriesFromDishes(dishes) {
  if (!Array.isArray(dishes)) return null
  let sum = 0
  let any = false
  for (const d of dishes) {
    const c = d?.calories ?? d?.calorie ?? d?.kcal ?? d?.energy ?? d?.totalCalories
    const n = toFiniteNumber(c)
    if (n != null) {
      sum += n
      any = true
    }
  }
  return any ? sum : null
}

function resolveSomethingElseCalories(raw) {
  const direct = toFiniteNumber(pickCaloriesRaw(raw))
  if (direct != null) return direct
  return sumCaloriesFromDishes(raw.dishes)
}

function normalizeMealTypeToken(s) {
  return String(s || '')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function substringMatch(p, l) {
  if (!(p.includes(l) || l.includes(p))) return false
  return Math.min(p.length, l.length) >= 5
}

function snackSlotMatch(p, l) {
  const has = (x, w) => x.includes(w)
  if (!has(p, 'snack') || !has(l, 'snack')) return false
  return (
    (has(p, 'evening') && has(l, 'evening')) ||
    (has(p, 'morning') && has(l, 'morning')) ||
    (has(p, 'afternoon') && has(l, 'afternoon'))
  )
}

function mainMealWordMatch(p, l) {
  const has = (x, w) => x.includes(w)
  for (const w of ['breakfast', 'lunch', 'dinner']) {
    if (has(p, w) && has(l, w)) return true
  }
  return false
}

/**
 * True when an "ate something else" log belongs in a given plan meal row (e.g. Evening Snack).
 */
export function mealTypeMatchesPlanSlot(planMealType, logMealType) {
  const p = normalizeMealTypeToken(planMealType)
  const l = normalizeMealTypeToken(logMealType)
  if (!p || !l) return false
  if (p === l) return true
  if (substringMatch(p, l)) return true
  if (snackSlotMatch(p, l)) return true
  return mainMealWordMatch(p, l)
}

export function normalizeAteSomethingElseEntry(raw, index) {
  if (!raw || typeof raw !== 'object') return null

  const calories = resolveSomethingElseCalories(raw)
  const imageUrl = coalesceMealImageUrl(raw)
  const id = String(raw._id ?? raw.id ?? `ate-something-else-${index}`)
  const dateKey = dateKeyFromTimestamp(pickLoggedAt(raw))

  const timePart = formatShortTimeFromRaw(pickLoggedAt(raw))
  const label = titleWithoutDishNames(raw)
  const displayTitle = timePart ? `${label} @ ${timePart}` : label
  const tone = raw.mealType
    ? mealCardToneFromMealType(String(raw.mealType))
    : somethingElseCardTone(index)

  const loggedAt = pickLoggedAt(raw)

  return {
    id,
    displayTitle,
    calories,
    quantityLabel: '',
    imageUrl,
    tone,
    dateKey,
    mealTypeLabel: String(raw.mealType ?? '').trim(),
    loggedAt,
  }
}

/**
 * @param {unknown} plan — assigned plan payload (root or `data`)
 */
export function normalizeAteSomethingElseMealLogs(plan) {
  const raw = plan?.ateSomethingElseMealLogs
  if (!Array.isArray(raw)) return []
  return raw.map((entry, i) => normalizeAteSomethingElseEntry(entry, i)).filter(Boolean)
}

export function formatAteSomethingElseCalories(calories) {
  if (calories == null || !Number.isFinite(calories)) return '—'
  return `${Math.round(calories)} Kcal`
}
