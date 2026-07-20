/** Default meal slots for one day (matches CreateTemplate editor shape). */
export const MEALS_BASE = [
  { id: 'breakfast', title: 'Breakfast', time: '', items: [], options: [] },
  { id: 'morning-snack', title: 'Morning Snack', time: '', items: [], options: [] },
  { id: 'lunch', title: 'Lunch', time: '', items: [], options: [] },
  { id: 'evening-snack', title: 'Evening Snack', time: '', items: [], options: [] },
  { id: 'dinner', title: 'Dinner', time: '', items: [], options: [] },
]

export const DEFAULT_MEAL_SCHEDULE = [
  { mealType: 'Breakfast', mealKey: 'breakfast', startHour: 5, endHour: 10, rank: 1 },
  { mealType: 'Morning Snack', mealKey: 'morning_snack', startHour: 10, endHour: 12, rank: 2 },
  { mealType: 'Lunch', mealKey: 'lunch', startHour: 12, endHour: 16, rank: 3 },
  { mealType: 'Evening Snack', mealKey: 'evening_snack', startHour: 16, endHour: 19, rank: 4 },
  { mealType: 'Dinner', mealKey: 'dinner', startHour: 19, endHour: 24, rank: 5 },
]

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export function mapMealTypeToId(mealType = '') {
  const normalized = mealType.toLowerCase().trim()
  if (normalized === 'breakfast') return 'breakfast'
  if (normalized === 'morning snack') return 'morning-snack'
  if (normalized === 'lunch') return 'lunch'
  if (normalized === 'evening snack') return 'evening-snack'
  if (normalized === 'dinner') return 'dinner'
  return normalized.replace(/\s+/g, '-')
}

export function createEmptyWeeklyMeals() {
  return {
    Monday: structuredClone(MEALS_BASE),
    Tuesday: structuredClone(MEALS_BASE),
    Wednesday: structuredClone(MEALS_BASE),
    Thursday: structuredClone(MEALS_BASE),
    Friday: structuredClone(MEALS_BASE),
    Saturday: structuredClone(MEALS_BASE),
    Sunday: structuredClone(MEALS_BASE),
  }
}

function normalizeMealScheduleKey(slot = {}) {
  return String(slot?.mealKey || slot?.mealType || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
}

function formatHour(hour) {
  const normalized = Number(hour)
  if (!Number.isFinite(normalized)) return '00:00'
  const wrapped = ((normalized % 24) + 24) % 24
  return `${String(wrapped).padStart(2, '0')}:00`
}

function buildMealTimeRange(slot = {}) {
  return `${formatHour(slot.startHour)} - ${formatHour(slot.endHour)}`
}

export function createEmptyWeeklyMealsFromSchedule(schedule = []) {
  const next = createEmptyWeeklyMeals()
  const normalizedSchedule =
    Array.isArray(schedule) && schedule.length ? schedule : DEFAULT_MEAL_SCHEDULE

  const timeByMealId = normalizedSchedule.reduce((acc, slot) => {
    const key = normalizeMealScheduleKey(slot)
    if (!key) return acc
    acc[key] = buildMealTimeRange(slot)
    return acc
  }, {})

  for (const day of Object.keys(next)) {
    next[day] = next[day].map((meal) => ({
      ...meal,
      time: timeByMealId[meal.id] || meal.time || '',
    }))
  }

  return next
}

/**
 * Maps API template `{ days: [{ day, meals }] }` into the editor `weeklyMeals` shape.
 */
export function buildWeeklyMealsFromApiTemplate(template) {
  const nextWeeklyMeals = createEmptyWeeklyMeals()

  for (const dayObj of template?.days || []) {
    if (!nextWeeklyMeals[dayObj.day]) continue

    const mealsForDay = nextWeeklyMeals[dayObj.day]
    for (const meal of dayObj.meals || []) {
      const mealId = mapMealTypeToId(meal.mealType)
      const mealIndex = mealsForDay.findIndex((m) => m.id === mealId)
      const mappedMeal = {
        id: mealId,
        title: meal.mealType || 'Meal',
        time: meal.notes || '',
        items: meal.items || [],
        options: meal.options || [],
      }

      if (mealIndex === -1) {
        mealsForDay.push(mappedMeal)
      } else {
        mealsForDay[mealIndex] = mappedMeal
      }
    }
  }

  return nextWeeklyMeals
}

/** Build API `days` array from editor `weeklyMeals` (same rules as CreateTemplate). */
export function buildDaysFromWeeklyMeals(weeklyMeals) {
  if (!weeklyMeals || typeof weeklyMeals !== 'object') return []
  return DAYS_OF_WEEK.map((day) => {
    const meals = weeklyMeals[day] || []
    return {
      day,
      meals: meals
        .map((meal) => ({
          mealType: meal.title,
          notes: meal.time || '',
          items: meal.items || [],
          options: meal.options || [],
        }))
        .filter((meal) => {
          const hasItems = meal.items.length > 0
          const hasOptions =
            meal.options.length > 0 && meal.options.some((opt) => opt.items?.length > 0)
          return hasItems || hasOptions
        }),
    }
  })
}

/**
 * Full template body for create/update (matches CreateTemplate payload shape).
 * @param {object} weeklyMeals - editor state
 * @param {{ templateName: string, description?: string, durationInDays: number }} meta
 */
export function buildTemplateBodyFromWeeklyMeals(weeklyMeals, meta) {
  return {
    templateName: meta.templateName || '',
    description: meta.description || '',
    durationInDays: Math.max(1, Number(meta.durationInDays) || 7),
    days: buildDaysFromWeeklyMeals(weeklyMeals),
    isDraft: false,
  }
}

function createRecipeLookup(recipes = []) {
  return (name) => {
    const n = (name || '').toLowerCase().trim()
    if (!n) return null
    const r = recipes.find((x) => {
      const rn = (x.recipeName || x.name || '').toLowerCase().trim()
      return rn === n
    })
    return r?._id || r?.id || null
  }
}

function attachRecipeIdsToItems(items, getRecipeId) {
  for (const item of items || []) {
    const id = getRecipeId(item.name)
    if (id) item.recipeId = id
  }
}

function attachRecipeIdsToMeal(meal, getRecipeId) {
  attachRecipeIdsToItems(meal.items, getRecipeId)
  for (const opt of meal.options || []) {
    attachRecipeIdsToItems(opt.items, getRecipeId)
  }
}

/** Attach recipeId to items when name matches a recipe (same idea as CreateTemplate mapRecipesToPayload). */
export function applyRecipeIdsToTemplatePayload(payload, recipes = []) {
  const getRecipeId = createRecipeLookup(recipes)
  const updated = JSON.parse(JSON.stringify(payload))

  for (const dayObj of updated.days || []) {
    for (const meal of dayObj.meals || []) {
      attachRecipeIdsToMeal(meal, getRecipeId)
    }
  }

  return updated
}
