<template>
  <div class="food-log-detail-item-row">
    <div class="food-log-detail-item-row__thumb">
      <img
        v-if="showImage"
        :src="resolvedImageUrl"
        :alt="name"
        class="food-log-detail-item-row__img"
        loading="lazy"
        @error="onImgError"
      />
      <div v-else class="food-log-detail-item-row__thumb-placeholder" aria-hidden="true" />
    </div>
    <div class="food-log-detail-item-row__text">
      <div v-if="quantityLabel" class="food-log-detail-item-row__qty">{{ quantityLabel }}</div>
      <div class="food-log-detail-item-row__name">{{ name }}</div>
    </div>
    <div class="food-log-detail-item-row__cal">{{ caloriesLabel }}</div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { resolveAbsoluteImageUrl } from '@/utils/foodLogMealHelpers'

const props = defineProps({
  name: { type: String, default: '' },
  quantityLabel: { type: String, default: '' },
  caloriesLabel: { type: String, default: '—' },
  imageUrl: { type: String, default: '' },
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
</script>

<style scoped>
.food-log-detail-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.food-log-detail-item-row:last-child {
  border-bottom: none;
  padding-bottom: 4px;
}

.food-log-detail-item-row__thumb {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.04);
}

.food-log-detail-item-row__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.food-log-detail-item-row__thumb-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #eceff1 0%, #e0e0e0 100%);
}

.food-log-detail-item-row__text {
  flex: 1;
  min-width: 0;
}

.food-log-detail-item-row__qty {
  margin-bottom: 2px;
  font-size: 0.8125rem;
  color: #757575;
  line-height: 1.35;
}

.food-log-detail-item-row__name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
}

.food-log-detail-item-row__cal {
  flex-shrink: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #424242;
  text-align: right;
}
</style>
