<template>
  <div class="food-logs-weekly-table-wrap">
    <v-table class="food-logs-weekly-table" density="compact" hover>
      <thead>
        <tr class="meal-row-main">
          <th rowspan="2" class="day-col text-left"><span class="mealHr">Day</span></th>
          <th v-for="slot in mealSlots" :key="slot" colspan="2" class="meal-header text-center">
            <span class="mealHr">{{ slot }}</span>
          </th>
        </tr>
        <tr class="meal-row-sub">
          <template v-for="slot in mealSlots" :key="'sub-' + slot">
            <th class="sub-header">Quant.</th>
            <th class="sub-header">Dish</th>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td class="day-cell font-weight-medium">
            <span class="day-text">{{ row.dayLabel }}</span>
          </td>
          <!-- One cell per meal (colspan 2) so Quant.|Dish align with thead; inner 2-col grid = side-by-side -->
          <td
            v-for="(slot, mi) in mealSlots"
            :key="row.id + '-meal-' + slot"
            colspan="2"
            class="cell-multiline meal-slot-col text-body-2"
          >
            <div class="meal-slot-grid">
              <template v-for="li in lineIndices(row)" :key="row.id + '-band-' + mi + '-' + li">
                <div
                  class="meal-slot-line meal-slot-line--qty"
                  :class="{ 'meal-slot-cell--band-border': li > 0 }"
                >
                  {{ row.cells[mi]?.lines?.[li]?.qty ?? '' }}
                </div>
                <div
                  class="meal-slot-line meal-slot-line--dish"
                  :class="{ 'meal-slot-cell--band-border': li > 0 }"
                >
                  <template v-if="row.cells[mi]?.lines?.[li]">
                    <v-tooltip
                      v-if="dishNeedsTooltip(row.cells[mi].lines[li].dish)"
                      location="top"
                      content-class="food-logs-dish-tooltip-overlay"
                      :max-width="420"
                    >
                      <template #activator="{ props: dishTipProps }">
                        <span
                          v-bind="dishTipProps"
                          class="meal-dish-text meal-dish-text--ellipsis"
                          :aria-label="String(row.cells[mi].lines[li].dish ?? '')"
                        >
                          {{ dishDisplayText(row.cells[mi].lines[li].dish) }}
                        </span>
                      </template>
                      <div class="meal-dish-tooltip-card">
                        {{ row.cells[mi].lines[li].dish }}
                      </div>
                    </v-tooltip>
                    <span v-else class="meal-dish-text">{{ row.cells[mi].lines[li].dish }}</span>
                  </template>
                </div>
              </template>
            </div>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td :colspan="emptyColspan" class="text-center text-medium-emphasis py-8">
            No weekly plan data available.
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mealSlots: {
    type: Array,
    default: () => [],
  },
  rows: {
    type: Array,
    default: () => [],
  },
})

const emptyColspan = computed(() => 1 + Math.max(0, props.mealSlots.length) * 2)

const DISH_DISPLAY_MAX_CHARS = 100

function dishDisplayText(dish) {
  const s = dish == null ? '' : String(dish)
  if (s.length <= DISH_DISPLAY_MAX_CHARS) return s
  return `${s.slice(0, DISH_DISPLAY_MAX_CHARS)}...`
}

function dishNeedsTooltip(dish) {
  return String(dish ?? '').length > DISH_DISPLAY_MAX_CHARS
}

function maxLinesForRow(row) {
  if (!row?.cells?.length) return 1
  return Math.max(1, ...row.cells.map((c) => (Array.isArray(c.lines) ? c.lines.length : 0)))
}

function lineIndices(row) {
  return Array.from({ length: maxLinesForRow(row) }, (_, i) => i)
}
</script>

<style scoped>
.meal-dish-text--ellipsis {
  cursor: help;
}
</style>

<style>
/*
  Tooltip content is teleported. Outer overlay is transparent; inner card matches food-log popover mockup.
*/
.food-logs-dish-tooltip-overlay {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  border: none !important;
  overflow: visible !important;
}

.meal-dish-tooltip-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow:
    0 4px 18px rgba(0, 0, 0, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.04);
  padding: 16px 20px;
  text-align: center;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.01em;
  max-width: min(400px, 92vw);
  word-break: break-word;
  white-space: pre-wrap;
}
</style>
