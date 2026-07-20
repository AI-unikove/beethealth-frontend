// Helper function to capitalize first letter of each word
export const capitalizeText = (text) => {
  if (!text || typeof text !== 'string') return text
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const calculateAge = (dob) => {
  const today = new Date()
  const birthDate = new Date(dob)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

const parseTimeToHours = (value) => {
  if (value == null || value === '') return null
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value >= 0 && value < 24 ? value : null
  }
  if (typeof value === 'string') {
    const match = value.trim().match(/^(\d{1,2}):(\d{2})$/)
    if (!match) return null
    const h = parseInt(match[1], 10)
    const m = parseInt(match[2], 10)
    if (h < 0 || h > 23 || m < 0 || m > 59) return null
    return h + m / 60
  }
  return null
}

export const getSleepPattern = (sleepPatterns) => {
  if (!sleepPatterns) return null

  const sleepTime = parseTimeToHours(sleepPatterns.bedTime)
  const wakeUpTime = parseTimeToHours(sleepPatterns.wakeUpTime)
  if (sleepTime == null || wakeUpTime == null) return null

  let duration
  if (wakeUpTime <= sleepTime) {
    // Overnight: e.g. sleep 22:30, wake 06:30
    duration = 24 - sleepTime + wakeUpTime
  } else {
    duration = wakeUpTime - sleepTime
  }

  return duration >= 0 && duration <= 24 ? duration : null
}

/** Decimal hours (0–24) to display label e.g. 22 -> "10:00 PM", 6.5 -> "6:30 AM" */
export const decimalHoursToDisplayLabel = (h) => {
  if (h == null || h === '' || Number.isNaN(Number(h))) return ''
  const n = Number(h)
  if (n < 0 || n >= 24) return ''
  const hours = Math.floor(n) % 24
  const mins = Math.round((n - Math.floor(n)) * 60)
  const isPM = hours >= 12
  const displayH = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  const ampm = isPM ? 'PM' : 'AM'
  return `${displayH}:${String(mins).padStart(2, '0')} ${ampm}`
}

/** Parse "10:00 PM" or "6:30 AM" to decimal hours (0-24) */
export const displayLabelToDecimalHours = (str) => {
  if (!str || typeof str !== 'string') return null
  const trimmed = str.trim()
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null
  let h = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  const ampm = (match[3] || '').toUpperCase()
  if (ampm === 'PM' && h !== 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  if (h < 0 || h > 23 || m < 0 || m > 59) return null
  return h + m / 60
}

/** Build sleep pattern label from bed/wake decimal hours (from API) */
export const bedWakeToSleepPatternLabel = (bedDecimal, wakeDecimal) => {
  const bed = bedDecimal != null && bedDecimal !== '' ? parseTimeToHours(bedDecimal) : null
  const wake = wakeDecimal != null && wakeDecimal !== '' ? parseTimeToHours(wakeDecimal) : null
  if (bed == null || wake == null) return ''
  const bedStr = decimalHoursToDisplayLabel(bed)
  const wakeStr = decimalHoursToDisplayLabel(wake)
  return bedStr && wakeStr ? `${bedStr} - ${wakeStr}` : ''
}

/** Parse "10:00 PM - 6:00 AM" to { bed, wake } in decimal hours */
export const sleepPatternLabelToBedWake = (label) => {
  if (!label || typeof label !== 'string') return { bed: null, wake: null }
  const parts = label.split(/\s*-\s*/).map((s) => s.trim())
  if (parts.length !== 2) return { bed: null, wake: null }
  const bed = displayLabelToDecimalHours(parts[0])
  const wake = displayLabelToDecimalHours(parts[1])
  return { bed, wake }
}

/** Parse duration option "5-6hrs/daily" to midpoint hours (5.5). Returns null if invalid. */
export const sleepPatternOptionToDuration = (optionLabel) => {
  if (!optionLabel || typeof optionLabel !== 'string') return null
  const match = optionLabel.trim().match(/^(\d+)-(\d+)hrs\/daily$/i)
  if (!match) return null
  const low = parseInt(match[1], 10)
  const high = parseInt(match[2], 10)
  if (low < 0 || high > 24 || low >= high) return null
  return (low + high) / 2
}

/** Convert duration option "5-6hrs/daily" to { bed, wake } using default bed time (decimal hours). */
export const sleepPatternOptionToBedWake = (optionLabel, defaultBedHours = 22) => {
  const duration = sleepPatternOptionToDuration(optionLabel)
  if (duration == null) return { bed: null, wake: null }
  const wake = (defaultBedHours + duration) % 24
  return { bed: defaultBedHours, wake }
}

/** Given duration in hours and list of option strings, return closest option (e.g. "5-6hrs/daily"). */
export const durationToSleepPatternOption = (durationHours, options) => {
  if (
    durationHours == null ||
    Number.isNaN(Number(durationHours)) ||
    !Array.isArray(options) ||
    options.length === 0
  )
    return ''
  const d = Number(durationHours)
  let closest = options[0]
  let minDist = Infinity
  for (const opt of options) {
    const mid = sleepPatternOptionToDuration(opt)
    if (mid == null) continue
    const dist = Math.abs(mid - d)
    if (dist < minDist) {
      minDist = dist
      closest = opt
    }
  }
  return closest
}
// Schema-aligned: bodyStatus (height, weight), bodyMeasurements (fatpercent, Chest, Hips, etc.)
const FIELD_UNITS = {
  Height: 'cm',
  Weight: 'kg',
  Arms: 'cm',
  Hips: 'cm',
  Thighs: 'cm',
  Neck: 'cm',
  Chest: 'cm',
  Abs: 'cm',
  'Body Fat': '%',
  'Visceral Fat': '%',
  'Muscle Mass': '%',
  'Body Water': '%',
  'Sleep Patterns': 'hrs/daily',
  Hydration: 'L',
  'Target Completion Period': 'months',
}
export const formatWithUnits = (label, value, fallback = '_') => {
  if (value == null || value === '') return fallback
  const unit = FIELD_UNITS[label]
  if (!unit) return String(value)
  if (unit === '%') return `${value}%`
  return `${value} ${unit}`
}

const cmToFeetAndInches = (cm) => {
  if (cm == null || Number.isNaN(Number(cm))) return null
  const totalInches = Number(cm) / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return { feet, inches }
}

/** Format as "5'11"" */
export const formatHeightFeetInches = (cm) => {
  const result = cmToFeetAndInches(cm)
  if (result == null) return ''
  return `${result.feet}'${result.inches}"`
}

function formatBedTimeAMPM(hours, minutes) {
  if (hours >= 1 && hours <= 5) return `${hours}:${minutes} AM`
  if (hours === 12) return `12:${minutes} AM`
  if (hours >= 6 && hours <= 11) return `${hours}:${minutes} PM`
  if (hours === 0) return `12:${minutes} AM`
  return `${hours}:${minutes} PM`
}

function formatStandardAMPM(hours, minutes) {
  if (hours === 0) return `12:${minutes} AM`
  if (hours === 12) return `12:${minutes} PM`
  if (hours < 12) return `${hours}:${minutes} AM`
  return `${hours - 12}:${minutes} PM`
}

/** Format time string to include uppercase AM/PM */
export const formatTimeWithAMPM = (timeStr, isBedTime = false) => {
  if (!timeStr || timeStr.trim() === '') return ''
  const str = String(timeStr).trim()

  const hasAMPM = /\b(am|pm)\b/i.test(str)
  if (hasAMPM) {
    return str.replace(/\b(am|pm)\b/gi, (match) => match.toUpperCase())
  }

  const timeMatch = str.match(/^(\d{1,2}):?(\d{2})?/)
  if (!timeMatch) return str

  const hours = parseInt(timeMatch[1], 10)
  const minutes = timeMatch[2] || '00'

  if (hours >= 13 && hours <= 23) {
    return `${hours - 12}:${minutes} PM`
  }
  if (isBedTime) return formatBedTimeAMPM(hours, minutes)
  return formatStandardAMPM(hours, minutes)
}

/** Convert array or object value to array of strings */
export const normalizeToArray = (value) => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'object' && v?.name ? v.name : String(v))).filter(Boolean)
  }
  if (typeof value === 'object' && value.name) {
    return [value.name]
  }
  return [String(value)]
}

