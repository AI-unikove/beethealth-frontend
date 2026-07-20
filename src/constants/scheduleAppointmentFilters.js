/** UI label vs API `type` string (must match DB / POST body). */
export const SCHEDULE_APPOINTMENT_FILTER_OPTIONS = [
  { value: 'First Consultation', label: 'Initial Consultation', appearance: 'initial' },
  { value: 'Follow Up', label: 'Follow Up', appearance: 'followUp' },
  { value: 'Weekly Review', label: 'Weekly Review', appearance: 'weekly' },
]

export const DEFAULT_SCHEDULE_APPOINTMENT_TYPES = SCHEDULE_APPOINTMENT_FILTER_OPTIONS.map(
  (o) => o.value,
)

/**
 * Build `types` for `GET /appointments`.
 * - **`undefined`:** omit `types` — show **all** meetings (no chips selected, or all three selected).
 * - **`string[]`:** strict subset — one or two types → `types=a,b` (OR on the server).
 */
export function typesForApiQuery(selected) {
  if (!Array.isArray(selected) || selected.length === 0) return undefined
  const allowed = new Set(DEFAULT_SCHEDULE_APPOINTMENT_TYPES)
  const normalized = [...new Set(selected.filter((t) => allowed.has(t)))]
  if (normalized.length === 0) return undefined
  const allSelected =
    normalized.length === DEFAULT_SCHEDULE_APPOINTMENT_TYPES.length &&
    DEFAULT_SCHEDULE_APPOINTMENT_TYPES.every((t) => normalized.includes(t))
  if (allSelected) return undefined
  return normalized
}

/** True when a strict type filter is on (one or two types, not all three, not none). */
export function hasActiveTypeFilter(selected) {
  const q = typesForApiQuery(selected)
  return Array.isArray(q) && q.length > 0
}
