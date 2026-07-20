/**
 * v-text-field suffix helpers: omit suffix when the model value already includes the unit
 * (e.g. AI-filled "1500 kcal" or "100 g").
 */

export function macroCaloriesSuffix(raw) {
  const s = String(raw ?? '').trim()
  if (!s) {
    return 'kcal'
  }
  if (/kcal/i.test(s)) {
    return ''
  }
  return 'kcal'
}

export function macroGramSuffix(raw) {
  const s = String(raw ?? '').trim()
  if (!s) {
    return 'g'
  }
  if (/\d+\s*g\s*$/i.test(s)) {
    return ''
  }
  return 'g'
}