/** Get dietary restrictions as array from client item */
export const getDietaryRestrictions = (item) => {
  return normalizeToArray(item.dietaryProfile?.dietaryRestrictions)
}

/** Get special diet as array from client item (each item shown as its own chip) */
export const getSpecialDiet = (item) => {
  return normalizeToArray(item.dietaryProfile?.specialDiet)
}

/** Keys for physical measurement fields (body + bodyStatus) used for 3-digit restriction */
export const PHYSICAL_MEASUREMENT_KEYS = [
  'fatpercent',
  'waterPercent',
  'musclepercent',
  'visceralfatPercentage',
  'height',
  'weight',
  'Chest',
  'abs',
  'Hips',
  'arms',
  'thighs',
]

/**
 * Process physical measurement input: allow only up to 3 digits, strip non-digits.
 * @param {string|number} val - Raw input value
 * @param {string} lastValid - Last valid value for this field (for revert on invalid)
 * @returns {{ value: string, exceeded: boolean, newLastValid: string }}
 */
export function processPhysicalMeasurementInput(val, lastValid = '') {
  const digitsOnly = String(val ?? '')
    .replace(/\D/g, '')
    .slice(0, 3)
  const n = digitsOnly === '' ? NaN : Number(digitsOnly)
  const invalid = digitsOnly !== '' && (Number.isNaN(n) || n < 0 || n > 999)
  return {
    value: invalid ? (lastValid ?? '') : digitsOnly,
    exceeded: invalid,
    newLastValid: invalid ? (lastValid ?? '') : digitsOnly,
  }
}

