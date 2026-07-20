/**
 * Values for GET /clients?sort=… — backend must implement ordering for each.
 * @see client.service.js getClients
 */
export const CLIENT_SORT_VALUES = {
  ALPHABETICAL: 'alphabetical',
  PROGRESS_ON_TRACK_FIRST: 'progress_on_track_first',
  PROGRESS_CRITICAL_FIRST: 'progress_critical_first',
  LAST_APPOINTMENT_RECENT: 'last_appointment_recent',
  LAST_APPOINTMENT_OLDER: 'last_appointment_older',
  DIET_PLAN: 'diet_plan',
  CREATED_OLD_TO_NEW: 'created_old_to_new',
  DURATION_SHORT_TO_LONG: 'duration_short_to_long',
  DURATION_LONG_TO_SHORT: 'duration_long_to_short',
}

export const CLIENT_SORT_OPTIONS = [
  { value: CLIENT_SORT_VALUES.ALPHABETICAL, title: 'Alphabetical' },
  {
    value: CLIENT_SORT_VALUES.PROGRESS_ON_TRACK_FIRST,
    title: 'Progress: On Track First',
  },
  {
    value: CLIENT_SORT_VALUES.PROGRESS_CRITICAL_FIRST,
    title: 'Progress: Critical First',
  },
  {
    value: CLIENT_SORT_VALUES.LAST_APPOINTMENT_RECENT,
    title: 'Last Appointment: Recent First',
  },
  {
    value: CLIENT_SORT_VALUES.LAST_APPOINTMENT_OLDER,
    title: 'Last Appointment: Older First',
  },
  { value: CLIENT_SORT_VALUES.DIET_PLAN, title: 'By Diet Plan' },
  { value: CLIENT_SORT_VALUES.CREATED_OLD_TO_NEW, title: 'Old to New' },
  {
    value: CLIENT_SORT_VALUES.DURATION_SHORT_TO_LONG,
    title: 'Duration: Short to Long',
  },
  {
    value: CLIENT_SORT_VALUES.DURATION_LONG_TO_SHORT,
    title: 'Duration: Long to Short',
  },
]

export const DEFAULT_CLIENT_SORT = CLIENT_SORT_VALUES.ALPHABETICAL
