<template>
  <div class="schedule-event" :class="`schedule-event--${appearance}`" :style="cardStyle">
    <div class="schedule-event__name">{{ clientName }}</div>
    <div class="schedule-event__meta">{{ timeRange }}</div>
    <div class="schedule-event__type">{{ typeLabel }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  clientName: { type: String, default: '' },
  timeRange: { type: String, default: '' },
  typeLabel: { type: String, default: '' },
  appearance: { type: String, default: 'default' },
  top: { type: Number, required: true },
  height: { type: Number, required: true },
  lane: { type: Number, default: 0 },
  laneCount: { type: Number, default: 1 },
})

const cardStyle = computed(() => {
  const n = Math.max(1, props.laneCount)
  const lane = Math.min(Math.max(0, props.lane), n - 1)
  const gap = 3
  const w = `calc(${100 / n}% - ${gap}px)`
  const left = `calc(${(lane / n) * 100}% + ${gap / 2}px)`
  return {
    top: `${props.top}px`,
    height: `${props.height}px`,
    left,
    width: w,
  }
})
</script>

<style scoped>
.schedule-event {
  position: absolute;
  box-sizing: border-box;
  border-radius: 12px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  font-size: 12px;
  line-height: 1.25;
}

.schedule-event__name {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.schedule-event__meta,
.schedule-event__type {
  font-size: 11px;
  opacity: 0.92;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.schedule-event--followUp {
  background: #e3f2fd;
  color: #1565c0;
}

.schedule-event--initial {
  background: #f1f8e9;
  color: #558b2f;
}

.schedule-event--weekly {
  background: #ffe0b2;
  color: #e65100;
}

.schedule-event--default {
  background: #f3e5f5;
  color: #6a1b9a;
}
</style>
