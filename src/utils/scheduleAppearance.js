import { SCHEDULE_TYPE_TO_APPEARANCE } from '@/constants/schedule'

export function resolveAppointmentAppearance(typeLabel) {
  const key = String(typeLabel || '')
    .trim()
    .toLowerCase()
  if (SCHEDULE_TYPE_TO_APPEARANCE[key]) return SCHEDULE_TYPE_TO_APPEARANCE[key]
  if (key.includes('follow')) return 'followUp'
  if (key.includes('initial') || key.includes('first consult') || key.includes('consult'))
    return 'initial'
  if (key.includes('weekly') || key.includes('review')) return 'weekly'
  return 'default'
}