function toStr(v) {
  return String(v ?? '')
}

/**
 * Build initial "last valid" object for physical measurement fields from client data.
 * Used when populating the form so revert-on-invalid uses loaded values.
 * @param {Object} clientData - Client API response
 * @returns {Record<string, string>}
 */
export function getInitialLastValidPhysicalMeasurement(clientData = {}) {
  const b = clientData.bodyMeasurements || {}
  const bodyStatus = clientData.bodyStatus || {}
  const p = clientData.profile || {}
  const height = bodyStatus.height ?? p.height
  const weight = bodyStatus.weight ?? p.weight
  const hips = b.Hips ?? b.hips

  return {
    fatpercent: toStr(b.fatpercent),
    waterPercent: toStr(b.waterPercent),
    musclepercent: toStr(b.musclepercent),
    visceralfatPercentage: toStr(b.visceralfatPercentage),
    height: toStr(height),
    weight: toStr(weight),
    Chest: toStr(b.Chest),
    abs: toStr(b.abs),
    Hips: toStr(hips),
    arms: toStr(b.arms),
    thighs: toStr(b.thighs),
  }
}

// --- Form / update dialog helpers (moved from updateClientProfileDialog.vue) ---

/** Parse value to array of strings (array, comma string, or object with name). */
export function parseArray(value) {
  if (value == null) return []
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'object' && v && 'name' in v ? v.name : String(v)))
  }
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Join array to comma-separated string. */
export function toArrayText(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return ''
  return arr.map((v) => (typeof v === 'object' && v && 'name' in v ? v.name : v)).join(', ')
}

