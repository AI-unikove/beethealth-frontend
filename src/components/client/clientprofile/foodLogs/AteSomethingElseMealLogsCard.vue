<template>
  <div v-if="entries.length" class="ate-something-else-stack">
    <FoodLogMealHeroCard
      v-for="entry in entries"
      :key="entry.id"
      :title="entry.displayTitle"
      :calories-label="formatAteSomethingElseCalories(entry.calories)"
      :quantity-line="quantityLineFor(entry)"
      :image-url="entry.imageUrl"
      :tone="entry.tone"
      badge-text="Looking good"
      badge-variant="looking-good"
    />
  </div>
</template>

<script setup>
import FoodLogMealHeroCard from './FoodLogMealHeroCard.vue'
import { formatAteSomethingElseCalories } from '@/utils/ateSomethingElseMealLogs'

defineProps({
  entries: {
    type: Array,
    default: () => [],
  },
})

function quantityLineFor(entry) {
  if (!entry?.quantityLabel || entry.quantityLabel === '—') return ''
  return `Quantity: ${entry.quantityLabel}`
}
</script>

<style scoped>
.ate-something-else-stack {
  display: block;
}
</style>
