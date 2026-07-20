/** Visible window for the timeline (local time). */
export const SCHEDULE_START_HOUR = 8
/** Through 8:00 PM local so UTC-backed slots (e.g. afternoon in IST) still render. */
export const SCHEDULE_END_HOUR = 20
export const SCHEDULE_SLOT_MINUTES = 30

/** Pixel height of one slot row (30 minutes). */
export const SCHEDULE_SLOT_HEIGHT_PX = 56
export const SCHEDULE_VIEWPORT_LAST_SLOT_START_MINUTES = 12 * 60

export const SCHEDULE_VIEWS = /** @type {const} */ ({
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
})

/** Map known appointment type labels to appearance keys. */
export const SCHEDULE_TYPE_TO_APPEARANCE = {
  'follow up': 'followUp',
  'initial consultation': 'initial',
  'first consultation': 'initial',
  'weekly review': 'weekly',
}
