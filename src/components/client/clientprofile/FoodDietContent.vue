<template>
  <div class="food-diet-content">
    <h2>Food and Diet</h2>
    <div class="nutrition-scope-row">
      <v-btn-toggle
        v-model="progressTimeScope"
        mandatory
        density="compact"
        class="nutrition-scope-toggle"
        variant="outlined"
        divided
      >
        <v-btn value="day" size="small" class="nutrition-scope-btn">Day</v-btn>
        <v-btn value="week" size="small" class="nutrition-scope-btn">Week</v-btn>
        <v-btn value="month" size="small" class="nutrition-scope-btn">Month</v-btn>
        <v-btn value="6months" size="small" class="nutrition-scope-btn">6 Month</v-btn>
        <v-btn value="year" size="small" class="nutrition-scope-btn">Year</v-btn>
      </v-btn-toggle>
    </div>

    <!-- Progress Cards -->
    <div
      class="progress-wrapper"
      :class="{ 'nutrition-progress--loading': nutritionProgressLoading }"
    >
      <!-- Food Log Progress -->
      <div class="card">
        <h3>Food Log Progress</h3>

        <div class="circle-wrap">
          <div class="circle" :style="circleGradient">
            <div class="circle-inner">
              <h2>{{ nutritionDisplay.caloriesConsumedLabel }}</h2>
              <span>out of {{ nutritionDisplay.caloriesTargetLabel }}</span>
            </div>
          </div>
        </div>
        <div class="text-center">
          <div class="status-pill">{{ nutritionDisplay.calorieStatusLabel }}</div>
        </div>
        <p>{{ nutritionDisplay.calorieDescription }}</p>
      </div>

      <!-- Macros Progress -->
      <div class="card macros-progress-card">
        <h3>Macros Progress</h3>

        <div class="macros-progress-chart">
          <div class="macros">
            <div class="bar carbs" :class="{ 'bar--over': nutritionDisplay.macroOver.carbs }">
              <div class="bar-track">
                <span
                  v-if="nutritionDisplay.barPercents.carbs < 0.01"
                  class="bar-value-current bar-value-current--empty"
                >
                  {{ nutritionDisplay.macros.carbs }}
                </span>
                <div
                  class="bar-fill"
                  :class="{ 'bar-fill--full': nutritionDisplay.barPercents.carbs >= 99.5 }"
                  :style="{ height: `${nutritionDisplay.barPercents.carbs}%` }"
                >
                  <span v-if="nutritionDisplay.barPercents.carbs >= 0.01" class="bar-value-current">
                    {{ nutritionDisplay.macros.carbs }}
                  </span>
                </div>
                <div class="bar-track-target">
                  <span class="bar-value-target"
                    >/ {{ nutritionDisplay.macroTargetLabels.carbs }}</span
                  >
                </div>
              </div>
              <div class="bar-label">Carbs</div>
            </div>

            <div class="bar protein" :class="{ 'bar--over': nutritionDisplay.macroOver.protein }">
              <div class="bar-track">
                <span
                  v-if="nutritionDisplay.barPercents.protein < 0.01"
                  class="bar-value-current bar-value-current--empty"
                >
                  {{ nutritionDisplay.macros.protein }}
                </span>
                <div
                  class="bar-fill"
                  :class="{ 'bar-fill--full': nutritionDisplay.barPercents.protein >= 99.5 }"
                  :style="{ height: `${nutritionDisplay.barPercents.protein}%` }"
                >
                  <span
                    v-if="nutritionDisplay.barPercents.protein >= 0.01"
                    class="bar-value-current"
                  >
                    {{ nutritionDisplay.macros.protein }}
                  </span>
                </div>
                <div class="bar-track-target">
                  <span class="bar-value-target">
                    / {{ nutritionDisplay.macroTargetLabels.protein }}
                  </span>
                </div>
              </div>
              <div class="bar-label">Protein</div>
            </div>

            <div class="bar fat" :class="{ 'bar--over': nutritionDisplay.macroOver.fat }">
              <div class="bar-track">
                <span
                  v-if="nutritionDisplay.barPercents.fat < 0.01"
                  class="bar-value-current bar-value-current--empty"
                >
                  {{ nutritionDisplay.macros.fat }}
                </span>
                <div
                  class="bar-fill"
                  :class="{ 'bar-fill--full': nutritionDisplay.barPercents.fat >= 99.5 }"
                  :style="{ height: `${nutritionDisplay.barPercents.fat}%` }"
                >
                  <span v-if="nutritionDisplay.barPercents.fat >= 0.01" class="bar-value-current">
                    {{ nutritionDisplay.macros.fat }}
                  </span>
                </div>
                <div class="bar-track-target">
                  <span class="bar-value-target"
                    >/ {{ nutritionDisplay.macroTargetLabels.fat }}</span
                  >
                </div>
              </div>
              <div class="bar-label">Fat</div>
            </div>

            <div class="bar fiber" :class="{ 'bar--over': nutritionDisplay.macroOver.fiber }">
              <div class="bar-track">
                <span
                  v-if="nutritionDisplay.barPercents.fiber < 0.01"
                  class="bar-value-current bar-value-current--empty"
                >
                  {{ nutritionDisplay.macros.fiber }}
                </span>
                <div
                  class="bar-fill"
                  :class="{ 'bar-fill--full': nutritionDisplay.barPercents.fiber >= 99.5 }"
                  :style="{ height: `${nutritionDisplay.barPercents.fiber}%` }"
                >
                  <span v-if="nutritionDisplay.barPercents.fiber >= 0.01" class="bar-value-current">
                    {{ nutritionDisplay.macros.fiber }}
                  </span>
                </div>
                <div class="bar-track-target">
                  <span class="bar-value-target">
                    / {{ nutritionDisplay.macroTargetLabels.fiber }}
                  </span>
                </div>
              </div>
              <div class="bar-label">Fiber</div>
            </div>
          </div>
        </div>

        <div class="macros-progress-footer">
          <div class="macro-pill">{{ nutritionDisplay.macroStatusLabel }}</div>
          <p class="macro-description">{{ nutritionDisplay.macroDescription }}</p>
        </div>
      </div>
    </div>

    <!-- Food Logs / Diet plan (toolbar matches View Diet Plan mockup when template is open) -->
    <div class="bgW">
      <!-- Default: Food Logs title + actions -->
      <div v-if="!showDietPlanActive" class="diteHead food-logs-dite-head">
        <div class="diteHeadLeft food-logs-dite-head__left">
          <h2>{{ dietPlanSectionTitle }}</h2>
          <span class="food-logs-plan-pill">{{ planBadgeText }}</span>
        </div>
        <div class="diteHeadRight food-logs-dite-head__right d-flex align-center flex-wrap ga-2">
          <v-menu v-model="foodLogCalendarOpen" :close-on-content-click="true">
            <template #activator="{ props: menuProps }">
              <div class="food-logs-toolbar d-inline-flex align-center flex-wrap ga-1">
                <span
                  class="button buttonBg scle01"
                  aria-label="Previous day"
                  :disabled="foodLogPlanLoading"
                  @click.stop="shiftFoodLogDay(-1)"
                >
                  <b><v-icon size="22">mdi-chevron-left</v-icon></b>
                </span>
                <span v-bind="menuProps" class="button buttonBg" rounded="pill" size="small">
                  <b>{{ foodLogDateNavLabel }}</b>
                </span>
                <span
                  class="button buttonBg scle01"
                  :disabled="!canGoNextFoodLogDay || foodLogPlanLoading"
                  aria-label="Next day"
                  @click.stop="shiftFoodLogDay(1)"
                >
                  <b><v-icon size="22">mdi-chevron-right</v-icon></b>
                </span>
                <span v-bind="menuProps" aria-label="Calendar" class="button buttonBg">
                  <b><v-icon size="22">mdi-calendar-month-outline</v-icon></b>
                </span>
              </div>
            </template>
            <v-date-picker
              :model-value="foodLogPickerValue"
              :max="foodLogDatePickerMax"
              @update:model-value="onFoodLogDatePicked"
            />
          </v-menu>
          <span
            :variant="foodLogsTableView ? 'tonal' : 'text'"
            :color="foodLogsTableView ? 'primary' : undefined"
            aria-label="Toggle weekly table view"
            :aria-pressed="foodLogsTableView"
            class="button buttonBg"
            @click="foodLogsTableView = !foodLogsTableView"
          >
            <b><v-icon size="small">mdi-table</v-icon></b>
          </span>
          <v-tooltip text="View Cheat Days Only" location="bottom">
            <template #activator="{ props: cheatTip }">
              <v-btn
                v-bind="cheatTip"
                icon
                size="small"
                variant="text"
                aria-label="Filter cheat days"
                disabled
              >
                <v-icon size="small">mdi-filter-variant</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <div
            class="food-logs-layout-toggle d-inline-flex align-center"
            role="group"
            aria-label="Food log layout"
          >
            <v-btn
              icon
              size="small"
              :variant="foodLogsPhotoLayoutEnabled ? 'tonal' : 'text'"
              :color="foodLogsPhotoLayoutEnabled ? 'primary' : undefined"
              aria-label="Weekly plan with photos and hero cards"
              :aria-pressed="foodLogsPhotoLayoutEnabled"
              @click="foodLogsPhotoLayoutEnabled = !foodLogsPhotoLayoutEnabled"
            >
              <v-icon size="small">mdi-image-area</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              :variant="foodLogsTableViewActive ? 'tonal' : 'text'"
              :color="foodLogsTableViewActive ? 'primary' : undefined"
              aria-label="Weekly table view"
              :aria-pressed="foodLogsTableViewActive"
              @click="onFoodLogsTableViewClick"
            >
              <v-icon size="small">mdi-table</v-icon>
            </v-btn>
          </div>
          <button
            variant="outlined"
            class="button buttonBg"
            :loading="openingTemplate"
            @click="openAssignedDietPlanTemplate"
          >
            <b>View diet plan</b>
          </button>
        </div>
      </div>

      <!-- View Diet Plan: Back (left) · grid · Assign new template · Save (right) -->
      <div
        v-else
        class="diet-plan-toolbar d-flex align-center justify-space-between flex-wrap ga-3 mb-1"
      >
        <button class="button" variant="outlined" rounded="pill" @click="backFromDietPlan">
          <b>Back</b>
        </button>

        <div class="d-flex align-center flex-wrap ga-2">
          <v-btn
            class="diet-toolbar-grid-btn"
            icon
            size="40"
            variant="flat"
            rounded="circle"
            aria-label="Table layout"
            @click="onDietPlanGridClick"
          >
            <v-icon size="20" color="grey-darken-1">mdi-table</v-icon>
          </v-btn>

          <button class="button" variant="outlined" rounded="pill" @click="goAssignNewTemplate">
            <b>Assign new template</b>
          </button>

          <v-menu location="bottom end">
            <template #activator="{ props: menuProps }">
              <button
                v-bind="menuProps"
                class="button dropdownBth"
                rounded="pill"
                variant="flat"
                :loading="savingTemplate"
                elevation="0"
              >
                <span>Save</span>
                <v-icon end size="small">mdi-chevron-down</v-icon>
              </button>
            </template>
            <v-card class="dropMenuWrap" elevation="4" rounded="lg">
              <v-list density="comfortable" class="py-1">
                <v-list-item class="save-split-menu-item" @click="onSaveOnlyForClient">
                  <v-list-item-title>Save only for client</v-list-item-title>
                </v-list-item>
                <v-divider class="border-opacity-25 my-0" />
                <v-list-item
                  class="save-split-menu-item"
                  :disabled="savingTemplate"
                  @click="onSaveTemplateFromMenu"
                >
                  <v-list-item-title>Save template</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </div>
      </div>

      <div v-if="showDietPlanActive" class="diet-plan-templates-layout">
        <div class="grayBg diet-plan-main pa-2">
          <TemplateWeekExpansionPanels
            :weekly-meals="viewWeeklyMeals"
            :food-suggestions="templateFoodSuggestions"
          />
        </div>
      </div>

      <template v-else>
        <template v-if="foodLogsPhotoLayoutEnabled">
          <FoodLogsWeeklyTable
            v-show="foodLogsTableView"
            :meal-slots="weeklyFoodLogTable.mealSlots"
            :rows="weeklyFoodLogTable.rows"
            class="mb-2"
          />

          <div v-show="!foodLogsTableView" class="grayBg food-logs-cards-wrap">
            <template
              v-for="(item, index) in foodLogCardsOrdered"
              :key="
                item.kind === 'plan'
                  ? `${foodLogDateKeyStr}-meal-${item.log.mealIndex}`
                  : `${foodLogDateKeyStr}-ate-${item.entry.id}`
              "
            >
              <FoodLogMealHeroCard
                v-if="item.kind === 'plan'"
                :title="item.log.displayTitle"
                :calories-label="item.log.caloriesLabel"
                :image-url="item.log.heroImage"
                :tone="item.log.tone"
                :badge-text="index === 0 ? 'Increased fat' : 'Looking good'"
                :badge-variant="index === 0 ? 'increased-fat' : 'looking-good'"
                :footer-note="index === 0 ? 'Partially Different — some substitutions made' : ''"
              />
              <FoodLogMealHeroCard
                v-else
                :title="item.entry.displayTitle"
                :calories-label="formatAteSomethingElseCalories(item.entry.calories)"
                :quantity-line="ateSomethingElseQuantityLine(item.entry)"
                :image-url="item.entry.imageUrl"
                :tone="item.entry.tone"
                badge-text="Looking good"
                badge-variant="looking-good"
              />
            </template>

            <FoodLogSupplementsSection :supplements="supplements" />
          </div>
        </template>

        <div v-else class="grayBg food-logs-detail-layout">
          <FoodLogMealDetailList :cards="foodLogDetailCards" :supplements="supplements" />
        </div>
      </template>
    </div>

    <v-snackbar v-model="showNoTemplateSnackbar" color="warning" location="top" timeout="4000">
      No diet plan template is assigned to this client yet.
    </v-snackbar>

    <v-snackbar v-model="showSaveSuccessSnackbar" color="success" location="top" timeout="3000">
      Template saved
    </v-snackbar>

    <v-snackbar v-model="showSaveErrorSnackbar" color="error" location="top" timeout="4000">
      Could not save template. Please try again.
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTemplatesStore } from '@/stores/templates.store'
import { useRecipesStore } from '@/stores/recipes.store'
import { getAssignedPlanByClientId, getClientNutritionProgress } from '@/services/client.service'
import {
  normalizeNutritionProgressPayload,
  resolveConsumedWithDayFallback,
} from '@/utils/nutritionProgressApi'
import { computeNutritionFromPlanMealLogs } from '@/utils/nutritionProgressFromMeals'
import {
  FoodLogsWeeklyTable,
  FoodLogMealHeroCard,
  FoodLogMealDetailList,
  FoodLogSupplementsSection,
  buildWeeklyFoodLogRows,
} from '@/components/client/clientprofile'
import {
  normalizeAteSomethingElseMealLogs,
  mealTypeMatchesPlanSlot,
  formatAteSomethingElseCalories,
} from '@/utils/ateSomethingElseMealLogs'
import { buildFoodLogDetailCards } from '@/utils/foodLogDetailViewModel'
import { resolveMealsForCalendarDay } from '@/utils/foodLogPlanMeals'
import { mealSlotSortOrder, parseLoggedAtMs } from '@/utils/foodLogMealOrder'
import {
  mealCardToneFromMealType,
  formatShortTimeFromRaw,
  firstImageFromTrackedItems,
  firstImageFromMeal,
  resolveMealTotalCalories,
  formatMealCaloriesLabel,
  collectTrackedItemsFromLog,
  coalesceMealImageUrl,
  getFoodLogItemDisplayName,
} from '@/utils/foodLogMealHelpers'
import {
  startOfLocalDay,
  dateKeyLocal,
  isTodayLocal,
  addDays,
  isSameLocalDay,
} from '@/utils/foodLogDateNav'
import TemplateWeekExpansionPanels from '@/components/template/TemplateWeekExpansionPanels.vue'
import {
  buildWeeklyMealsFromApiTemplate,
  buildTemplateBodyFromWeeklyMeals,
  applyRecipeIdsToTemplatePayload,
} from '@/utils/templateWeekMeals'

