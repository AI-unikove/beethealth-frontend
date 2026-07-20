<template>
  <article class="food-log-meal-detail-card" :class="toneClass">
    <div class="food-log-meal-detail-card__header">
      <div class="food-log-meal-detail-card__head-text">
        <h3 class="food-log-meal-detail-card__title">{{ detail.displayTitle }}</h3>
        <p class="food-log-meal-detail-card__calories">{{ detail.caloriesLabel }}</p>
      </div>
      <span v-if="detail.badgeText" class="food-log-meal-detail-card__badge" :class="badgeClass">{{
        detail.badgeText
      }}</span>
    </div>

    <div class="food-log-meal-detail-card__lines">
      <FoodLogMealDetailItemRow
        v-for="(line, idx) in detail.lines"
        :key="idx"
        :name="line.name"
        :quantity-label="line.quantityLabel"
        :calories-label="line.caloriesLabel"
        :image-url="line.imageUrl"
      />
    </div>

    <div v-if="detail.footerNote" class="food-log-meal-detail-card__footer-note">
      <span class="food-log-meal-detail-card__footer-icon" aria-hidden="true">ℹ</span>
      {{ detail.footerNote }}
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import FoodLogMealDetailItemRow from './FoodLogMealDetailItemRow.vue'

const props = defineProps({
  detail: {
    type: Object,
    required: true,
  },
})

const toneClass = computed(() => `food-log-meal-detail-card--tone-${props.detail.tone || 'other'}`)

const badgeClass = computed(() =>
  props.detail.badgeVariant === 'increased-fat'
    ? 'food-log-meal-detail-card__badge--fat'
    : 'food-log-meal-detail-card__badge--good',
)
</script>

<style scoped>
.food-log-meal-detail-card {
  border-radius: 20px;
  padding: 16px 18px 18px;
  margin-bottom: 16px;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.06);
}

.food-log-meal-detail-card--tone-breakfast {
  background: linear-gradient(180deg, #f7f4e4 0%, #f3efe0 100%);
}

.food-log-meal-detail-card--tone-snack {
  background: linear-gradient(180deg, #f4f6ea 0%, #eef1e4 100%);
}

.food-log-meal-detail-card--tone-lunch {
  background: linear-gradient(180deg, #e8f0f8 0%, #e3ebf5 100%);
}

.food-log-meal-detail-card--tone-dinner {
  background: linear-gradient(180deg, #fceef2 0%, #f8e8ec 100%);
}

.food-log-meal-detail-card--tone-other {
  background: linear-gradient(180deg, #f4f6f8 0%, #eef1f4 100%);
}

.food-log-meal-detail-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 4px;
}

.food-log-meal-detail-card__head-text {
  min-width: 0;
}

.food-log-meal-detail-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.food-log-meal-detail-card__calories {
  margin: 4px 0 0;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #888;
  line-height: 1.35;
}

.food-log-meal-detail-card__badge {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  white-space: nowrap;
}

.food-log-meal-detail-card__badge--fat {
  background: #fff;
  color: #1565c0;
  border: 1px solid rgba(21, 101, 192, 0.25);
}

.food-log-meal-detail-card__badge--good {
  background: #fff;
  color: #558b2f;
  border: 1px solid rgba(85, 139, 47, 0.28);
}

.food-log-meal-detail-card__lines {
  margin-top: 4px;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 14px;
  padding: 4px 12px 8px;
}

.food-log-meal-detail-card__footer-note {
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.8125rem;
  color: #1565c0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.4;
}

.food-log-meal-detail-card__footer-icon {
  flex-shrink: 0;
  font-style: normal;
  font-size: 0.875rem;
}
</style>
