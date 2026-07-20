<template>
  <div class="schedule-sidebar">
    <v-menu v-model="calendarMenuOpen" :close-on-content-click="false" location="end" offset="8">
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          icon
          variant="text"
          size="small"
          class="schedule-sidebar__btn"
          aria-label="Open calendar"
          type="button"
        >
          <v-icon>mdi-calendar-month</v-icon>
        </v-btn>
      </template>
      <v-date-picker
        :model-value="modelValue"
        color="primary"
        show-adjacent-months
        @update:model-value="onDatePicked"
      />
    </v-menu>

    <v-menu
      v-model="filterMenuOpen"
      :close-on-content-click="false"
      location="end"
      offset="8"
      :z-index="4000"
    >
      <template #activator="{ props: filterActivator }">
        <v-btn
          v-bind="filterActivator"
          icon
          variant="text"
          size="small"
          class="schedule-sidebar__btn"
          :class="{ 'schedule-sidebar__btn--filter-on': filterAccent }"
          aria-label="Filter by appointment type"
          type="button"
        >
          <v-icon>mdi-filter-variant</v-icon>
        </v-btn>
      </template>
      <v-sheet class="schedule-filter-sheet pa-4" elevation="6" rounded="xl" width="220">
        <div class="schedule-filter-sheet__title text-caption text-medium-emphasis mb-3">
          Type of appointment
        </div>
        <div class="schedule-filter-sheet__chips d-flex flex-column ga-2">
          <button
            v-for="opt in filterOptions"
            :key="opt.value"
            type="button"
            class="schedule-filter-chip"
            :class="[
              `schedule-filter-chip--${opt.appearance}`,
              { 'schedule-filter-chip--muted': !isSelected(opt.value) },
            ]"
            @click="toggleType(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </v-sheet>
    </v-menu>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  hasActiveTypeFilter,
  SCHEDULE_APPOINTMENT_FILTER_OPTIONS,
} from '@/constants/scheduleAppointmentFilters'

const props = defineProps({
  /** Selected day as `YYYY-MM-DD` (Vuetify date picker format). */
  modelValue: { type: String, default: null },
  /** Which types are on. Empty = show all meetings; 1–2 selected = `types=` filter; all three = show all. */
  selectedTypes: {
    type: Array,
    default: () => [],
  },
})

const filterAccent = computed(() => hasActiveTypeFilter(props.selectedTypes))

const emit = defineEmits(['update:modelValue', 'update:selectedTypes'])

const filterOptions = SCHEDULE_APPOINTMENT_FILTER_OPTIONS

const calendarMenuOpen = ref(false)
const filterMenuOpen = ref(false)

function onDatePicked(val) {
  emit('update:modelValue', val)
  calendarMenuOpen.value = false
}

function isSelected(value) {
  return props.selectedTypes.includes(value)
}

function toggleType(value) {
  const next = [...props.selectedTypes]
  const idx = next.indexOf(value)
  if (idx >= 0) {
    next.splice(idx, 1)
  } else {
    next.push(value)
  }
  emit('update:selectedTypes', next)
}
</script>

<style scoped>
.schedule-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
  align-self: flex-start;
}

.schedule-sidebar__btn {
  color: rgb(var(--v-theme-primary)) !important;
}

.schedule-sidebar__btn--filter-on {
  background: rgba(138, 34, 111, 0.12) !important;
  border-radius: 999px;
}

.schedule-filter-sheet {
  border: 1px solid rgba(148, 163, 184, 0.25) !important;
}

.schedule-filter-sheet__title {
  font-size: 12px !important;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.schedule-filter-chip {
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: center;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  transition:
    opacity 0.15s ease,
    transform 0.12s ease;
}

.schedule-filter-chip:hover {
  transform: translateY(-1px);
}

.schedule-filter-chip--initial {
  background: #f1f8e9;
  color: #558b2f;
}

.schedule-filter-chip--followUp {
  background: #e3f2fd;
  color: #1565c0;
}

.schedule-filter-chip--weekly {
  background: #ffe0b2;
  color: #e65100;
}

.schedule-filter-chip--muted {
  opacity: 0.42;
}
</style>
