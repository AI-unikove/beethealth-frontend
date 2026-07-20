import { computed, ref } from 'vue'
import { SCHEDULE_VIEWS } from '@/constants/schedule'
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeekSaturday,
  formatDayTitle,
  formatMonthYear,
  formatWeekRangeLabel,
  startOfDay,
  startOfMonth,
  startOfWeekSunday,
} from '@/utils/scheduleDates'

export function useScheduleNavigation(initialView = SCHEDULE_VIEWS.WEEK) {
  const cursorDate = ref(new Date())
  const view = ref(initialView)

  const range = computed(() => {
    const c = cursorDate.value
    const v = view.value
    if (v === SCHEDULE_VIEWS.DAY) {
      return { from: startOfDay(c), to: endOfDay(c) }
    }
    if (v === SCHEDULE_VIEWS.WEEK) {
      return { from: startOfWeekSunday(c), to: endOfWeekSaturday(c) }
    }
    return { from: startOfMonth(c), to: endOfMonth(c) }
  })

  const headerLabel = computed(() => {
    const c = cursorDate.value
    const v = view.value
    if (v === SCHEDULE_VIEWS.DAY) return formatDayTitle(c)
    if (v === SCHEDULE_VIEWS.WEEK) {
      const ws = startOfWeekSunday(c)
      const we = endOfWeekSaturday(c)
      return formatWeekRangeLabel(ws, we)
    }
    return formatMonthYear(c)
  })

  /** Dates shown as columns in day/week timeline (empty for month). */
  const columnDates = computed(() => {
    const c = cursorDate.value
    const v = view.value
    if (v === SCHEDULE_VIEWS.DAY) return [startOfDay(c)]
    if (v === SCHEDULE_VIEWS.WEEK) {
      const ws = startOfWeekSunday(c)
      return Array.from({ length: 7 }, (_, i) => addDays(ws, i))
    }
    return []
  })

  function goPrev() {
    const c = cursorDate.value
    const v = view.value
    const next = new Date(c)
    if (v === SCHEDULE_VIEWS.DAY) next.setDate(c.getDate() - 1)
    else if (v === SCHEDULE_VIEWS.WEEK) next.setDate(c.getDate() - 7)
    else next.setMonth(c.getMonth() - 1)
    cursorDate.value = next
  }

  function goNext() {
    const c = cursorDate.value
    const v = view.value
    const next = new Date(c)
    if (v === SCHEDULE_VIEWS.DAY) next.setDate(c.getDate() + 1)
    else if (v === SCHEDULE_VIEWS.WEEK) next.setDate(c.getDate() + 7)
    else next.setMonth(c.getMonth() + 1)
    cursorDate.value = next
  }

  function setView(next) {
    view.value = next
  }

  return {
    cursorDate,
    view,
    range,
    headerLabel,
    columnDates,
    goPrev,
    goNext,
    setView,
    SCHEDULE_VIEWS,
  }
}
