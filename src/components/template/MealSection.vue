<template>
  <div :class="'meal-section ' + meal.title">
    <div class="cardHead">
      <div class="meal-title text-subtitle-1 font-weight-medium">
        {{ meal.title }}
        <template v-if="meal.time">
          <span class="time-text font-weight-medium"> @ {{ meal.time }} </span>
          <span icon variant="text" size="small" class="ml-1 edit-time-btn" @click="openTimeDialog">
            <v-icon size="18">mdi-pencil</v-icon>
          </span>
        </template>
        <span v-else class="add-time-btn pa-0" @click="openTimeDialog" style="cursor: pointer">
          @ +Add time
        </span>
      </div>

      <div class="d-flex align-center gap-3 meal-header-actions">
        <span
          v-if="(meal.items && meal.items.length > 0) || (meal.options && meal.options.length > 0)"
          class="pa-0 text-none btnText"
          @click="$emit('add-option', meal.id)"
        >
          +Add Option
        </span>
      </div>
    </div>

    <v-dialog v-model="timeDialog" max-width="340" persistent>
      <v-card>
        <v-card-title class="text-h6">Add time </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="tempTime"
            label="Time (e.g. 8:00 AM)"
            placeholder="8:00 AM"
            variant="outlined"
            density="comfortable"
            autofocus
            hide-details="auto"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="timeDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="saveMealTime">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="foodMainContent">
      <div class="food-items mt-2">
        <!-- if options exist, render each option separately -->
        <template v-if="meal.options && meal.options.length">
          <div v-for="(opt, oidx) in meal.options" :key="oidx" class="option-block mb-4">
            <div class="d-flex justify-space-between align-center mb-2 addOptionWrap">
              <span class="font-weight-medium">Option {{ oidx + 1 }}</span>
              <v-btn
                icon
                variant="text"
                size="small"
                color="grey-darken-1"
                @click="removeOption(oidx)"
              >
                <v-icon size="20">mdi-close</v-icon>
              </v-btn>
            </div>

            <div
              v-for="(item, index) in opt.items"
              :key="index"
              class="food-item d-flex align-center"
            >
              <div class="food-name flex-grow-1 text-body-1 font-weight-medium">
                <v-combobox
                  v-model="item.name"
                  :items="foodSuggestions"
                  :custom-filter="foodNameFilter"
                  placeholder="Enter food name (e.g. Idli)"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  rounded="lg"
                  class="food-name-input"
                  clearable
                />
              </div>

              <v-text-field
                v-model.number="item.quantity"
                label="+No."
                type="number"
                min="0.1"
                step="0.1"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="quantity-input"
                rounded="lg"
              />

              <v-select
                v-model="item.measurement"
                :items="measurements"
                label="+Measurement"
                variant="outlined"
                density="compact"
                hide-details="auto"
                placeholder="Select"
                class="measurement-select"
                rounded="lg"
              />

              <v-btn
                icon
                variant="text"
                size="small"
                color="grey-darken-1"
                @click="removeFoodItem(index, oidx)"
              >
                <v-icon size="20">mdi-close</v-icon>
              </v-btn>
            </div>

            <div class="add-actions d-flex">
              <span class="pa-0 text-none btnText" @click="$emit('add-item', meal.id, oidx)">
                +Add Item
              </span>
            </div>
          </div>
        </template>

        <template v-else>
          <div
            v-for="(item, index) in meal.items"
            :key="index"
            class="food-item d-flex align-center"
          >
            <div class="food-name flex-grow-1 text-body-1 font-weight-medium">
              <v-combobox
                v-model="item.name"
                :items="foodSuggestions"
                :custom-filter="foodNameFilter"
                placeholder="Enter food name (e.g. Idli)"
                variant="outlined"
                density="compact"
                hide-details="auto"
                rounded="lg"
                class="food-name-input"
                clearable
              />
            </div>

            <v-text-field
              v-model.number="item.quantity"
              label="+No."
              type="number"
              min="0.1"
              step="0.1"
              variant="outlined"
              density="compact"
              hide-details="auto"
              class="quantity-input"
              rounded="lg"
            />

            <v-select
              v-model="item.measurement"
              :items="measurements"
              label="+Measurement"
              variant="outlined"
              density="compact"
              hide-details="auto"
              placeholder="Select"
              class="measurement-select"
              rounded="lg"
            />

            <v-btn
              icon
              variant="text"
              size="small"
              color="grey-darken-1"
              @click="removeFoodItem(index)"
            >
              <v-icon size="20">mdi-close</v-icon>
            </v-btn>
          </div>

          <div
            v-if="!meal.items || meal.items.length === 0"
            class="food-item-placeholder d-flex align-center gap-3 mb-4 pa-3 smallCommanBox"
          >
            <span class="addItems" @click="$emit('add-item', meal.id)"> + Add item </span>

            <v-text-field
              disabled
              label="+No."
              variant="outlined"
              density="compact"
              hide-details="auto"
              rounded="lg"
              style="max-width: 100px"
            />

            <v-select
              disabled
              :items="measurements"
              label="+Measurement"
              variant="outlined"
              density="compact"
              hide-details="auto"
              rounded="lg"
              style="max-width: 160px"
            />
          </div>

          <div v-if="meal.items && meal.items.length > 0" class="add-actions d-flex">
            <span class="pa-0 text-none btnText" @click="$emit('add-item', meal.id)">
              +Add Item
            </span>
          </div>
        </template>
      </div>

      <div v-if="meal.items.length > 0" class="totals-row mt-1 text-caption">
        <span class="font-weight-medium">Total:</span>
        <span class="ml-3 protein">P {{ totalProtein }}g</span>
        <span class="ml-3 carbs">C {{ totalCarbs }}g</span>
        <span class="ml-3 fat">F {{ totalFat }}g</span>
        <span class="ml-3 fiber">Fib {{ totalFiber }}g</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  meal: {
    type: Object,
    required: true,
    default: () => ({
      title: 'Meal',
      time: '',
      items: [],
    }),
  },
  day: {
    type: String,
    default: '',
  },
  foodSuggestions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['add-item', 'add-option', 'repeat-meal', 'update:meal'])

