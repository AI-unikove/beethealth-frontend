<template>
  <CrudDialog
    :model-value="modelValue"
    title="Schedule meeting"
    max-width="480"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="$emit('update:modelValue', false)"
  >
    <div id="schedule-meeting-anchor" class="schedule-meeting-content">
      <!-- Title -->
      <div class="field-label">Title</div>
      <v-text-field
        v-model="form.title"
        placeholder="Add title"
        variant="outlined"
        density="compact"
        class="mt-1 mb-2"
        hide-details
      />

      <!-- Quick type chips (matches schedule mockup) -->
      <div class="type-chips mb-4">
        <button
          v-for="opt in categoryOptions"
          :key="opt"
          type="button"
          class="type-chip"
          :class="{ 'type-chip--active': form.category === opt }"
          @click="form.category = opt"
        >
          {{ opt }}
        </button>
      </div>

      <!-- Date -->
      <div class="field-label mb-1">Date</div>
      <v-menu
        v-model="dateMenu"
        :close-on-content-click="false"
        location="bottom"
        offset="6"
        :z-index="4000"
        content-class="schedule-meeting-date-menu"
      >
        <template #activator="{ props: menuActivators }">
          <v-text-field
            v-bind="menuActivators"
            :model-value="formattedDate"
            placeholder="Select Date"
            variant="outlined"
            density="compact"
            readonly
            append-inner-icon="mdi-chevron-down"
            class="mb-4"
            hide-details
          />
        </template>
        <v-date-picker
          v-model="form.date"
          :min="minScheduleDateStr"
          color="primary"
          show-adjacent-months
          @update:model-value="dateMenu = false"
        />
      </v-menu>

      <!-- Time start / end -->
      <div class="d-flex ga-4 mb-4">
        <div style="flex: 1">
          <div class="field-label mb-1">Time start</div>
          <v-select
            v-model="form.timeStart"
            :items="availableTimeStartOptions"
            placeholder="10:00 am"
            variant="outlined"
            density="compact"
            hide-details
          />
        </div>
        <div style="flex: 1">
          <div class="field-label mb-1">Time end</div>
          <v-select
            v-model="form.timeEnd"
            :items="timeOptions"
            placeholder="10:30 am"
            variant="outlined"
            density="compact"
            hide-details
          />
        </div>
      </div>

      <v-alert
        v-if="saveError"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4"
        closable
        @click:close="saveError = ''"
      >
        {{ saveError }}
      </v-alert>

      <!-- Guests (selected tags + search live inside one outlined field) -->
      <div class="field-label mb-1">Guests</div>
      <div class="guests-autocomplete mb-6" ref="guestsRef">
        <div
          class="guest-field-shell"
          :class="{ 'guest-field-shell--focused': guestFieldFocused }"
          role="group"
          aria-label="Guests"
          @click="focusGuestInput"
        >
          <v-chip
            v-for="guest in selectedGuests"
            :key="guest._id"
            class="guest-inline-chip"
            closable
            color="primary"
            variant="tonal"
            size="small"
            @click:close.stop="removeGuest(guest)"
            @mousedown.prevent.stop
          >
            <template #prepend>
              <InitialsAvatar
                class="guest-inline-chip__avatar"
                :name="guestDisplayName(guest)"
                :src="getClientAvatarSrc(guest.profile?.gender, guest.profile?.avatar)"
                :size="20"
              />
            </template>
            {{ guestDisplayName(guest) }}
          </v-chip>
          <input
            ref="guestInputRef"
            v-model="guestSearch"
            class="guest-field-input"
            type="text"
            placeholder="Add guests"
            autocomplete="off"
            @focus="onGuestFieldFocus"
            @blur="onGuestBlur"
            @input="onGuestInput"
          />
        </div>
        <div v-if="showGuestDropdown && filteredGuests.length > 0" class="guest-dropdown">
          <div
            v-for="client in filteredGuests"
            :key="client._id"
            class="guest-item"
            @mousedown.prevent="toggleGuest(client)"
          >
            <div class="guest-check" :class="{ selected: isSelected(client) }">
              <v-icon v-if="isSelected(client)" size="18" color="white">mdi-check</v-icon>
            </div>
            <InitialsAvatar
              :name="guestDisplayName(client)"
              :src="getClientAvatarSrc(client.profile?.gender, client.profile?.avatar)"
              :size="34"
            />
            <span class="guest-name">{{ guestDisplayName(client) }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="d-flex justify-end">
        <v-btn class="save-btn" rounded :loading="saving" @click="handleSave">Save</v-btn>
      </div>
    </div>
  </CrudDialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import CrudDialog from './CrudDialog.vue'
import InitialsAvatar from './InitialsAvatar.vue'
import { createAppointment } from '@/services/schedule.service'
import { useClientStore } from '@/stores/client.store'
import { getClientAvatarSrc } from '@/utils/clientAvatar'
import {
  buildAppointmentRangeIso,
  parseMeridiemTime,
  toLocalDayDate,
} from '@/utils/scheduleAppointmentPayload'

const CATEGORY_OPTIONS = ['First Consultation', 'Follow Up', 'Weekly Review']

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** Pre-selected chip when the dialog opens (consultation category). */
  defaultCategory: {
    type: String,
    default: 'First Consultation',
  },
  /** Pre-filled guest client objects when the dialog opens. */
  defaultGuests: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const clientStore = useClientStore()

const saving = ref(false)
const saveError = ref('')
const dateMenu = ref(false)
const guestSearch = ref('')
const guestInputRef = ref(null)
const guestFieldFocused = ref(false)
const showGuestDropdown = ref(false)
const selectedGuests = ref([])

const categoryOptions = CATEGORY_OPTIONS

const form = reactive({
  title: '',
  category: CATEGORY_OPTIONS[0],
  date: null,
  timeStart: '10:00 am',
  timeEnd: '10:30 am',
})

const filteredGuests = computed(() => {
  const q = guestSearch.value.trim().toLowerCase()
  if (!q) return []
  return clientStore.clients.filter((c) => {
    const name = (c.profile?.fullName || c.fullName || '').toLowerCase()
    return name.includes(q)
  })
})

function guestDisplayName(client) {
  return client.profile?.fullName || client.fullName || ''
}

function isSelected(client) {
  return selectedGuests.value.some((g) => g._id === client._id)
}

function removeGuest(client) {
  selectedGuests.value = selectedGuests.value.filter((g) => g._id !== client._id)
}

function toggleGuest(client) {
  if (isSelected(client)) {
    selectedGuests.value = selectedGuests.value.filter((g) => g._id !== client._id)
  } else {
    selectedGuests.value.push(client)
  }
}

function onGuestInput() {
  showGuestDropdown.value = true
}

function focusGuestInput() {
  guestInputRef.value?.focus()
}

function onGuestFieldFocus() {
  guestFieldFocused.value = true
  showGuestDropdown.value = true
}

function onGuestBlur() {
  setTimeout(() => {
    guestFieldFocused.value = false
    showGuestDropdown.value = false
  }, 150)
}

function generateTimeOptions() {
  const options = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour12 = h % 12 || 12
      const period = h < 12 ? 'am' : 'pm'
      const minStr = m === 0 ? '00' : '30'
      options.push(`${hour12}:${minStr} ${period}`)
    }
  }
  return options
}

