<template>
  <div class="schedule-toolbar">
    <v-btn
      class="schedule-toolbar__add"
      icon
      variant="flat"
      size="small"
      rounded="lg"
      color="primary"
      aria-label="Add appointment"
      @click="$emit('add')"
    >
      <v-icon size="22">mdi-plus</v-icon>
    </v-btn>

    <div class="schedule-toolbar__nav">
      <button
        type="button"
        class="schedule-toolbar__chev"
        aria-label="Previous"
        @click="$emit('prev')"
      >
        <v-icon size="20">mdi-chevron-left</v-icon>
      </button>
      <span class="schedule-toolbar__title">{{ title }}</span>
      <button type="button" class="schedule-toolbar__chev" aria-label="Next" @click="$emit('next')">
        <v-icon size="20">mdi-chevron-right</v-icon>
      </button>
    </div>

    <div class="schedule-toolbar__segment" role="tablist">
      <button
        v-for="opt in viewOptions"
        :key="opt.value"
        type="button"
        role="tab"
        class="schedule-toolbar__tab"
        :class="{ 'schedule-toolbar__tab--active': modelValue === opt.value }"
        @click="$emit('update:modelValue', opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  modelValue: { type: String, required: true },
})

defineEmits(['add', 'prev', 'next', 'update:modelValue'])

const viewOptions = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
]
</script>

<style scoped>
.schedule-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.schedule-toolbar__add {
  background: rgba(138, 34, 111, 0.12) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.schedule-toolbar__nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
  min-width: 200px;
}

.schedule-toolbar__title {
  font-weight: 600;
  font-size: 15px;
  color: rgb(var(--v-theme-primary));
  text-align: center;
}

.schedule-toolbar__chev {
  border: none;
  background: transparent;
  padding: 4px;
  cursor: pointer;
  border-radius: 999px;
  color: rgb(var(--v-theme-primary));
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.schedule-toolbar__chev:hover {
  background: rgba(138, 34, 111, 0.08);
}

.schedule-toolbar__segment {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: rgba(138, 34, 111, 0.1);
  gap: 4px;
}

.schedule-toolbar__tab {
  border: none;
  background: transparent;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: #64748b;
}

.schedule-toolbar__tab--active {
  background: #fff;
  color: rgb(var(--v-theme-primary));
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}
</style>
