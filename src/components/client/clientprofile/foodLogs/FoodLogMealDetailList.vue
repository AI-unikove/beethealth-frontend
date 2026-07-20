<template>
  <div class="food-log-meal-detail-list">
    <FoodLogMealDetailCard v-for="card in cards" :key="card.cardKey" :detail="card" />
    <FoodLogSupplementsSection :supplements="supplements" />
  </div>
</template>

<script setup>
import FoodLogMealDetailCard from './FoodLogMealDetailCard.vue'
import FoodLogSupplementsSection from './FoodLogSupplementsSection.vue'

defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
  supplements: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.food-log-meal-detail-list {
  padding-top: 4px;
}
</style>