/** Parse stored address string into up to 6 lines (address, addressLine2, city, state, zip, country). */
export function parseAddressLines(addressStr) {
  if (!addressStr || typeof addressStr !== 'string') return ['', '', '', '', '', '']
  let lines = addressStr
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (lines.length <= 1 && addressStr.includes(',')) {
    lines = addressStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  const result = ['', '', '', '', '', '']
  lines.slice(0, 6).forEach((line, i) => {
    result[i] = line
  })
  return result
}

/** Decimal hours to "H:MM" string (e.g. 22.5 -> "22:30"). */
export function hoursToTimeStr(num) {
  if (num == null || num === '' || Number.isNaN(Number(num))) return ''
  const n = Number(num)
  const h = Math.floor(n)
  const m = Math.round((n - h) * 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

/** Mobile validation: returns true if valid, or error message string. */
export function validateMobile(value) {
  if (value == null || String(value).trim() === '') return true
  const s = String(value).trim()
  const digitsOnly = s.replace(/\D/g, '')
  if (!/^[\d\s+\-()]+$/.test(s)) return 'Use only numbers and optional +, spaces or hyphens'
  if (digitsOnly.length < 10) return 'Enter at least 10 digits'
  if (digitsOnly.length > 15) return 'Enter at most 15 digits'
  return true
}

/** Stress level number (1–10) to label. */
export function getStressLevelLabel(level) {
  if (level >= 0 && level <= 5) return 'Low'
  if (level >= 6 && level <= 7) return 'Medium'
  return 'High'
}

/** Map API liters (number) or value to hydration dropdown option; pass options list from DropDownItems. */
export function litersToHydrationOption(val, hydrationOptions = []) {
  if (val == null || val === '') return ''
  if (hydrationOptions.includes(String(val).trim())) return String(val).trim()
  const n = Number(val)
  if (Number.isNaN(n)) return ''
  if (n < 1) return '<1L'
  if (n < 2) return '1-2 L'
  if (n < 3) return '2-3L'
  if (n < 4) return '3-4L'
  return '>4L'
}

/** Map hydration option string to number for API (midpoint of range). */
export function hydrationOptionToLiters(option) {
  if (!option || option === '') return null
  switch (String(option).trim()) {
    case '<1L':
      return 0.5
    case '1-2 L':
      return 1.5
    case '2-3L':
      return 2.5
    case '3-4L':
      return 3.5
    case '>4L':
      return 4.5
    default:
      return Number(option) || null
  }
}

/** Default form shape for client profile update dialog. */
export function getDefaultClientProfileForm() {
  return {
    profile: {
      fullName: '',
      email: '',
      age: '',
      phone: '',
      address: '',
      addressLine1: '',
      addressLine2: '',
      cityTown: '',
      stateRegion: '',
      zipPostcode: '',
      country: '',
      gender: '',
      familyDoctor: '',
      pastDietExperience: '',
      reference: '',
    },
    bodyStatus: { height: '', weight: '' },
    nutritionistName: '',
    bodyMeasurements: {
      fatpercent: '',
      waterPercent: '',
      musclepercent: '',
      Chest: '',
      abs: '',
      Hips: '',
      arms: '',
      thighs: '',
      neck: '',
      visceralfatPercentage: '',
    },
    dietaryProfile: {
      dietaryRestrictions: [],
      dietaryRestrictionsText: '',
      specialDiet: [],
      sweetCravingTime: '',
      sweetCravingList: [],
    },
    medicalProfile: {
      knownMedicalConditions: [],
      knownMedicalConditionsText: '',
      currentHealthIssues: [],
      currentHealthIssuesText: '',
      currentMedicationsText: '',
      familyMedicalHistoryText: '',
      gutHealthIssues: [],
      gutHealthIssuesText: '',
      periodRegularity: '',
    },
    lifestyleProfile: {
      activityFrequency: '',
      activityType: '',
      waterIntakeLitersPerDay: '',
      alcoholFrequency: '',
      sleepPattern: '',
      bedTime: '',
      wakeUpTime: '',
      stressLevel: '',
      sweetCravings: '',
      spicesOilCookingPreferences: '',
      eatingOutFrequency: '',
    },
    goalsProfile: {
      primaryGoal: '',
      motivationForGoal: '',
      targetWeightKg: '',
      targetCompletionInMonths: '',
      additionalNotes: '',
    },
  }
}