const todayMeals = ref([])
const assignedPlan = ref(null)
/** True while assigned plan / day logs are loading */
const foodLogPlanLoading = ref(false)
/** Local calendar key (`YYYY-MM-DD`) of the last successful `assignedPlan` fetch; avoids showing prior day’s plan against a new date */
const foodLogDataDateKey = ref('')
let foodLogFetchSeq = 0
/** Calendar day (local midnight) for which we show plan meals + logs */
const foodLogViewDate = ref(startOfLocalDay(new Date()))
const foodLogCalendarOpen = ref(false)
const foodLogPickerValue = ref(dateKeyLocal(new Date()))
const foodLogsTableView = ref(false)
/** When true (photo icon selected): weekly table + hero photo cards. When false: per-item detail cards. */
const foodLogsPhotoLayoutEnabled = ref(false)
watch(foodLogsPhotoLayoutEnabled, (enabled) => {
  if (!enabled) foodLogsTableView.value = false
})

/** Table icon is “on” only when photo layout is on and the weekly table is visible (vs hero cards). */
const foodLogsTableViewActive = computed(
  () => foodLogsPhotoLayoutEnabled.value && foodLogsTableView.value,
)

function onFoodLogsTableViewClick() {
  if (!foodLogsPhotoLayoutEnabled.value) {
    foodLogsPhotoLayoutEnabled.value = true
    foodLogsTableView.value = true
    return
  }
  foodLogsTableView.value = !foodLogsTableView.value
}

