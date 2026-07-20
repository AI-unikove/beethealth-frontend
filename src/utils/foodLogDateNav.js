export function startOfLocalDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function dateKeyLocal(d) {
  const x = startOfLocalDay(d)
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isSameLocalDay(a, b) {
  return dateKeyLocal(a) === dateKeyLocal(b)
}

export function isTodayLocal(d) {
  return isSameLocalDay(d, new Date())
}

export function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return startOfLocalDay(x)
}

export function dateKeyFromTimestamp(raw) {
  if (raw == null || raw === '') return ''
  const t = new Date(raw)
  if (Number.isNaN(t.getTime())) return ''
  return dateKeyLocal(t)
}

function normalizeDayToken(dayStr) {
  return String(dayStr || '')
    .trim()
    .toLowerCase()
    .replace(/\./g, '')
}

export function planDayMatchesDate(planDayStr, viewDate) {
  const wd = viewDate.toLocaleDateString('en-US', { weekday: 'long' })
  const a = normalizeDayToken(planDayStr)
  const b = normalizeDayToken(wd)
  if (!a || !b) return false
  if (a === b) return true
  return a.startsWith(b.slice(0, 3)) || b.startsWith(a.slice(0, 3))
}

export function findDayPlanForViewDate(plan, viewDate) {
  const planDays = Array.isArray(plan?.days) ? plan.days : []
  const found = planDays.find((d) => planDayMatchesDate(d?.day, viewDate))
  if (found) return found
  /** Avoid using another weekday’s meals when the template lists multiple days (was showing e.g. Breakfast from Monday while viewing Thursday). */
  if (planDays.length === 1) return planDays[0]
  return null
}
