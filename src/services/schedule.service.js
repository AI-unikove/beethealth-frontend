import api from './api.service'
import { appointmentInstant } from '@/utils/appointmentInstant'

/** Normalize common API date shapes (ISO string, millis, `{ $date }`). */
function coerceDateInput(val) {
  if (val == null) return null
  if (typeof val === 'number') return val
  if (val instanceof Date) return val.toISOString()
  if (typeof val === 'object') {
    if (typeof val.$date !== 'undefined') {
      const d = val.$date
      return typeof d === 'string' ? d : new Date(d).toISOString()
    }
    if (typeof val.iso === 'string') return val.iso
  }
  return val
}

function guestLabelFromEntry(g) {
  if (!g || typeof g !== 'object') return ''
  return (
    g.name ||
    g.fullName ||
    g.clientName ||
    g.profile?.fullName ||
    (typeof g.client === 'object' &&
      g.client &&
      (g.client.profile?.fullName || g.client.fullName || g.client.name || '')) ||
    ''
  )
}

function resolveCardLabel(raw, title) {
  let fromGuest = raw.clientName ?? raw.name
  if (!fromGuest && Array.isArray(raw.guests)) {
    for (const g of raw.guests) {
      const label = guestLabelFromEntry(g)
      if (label) {
        fromGuest = label
        break
      }
    }
  }
  return String(fromGuest || title || 'Appointment')
}

function isValidInstantRange(start, end) {
  return Boolean(start && end) && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
}

/**
 * Extract list of appointment documents from varied API envelopes.
 */
function extractRawAppointments(body) {
  if (body == null) return []
  if (Array.isArray(body)) return body
  if (typeof body !== 'object') return []

  const nested = [
    body.appointments,
    body.data,
    body.results,
    body.items,
    body.records,
    body.payload,
    body.list,
    body.rows,
    body?.data?.appointments,
    body?.data?.items,
    body?.data?.data,
  ]
  for (const n of nested) {
    if (Array.isArray(n)) return n
  }
  return []
}

function mapAppointment(raw) {
  if (!raw || typeof raw !== 'object') return null
  const startRaw = coerceDateInput(raw.startTime ?? raw.start)
  const endRaw = coerceDateInput(raw.endTime ?? raw.end)
  if (startRaw == null || endRaw == null) return null

  const start = appointmentInstant(startRaw)
  const end = appointmentInstant(endRaw)
  if (!isValidInstantRange(start, end)) return null

  const title = raw.title != null ? String(raw.title).trim() : ''

  return {
    id: String(raw._id ?? raw.id ?? ''),
    clientName: resolveCardLabel(raw, title),
    startTime: start.getTime(),
    endTime: end.getTime(),
    type: String(raw.type ?? raw.appointmentType ?? ''),
  }
}

/**
 * Fetch appointments overlapping the given range.
 *
 * @param {{ from: string, to: string, types?: string[] }} range ISO bounds + optional type filter.
 */
export async function getScheduleAppointments(range) {
  const params = {
    from: range.from,
    to: range.to,
  }
  if (range.types?.length) {
    params.types = range.types.join(',')
  }
  const response = await api.get('/appointments', {
    params,
  })
  const body = response.data
  const list = extractRawAppointments(body)
  const appointments = list.map(mapAppointment).filter(Boolean)
  return { appointments }
}

/**
 * Create an appointment (schedule block).
 *
 * @param {{
 *   title: string,
 *   type: string,
 *   startTime: string,
 *   endTime: string,
 *   guestIds?: string[],
 * }} payload
 */
export async function createAppointment(payload) {
  const response = await api.post('/appointments', payload)
  return response.data
}