const timeDialog = ref(false)
const tempTime = ref('')

function openTimeDialog() {
  tempTime.value = props.meal.time || ''
  timeDialog.value = true
}

function saveMealTime() {
  if (tempTime.value.trim()) {
    emit('update:meal', {
      ...props.meal,
      time: tempTime.value.trim(),
    })
  }
  timeDialog.value = false
}

const measurements = ref([
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
])

function doesMatchByInitials(value = '', query = '') {
  if (!value || !query) return false

  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toLowerCase()

  return initials.includes(query.toLowerCase())
}

function foodNameFilter(itemTitle, queryText, item) {
  const query = (queryText || '').toString().trim().toLowerCase()
  if (!query) return true

  const rawValue = item?.raw ?? itemTitle
  const title = (rawValue || '').toString().toLowerCase()

  return title.includes(query) || doesMatchByInitials(title, query)
}

function removeFoodItem(index, optionIndex) {
  // when inside an option, update that option's items
  const updated = { ...props.meal }
  if (optionIndex !== undefined && optionIndex !== null) {
    updated.options = updated.options || []
    if (updated.options[optionIndex]) {
      updated.options[optionIndex].items = updated.options[optionIndex].items.filter(
        (_, i) => i !== index,
      )
    }
  } else {
    updated.items = updated.items.filter((_, i) => i !== index)
  }
  emit('update:meal', updated)
}

function removeOption(optionIndex) {
  const updated = { ...props.meal }
  updated.options = (updated.options || []).filter((_, i) => i !== optionIndex)
  emit('update:meal', updated)
}

function sumMacro(field) {
  let sum = 0
  ;(props.meal.items || []).forEach((item) => {
    sum += Number(item[field]) || 0
  })
  ;(props.meal.options || []).forEach((opt) => {
    ;(opt.items || []).forEach((item) => {
      sum += Number(item[field]) || 0
    })
  })
  return sum.toFixed(1)
}

const totalProtein = computed(() => sumMacro('protein'))
const totalCarbs = computed(() => sumMacro('carbs'))
const totalFat = computed(() => sumMacro('fat'))
const totalFiber = computed(() => sumMacro('fiber'))
</script>

<style scoped>
.add-time-btn {
  text-transform: none;
  font-size: 14px;
  letter-spacing: 0;
  padding: 0 4px !important;
  text-decoration: underline;
}

.time-text {
  color: #424242;
  font-size: 14px;
}

.edit-time-btn {
  margin-left: 2px !important;
}

.meal-header-actions {
  justify-content: flex-end;
}

.food-name {
  min-width: 140px;
}

.quantity-input {
  max-width: 90px;
}

.measurement-select {
  max-width: 150px;
}

.add-item-button {
  border-style: dashed;
  text-transform: none;
  font-weight: 500;
}

.add-actions {
  padding-left: 16px;
}

.add-actions .v-btn {
  font-size: 14px;
  letter-spacing: normal;
  min-height: 32px;
}

.quantity-input {
  max-width: 85px;
}

.measurement-select {
  max-width: 145px;
}

.totals-row {
  color: #616161;
  padding: 0 16px;
}

.protein {
  color: #2e7d32;
}
.carbs {
  color: #1976d2;
}
.fat {
  color: #e65100;
}
.fiber {
  color: #6a1b9a;
}
</style>
