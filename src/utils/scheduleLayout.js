import {
  SCHEDULE_END_HOUR,
  SCHEDULE_SLOT_HEIGHT_PX,
  SCHEDULE_SLOT_MINUTES,
  SCHEDULE_START_HOUR,
  SCHEDULE_VIEWPORT_LAST_SLOT_START_MINUTES,
} from '@/constants/schedule'
import { isSameLocalDay, startOfDay } from '@/utils/scheduleDates'

function minutesSinceDayStart(date) {
  const d = new Date(date)
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60
}

function windowStartMinutes() {
  return SCHEDULE_START_HOUR * 60
}

function windowEndMinutes() {
  return SCHEDULE_END_HOUR * 60
}

const PX_PER_MINUTE = SCHEDULE_SLOT_HEIGHT_PX / SCHEDULE_SLOT_MINUTES

export function timelineHeightPx() {
  const totalMinutes = (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR) * 60
  return (totalMinutes / SCHEDULE_SLOT_MINUTES) * SCHEDULE_SLOT_HEIGHT_PX
}

/** Max height (px) of the clipped day/week timeline: shows rows through `SCHEDULE_VIEWPORT_LAST_SLOT_START_MINUTES`. */
export function timelineViewportClipHeightPx() {
  const w0 = SCHEDULE_START_HOUR * 60
  const lastStart = Math.min(SCHEDULE_VIEWPORT_LAST_SLOT_START_MINUTES, SCHEDULE_END_HOUR * 60)
  const slotCount = (lastStart - w0) / SCHEDULE_SLOT_MINUTES + 1
  return slotCount * SCHEDULE_SLOT_HEIGHT_PX
}

/**
 * Top offset within the timeline column for a given instant (local).
 * Returns null if outside the visible window.
 */
export function topPxForInstant(instant) {
  const mins = minutesSinceDayStart(instant)
  const w0 = windowStartMinutes()
  const w1 = windowEndMinutes()
  if (mins < w0 || mins > w1) return null
  return (mins - w0) * PX_PER_MINUTE
}

export function layoutEventBlock(event, dayDate) {
  const start = new Date(event.startTime)
  const end = new Date(event.endTime)
  const dayStart = startOfDay(dayDate).getTime()
  const dayEnd = dayStart + 86400000

  const clipStart = Math.max(start.getTime(), dayStart)
  const clipEnd = Math.min(end.getTime(), dayEnd)
  if (clipEnd <= clipStart) return null

  const w0 = windowStartMinutes()
  const w1 = windowEndMinutes()

  const startM = minutesSinceDayStart(new Date(clipStart))
  const endM = minutesSinceDayStart(new Date(clipEnd))
  const visibleStart = Math.max(startM, w0)
  const visibleEnd = Math.min(endM, w1)
  if (visibleEnd <= visibleStart) return null

  const top = (visibleStart - w0) * PX_PER_MINUTE
  const height = Math.max((visibleEnd - visibleStart) * PX_PER_MINUTE, 24)
  return { top, height }
}

/**
 * Greedy lane assignment for overlapping intervals in one day column.
 */
export function assignLanes(events) {
  const sorted = [...events].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  const laneEnds = []
  const placed = []

  for (const ev of sorted) {
    const start = new Date(ev.startTime).getTime()
    const end = new Date(ev.endTime).getTime()
    let lane = laneEnds.findIndex((le) => start >= le)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(end)
    } else {
      laneEnds[lane] = end
    }
    placed.push({ event: ev, lane })
  }

  const laneCount = Math.max(1, laneEnds.length)
  return placed.map((p) => ({
    ...p.event,
    lane: p.lane,
    laneCount,
  }))
}

export function filterEventsForDay(events, dayDate) {
  return events.filter((e) => isSameLocalDay(new Date(e.startTime), dayDate))
}
