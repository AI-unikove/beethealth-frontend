export function formatLabel(f) {
  if (!f) return '–'
  if (f === 'writeup') return 'Write-Up'
  if (f === 'link') return 'Link'
  if (f === 'document') return 'Document'
  return f
}

export function normalizeTags(raw) {
  if (Array.isArray(raw)) {
    return raw
      .map((t) =>
        typeof t === 'string'
          ? t
          : (t?.name ?? t?.title ?? t?.value ?? (t != null ? String(t) : '')),
      )
      .filter(Boolean)
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}
