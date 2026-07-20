<template>
  <article class="food-log-hero-card" :class="toneClass">
    <div class="food-log-hero-card__header">
      <div class="food-log-hero-card__head-text">
        <h3 class="food-log-hero-card__title">{{ title }}</h3>
        <p class="food-log-hero-card__calories">{{ caloriesLabel }}</p>
        <p v-if="quantityLine" class="food-log-hero-card__quantity">{{ quantityLine }}</p>
      </div>
      <span v-if="badgeText" class="food-log-hero-card__badge" :class="badgeClass">{{
        badgeText
      }}</span>
    </div>

    <div v-if="showImage" class="food-log-hero-card__media">
      <img
        :src="resolvedImageUrl"
        :alt="title"
        class="food-log-hero-card__img"
        loading="lazy"
        @error="onImgError"
      />
    </div>

    <div v-if="footerNote" class="food-log-hero-card__footer-note">
      <span class="food-log-hero-card__footer-icon" aria-hidden="true">ℹ</span>
      {{ footerNote }}
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { resolveAbsoluteImageUrl } from '@/utils/foodLogMealHelpers'

const props = defineProps({
  title: { type: String, default: '' },
  caloriesLabel: { type: String, default: '—' },
  quantityLine: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  /** 'breakfast' | 'snack' | 'lunch' | 'dinner' | 'other' */
  tone: { type: String, default: 'other' },
  badgeText: { type: String, default: '' },
  /** 'increased-fat' | 'looking-good' */
  badgeVariant: { type: String, default: 'looking-good' },
  footerNote: { type: String, default: '' },
})

const imageFailed = ref(false)

const resolvedImageUrl = computed(() => resolveAbsoluteImageUrl(props.imageUrl || ''))

const showImage = computed(() => Boolean(resolvedImageUrl.value) && !imageFailed.value)

watch(
  () => props.imageUrl,
  () => {
    imageFailed.value = false
  },
)

function onImgError() {
  imageFailed.value = true
}

const toneClass = computed(() => `food-log-hero-card--tone-${props.tone}`)

const badgeClass = computed(() =>
  props.badgeVariant === 'increased-fat'
    ? 'food-log-hero-card__badge--fat'
    : 'food-log-hero-card__badge--good',
)
</script>

<style scoped>
.food-log-hero-card {
  border-radius: 20px;
  padding: 16px 18px 18px;
  margin-bottom: 16px;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.06);
}

.food-log-hero-card--tone-breakfast {
  background: linear-gradient(180deg, #f7f4e4 0%, #f3efe0 100%);
}

.food-log-hero-card--tone-snack {
  background: linear-gradient(180deg, #f4f6ea 0%, #eef1e4 100%);
}

.food-log-hero-card--tone-lunch {
  background: linear-gradient(180deg, #e8f0f8 0%, #e3ebf5 100%);
}

.food-log-hero-card--tone-dinner {
  background: linear-gradient(180deg, #fceef2 0%, #f8e8ec 100%);
}

.food-log-hero-card--tone-other {
  background: linear-gradient(180deg, #f4f6f8 0%, #eef1f4 100%);
}

.food-log-hero-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.food-log-hero-card__head-text {
  min-width: 0;
}

.food-log-hero-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

/* Single line under title, e.g. "423 Kcal" — mockup: smaller, gray, regular weight */
.food-log-hero-card__calories {
  margin: 4px 0 0;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #888;
  line-height: 1.35;
}

.food-log-hero-card__quantity {
  margin: 6px 0 0;
  font-size: 0.8125rem;
  color: #616161;
}

.food-log-hero-card__badge {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  white-space: nowrap;
}

.food-log-hero-card__badge--fat {
  background: #fff;
  color: #1565c0;
  border: 1px solid rgba(21, 101, 192, 0.25);
}

.food-log-hero-card__badge--good {
  background: #fff;
  color: #558b2f;
  border: 1px solid rgba(85, 139, 47, 0.28);
}

.food-log-hero-card__media {
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.65);
}

.food-log-hero-card__img {
  display: block;
  width: 100%;
  min-height: 100px;
  max-height: 280px;
  object-fit: cover;
}

.food-log-hero-card__footer-note {
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

.food-log-hero-card__footer-icon {
  flex-shrink: 0;
  font-style: normal;
  font-size: 0.875rem;
}
</style>
