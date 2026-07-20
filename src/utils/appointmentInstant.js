/**
 * Normalize API start/end instants for the schedule grid.
 *
 * - **ISO strings with `Z` or `±hh:mm`** → parsed with `new Date()` so UTC is converted to the
 *   user's local timezone (correct for backends that store real instants, e.g. Mongo UTC).
 * - **Naive strings** (no timezone suffix) → calendar fields interpreted as **local wall clock**
 *   (same numbers as if you built `new Date(y, m, d, h, min)`).
 *
 * This fixes cases where treating `2026-04-24T04:30:00.000Z` as “4:30 AM local digits” hid
 * events before 8:00 on the grid. With `Z`, 04:30 UTC becomes morning in IST instead.
 */

function hasExplicitTimeZone(isoLike) {
  const s = String(isoLike).trim()
  if (/Z$/i.test(s)) return true
  // +05:30 or +0530 at end (after optional fractional seconds)
  return /[+-]\d{2}:?\d{2}$/.test(s)
}

export function appointmentInstant(value) {
  if (value == null || value === '') return null
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return new Date(value)
  }

  const s = String(value).trim()

  if (import.meta.env.VITE_SCHEDULE_APPOINTMENTS_AS_LOCAL_WALL === 'true') {
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?/)
    if (m) {
      return new Date(
        Number(m[1]),
        Number(m[2]) - 1,
        Number(m[3]),
        Number(m[4]),
        Number(m[5]),
        0,
        0,
      )
    }
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? null : d
  }

  if (hasExplicitTimeZone(s)) {
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/)
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), 0, 0)
  }

  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}