const route = useRoute()
const router = useRouter()
const templatesStore = useTemplatesStore()
const recipesStore = useRecipesStore()
const openingTemplate = ref(false)
const savingTemplate = ref(false)
const showNoTemplateSnackbar = ref(false)
const showSaveSuccessSnackbar = ref(false)
const showSaveErrorSnackbar = ref(false)
const showDietPlanPanel = ref(false)
const viewWeeklyMeals = ref(null)
const viewTemplateTitle = ref('')
const viewTemplateId = ref(null)
const viewTemplateMeta = ref({
  templateName: '',
  description: '',
  durationInDays: 7,
})
const mealSummary = ref({})
/** "Ate something else" rows that did not match a plan meal slot (merged rows are excluded) */
const unmatchedSomethingElseMealLogs = ref([])

const weeklyFoodLogTable = computed(() => buildWeeklyFoodLogRows(assignedPlan.value))

const foodLogDateKeyStr = computed(() => dateKeyLocal(foodLogViewDate.value))

/** Plan rows + unmatched “ate something else”, ordered by meal slot (e.g. all evening snacks before dinner) then time */
const foodLogCardsOrdered = computed(() => {
  const planItems = todayMeals.value.map((log) => ({
    kind: 'plan',
    sortOrder: mealSlotSortOrder(log.title),
    sortTime: log.sortTimestamp ?? 0,
    log,
  }))
  const ateItems = unmatchedSomethingElseMealLogs.value.map((entry) => ({
    kind: 'ateElse',
    sortOrder: mealSlotSortOrder(entry.mealTypeLabel || entry.displayTitle),
    sortTime: parseLoggedAtMs(entry.loggedAt),
    entry,
  }))
  return [...planItems, ...ateItems].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
    if (a.sortTime !== b.sortTime) return a.sortTime - b.sortTime
    if (a.kind === 'plan' && b.kind === 'plan') {
      return (a.log.mealIndex ?? 0) - (b.log.mealIndex ?? 0)
    }
    if (a.kind === 'ateElse' && b.kind === 'ateElse') {
      return String(a.entry.id).localeCompare(String(b.entry.id))
    }
    return 0
  })
})

const foodLogDetailCards = computed(() => buildFoodLogDetailCards(foodLogCardsOrdered.value))

function ateSomethingElseQuantityLine(entry) {
  if (!entry?.quantityLabel || entry.quantityLabel === '—') return ''
  return `Quantity: ${entry.quantityLabel}`
}

const foodLogDateNavLabel = computed(() => {
  const d = foodLogViewDate.value
  if (isTodayLocal(d)) return 'Today'
  const yest = addDays(startOfLocalDay(new Date()), -1)
  if (isSameLocalDay(d, yest)) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

const canGoNextFoodLogDay = computed(
  () => dateKeyLocal(foodLogViewDate.value) < dateKeyLocal(new Date()),
)

const foodLogDatePickerMax = computed(() => dateKeyLocal(new Date()))

const planBadgeText = computed(() => {
  const s = mealSummary.value || {}
  const logged = Number(s.mealsLogged ?? 0)
  const total = Number(s.totalMealsAssigned ?? 0)
  const viewingToday = isTodayLocal(foodLogViewDate.value)
  if (!viewingToday) {
    if (total <= 0) {
      return `No plan meals · ${foodLogDateNavLabel.value}`
    }
    return `${logged} of ${total} logged · ${foodLogDateNavLabel.value}`
  }
  if (total <= 0) {
    return 'No plan meals today'
  }
  return `${logged} of ${total} as per plan`
})

const showDietPlanActive = computed(() => Boolean(showDietPlanPanel.value && viewWeeklyMeals.value))

const dietPlanSectionTitle = computed(() =>
  showDietPlanActive.value ? viewTemplateTitle.value || 'Diet plan' : 'Food Logs',
)

const templateFoodSuggestions = computed(() => {
  const list = recipesStore.recipes || []
  const names = list
    .map((r) => r?.recipeName || r?.name)
    .filter((n) => typeof n === 'string' && n.trim())
  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b))
})

