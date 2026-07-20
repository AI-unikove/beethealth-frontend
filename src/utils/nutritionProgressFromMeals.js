import { collectTrackedItemsFromLog, sumCaloriesFromTrackedItems } from '@/utils/foodLogMealHelpers'

function num(v) {
  if (v == null || v === '') return 0
  const n = Number.parseFloat(String(v).replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

function consumedFraction(item) {
  const t = Number(item?.takenQuantity || 0)
  const a = Math.max(1, Number(item?.assignedQuantity || 1))
  return Math.min(1, t / a)
}

function macroGramsFromRecipe(recipe, key) {
  const m = recipe?.macros || {}
  if (key === 'carbs') return num(m.carbohydrates ?? m.carbs)
  if (key === 'protein') return num(m.protein)
  if (key === 'fat') return num(m.fats ?? m.fat)
  if (key === 'fiber') return num(m.fiber)
  return 0
}

/**
 * Estimates consumed calories and macros from plan meal rows (items with takenQuantity + recipe.macros).
 */
export function computeNutritionFromPlanMealLogs(meals) {
  let calories = 0
  let carbs = 0
  let protein = 0
  let fat = 0
  let fiber = 0
  let anyCal = false

  if (!Array.isArray(meals)) {
    return { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0, hasData: false }
  }

  for (const meal of meals) {
    const items = collectTrackedItemsFromLog(meal)
    for (const it of items) {
      const frac = consumedFraction(it)
      if (frac <= 0) continue
      const c = sumCaloriesFromTrackedItems([it])
      if (c != null) {
        calories += c * frac
        anyCal = true
      }
      const r = it.recipe
      carbs += macroGramsFromRecipe(r, 'carbs') * frac
      protein += macroGramsFromRecipe(r, 'protein') * frac
      fat += macroGramsFromRecipe(r, 'fat') * frac
      fiber += macroGramsFromRecipe(r, 'fiber') * frac
    }
  }

  return {
    calories,
    carbs,
    protein,
    fat,
    fiber,
    hasData: anyCal || carbs > 0 || protein > 0 || fat > 0 || fiber > 0,
  }
}
