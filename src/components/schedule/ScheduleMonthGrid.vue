<template>
  <div class="month-grid">
    <div class="month-grid__weekdays">
      <span v-for="d in weekdayLabels" :key="d">{{ d }}</span>
    </div>

    <div class="month-grid__cells">
      <div
        v-for="cell in cells"
        :key="cell.key"
        class="month-grid__cell"
        :class="{
          'month-grid__cell--muted': !cell.inMonth,
          'month-grid__cell--today': cell.isToday,
        }"
      >
        <span class="month-grid__num">{{ cell.day }}</span>
        <div class="month-grid__pills">
          <div
            v-for="pill in cell.visiblePills"
            :key="pill.rowKey"
            class="month-pill"
            :class="`month-pill--${pill.appearance}`"
            :title="pill.fullTitle"
          >
            <span class="month-pill__time">{{ pill.timeLabel }}</span>
            <span class="month-pill__name">{{ pill.clientName }}</span>
          </div>
          <div v-if="cell.moreCount > 0" class="month-grid__more">+{{ cell.moreCount }} more</div>
        </div>
      </div>
    </div>

    <div class="month-grid__legend" aria-hidden="true">
      <span class="month-legend month-legend--initial">
        <span class="month-legend__swatch" /> Initial Consultation
      </span>
      <span class="month-legend month-legend--follow">
        <span class="month-legend__swatch" /> Follow Up
      </span>
      <span class="month-legend month-legend--weekly">
        <span class="month-legend__swatch" /> Weekly Review
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  addDays,
  formatMonthPillTime,
  isSameLocalDay,
  startOfMonth,
  startOfWeekSunday,
} from '@/utils/scheduleDates'
import { resolveAppointmentAppearance } from '@/utils/scheduleAppearance'

/** Max stacked pills per cell before "+N more". */
const MAX_PILLS = 4

const props = defineProps({
  cursorDate: { type: Date, required: true },
  appointments: { type: Array, default: () => [] },
})

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dayKey(d) {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

const appointmentsByDay = computed(() => {
  const map = {}
  for (const a of props.appointments) {
    const k = dayKey(new Date(a.startTime))
    if (!map[k]) map[k] = []
    map[k].push(a)
  }
  for (const key of Object.keys(map)) {
    map[key].sort((x, y) => x.startTime - y.startTime)
  }
  return map
})

const cells = computed(() => {
  const cur = props.cursorDate
  const first = startOfMonth(cur)
  const gridStart = startOfWeekSunday(first)
  const today = new Date()
  const byDay = appointmentsByDay.value
  const out = []

  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i)
    const inMonth = d.getMonth() === cur.getMonth()
    const k = dayKey(d)
    const list = byDay[k] ?? []

    const pills = list.map((a, idx) => {
      const appearance = resolveAppointmentAppearance(a.type)
      const clientName = String(a.clientName ?? '').trim() || 'Appointment'
      const timeLabel = formatMonthPillTime(a.startTime)
      const rowKey = `${a.id || k}-${idx}-${a.startTime}`
      return {
        rowKey,
        appearance,
        timeLabel,
        clientName,
        fullTitle: `${timeLabel} ${clientName}`,
      }
    })

    const visiblePills = pills.slice(0, MAX_PILLS)
    const moreCount = Math.max(0, pills.length - MAX_PILLS)

    out.push({
      key: `${k}-${i}`,
      day: d.getDate(),
      inMonth,
      isToday: isSameLocalDay(d, today),
      visiblePills,
      moreCount,
    })
  }
  return out
})
</script>

<style scoped>
.month-grid {
  width: 100%;
}

.month-grid__weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
  margin-bottom: 10px;
  font-size: 11px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  text-align: center;
}

.month-grid__cells {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.month-grid__cell {
  display: flex;
  flex-direction: column;
  min-height: 118px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.28);
  padding: 6px 5px 5px;
  min-width: 0;
}

.month-grid__cell--muted {
  opacity: 0.42;
}

.month-grid__cell--today {
  border-color: rgba(138, 34, 111, 0.45);
  box-shadow: 0 0 0 1px rgba(138, 34, 111, 0.12);
}

.month-grid__num {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  flex-shrink: 0;
}

.month-grid__pills {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 4px;
  flex: 1;
  min-height: 0;
}

.month-pill {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 0;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.25;
  padding: 4px 7px;
  border-radius: 10px;
  cursor: default;
}

.month-pill__time {
  flex-shrink: 0;
  text-transform: lowercase;
}

.month-pill__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.month-pill--followUp {
  background: #e3f2fd;
  color: #1565c0;
}

.month-pill--initial {
  background: #f1f8e9;
  color: #558b2f;
}

.month-pill--weekly {
  background: #ffe0b2;
  color: #e65100;
}

.month-pill--default {
  background: #f3e5f5;
  color: #6a1b9a;
}

.month-grid__more {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  padding: 2px 4px 0;
}

.month-grid__legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.25);
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.month-legend {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.month-legend__swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
}

.month-legend--initial .month-legend__swatch {
  background: #f1f8e9;
  border: 1px solid rgba(85, 139, 47, 0.35);
}

.month-legend--follow .month-legend__swatch {
  background: #e3f2fd;
  border: 1px solid rgba(21, 101, 192, 0.25);
}

.month-legend--weekly .month-legend__swatch {
  background: #ffe0b2;
  border: 1px solid rgba(230, 81, 0, 0.25);
}
</style>