const props = defineProps({
  clientData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['diet-plan-view-change'])

watch(
  showDietPlanActive,
  (active) => {
    emit('diet-plan-view-change', active)
  },
  { immediate: true },
)
//const logMealItemForPlan = logMealItemForPlan();

/** Chart range: Day aligns with food-log anchor date; other ranges use the same anchor in API queries */
const progressTimeScope = ref('week')
const nutritionProgressPayload = ref(null)
const nutritionProgressLoading = ref(false)

function fmtInt(n) {
  if (n == null || !Number.isFinite(Number(n))) return '—'
  return Math.round(Number(n)).toLocaleString('en-US')
}

function barPercent(consumed, target) {
  if (target == null || !(Number(target) > 0)) return 0
  return Math.min(100, (Number(consumed) / Number(target)) * 100)
}

function deriveCalorieCopy(consumed, target) {
  if (target == null || !(Number(target) > 0)) {
    return {
      label: 'Set a calorie target',
      description:
        'Add daily calorie and macro targets in client goals so we can chart progress for this period.',
    }
  }
  const r = Number(consumed) / Number(target)
  if (r < 0.75) {
    return {
      label: 'Below target',
      description: 'Overall energy balance is below the goal for this period.',
    }
  }
  if (r < 0.95) {
    return {
      label: 'Slightly below target',
      description:
        'Overall energy balance is on track, but a bit more intake could help meet daily needs.',
    }
  }
  if (r <= 1.05) {
    return {
      label: 'On track',
      description: 'Energy intake is aligned with your target for this period.',
    }
  }
  return {
    label: 'Above target',
    description: 'Intake is above the set target for this period.',
  }
}

function deriveMacroStatusLabel(consumed, targets) {
  const keys = ['carbs', 'protein', 'fat', 'fiber']
  let sum = 0
  let n = 0
  for (const k of keys) {
    const t = targets[k]
    const c = consumed[k]
    if (typeof t === 'number' && t > 0 && c != null) {
      sum += Number(c) / t
      n += 1
    }
  }
  if (n === 0) return 'Set macro targets'
  const avg = sum / n
  if (avg < 0.85) return 'Macros below targets'
  if (avg <= 1.1) return 'Macros moderately balanced'
  return 'Macros above targets'
}

/** Short caption under the macro status pill (matches reference card). */
function deriveMacroDescription(consumed, targets) {
  const keys = ['carbs', 'protein', 'fat', 'fiber']
  let hasTargets = false
  for (const k of keys) {
    const t = targets[k]
    if (typeof t === 'number' && t > 0) {
      hasTargets = true
      break
    }
  }
  if (!hasTargets) {
    return 'Add daily macro targets in client goals so we can chart progress for this period.'
  }
  const label = deriveMacroStatusLabel(consumed, targets)
  if (label === 'Macros below targets') {
    return 'Overall intake is below your macro targets for this period.'
  }
  if (label === 'Macros moderately balanced') {
    return "Overall intake looks fair — not far off from targets, but there's room for fine-tuning."
  }
  if (label === 'Macros above targets') {
    return 'Overall intake is above your macro targets for this period.'
  }
  return 'Macro intake compared to your goals for this period.'
}

const defaultNutritionTargets = computed(() => {
  const g = props.clientData?.goalsProfile || {}
  const pick = (v, fallback) => {
    const x = typeof v === 'number' ? v : Number.parseFloat(String(v ?? '').replace(/,/g, ''))
    return Number.isFinite(x) && x > 0 ? x : fallback
  }
  return {
    calories: pick(g.dailyCalorieTarget ?? g.calorieTarget, 2250),
    carbs: pick(g.carbTargetGrams, 200),
    protein: pick(g.proteinTargetGrams, 120),
    fat: pick(g.fatTargetGrams, 60),
    fiber: pick(g.fiberTargetGrams, 42),
  }
})

const NUTRITION_TARGET_KEYS = ['calories', 'carbs', 'protein', 'fat', 'fiber']

function mergeNutritionTargets(api, defaults) {
  const t = api?.targets || {}
  const o = {}
  for (const k of NUTRITION_TARGET_KEYS) {
    o[k] = t[k] ?? defaults[k]
  }
  return o
}

function macroBarPercents(consumed, targets) {
  return {
    carbs: barPercent(consumed.carbs, targets.carbs),
    protein: barPercent(consumed.protein, targets.protein),
    fat: barPercent(consumed.fat, targets.fat),
    fiber: barPercent(consumed.fiber, targets.fiber),
  }
}

function buildNutritionDisplayModel(api, defaults, meals, scope) {
  const targets = mergeNutritionTargets(api, defaults)
  const fromMeals = scope === 'day' ? computeNutritionFromPlanMealLogs(meals) : null
  const consumed = resolveConsumedWithDayFallback(api, fromMeals, scope)
  const calorieDer = deriveCalorieCopy(consumed.calories, targets.calories)
  const barPercents = macroBarPercents(consumed, targets)
  return {
    caloriesConsumedLabel: fmtInt(consumed.calories),
    caloriesTargetLabel: fmtInt(targets.calories),
    calorieStatusLabel: api?.calorieStatusLabel || calorieDer.label,
    calorieDescription: api?.calorieDescription || calorieDer.description,
    macroStatusLabel: api?.macroStatusLabel || deriveMacroStatusLabel(consumed, targets),
    macroDescription: api?.macroDescription || deriveMacroDescription(consumed, targets),
    macros: {
      carbs: fmtInt(consumed.carbs),
      protein: fmtInt(consumed.protein),
      fat: fmtInt(consumed.fat),
      fiber: fmtInt(consumed.fiber),
    },
    macroTargetLabels: {
      carbs: `${fmtInt(targets.carbs)}g`,
      protein: `${fmtInt(targets.protein)}g`,
      fat: `${fmtInt(targets.fat)}g`,
      fiber: `${fmtInt(targets.fiber)}g`,
    },
    barPercents,
    calorieRingPercent: barPercent(consumed.calories, targets.calories),
    macroOver: {
      carbs: Number(consumed.carbs) > Number(targets.carbs),
      protein: Number(consumed.protein) > Number(targets.protein),
      fat: Number(consumed.fat) > Number(targets.fat),
      fiber: Number(consumed.fiber) > Number(targets.fiber),
    },
  }
}

const nutritionDisplay = computed(() =>
  buildNutritionDisplayModel(
    nutritionProgressPayload.value,
    defaultNutritionTargets.value,
    todayMeals.value,
    progressTimeScope.value,
  ),
)

const circleGradient = computed(() => {
  const pct = nutritionDisplay.value.calorieRingPercent
  return {
    background: `conic-gradient(#EEF4D0 0% ${pct}%, #f1f1f1 ${pct}% 100%)`,
  }
})

async function loadNutritionProgress() {
  const clientId = route.params.id
  if (!clientId) {
    nutritionProgressPayload.value = null
    return
  }
  nutritionProgressLoading.value = true
  try {
    const raw = await getClientNutritionProgress(clientId, {
      period: progressTimeScope.value,
      date: dateKeyLocal(foodLogViewDate.value),
    })
    nutritionProgressPayload.value = normalizeNutritionProgressPayload(raw)
  } catch (err) {
    nutritionProgressPayload.value = null
    if (err?.response?.status !== 404) {
      console.error('Nutrition progress:', err)
    }
  } finally {
    nutritionProgressLoading.value = false
  }
}

watch(
  () => [route.params.id, progressTimeScope.value, dateKeyLocal(foodLogViewDate.value)],
  () => loadNutritionProgress(),
  { immediate: true },
)
// const foodLogs = computed(() => [
//   {
//     title: 'Breakfast @ 10:00am',
//     tag: 'Increased fat',
//     tagClass: 'increased-fat',
//     items: [
//       { name: 'Idli', calories: 140 },
//       { name: 'Sambar', calories: 122 },
//       { name: 'Coconut chutney', calories: 56 },
//     ],
//   },
//   {
//     title: 'Lunch @ 1:30pm',
//     tag: 'Looking good',
//     tagClass: 'looking-good',
//     items: [
//       { name: 'Chapathi', calories: 140 },
//       { name: 'Dal', calories: 122 },
//       { name: 'Mixed vegetable sabzi', calories: 56 },
//     ],
//   },
// ])

const supplements = computed(() => [
  { name: 'Vitamin D', taken: true },
  { name: 'Omega-3', taken: false },
])

function pickTrackingSummaryByDateKey(plan, key) {
  const byDate =
    plan.trackingSummariesByDate?.[key] ??
    plan.trackingByDate?.[key] ??
    plan.dailyTrackingSummaries?.[key]
  return byDate && typeof byDate === 'object' ? byDate : null
}

/** Tracking for a calendar day — supports several backend shapes (see BACKEND_FOOD_LOGS_BY_DATE.md). */
function resolveTrackingSummaryForView(plan, viewDate) {
  if (!plan || typeof plan !== 'object') return null
  const key = dateKeyLocal(viewDate)
  const fromMap = pickTrackingSummaryByDateKey(plan, key)
  if (fromMap) return fromMap
  const dts = plan.dayTrackingSummary
  if (dts && typeof dts === 'object') {
    const d = dts.date ?? dts.dateKey
    if (!d || d === key) return dts
  }
  if (plan.requestedFoodLogDate === key || plan.foodLogDate === key) {
    return plan.todayTrackingSummary ?? null
  }
  if (isTodayLocal(viewDate)) return plan.todayTrackingSummary ?? null
  return null
}

function filterAteSomethingElseForViewDate(plan, viewDate) {
  const all = normalizeAteSomethingElseMealLogs(plan)
  const key = dateKeyLocal(viewDate)
  return all.filter((e) => {
    if (e.dateKey) return e.dateKey === key
    return isTodayLocal(viewDate)
  })
}

function pickAteSomethingElseMatch(mealType, ateForDay, usedAteIds) {
  return ateForDay.find((e) => {
    if (usedAteIds.has(e.id)) return false
    return mealTypeMatchesPlanSlot(mealType, e.mealTypeLabel)
  })
}

// eslint-disable-next-line complexity -- meal row builder coordinates plan slots + ate-else merges
function buildMealLogRow(meal, mealIndex, trackingMap, ateForDay, usedAteIds) {
  const mealType = meal?.mealType || 'Meal'
  const items = getMealItems(meal, mealIndex, trackingMap)
  const options = mapMealOptions(meal?.options, mealIndex, trackingMap)
  const loggedAt = meal?.loggedAt ?? meal?.logTime ?? meal?.loggedTime
  const timeStr = formatShortTimeFromRaw(loggedAt)

  const match = pickAteSomethingElseMatch(mealType, ateForDay, usedAteIds)
  if (match) usedAteIds.add(match.id)

  let displayTitle
  if (match) {
    const t = match.loggedAt ? formatShortTimeFromRaw(match.loggedAt) : timeStr
    displayTitle = t ? `${mealType} @ ${t}` : mealType
  } else {
    displayTitle = timeStr ? `${mealType} @ ${timeStr}` : mealType
  }

  const allItems = collectTrackedItemsFromLog({ items, options })
  let totalCal = resolveMealTotalCalories(meal, allItems)
  if (match && match.calories != null && Number.isFinite(match.calories)) {
    totalCal = match.calories
  }

  let heroImage = firstImageFromMeal(meal) || firstImageFromTrackedItems(allItems)
  if (match?.imageUrl) {
    heroImage = match.imageUrl
  }

  return {
    title: mealType,
    displayTitle,
    mealIndex,
    items,
    options,
    heroImage,
    caloriesLabel: formatMealCaloriesLabel(totalCal),
    tone: mealCardToneFromMealType(mealType),
    sortTimestamp: parseLoggedAtMs(match?.loggedAt ?? loggedAt),
  }
}

/**
 * Plan meals for the day, with matching `ateSomethingElseMealLogs` merged into the same slot
 * (e.g. Evening Snack photo). Unmatched ate-else entries are listed separately.
 */
function mapMealsForDate(plan, viewDate) {
  const meals = resolveMealsForCalendarDay(plan, viewDate)
  const trackingSummary = resolveTrackingSummaryForView(plan, viewDate)
  const trackingMap = buildTrackingMap(trackingSummary?.meals || [])
  const ateForDay = filterAteSomethingElseForViewDate(plan, viewDate)
  const usedAteIds = new Set()

  const rows = meals.map((meal, mealIndex) =>
    buildMealLogRow(meal, mealIndex, trackingMap, ateForDay, usedAteIds),
  )

  const unmatched = ateForDay.filter((e) => !usedAteIds.has(e.id))
  return { rows, unmatched }
}

function refreshFoodLogDayView() {
  const vd = foodLogViewDate.value
  const viewKey = dateKeyLocal(vd)
  if (viewKey !== foodLogDataDateKey.value) {
    todayMeals.value = []
    mealSummary.value = {}
    unmatchedSomethingElseMealLogs.value = []
    return
  }
  const plan = assignedPlan.value
  if (!plan || typeof plan !== 'object') {
    todayMeals.value = []
    mealSummary.value = {}
    unmatchedSomethingElseMealLogs.value = []
    return
  }
  const { rows, unmatched } = mapMealsForDate(plan, vd)
  todayMeals.value = rows
  unmatchedSomethingElseMealLogs.value = unmatched
  const trackingSummary = resolveTrackingSummaryForView(plan, vd)
  if (trackingSummary) {
    mealSummary.value = trackingSummary
  } else if (isTodayLocal(vd)) {
    mealSummary.value = plan.todayTrackingSummary || createFallbackSummary(todayMeals.value, vd)
  } else {
    mealSummary.value = createFallbackSummary(todayMeals.value, vd)
  }
}

function shiftFoodLogDay(delta) {
  const next = addDays(foodLogViewDate.value, delta)
  if (dateKeyLocal(next) > dateKeyLocal(new Date())) return
  foodLogViewDate.value = next
}

function onFoodLogDatePicked(v) {
  if (v == null || v === '') return
  let str
  if (typeof v === 'string') {
    str = v.length >= 10 ? v.slice(0, 10) : v
  } else {
    str = dateKeyLocal(new Date(v))
  }
  const picked = startOfLocalDay(new Date(`${str}T12:00:00`))
  if (dateKeyLocal(picked) > dateKeyLocal(new Date())) return
  foodLogViewDate.value = picked
  foodLogPickerValue.value = str
  foodLogCalendarOpen.value = false
}

async function loadFoodLogForSelectedDate() {
  const clientId = route.params.id
  const dateKey = dateKeyLocal(foodLogViewDate.value)
  const seq = ++foodLogFetchSeq
  foodLogDataDateKey.value = ''
  refreshFoodLogDayView()

  if (!clientId) {
    assignedPlan.value = null
    return
  }

  try {
    foodLogPlanLoading.value = true
    const _response = await getAssignedPlanByClientId(clientId, { date: dateKey })
    if (seq !== foodLogFetchSeq) return
    const plan = _response?.data || _response || {}
    assignedPlan.value = plan
    foodLogDataDateKey.value = dateKey
    refreshFoodLogDayView()
  } catch (err) {
    if (seq !== foodLogFetchSeq) return
    if (err?.response?.status === 404) {
      assignedPlan.value = null
      foodLogDataDateKey.value = dateKey
      refreshFoodLogDayView()
      return
    }
    console.error('Error loading meals:', err)
    assignedPlan.value = null
    foodLogDataDateKey.value = ''
    refreshFoodLogDayView()
  } finally {
    if (seq === foodLogFetchSeq) {
      foodLogPlanLoading.value = false
    }
  }
}

function createFallbackSummary(meals = [], viewDate = new Date()) {
  const totalMealsAssigned = meals.length
  const mealsLogged = meals.filter((meal) => {
    const directItems = Array.isArray(meal?.items) ? meal.items : []
    const optionItems = Array.isArray(meal?.options)
      ? meal.options.flatMap((option) => (Array.isArray(option?.items) ? option.items : []))
      : []
    const allItems = [...directItems, ...optionItems]
    return allItems.some((item) => Number(item?.takenQuantity || 0) > 0)
  }).length

  const mealLogPercent =
    totalMealsAssigned > 0 ? Math.round((mealsLogged / totalMealsAssigned) * 100) : 0
  const isBelowTarget = totalMealsAssigned > 0 && mealLogPercent < 80
  const dayLabel = viewDate.toLocaleDateString('en-US', { weekday: 'long' })

  return {
    date: dateKeyLocal(viewDate),
    dayName: dayLabel,
    totalMealsAssigned,
    mealsLogged,
    mealLogPercent,
    isBelowTarget,
    statusMessage:
      totalMealsAssigned === 0
        ? `No meals assigned for ${dayLabel}`
        : isBelowTarget
          ? `Only ${mealsLogged} out of ${totalMealsAssigned} (<80%) of meals logged so far`
          : `${mealsLogged} out of ${totalMealsAssigned} meals logged. You are on target`,
    meals: [],
  }
}

function buildTrackingMap(trackingMeals = []) {
  return (Array.isArray(trackingMeals) ? trackingMeals : []).reduce((acc, mealLog) => {
    const items = Array.isArray(mealLog?.items) ? mealLog.items : []
    items.forEach((item) => {
      const key = String(item?.itemKey || '')
      if (key) {
        acc[key] = Number(item?.takenQuantity || 0)
      }
    })
    return acc
  }, {})
}

function getMealItems(meal = {}, mealIndex, trackingMap = {}, optionIndex = -1) {
  const baseItems = Array.isArray(meal.items)
    ? meal.items
        .map((item, itemIndex) =>
          buildTrackedItem(item, mealIndex, optionIndex, itemIndex, trackingMap),
        )
        .filter(Boolean)
    : []

  const directRecipeItem = meal?.recipe
    ? [
        buildTrackedItem(
          {
            recipe: meal.recipe,
            quantity: meal.quantity,
            measurement: meal.measurement || 'Nos',
          },
          mealIndex,
          -2,
          0,
          trackingMap,
        ),
      ]
    : []

  return [...baseItems, ...directRecipeItem].filter(Boolean)
}

function mapMealOptions(options = [], mealIndex, trackingMap = {}) {
  return Array.isArray(options)
    ? options.map((option, optionIndex) => ({
        optionTitle: option?.optionTitle || `Option ${optionIndex + 1}`,
        items: getMealItems(option, mealIndex, trackingMap, optionIndex),
      }))
    : []
}

function getItemName(rawItem) {
  return getFoodLogItemDisplayName(rawItem)
}

// eslint-disable-next-line complexity -- resolves calories from heterogeneous meal item shapes
function trackedItemCalories(rawItem) {
  const calRaw =
    rawItem?.calories ??
    rawItem?.kcal ??
    rawItem?.totalCalories ??
    rawItem?.recipe?.calories ??
    rawItem?.recipe?.caloriesPerServing ??
    rawItem?.recipe?.totalCalories ??
    rawItem?.recipe?.kcal
  if (calRaw == null || calRaw === '') return null
  const n =
    typeof calRaw === 'number' ? calRaw : Number.parseFloat(String(calRaw).replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

function trackedItemImageUrl(rawItem) {
  return coalesceMealImageUrl(rawItem)
}

function buildTrackedItem(rawItem = {}, mealIndex, optionIndex, itemIndex, trackingMap = {}) {
  const itemName = getItemName(rawItem)
  const assignedQuantity = parseAssignedQuantity(rawItem?.quantity, 1)
  const quantityText = String(rawItem?.quantity ?? '')
    .trim()
    .toLowerCase()
  const inferredUnit = quantityText.replace(/[0-9.\s]/g, '')
  const measurement = rawItem?.measurement || inferredUnit || 'Nos'
  const itemKey = `${mealIndex}:${optionIndex}:${itemIndex}`
  const takenQuantity = Number(trackingMap[itemKey] || 0)

  return {
    itemName,
    itemKey,
    assignedQuantity,
    measurement,
    takenQuantity: Math.max(0, takenQuantity),
    imageUrl: trackedItemImageUrl(rawItem),
    calories: trackedItemCalories(rawItem),
    recipe: rawItem.recipe,
  }
}

function parseAssignedQuantity(rawValue, fallback = 1) {
  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    return Math.max(1, Math.floor(rawValue))
  }

  if (typeof rawValue === 'string') {
    const parsed = parseInt(rawValue.match(/\d+/)?.[0] || '', 10)
    if (Number.isFinite(parsed)) {
      return Math.max(1, parsed)
    }
  }

  return Math.max(1, fallback)
}

function resolveTemplateIdFromPlan(plan) {
  if (!plan || typeof plan !== 'object') return null
  const embedded = plan.template
  return (
    plan.templateId ||
    plan.planTemplateId ||
    plan.dietPlanTemplateId ||
    (embedded && (embedded._id || embedded.id)) ||
    null
  )
}

function clientMatchesAssignment(clientId, assignedTo = []) {
  const cid = String(clientId)
  return (assignedTo || []).some((c) => String(c?._id || c?.id || c) === cid)
}

async function findTemplateIdByClientAssignment(clientId) {
  try {
    await templatesStore.fetchAllTemplates()
  } catch {
    return null
  }
  const list = templatesStore.templates || []
  for (const tpl of list) {
    if (clientMatchesAssignment(clientId, tpl.assignedTo)) {
      return tpl._id || tpl.id
    }
  }
  return null
}

async function resolveTemplateIdForDietPlan(clientId, cachedAssignedPlan) {
  let templateId = resolveTemplateIdFromPlan(cachedAssignedPlan)
  if (templateId) return templateId

  try {
    const dateKey = dateKeyLocal(foodLogViewDate.value)
    const res = await getAssignedPlanByClientId(clientId, { date: dateKey })
    const plan = res?.data ?? res ?? {}
    templateId = resolveTemplateIdFromPlan(plan)
    if (plan && Object.keys(plan).length) {
      assignedPlan.value = plan
      foodLogDataDateKey.value = dateKey
      refreshFoodLogDayView()
    }
  } catch {
    /* no assigned plan */
  }

  if (!templateId) {
    templateId = await findTemplateIdByClientAssignment(clientId)
  }
  return templateId
}

async function loadTemplateIntoDietPlanView(templateId) {
  await recipesStore.fetchAllRecipes({ limit: 1000 }).catch(() => {})

  const tpl = await templatesStore.fetchTemplateById(templateId)
  viewTemplateId.value = templateId
  viewTemplateMeta.value = {
    templateName: tpl?.templateName || '',
    description: tpl?.description || '',
    durationInDays: tpl?.durationInDays ?? 7,
  }
  viewWeeklyMeals.value = buildWeeklyMealsFromApiTemplate(tpl)
  viewTemplateTitle.value = tpl?.templateName || ''
  showDietPlanPanel.value = true
}

function backFromDietPlan() {
  showDietPlanPanel.value = false
}

function goAssignNewTemplate() {
  router.push({ name: 'templates' })
}

function onDietPlanGridClick() {
  /* TODO: optional alternate layout / table view for the weekly plan */
}

function onSaveOnlyForClient() {
  /* TODO: persist client-specific meal overrides without updating the shared template */
}

async function onSaveTemplateFromMenu() {
  await saveTemplateFromProfile()
}

async function saveTemplateFromProfile() {
  if (!viewTemplateId.value || !viewWeeklyMeals.value) return
  savingTemplate.value = true
  try {
    let body = buildTemplateBodyFromWeeklyMeals(viewWeeklyMeals.value, viewTemplateMeta.value)
    body = applyRecipeIdsToTemplatePayload(body, recipesStore.recipes)
    await templatesStore.updateTemplate(viewTemplateId.value, body)
    showSaveSuccessSnackbar.value = true
  } catch (err) {
    console.error('Failed to save template:', err)
    showSaveErrorSnackbar.value = true
  } finally {
    savingTemplate.value = false
  }
}

async function openAssignedDietPlanTemplate() {
  const clientId = route.params.id
  if (!clientId) return

  if (showDietPlanPanel.value) {
    showDietPlanPanel.value = false
    return
  }

  openingTemplate.value = true
  try {
    const templateId = await resolveTemplateIdForDietPlan(clientId, assignedPlan.value)
    if (!templateId) {
      showNoTemplateSnackbar.value = true
      return
    }
    await loadTemplateIntoDietPlanView(templateId)
  } catch (err) {
    console.error('Failed to load diet plan template:', err)
    showNoTemplateSnackbar.value = true
  } finally {
    openingTemplate.value = false
  }
}

watch(foodLogViewDate, (d) => {
  foodLogPickerValue.value = dateKeyLocal(d)
})

watch(
  () => [route.params.id, dateKeyLocal(foodLogViewDate.value)],
  ([clientId], prev) => {
    if (!clientId) {
      assignedPlan.value = null
      foodLogDataDateKey.value = ''
      refreshFoodLogDayView()
      return
    }
    const prevId = prev?.[0]
    if (prevId !== undefined && prevId !== clientId) {
      foodLogViewDate.value = startOfLocalDay(new Date())
      foodLogPickerValue.value = dateKeyLocal(foodLogViewDate.value)
      return
    }
    loadFoodLogForSelectedDate()
  },
  { immediate: true },
)
</script>

<style scoped>
.food-logs-toolbar .button {
  min-width: 32px;
}
.food-logs-toolbar .button[disabled='true'] {
  opacity: 0.6;
}
.food-diet-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.food-diet-content h2 {
  color: #31253a;
  font-size: 24px;
  font-weight: 500;
  line-height: 28px;
  letter-spacing: 0;
}

.nutrition-scope-row {
  border-radius: 50px;
  border: 1px solid #e0e0e0;
  background: #f8f8f8;
  width: 100%;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 5px 10px;
}
.v-btn-group--density-compact.v-btn-group {
  height: auto;
}
.v-btn__content {
  font-weight: 500;
}
.nutrition-scope-toggle {
  border-radius: 999px !important;
  border-color: rgba(186, 104, 200, 0.45) !important;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: auto;
}

.nutrition-scope-toggle .nutrition-scope-btn {
  width: 20%;
  box-shadow: none;
  padding: 10px;
  border: 0;
  outline: 0;
  color: #929292;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  height: auto;
  margin-bottom: 3px;
  line-height: 20px; /* 142.857% */
  letter-spacing: 0.1px;
}
.nutrition-scope-toggle .nutrition-scope-btn .v-btn__content {
  font-weight: 500;
}
.nutrition-scope-toggle.v-btn-group--horizontal.v-btn-group--divided .v-btn:not(:last-child) {
  border-inline-end-color: transparent !important;
}
.nutrition-scope-toggle :deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0.02em;
  font-weight: 600;
  font-size: 12px;
  min-width: 52px;
}
.scle01 {
  transform: scale(0.7);
}

@media (min-width: 600px) {
  .nutrition-scope-toggle :deep(.v-btn) {
    font-size: 13px;
    min-width: 56px;
  }
}

.nutrition-scope-toggle :deep(.v-btn--active) {
  color: #ab2e95;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  background:
    linear-gradient(white, white) padding-box,
    linear-gradient(135deg, #f7c6ff, #ffd6a5) border-box;
  border: 2px solid transparent;
  box-shadow: 0 2px 0 0 #d7c8e2;
  letter-spacing: 0.1px;
}
.nutrition-scope-toggle :deep(.v-btn--active) > .v-btn__overlay {
  background-color: #ffffff;
}
.nutrition-scope-toggle .v-btn__content {
  font-weight: 500;
}
.nutrition-progress--loading {
  opacity: 0.55;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.food-logs-dite-head {
  flex-wrap: wrap;
  align-items: flex-start !important;
  gap: 12px 16px !important;
}

.food-logs-dite-head__left {
  flex: 1;
  min-width: 200px;
}

.food-logs-dite-head__left h2 {
  margin-bottom: 8px;
}

.food-logs-plan-pill {
  display: inline-block;
  border-radius: 12px;
  padding: 8px 12px;
  background: #ffe7e0;
  color: #e85708;
  font-size: 14px;
  font-weight: 500;
}

.food-logs-dite-head__right {
  justify-content: flex-end;
}

.food-logs-layout-toggle {
  gap: 8px;
}
.food-logs-layout-toggle :deep(.v-btn) {
  border-radius: 999px;
}

.food-logs-today-pill {
  border-color: rgba(186, 104, 200, 0.55) !important;
  color: #6a1b9a !important;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.02em;
}

.food-logs-view-plan-btn {
  border: none !important;
  background: linear-gradient(180deg, #f8e1f0 0%, #f3d4e8 100%) !important;
  color: #4a148c !important;
  font-weight: 600;
}

.food-logs-cards-wrap {
  padding-top: 4px;
}

.food-logs-detail-layout {
  padding-top: 4px;
}

.progress-wrapper {
  display: flex;
  align-items: stretch;
  gap: 24px;
  width: 100%;
  flex-wrap: wrap;
}

.card {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  border: 0;
  min-width: 0;
}

.macros-progress-card {
  display: flex;
  flex-direction: column;
  isolation: isolate;
  position: relative;
  z-index: 0;
}

.macros-progress-chart {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 0;
  width: 100%;
}

.macros-progress-footer {
  flex-shrink: 0;
  margin-top: 20px;
  padding-top: 4px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 2;
}

.macro-description {
  margin: 14px 0 0;
  padding: 0 4px;
  font-size: 13px;
  color: #555;
  line-height: 1.55;
  text-align: center;
}

.card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 18px;
}

.circle-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0 20px;
}

.circle {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.circle-inner {
  width: 120px;
  height: 120px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.circle-inner h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.circle-inner span {
  font-size: 12px;
  color: #888;
}

.status-pill {
  display: inline-block;
  background: #eef4d0;
  color: #5f880d;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 10px;
}

.card p {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  text-align: center;
}

.macros {
  display: flex;
  justify-content: space-evenly;
  align-items: flex-end;
  gap: 12px;
  margin-top: 12px;
  padding: 0 4px;
  width: 100%;
  max-width: 100%;
  overflow: visible;
  box-sizing: border-box;
}

.bar {
  flex: 1 1 0;
  max-width: 92px;
  min-width: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Wide capsule (~reference): neutral track, colored fill only */
.bar-track {
  position: relative;
  width: 100%;
  max-width: 84px;
  margin-inline: auto;
  aspect-ratio: 1 / 3.15;
  height: auto;
  max-height: 300px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #ebeff5;
}

.carbs .bar-track,
.protein .bar-track,
.fat .bar-track,
.fiber .bar-track {
  background: #ebeff5;
}

/* Fill grows from bottom; current value sits at top of the fill */
.bar-fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 4px 0;
  box-sizing: border-box;
  z-index: 1;
  border-radius: 22px 22px 0 0;
  transition: height 0.3s ease;
}

.bar-fill--full {
  border-radius: 22px;
}

.bar-track-target {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 0 4px 13px;
  text-align: center;
  pointer-events: none;
}

.bar-value-current {
  font-size: clamp(14px, 3.5vw, 18px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.05;
  max-width: 100%;
  text-align: center;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.bar-value-current--empty {
  position: absolute;
  top: 12px;
  left: 50%;
  z-index: 3;
  transform: translateX(-50%);
  width: 100%;
  padding: 0 4px;
  pointer-events: none;
}

.bar-value-target {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.2;
  max-width: 100%;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.bar-label {
  margin-top: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  text-align: center;
  width: 100%;
  line-height: 1.2;
  overflow-wrap: break-word;
  hyphens: auto;
}

.carbs .bar-fill {
  background: linear-gradient(180deg, #ffd8c9 0%, #ffcbb8 100%);
}

.carbs .bar-value-current {
  color: #e65100;
}

.protein .bar-fill {
  background: linear-gradient(180deg, #dcecc4 0%, #cfdfa8 100%);
}

.protein .bar-value-current {
  color: #558b00;
}

.fat .bar-fill {
  background: linear-gradient(180deg, #c9e8fa 0%, #b5dff7 100%);
}

.fat .bar-value-current {
  color: #0277bd;
}

.fiber .bar-fill {
  background: linear-gradient(180deg, #b8ebe0 0%, #9fdfd2 100%);
}

.fiber .bar-value-current {
  color: #00796b;
}

/* Slight emphasis when intake is above target */
.bar--over .bar-fill {
  opacity: 0.95;
}

.bar--over.carbs .bar-value-current {
  color: #bf360c;
}

.carbs .bar-value-current--empty {
  color: #d35400;
}

.protein .bar-value-current--empty {
  color: #5f880d;
}

.fat .bar-value-current--empty {
  color: #0c75a5;
}

.fiber .bar-value-current--empty {
  color: #00695c;
}

.macro-pill {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
  max-width: 100%;
  margin-top: 0;
  padding: 10px 20px;
  min-width: min(100%, 280px);
  background: #fff3ed;
  color: #e65100;
  font-weight: 600;
  border-radius: 22px;
  font-size: 13px;
  line-height: 1.35;
  text-align: center;
  position: relative;
  z-index: 1;
  word-break: break-word;
  border: 1px solid rgba(230, 81, 0, 0.12);
}

/* View Diet Plan toolbar — outlined pills + circular grid (mockup) */
.diet-plan-toolbar {
  width: 100%;
  padding: 4px 0 12px;
}

.diet-toolbar-pill {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.01em;
  border-color: rgba(74, 20, 140, 0.35) !important;
  color: #4a148c !important;
}

.diet-toolbar-pill:hover {
  background: rgba(74, 20, 140, 0.06) !important;
}

.diet-toolbar-grid-btn {
  background: #fff !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08) !important;
}

.diet-toolbar-grid-btn:hover {
  background: #fafafa !important;
}

/* Save split button (pill + dropdown) */
.save-split-btn {
  font-weight: 600;
  letter-spacing: 0.02em;
  background: #fde2e6 !important;
  color: #4a148c !important;
  box-shadow: none !important;
}

.save-split-btn:hover {
  background: #fcd4dc !important;
}

.save-split-btn :deep(.v-btn__loader) {
  color: #4a148c;
}

.dropMenuWrap {
  min-width: 220px;
}

.save-split-menu-item :deep(.v-list-item-title) {
  font-size: 14px;
  color: #424242;
}
</style>
