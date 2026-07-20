import { formatAteSomethingElseCalories } from '@/utils/ateSomethingElseMealLogs'
import { getFoodLogItemDisplayName } from '@/utils/foodLogMealHelpers'

/**
 * @param {number|null|undefined} n
 * @returns {string}
 */
export function formatDetailItemCaloriesLabel(n) {
  if (n == null || !Number.isFinite(n)) return '—'
  return `${Math.round(n)} kcal`
}

/**
 * @param {object} tracked — shape from buildTrackedItem in FoodDietContent
 * @returns {string}
 */
function formatTrackedQuantityLine(tracked) {
  const q = tracked.takenQuantity > 0 ? tracked.takenQuantity : tracked.assignedQuantity
  const unit = (tracked.measurement || 'nos').trim()
  return `${q} ${unit}`.trim()
}

/**
 * @param {object} tracked
 * @returns {{ name: string, quantityLabel: string, caloriesLabel: string, imageUrl: string }}
 */
function trackedItemToDetailLine(tracked) {
  return {
    name: getFoodLogItemDisplayName(tracked),
    quantityLabel: formatTrackedQuantityLine(tracked),
    caloriesLabel: formatDetailItemCaloriesLabel(tracked.calories),
    imageUrl: tracked.imageUrl || '',
  }
}

/**
 * @param {object} log — meal row from mapMealsForDate (items + options with items)
 * @returns {Array<{ name: string, quantityLabel: string, caloriesLabel: string, imageUrl: string }>}
 */
export function flattenMealLogLines(log) {
  const lines = []
  if (Array.isArray(log?.items)) {
    for (const it of log.items) {
      lines.push(trackedItemToDetailLine(it))
    }
  }
  if (Array.isArray(log?.options)) {
    for (const opt of log.options) {
      if (Array.isArray(opt?.items)) {
        for (const it of opt.items) {
          lines.push(trackedItemToDetailLine(it))
        }
      }
    }
  }
  return lines
}

function ateElseQuantityLabel(entry) {
  const q = String(entry?.quantityLabel ?? '').trim()
  if (q && q !== '—') return q
  return ''
}

/**
 * Maps `foodLogCardsOrdered` entries to props for FoodLogMealDetailCard.
 * Badge/footer rules match the hero-card list (first card = increased fat + footer note).
 *
 * @param {Array<{ kind: 'plan'|'ateElse', log?: object, entry?: object }>} ordered
 * @returns {Array<object>}
 */
export function buildFoodLogDetailCards(ordered) {
  if (!Array.isArray(ordered)) return []

  return ordered
    .map((item, index) => {
      if (item.kind === 'plan' && item.log) {
        const lines = flattenMealLogLines(item.log)
        const safeLines =
          lines.length > 0
            ? lines
            : [
                {
                  name: 'No items',
                  quantityLabel: '',
                  caloriesLabel: '—',
                  imageUrl: '',
                },
              ]

        return {
          cardKey: `plan-${item.log.mealIndex}-${index}`,
          displayTitle: item.log.displayTitle,
          caloriesLabel: item.log.caloriesLabel,
          tone: item.log.tone,
          badgeText: index === 0 ? 'Increased fat' : 'Looking good',
          badgeVariant: index === 0 ? 'increased-fat' : 'looking-good',
          footerNote: index === 0 ? 'Partially Different — some substitutions made' : '',
          lines: safeLines,
        }
      }

      const e = item.entry
      if (!e) {
        return null
      }

      const qty = ateElseQuantityLabel(e)
      return {
        cardKey: `ate-${e.id}-${index}`,
        displayTitle: e.displayTitle,
        caloriesLabel: formatAteSomethingElseCalories(e.calories),
        tone: e.tone,
        badgeText: 'Looking good',
        badgeVariant: 'looking-good',
        footerNote: '',
        lines: [
          {
            name: e.displayTitle || 'Something else',
            quantityLabel: qty,
            caloriesLabel: formatDetailItemCaloriesLabel(e.calories),
            imageUrl: e.imageUrl || '',
          },
        ],
      }
    })
    .filter(Boolean)
}