const timeOptions = generateTimeOptions()

/** Today as local calendar date (midnight). */
function startOfLocalToday() {
  const t = new Date()
  return new Date(t.getFullYear(), t.getMonth(), t.getDate())
}

/** `YYYY-MM-DD` for v-date-picker `min` (local today). */
const minScheduleDateStr = computed(() => {
  const t = startOfLocalToday()
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const d = String(t.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})

function isSameLocalDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Start-time options: on today, drop slots that are already in the past. */
const availableTimeStartOptions = computed(() => {
  const day = toLocalDayDate(form.date)
  if (!day) return timeOptions
  const today = startOfLocalToday()
  if (!isSameLocalDay(day, today)) return timeOptions
  const nowMs = Date.now()
  return timeOptions.filter((opt) => {
    const p = parseMeridiemTime(opt)
    if (!p) return false
    const slot = new Date(day)
    slot.setHours(p.hours, p.minutes, 0, 0)
    return slot.getTime() >= nowMs
  })
})

function clampStartEndToAllowed() {
  const starts = availableTimeStartOptions.value
  if (!form.date || !starts.length) return
  if (!starts.includes(form.timeStart)) {
    form.timeStart = starts[0]
  }
  try {
    let { startTime, endTime } = buildAppointmentRangeIso(form.date, form.timeStart, form.timeEnd)
    if (new Date(startTime).getTime() < Date.now()) {
      form.timeStart = starts[0]
      ;({ startTime, endTime } = buildAppointmentRangeIso(form.date, form.timeStart, form.timeEnd))
    }
    if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
      const idx = timeOptions.indexOf(form.timeStart)
      if (idx >= 0 && idx < timeOptions.length - 1) {
        form.timeEnd = timeOptions[idx + 1]
      }
    }
  } catch {
    const idx = timeOptions.indexOf(form.timeStart)
    if (idx >= 0 && idx < timeOptions.length - 1) {
      form.timeEnd = timeOptions[idx + 1]
    }
  }
}

