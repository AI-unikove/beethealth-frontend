function n(v) {
  if (v == null || v === '') return null
  const x = typeof v === 'number' ? v : Number.parseFloat(String(v).replace(/,/g, ''))
  return Number.isFinite(x) ? x : null
}

function pickConsumed(obj) {
  return {
    calories: n(obj.calories ?? obj.kcal ?? obj.totalCalories) ?? 0,
    carbs: n(obj.carbs ?? obj.carbohydrates) ?? 0,
    protein: n(obj.protein) ?? 0,
    fat: n(obj.fat ?? obj.fats) ?? 0,
    fiber: n(obj.fiber) ?? 0,
  }
}

function pickTargets(obj) {
  return {
    calories: n(obj.calories ?? obj.dailyCalories) ?? null,
    carbs: n(obj.carbs ?? obj.carbohydrates) ?? null,
    protein: n(obj.protein) ?? null,
    fat: n(obj.fat ?? obj.fats) ?? null,
    fiber: n(obj.fiber) ?? null,
  }
}

/**
 * Normalizes GET /clients/:id/nutrition-progress (or embedded) payloads.
 */
function pickLabels(data) {
  return {
    calorieStatusLabel: data.calorieStatusLabel ?? data.calorieStatus ?? data.statusLabel ?? '',
    calorieDescription: data.calorieDescription ?? data.statusDescription ?? '',
    macroStatusLabel: data.macroStatusLabel ?? data.macroStatus ?? '',
  }
}

export function normalizeNutritionProgressPayload(raw) {
  const data = raw?.data !== undefined ? raw.data : raw
  if (!data || typeof data !== 'object') return null

  const consumedRaw = data.consumed ?? data.totals ?? data.actual ?? {}
  const targetsRaw = data.targets ?? data.goals ?? data.target ?? {}

  return {
    consumed: pickConsumed(consumedRaw),
    targets: pickTargets(targetsRaw),
    ...pickLabels(data),
  }
}

/**
 * When the API is missing or all-zero, use meal-log estimates for the Day scope only.
 */
export function resolveConsumedWithDayFallback(apiPayload, fromMeals, progressTimeScope) {
  const consumed = apiPayload?.consumed
    ? { ...apiPayload.consumed }
    : { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 }

  const apiNumericEmpty =
    !apiPayload ||
    (Number(consumed.calories) === 0 &&
      Number(consumed.carbs) === 0 &&
      Number(consumed.protein) === 0 &&
      Number(consumed.fat) === 0 &&
      Number(consumed.fiber) === 0)

  if (progressTimeScope === 'day' && fromMeals?.hasData && apiNumericEmpty) {
    return {
      calories: fromMeals.calories,
      carbs: fromMeals.carbs,
      protein: fromMeals.protein,
      fat: fromMeals.fat,
      fiber: fromMeals.fiber,
    }
  }
  return consumed
}
