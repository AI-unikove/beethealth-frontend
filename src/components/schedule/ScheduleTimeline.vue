<template>
  <div class="timeline">
    <div class="timeline__corner" />

    <div class="timeline__headers" :style="gridTemplateColumns">
      <div v-for="col in columnsLayout" :key="col.key" class="timeline__head">
        {{ col.weekdayShort }}
      </div>
    </div>

    <div class="timeline__body-scroll">
      <div class="timeline__times">
        <div
          v-for="(lbl, idx) in timeLabels"
          :key="idx"
          class="timeline__time-row"
          :style="{ height: `${slotHeight}px` }"
        >
          {{ lbl }}
        </div>
      </div>

      <div class="timeline__cols-shell">
        <div class="timeline__cols" :style="gridTemplateColumns">
          <div v-for="col in columnsLayout" :key="col.key + '-c'" class="timeline__col">
            <div
              class="timeline__col-bg"
              :style="{
                height: `${timelineHeight}px`,
                '--slot': `${slotHeight}px`,
              }"
            >
              <ScheduleEventCard
                v-for="(ev, evIdx) in col.events"
                :key="`${col.key}-${evIdx}-${ev.startTime}`"
                :client-name="ev.clientName"
                :time-range="ev.timeRange"
                :type-label="ev.type"
                :appearance="ev.appearance"
                :top="ev.layout.top"
                :height="ev.layout.height"
                :lane="ev.lane"
                :lane-count="ev.laneCount"
              />
            </div>
          </div>
        </div>

        <div
          v-if="currentLineTop !== null"
          class="timeline__now"
          :style="{ top: `${currentLineTop}px` }"
        >
          <span class="timeline__now-dot" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { SCHEDULE_SLOT_HEIGHT_PX } from '@/constants/schedule'
import {
  formatCompactTimeRange,
  generateTimeSlotLabels,
  isSameLocalDay,
} from '@/utils/scheduleDates'
import { resolveAppointmentAppearance } from '@/utils/scheduleAppearance'
import {
  assignLanes,
  filterEventsForDay,
  layoutEventBlock,
  timelineHeightPx,
  topPxForInstant,
} from '@/utils/scheduleLayout'
import ScheduleEventCard from './ScheduleEventCard.vue'

const props = defineProps({
  columnDates: { type: Array, default: () => [] },
  appointments: { type: Array, default: () => [] },
  now: { type: Object, default: () => new Date() },
})

const slotHeight = SCHEDULE_SLOT_HEIGHT_PX
const timelineHeight = timelineHeightPx()
const timeLabels = generateTimeSlotLabels()

const gridTemplateColumns = computed(() => {
  const n = Math.max(props.columnDates.length, 1)
  return { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }
})

const columnsLayout = computed(() => {
  return props.columnDates.map((dayDate) => {
    const raw = filterEventsForDay(props.appointments, dayDate)
    const withLanes = assignLanes(raw)
    const events = withLanes
      .map((ev) => {
        const layout = layoutEventBlock(ev, dayDate)
        if (!layout) return null
        return {
          ...ev,
          layout,
          timeRange: formatCompactTimeRange(ev.startTime, ev.endTime),
          appearance: resolveAppointmentAppearance(ev.type),
        }
      })
      .filter(Boolean)

    return {
      key: dayDate.valueOf(),
      weekdayShort: dayDate.toLocaleDateString(undefined, { weekday: 'short' }),
      events,
    }
  })
})

const currentLineTop = computed(() => {
  const n = props.now instanceof Date ? props.now : new Date(props.now)
  const visible = props.columnDates.some((d) => isSameLocalDay(new Date(d), n))
  if (!visible) return null
  return topPxForInstant(n)
})
</script>

<style scoped>
.timeline {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  column-gap: 4px;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.timeline__corner {
  grid-column: 1;
  grid-row: 1;
}

.timeline__headers {
  grid-column: 2;
  grid-row: 1;
  display: grid;
  gap: 0;
  padding-bottom: 8px;
}

.timeline__head {
  text-align: center;
  font-weight: 700;
  font-size: 13px;
  color: rgb(var(--v-theme-primary));
}

.timeline__body-scroll {
  grid-column: 1 / -1;
  grid-row: 2;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  column-gap: 4px;
  align-items: start;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.timeline__times {
  padding-top: 0;
}

.timeline__time-row {
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-right: 6px;
}

.timeline__cols-shell {
  position: relative;
  min-width: 0;
}

.timeline__cols {
  display: grid;
  gap: 0;
}

.timeline__col-bg {
  position: relative;
  border-left: 1px solid rgba(148, 163, 184, 0.35);
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent calc(var(--slot, 56px) - 1px),
    rgba(148, 163, 184, 0.28) calc(var(--slot, 56px) - 1px),
    rgba(148, 163, 184, 0.28) var(--slot, 56px)
  );
}

.timeline__now {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: rgb(var(--v-theme-primary));
  pointer-events: none;
  z-index: 2;
}

.timeline__now-dot {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translate(-60%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(138, 34, 111, 0.2);
}
</style>