// Load clients when dialog opens; sync defaults
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      saveError.value = ''
      form.category = CATEGORY_OPTIONS.includes(props.defaultCategory)
        ? props.defaultCategory
        : CATEGORY_OPTIONS[0]
      form.date = startOfLocalToday()
      form.timeStart = '10:00 am'
      form.timeEnd = '10:30 am'
      selectedGuests.value = props.defaultGuests ? [...props.defaultGuests] : []
      if (!clientStore.clients.length) {
        clientStore.fetchAllClients({ limit: 200 })
      }
      queueMicrotask(() => clampStartEndToAllowed())
    }
  },
)

watch(
  () => [form.date, availableTimeStartOptions.value],
  () => {
    if (!props.modelValue) return
    clampStartEndToAllowed()
  },
)

watch(
  () => form.timeStart,
  () => {
    if (!props.modelValue) return
    clampStartEndToAllowed()
  },
)

const formattedDate = computed(() => {
  if (!form.date) return ''
  return new Date(form.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function resetForm() {
  Object.assign(form, {
    title: '',
    category: CATEGORY_OPTIONS[0],
    date: startOfLocalToday(),
    timeStart: '10:00 am',
    timeEnd: '10:30 am',
  })
  selectedGuests.value = []
  guestSearch.value = ''
}

async function handleSave() {
  saveError.value = ''
  saving.value = true
  try {
    const { startTime, endTime } = buildAppointmentRangeIso(form.date, form.timeStart, form.timeEnd)
    if (new Date(startTime).getTime() < Date.now()) {
      saveError.value = 'Meetings cannot be scheduled in the past.'
      return
    }
    const title = form.title.trim() || form.category
    await createAppointment({
      title,
      type: form.category,
      startTime,
      endTime,
      guestIds: selectedGuests.value.map((g) => g._id).filter(Boolean),
    })
    emit('saved')
    emit('update:modelValue', false)
    resetForm()
  } catch (e) {
    const data = e?.response?.data
    const msg = data?.message ?? data?.error ?? e?.message
    saveError.value = typeof msg === 'string' ? msg : 'Could not save appointment. Try again.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.schedule-meeting-content {
  position: relative;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.type-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-chip {
  border: 1.5px solid #e0e0e0;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  background: #fff;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
}

.type-chip:hover {
  border-color: rgba(124, 58, 237, 0.35);
}

.type-chip--active {
  background: #fce7f3;
  color: #7c3aed;
  border-color: rgba(168, 85, 247, 0.45);
}

.save-btn {
  background: linear-gradient(90deg, #e8559a 0%, #c84bbd 100%);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  padding: 0 32px;
  height: 40px;
  box-shadow: none;
  text-transform: none;
  letter-spacing: 0;
}

.guest-field-shell {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 6px 12px;
  border: 1px solid rgba(0, 0, 0, 0.38);
  border-radius: 4px;
  cursor: text;
  transition:
    border-color 0.15s ease,
    border-width 0.15s ease,
    padding 0.15s ease;
}

.guest-field-shell--focused {
  border-color: rgb(var(--v-theme-primary));
  border-width: 2px;
  padding: 5px 11px;
}

.guest-field-input {
  flex: 1;
  min-width: 120px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  padding: 4px 0;
  color: #1a1a2e;
}

.guest-field-input::placeholder {
  color: rgba(0, 0, 0, 0.38);
}

.guest-inline-chip {
  margin-block: 2px !important;
  padding-inline-start: 4px !important;
}

.guest-inline-chip__avatar {
  margin-inline-end: 2px;
}

.guests-autocomplete {
  position: relative;
}

.guest-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 2px);
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 5000;
  max-height: 220px;
  overflow-y: auto;
}

.guest-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.12s;
}

.guest-item:hover {
  background: #f8f5ff;
}

.guest-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.guest-check.selected {
  background: #7c3aed;
  border-color: #7c3aed;
}

.guest-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a2e;
}
</style>

<style>
/* Unscoped: Vuetify date menu is teleported — lift above dialog overlay */
.schedule-meeting-date-menu {
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.15) !important;
}
</style>
