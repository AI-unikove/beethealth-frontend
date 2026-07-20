import { dateKeyLocal, findDayPlanForViewDate } from '@/utils/foodLogDateNav'

/**
 * Case-insensitive meal slot match (e.g. "Lunch" vs "lunch").
 */
export function mealTypesMatch(a, b) {
  return (
    String(a || '')
      .trim()
      .toLowerCase() ===
    String(b || '')
      .trim()
      .toLowerCase()
  )
}

function normalizeDateKeyFromEntry(raw) {
  if (raw == null || raw === '') return ''
  const s = typeof raw === 'string' ? raw.trim() : String(raw)
  if (s.length >= 10) return s.slice(0, 10)
  const t = new Date(s)
  if (!Number.isNaN(t.getTime())) return dateKeyLocal(t)
  return s
}

/**
 * Finds the `dailyMealLogs[]` element for a calendar day (matches assigned-plan API).
 * @param {object} plan
 * @param {Date} viewDate
 * @returns {object|null}
 */
export function findDailyMealLogEntryForDate(plan, viewDate) {
  const key = dateKeyLocal(viewDate)
  const list = plan?.dailyMealLogs
  if (!Array.isArray(list)) return null
  return (
    list.find((entry) => {
      const raw =
        entry?.logDate ?? entry?.date ?? entry?.dateKey ?? entry?.logDateKey ?? entry?.dayDate
      const normalized = normalizeDateKeyFromEntry(raw)
      return normalized === key
    }) ?? null
  )
}

function findTemplateMealByType(plan, mealType) {
  for (const day of plan?.days || []) {
    const meals = Array.isArray(day?.meals) ? day.meals : []
    const hit = meals.find((m) => mealTypesMatch(m?.mealType, mealType))
    if (hit) return hit
  }
  return null
}

/**
 * Meals to render for a calendar day: prefers `dailyMealLogs` for that date (what the API
 * actually assigned/logged), merged with template `items` from `plan.days` by `mealType`.
 * Falls back to the weekday slice of the template when `dailyMealLogs` has no entry or empty meals.
 *
 * @param {object} plan — assigned plan payload
 * @param {Date} viewDate
 * @returns {Array} meal objects for `mapMealsForDate` / hero cards
 */
export function resolveMealsForCalendarDay(plan, viewDate) {
  const dayPlan = findDayPlanForViewDate(plan, viewDate)
  const templateMeals = Array.isArray(dayPlan?.meals) ? dayPlan.meals : []

  const dailyEntry = findDailyMealLogEntryForDate(plan, viewDate)
  const logged = dailyEntry && Array.isArray(dailyEntry.meals) ? dailyEntry.meals : null

  if (logged && logged.length > 0) {
    return logged.map((logMeal) => {
      const fromDayPlan = templateMeals.find((m) => mealTypesMatch(m?.mealType, logMeal?.mealType))
      const fromAny = fromDayPlan || findTemplateMealByType(plan, logMeal?.mealType)
      if (fromAny) {
        return {
          ...fromAny,
          ...logMeal,
          mealType: logMeal.mealType || fromAny.mealType,
        }
      }
      return logMeal
    })
  }

  return templateMeals
}
