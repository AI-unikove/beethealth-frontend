<template>
  <div class="template-week-expansion-panels">
    <v-expansion-panels v-model="expandedDays" accordion>
      <v-expansion-panel v-for="day in DAYS_OF_WEEK" :key="day">
        <v-expansion-panel-title>{{ day }}</v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="mealMealWrap">
            <!-- Read-only: client profile “view diet plan” -->
            <template v-if="readonly">
              <div v-for="meal in mealsByDay[day] || []" :key="meal.id" class="readonly-meal mb-4">
                <div class="text-subtitle-2 font-weight-medium">
                  {{ meal.title || 'Meal' }}
                  <span
                    v-if="meal.time"
                    class="text-body-2 text-medium-emphasis font-weight-regular"
                  >
                    · @ {{ meal.time }}
                  </span>
                </div>
                <ul v-if="meal.items?.length" class="ml-4 mb-2 mt-1">
                  <li v-for="(it, ii) in meal.items" :key="ii" class="text-body-2">
                    {{ formatReadonlyLine(it) }}
                  </li>
                </ul>
                <div v-for="(opt, oi) in meal.options || []" :key="'opt-' + oi" class="ml-2 mb-2">
                  <div class="text-caption text-medium-emphasis">
                    {{ opt.optionTitle || `Option ${oi + 1}` }}
                  </div>
                  <ul v-if="opt.items?.length" class="ml-4 mt-1">
                    <li v-for="(it, ii) in opt.items" :key="ii" class="text-body-2">
                      {{ formatReadonlyLine(it) }}
                    </li>
                  </ul>
                </div>
              </div>
              <p v-if="!hasAnyMealContent(day)" class="text-body-2 text-medium-emphasis mb-0">
                No meals for this day.
              </p>
            </template>

            <!-- Editable: CreateTemplate -->
            <template v-else>
              <MealSection
                v-for="meal in mealsByDay[day] || []"
                :key="meal.id"
                :meal="meal"
                :day="day"
                :food-suggestions="foodSuggestions"
                @add-item="(mealId, optIdx) => handleAddFoodItem(day, mealId, optIdx)"
                @add-option="(mealId) => handleAddOption(day, mealId)"
                @update:meal="(updated) => handleMealUpdate(day, updated)"
              />

              <v-divider class="my-6 mb-0" />
              <div class="d-flex justify-center">
                <span class="btnText" @click="openRepeatDay(day)"> Repeat this day's plan </span>
              </div>
            </template>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-dialog v-if="!readonly" v-model="repeatDayDialog" max-width="440" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <span>Repeat {{ sourceDayForRepeat }}'s Plan</span>
          <v-spacer />
          <v-btn icon variant="text" class="repeat-close-btn" @click="repeatDayDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <div class="text-body-2 mb-4">
            Apply this day's complete meal plan to the selected days:
          </div>

          <v-checkbox
            v-for="d in DAYS_OF_WEEK"
            :key="d"
            v-model="selectedRepeatDays"
            :label="d"
            :value="d"
            :disabled="d === sourceDayForRepeat"
            color="primary"
            hide-details
            density="compact"
            class="mt-1 mb-1"
          />
        </v-card-text>

        <v-card-actions class="pb-6 px-6">
          <v-spacer />
          <v-btn variant="text" @click="repeatDayDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="selectedRepeatDays.filter((d) => d !== sourceDayForRepeat).length === 0"
            @click="performDayRepeat"
          >
            Apply
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { DAYS_OF_WEEK } from '@/utils/templateWeekMeals'
import MealSection from '@/components/template/MealSection.vue'

const props = defineProps({
  /** Editor shape: { Monday: [...meals], ... } */
  weeklyMeals: {
    type: Object,
    default: null,
  },
  foodSuggestions: {
    type: Array,
    default: () => [],
  },
  /** When true, shows the same week structure without MealSection (view-only). */
  readonly: {
    type: Boolean,
    default: false,
  },
})

/** Avoids null[day] when parent passes null before data loads */
const mealsByDay = computed(() => props.weeklyMeals ?? {})

const defaultMeasurements = [
  'Nos',
  'g',
  'ml',
  'piece',
  'slice',
  'cup',
  'tbsp',
  'tsp',
  'Small',
  'Medium',
  'Large',
  'Bowl',
  'Medium Bowl',
  'Tablespoon',
]

const expandedDays = ref([0])

const repeatDayDialog = ref(false)
const sourceDayForRepeat = ref(null)
const selectedRepeatDays = ref([])

function handleAddFoodItem(day, mealId, optionIndex) {
  const meal = (props.weeklyMeals || {})[day]?.find((m) => m.id === mealId)
  if (!meal) return
  if (!meal.items) meal.items = []

  const newItem = {
    name: '',
    quantity: 1,
    measurement: defaultMeasurements[0] || 'Nos',
  }

  if (optionIndex !== undefined && optionIndex !== null) {
    meal.options = meal.options || []
    if (!meal.options[optionIndex]) {
      meal.options[optionIndex] = { items: [] }
    }
    meal.options[optionIndex].items.push(newItem)
  } else {
    meal.items.push(newItem)
  }
}

function handleAddOption(day, mealId) {
  const meal = (props.weeklyMeals || {})[day]?.find((m) => m.id === mealId)
  if (!meal) return
  meal.options = meal.options || []

  if (meal.options.length === 0 && meal.items && meal.items.length) {
    meal.options.push({ items: [...meal.items] })
    meal.items = []
  } else {
    meal.options.push({ items: [] })
  }
}

function handleMealUpdate(day, updatedMeal) {
  const meals = (props.weeklyMeals || {})[day]
  if (!meals) return
  const idx = meals.findIndex((m) => m.id === updatedMeal.id)
  if (idx !== -1) {
    meals[idx] = updatedMeal
  }
}

function openRepeatDay(day) {
  sourceDayForRepeat.value = day
  selectedRepeatDays.value = [day]
  repeatDayDialog.value = true
}

function performDayRepeat() {
  const wm = props.weeklyMeals
  if (!sourceDayForRepeat.value || !wm) return
  const targetDays = selectedRepeatDays.value.filter((d) => d !== sourceDayForRepeat.value)
  if (targetDays.length === 0) return

  const sourceMeals = wm[sourceDayForRepeat.value]
  const clonedSourceMeals = JSON.parse(JSON.stringify(sourceMeals || []))

  targetDays.forEach((targetDay) => {
    wm[targetDay] = JSON.parse(JSON.stringify(clonedSourceMeals))
  })

  repeatDayDialog.value = false
  selectedRepeatDays.value = []
}

function readonlyItemName(rawItem) {
  return rawItem?.name ?? rawItem?.recipe?.recipeName ?? rawItem?.recipe?.name ?? 'Item'
}

function formatReadonlyLine(rawItem) {
  const name = readonlyItemName(rawItem)
  const qty = rawItem?.quantity != null ? String(rawItem.quantity).trim() : ''
  const unit = rawItem?.measurement ? String(rawItem.measurement).trim() : ''
  if (qty || unit) {
    return `${name}${qty ? ` — ${qty}` : ''}${unit ? ` ${unit}` : ''}`
  }
  return name
}

function hasAnyMealContent(day) {
  const meals = mealsByDay.value[day] || []
  return meals.some((meal) => {
    const hasItems = meal.items?.length > 0
    const hasOpts =
      meal.options?.some((o) => Array.isArray(o?.items) && o.items.length > 0) ?? false
    return hasItems || hasOpts
  })
}
</script>
