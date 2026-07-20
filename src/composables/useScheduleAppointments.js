import { ref, watch } from 'vue'
import { typesForApiQuery } from '@/constants/scheduleAppointmentFilters'
import { getScheduleAppointments } from '@/services/schedule.service'

/**
 * @param {import('vue').Ref<{ from: Date, to: Date }>} rangeRef
 * @param {import('vue').Ref<string[]> | null} [selectedTypesRef] when set, drives server `types` filter
 */
export function useScheduleAppointments(rangeRef, selectedTypesRef = null) {
  const appointments = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function load() {
    const { from, to } = rangeRef.value
    const types = selectedTypesRef ? typesForApiQuery(selectedTypesRef.value) : undefined

    loading.value = true
    error.value = null
    try {
      const data = await getScheduleAppointments({
        from: from.toISOString(),
        to: to.toISOString(),
        types,
      })
      appointments.value = data.appointments ?? []
    } catch (e) {
      error.value = e
      appointments.value = []
    } finally {
      loading.value = false
    }
  }

  watch(
    () => {
      const parts = [rangeRef.value.from.valueOf(), rangeRef.value.to.valueOf()]
      if (selectedTypesRef) {
        parts.push(JSON.stringify([...(selectedTypesRef.value ?? [])].sort()))
      }
      return parts
    },
    load,
    { immediate: true },
  )

  return { appointments, loading, error, reload: load }
}
