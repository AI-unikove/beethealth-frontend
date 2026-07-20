import { SCHEDULE_END_HOUR, SCHEDULE_SLOT_MINUTES, SCHEDULE_START_HOUR } from '@/constants/schedule'

/**
 * Week starts Sunday (0) through Saturday — matches design reference.
 */
export function startOfWeekSunday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const next = new Date(d)
  next.setDate(d.getDate() - day)
  next.setHours(0, 0, 0, 0)
  return next
}

export function endOfWeekSaturday(date) {
  const start = startOfWeekSunday(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function startOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  d.setHours(23, 59, 59, 999)
  return d
}

function ordinal(n) {
  const j = n % 10
  const k = n % 100
  if (j === 1 && k !== 11) return `${n}st`
  if (j === 2 && k !== 12) return `${n}nd`
  if (j === 3 && k !== 13) return `${n}rd`
  return `${n}th`
}

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function formatWeekRangeLabel(weekStart, weekEnd) {
  const ys = weekStart.getFullYear()
  const ye = weekEnd.getFullYear()
  const ms = MONTH_SHORT[weekStart.getMonth()]
  const me = MONTH_SHORT[weekEnd.getMonth()]
  const ds = ordinal(weekStart.getDate())
  const de = ordinal(weekEnd.getDate())
  if (ys === ye) {
    return `${ms} ${ds}–${me} ${de}, ${ys}`
  }
  return `${ms} ${ds}, ${ys}–${me} ${de}, ${ye}`
}

export function formatDayTitle(date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatMonthYear(date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function isSameLocalDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/**
 * Labels for each row in the timeline (slot start times), up to the last slot before `SCHEDULE_END_HOUR`.
 */
export function generateTimeSlotLabels() {
  const out = []
  let m = SCHEDULE_START_HOUR * 60
  const end = SCHEDULE_END_HOUR * 60
  while (m < end) {
    out.push(formatMinutesAsTimeLabel(m))
    m += SCHEDULE_SLOT_MINUTES
  }
  return out
}

function formatMinutesAsTimeLabel(minutesFromMidnight) {
  const h = Math.floor(minutesFromMidnight / 60)
  const mi = minutesFromMidnight % 60
  const d = new Date()
  d.setHours(h, mi, 0, 0)
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const RANGE_TIME_OPTS = { hour: 'numeric', minute: '2-digit', hour12: true }

export function formatCompactTimeRange(startIso, endIso) {
  const s = new Date(startIso)
  const e = new Date(endIso)
  return `${s.toLocaleTimeString('en-US', RANGE_TIME_OPTS)}–${e.toLocaleTimeString('en-US', RANGE_TIME_OPTS)}`
}

/** Compact time for month-view pills, e.g. `9am`, `10:30am` (matches mockups). */
export function formatMonthPillTime(msOrDate) {
  const d = new Date(msOrDate)
  if (Number.isNaN(d.getTime())) return ''
  const h = d.getHours()
  const min = d.getMinutes()
  const isPm = h >= 12
  let h12 = h % 12
  if (h12 === 0) h12 = 12
  const minPart = min === 0 ? '' : `:${String(min).padStart(2, '0')}`
  const suf = isPm ? 'pm' : 'am'
  return `${h12}${minPart}${suf}`
}
