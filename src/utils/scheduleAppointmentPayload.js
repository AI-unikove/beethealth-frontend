/**
 * Parse times produced by `ScheduleMeetingDialog` selects, e.g. `"10:00 am"`.
 * @returns {{ hours: number, minutes: number } | null}
 */
export function parseMeridiemTime(str) {
  if (!str || typeof str !== 'string') return null
  const m = str.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i)
  if (!m) return null
  let h = Number.parseInt(m[1], 10)
  const minutes = Number.parseInt(m[2], 10)
  const ap = m[3].toLowerCase()
  if (ap === 'pm' && h !== 12) h += 12
  if (ap === 'am' && h === 12) h = 0
  return { hours: h, minutes }
}

/** Normalize v-date-picker value to a local calendar day (no TZ shift). */
export function toLocalDayDate(dateVal) {
  if (dateVal == null) return null
  if (dateVal instanceof Date) {
    return new Date(dateVal.getFullYear(), dateVal.getMonth(), dateVal.getDate())
  }
  if (typeof dateVal === 'string') {
    const parts = dateVal.split('-').map(Number)
    if (parts.length >= 3 && !Number.isNaN(parts[0])) {
      return new Date(parts[0], parts[1] - 1, parts[2])
    }
  }
  return null
}

/**
 * @returns {{ startTime: string, endTime: string }} ISO strings (UTC)
 */
export function buildAppointmentRangeIso(dateVal, timeStartStr, timeEndStr) {
  const day = toLocalDayDate(dateVal)
  if (!day) {
    throw new Error('Select a date')
  }
  const t0 = parseMeridiemTime(timeStartStr)
  const t1 = parseMeridiemTime(timeEndStr)
  if (!t0 || !t1) {
    throw new Error('Select start and end time')
  }
  const start = new Date(day)
  start.setHours(t0.hours, t0.minutes, 0, 0)
  const end = new Date(day)
  end.setHours(t1.hours, t1.minutes, 0, 0)
  if (end.getTime() <= start.getTime()) {
    end.setDate(end.getDate() + 1)
  }
  return {
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  }
}
