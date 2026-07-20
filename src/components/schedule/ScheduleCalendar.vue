<template>
  <v-container fluid class="schedule-root pa-4 pa-md-6">
    <ScheduleToolbar
      v-model="view"
      :title="headerLabel"
      @add="onAdd"
      @prev="goPrev"
      @next="goNext"
    />

    <div class="schedule-body">
      <ScheduleSidebar
        v-model="schedulePickerDate"
        v-model:selected-types="selectedAppointmentTypes"
      />

      <v-sheet class="schedule-card flex-grow-1 rounded-xl pa-4 pa-md-6" elevation="0">
        <v-progress-linear v-if="loading" indeterminate color="primary" height="3" class="mb-3" />

        <v-alert v-if="error" type="warning" variant="tonal" density="compact" class="mb-4">
          Could not load appointments. Verify the API or try again.
        </v-alert>

        <div v-if="view !== SCHEDULE_VIEWS.MONTH" class="schedule-scroll">
          <ScheduleTimeline
            :column-dates="columnDates"
            :appointments="appointments"
            :now="clockNow"
          />
        </div>
        <ScheduleMonthGrid v-else :cursor-date="cursorDate" :appointments="appointments" />
      </v-sheet>
    </div>

    <ScheduleMeetingDialog v-model="showScheduleDialog" @saved="reloadAppointments" />
  </v-container>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { SCHEDULE_VIEWS } from '@/constants/schedule'
import { useScheduleAppointments } from '@/composables/useScheduleAppointments'
import { useScheduleNavigation } from '@/composables/useScheduleNavigation'
import ScheduleMeetingDialog from '@/components/common/ScheduleMeetingDialog.vue'
import { startOfDay } from '@/utils/scheduleDates'
import ScheduleMonthGrid from './ScheduleMonthGrid.vue'
import ScheduleSidebar from './ScheduleSidebar.vue'
import ScheduleTimeline from './ScheduleTimeline.vue'
import ScheduleToolbar from './ScheduleToolbar.vue'

const { cursorDate, view, range, headerLabel, columnDates, goPrev, goNext } =
  useScheduleNavigation()

/** Empty = show all meetings; one or two types = filter; all three = show all (no `types` param). */
const selectedAppointmentTypes = ref([])

const {
  appointments,
  loading,
  error,
  reload: reloadAppointments,
} = useScheduleAppointments(range, selectedAppointmentTypes)

const clockNow = ref(new Date())
const showScheduleDialog = ref(false)

/** Syncs sidebar date picker with `cursorDate` (YYYY-MM-DD). */
const schedulePickerDate = computed({
  get() {
    const d = cursorDate.value
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  },
  set(val) {
    if (val == null || val === '') return
    const parsed = parsePickerDate(val)
    cursorDate.value = startOfDay(parsed)
  },
})

function parsePickerDate(val) {
  if (val instanceof Date) return val
  if (typeof val === 'string') {
    const parts = val.split('-').map(Number)
    if (parts.length >= 3 && !Number.isNaN(parts[0])) {
      return new Date(parts[0], parts[1] - 1, parts[2])
    }
  }
  return new Date()
}

let tickId
onMounted(() => {
  clockNow.value = new Date()
  tickId = setInterval(() => {
    clockNow.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  clearInterval(tickId)
})

function onAdd() {
  showScheduleDialog.value = true
}
</script>

<style scoped>
.schedule-root {
  background: #f1f5f9;
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.schedule-body {
  display: flex;
  gap: 16px;
  align-items: stretch;
  margin-top: 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.schedule-card {
  background: #fff !important;
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06) !important;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.schedule-scroll {
  overflow-x: auto;
  flex: 1;
  min-height: 0;
}
</style>
