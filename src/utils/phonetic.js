const SOUNDEX_MAP = Object.freeze({
  B: '1',
  F: '1',
  P: '1',
  V: '1',
  C: '2',
  G: '2',
  J: '2',
  K: '2',
  Q: '2',
  S: '2',
  X: '2',
  Z: '2',
  D: '3',
  T: '3',
  L: '4',
  M: '5',
  N: '5',
  R: '6',
})
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y', 'H', 'W'])

export function normalizeForPhonetic(str) {
  if (str == null) return ''
  return String(str)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export function getSoundexCode(str) {
  const s = String(str).trim().toUpperCase()
  if (!s) return ''
  let code = s[0]
  let prev = SOUNDEX_MAP[s[0]] ?? (VOWELS.has(s[0]) ? null : s[0])
  for (let i = 1; i < s.length && code.length < 4; i++) {
    const c = s[i]
    const digit = SOUNDEX_MAP[c]
    if (digit != null && digit !== prev) {
      code += digit
      prev = digit
    } else if (!VOWELS.has(c) && SOUNDEX_MAP[c] == null) {
      prev = null
    }
  }
  return `${code}000`.slice(0, 4)
}

export function getPhoneticKey(str) {
  const n = normalizeForPhonetic(str)
  if (!n) return ''
  const firstWord = n.split(/\s+/)[0] || n
  return getSoundexCode(firstWord)
}

function soundsLikeCode(a, b) {
  if (!a || !b || a.length < 2 || b.length < 2) return a === b
  if (a === b) return true
  return a[0] === b[0] && a[1] === b[1]
}

export function phoneticMatch(query, text) {
  const q = normalizeForPhonetic(query)
  const t = normalizeForPhonetic(text)
  if (!q) return true
  if (!t) return false
  if (t.includes(q)) return true
  if (t.startsWith(q) || q.startsWith(t)) return true
  const qKey = getSoundexCode(q)
  const tKey = getSoundexCode(t)
  if (qKey && tKey && (qKey === tKey || soundsLikeCode(qKey, tKey))) return true
  const tWords = t.split(/\s+/).filter(Boolean)
  for (const w of tWords) {
    const wKey = getSoundexCode(w)
    if (qKey === wKey || soundsLikeCode(qKey, wKey)) return true
    if (w.startsWith(q) || q.startsWith(w)) return true
  }
  return false
}

function scoreMatchByWords(q, qKey, tWords) {
  for (const w of tWords) {
    const wKey = getSoundexCode(w)
    if (qKey === wKey) {
      return 40
    }
    if (qKey && wKey && soundsLikeCode(qKey, wKey)) {
      return 35
    }
    if (w.startsWith(q) || q.startsWith(w)) {
      return 30
    }
  }
  return 0
}

function scoreMatch(query, text) {
  const q = normalizeForPhonetic(query)
  const t = normalizeForPhonetic(text)
  if (!q || !t) {
    return 0
  }
  if (t === q) {
    return 100
  }
  if (t.startsWith(q)) {
    return 80
  }
  if (t.includes(q)) {
    return 60
  }
  const qKey = getSoundexCode(q)
  const tKey = getSoundexCode(t)
  if (qKey && tKey && qKey === tKey) {
    return 50
  }
  if (qKey && tKey && soundsLikeCode(qKey, tKey)) {
    return 45
  }
  const tWords = t.split(/\s+/).filter(Boolean)
  return scoreMatchByWords(q, qKey, tWords)
}

function toSimilarEntryForRank(item) {
  if (item == null) return null
  if (typeof item === 'string') {
    const name = item.trim()
    return name ? { id: null, name } : null
  }
  if (typeof item === 'object') {
    const name = String(item.name ?? item.title ?? item.recipeName ?? item.value ?? '').trim()
    if (!name) return null
    const rawId = item._id ?? item.id ?? item.recipeId
    const id = rawId != null && String(rawId).trim() !== '' ? String(rawId) : null
    return { id, name }
  }
  return null
}

/** @param {(string | { id?: string | null, name?: string })[]} items */
export function filterAndRankSimilarNames(query, items, options = {}) {
  const q = (query || '').trim()
  const limit = options.limit ?? 10
  if (!q || !Array.isArray(items)) return []
  const entries = items
    .map(toSimilarEntryForRank)
    .filter(Boolean)
    .filter((e) => e.name.toLowerCase() !== q.toLowerCase())
  const scored = entries
    .map((entry) => ({ entry, score: scoreMatch(q, entry.name) }))
    .filter(({ score }) => score > 0)
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(({ entry }) => ({ id: entry.id, name: entry.name }))
}
