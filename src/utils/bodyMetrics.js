function asArray(value) {
  return Array.isArray(value) ? value : null
}

/**
 * Normalize GET /clients/:id/body-metrics into snapshot rows:
 * { measurementDate, metrics, _id? }[]
 *
 * New schema: { clientId, entries: [...] } (optionally wrapped as { data: doc })
 * Legacy: [...], { data: [...] }, { bodyMetrics: [...] }
 */
export function normalizeBodyMetricsToEntries(payload) {
  if (payload == null) {
    return []
  }
  const fromDataArray = asArray(payload.data)
  if (fromDataArray) {
    return fromDataArray
  }
  const nestedDoc =
    payload && typeof payload === 'object' && payload.data != null && !Array.isArray(payload.data)
      ? payload.data
      : payload
  return asArray(nestedDoc?.entries) || asArray(nestedDoc) || asArray(payload.bodyMetrics) || []
}
