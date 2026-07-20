<template>
  <v-dialog
    :model-value="modelValue"
    max-width="460"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="export-dialog pa-6">
      <!-- Header -->
      <div class="export-dialog__header">
        <h3 class="export-dialog__title">Export Profile</h3>
        <button class="export-dialog__close" @click="$emit('update:modelValue', false)">
          <v-icon size="20">mdi-close</v-icon>
        </button>
      </div>

      <!-- Idle state -->
      <template v-if="state === 'idle'">
        <p class="export-section-label">Selected clients</p>
        <div class="export-clients-row mb-5">
          <div v-for="client in localClients" :key="clientId(client)" class="client-chip">
            <v-avatar size="26" class="client-chip__avatar">
              <v-img :src="avatarSrc(client)" :alt="clientName(client)" cover />
            </v-avatar>
            <span class="client-chip__name">{{ clientName(client) }}</span>
            <button class="client-chip__remove" @click="removeClient(clientId(client))">
              &times;
            </button>
          </div>
          <button class="client-chip client-chip--add">+ Add Client</button>
        </div>

        <!-- Export As dropdown -->
        <div class="export-as-wrapper mb-2">
          <button class="export-as-trigger" @click="dropdownOpen = !dropdownOpen">
            <span class="export-as-label">{{ selectedFormat || 'Export As' }}</span>
            <v-icon size="20" class="ml-auto">mdi-chevron-down</v-icon>
          </button>
          <div v-if="dropdownOpen" class="export-as-menu">
            <button
              class="export-format-item"
              :class="{ 'export-format-item--active': selectedFormat === 'CSV' }"
              @click="selectFormat('CSV')"
            >
              <v-icon size="20" class="export-format-icon">mdi-file-delimited-outline</v-icon>
              <span>CSV</span>
            </button>
            <button
              class="export-format-item"
              :class="{ 'export-format-item--active': selectedFormat === 'PDF' }"
              @click="selectFormat('PDF')"
            >
              <v-icon size="20" class="export-format-icon">mdi-file-outline</v-icon>
              <span>PDF</span>
            </button>
          </div>
        </div>

        <div class="d-flex justify-end mt-5">
          <button
            class="export-btn"
            :disabled="localClients.length === 0 || !selectedFormat"
            @click="handleExport"
          >
            Export
          </button>
        </div>
      </template>

      <!-- Downloading -->
      <template v-else-if="state === 'downloading'">
        <div class="export-progress-wrap">
          <div class="export-progress-bar">
            <div class="export-progress-fill" :style="{ width: progress + '%' }" />
          </div>
          <p class="export-progress-label">Your download will start automatically.</p>
        </div>
      </template>

      <!-- Done -->
      <template v-else-if="state === 'done'">
        <p class="export-done-msg">
          If the download has not started,
          <a class="export-done-link" :href="downloadUrl" :download="downloadFilename">click here</a
          >.
        </p>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getClientAvatarSrc } from '@/utils/clientAvatar'
import { exportClientsPdf } from '@/services/client.service'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  clients: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'done'])

const localClients = ref([])
const selectedFormat = ref('')
const dropdownOpen = ref(false)
const state = ref('idle')
const progress = ref(0)
const downloadUrl = ref('')
const downloadFilename = ref('clients-export.csv')

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      localClients.value = [...props.clients]
      state.value = 'idle'
      progress.value = 0
      downloadUrl.value = ''
      selectedFormat.value = ''
      dropdownOpen.value = false
    }
  },
)

function clientId(c) {
  return c._id || c.id
}
function clientName(c) {
  return c.profile?.fullName || c.fullName || 'N/A'
}
function avatarSrc(c) {
  return getClientAvatarSrc(c?.profile?.gender, c?.profile?.avatar)
}
function removeClient(id) {
  localClients.value = localClients.value.filter((c) => clientId(c) !== id)
}

function selectFormat(fmt) {
  selectedFormat.value = fmt
  dropdownOpen.value = false
}

function clientTags(c) {
  const specialDiet = (c.dietaryProfile?.specialDiet || []).join('; ')
  const restrictions = (c.dietaryProfile?.dietaryRestrictions || []).join('; ')
  return [specialDiet, restrictions].filter(Boolean).join('; ')
}

function csvEscape(v) {
  return `"${String(v).replace(/"/g, '""')}"`
}

function clientToCsvRow(c) {
  const fields = [
    clientName(c),
    c.profile?.email || c.email || '',
    c.profile?.mobile || c.mobile || '',
    c.dietPlan || c.profile?.dietPlan || 'Balanced Lifestyle',
    c.onboardingStatus || c.status || c.progress || 'On-track',
    clientTags(c),
  ]
  return fields.map(csvEscape).join(',')
}

function buildCsvContent(clients) {
  const headers = ['Name', 'Email', 'Phone', 'Diet Plan', 'Progress', 'Tags']
  return [headers.join(','), ...clients.map(clientToCsvRow)].join('\n')
}

async function handleExport() {
  const ids = localClients.value.map(clientId)

  if (selectedFormat.value === 'PDF') {
    state.value = 'downloading'
    progress.value = 0
    const interval = setInterval(() => {
      progress.value = Math.min(progress.value + 15, 85)
    }, 200)
    try {
      const blob = await exportClientsPdf(ids)
      clearInterval(interval)
      progress.value = 100
      const url = URL.createObjectURL(blob)
      downloadUrl.value = url
      downloadFilename.value = `clients-export-${Date.now()}.pdf`
      const a = document.createElement('a')
      a.href = url
      a.download = downloadFilename.value
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      state.value = 'done'
      emit('done', { action: 'export', clientIds: ids, format: 'PDF' })
    } catch (e) {
      clearInterval(interval)
      state.value = 'idle'
      console.error('PDF export failed:', e)
    }
    return
  }

  state.value = 'downloading'
  progress.value = 0
  const interval = setInterval(() => {
    progress.value = Math.min(progress.value + 20, 90)
  }, 150)
  await new Promise((r) => {
    setTimeout(r, 800)
  })
  clearInterval(interval)
  progress.value = 100

  const csv = buildCsvContent(localClients.value)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  downloadUrl.value = url
  downloadFilename.value = `clients-export-${Date.now()}.csv`

  const a = document.createElement('a')
  a.href = url
  a.download = downloadFilename.value
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  await new Promise((r) => {
    setTimeout(r, 300)
  })
  state.value = 'done'
  emit('done', { action: 'export', clientIds: localClients.value.map(clientId), format: 'CSV' })
}
</script>

<style scoped>
.export-dialog {
  border-radius: 16px !important;
}
.export-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.export-dialog__title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}
.export-dialog__close {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 50%;
  transition: background 0.15s;
}
.export-dialog__close:hover {
  background: #f0f0f0;
}

.export-section-label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
  margin-bottom: 10px;
}
.export-clients-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.client-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 4px;
  background: #f5f5f5;
  border-radius: 999px;
  border: 1px solid #e0e0e0;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}
.client-chip__name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.client-chip__remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #999;
  line-height: 1;
  padding: 0 0 0 2px;
  display: flex;
  align-items: center;
  font-family: inherit;
}
.client-chip__remove:hover {
  color: #d94fa3;
}
.client-chip--add {
  background: #fff;
  border: 1.5px solid #d94fa3;
  color: #d94fa3;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 14px;
  font-size: 13px;
  border-radius: 999px;
  font-family: inherit;
  transition: background 0.15s;
}
.client-chip--add:hover {
  background: #fff0f7;
}

.export-as-wrapper {
  position: relative;
  width: 100%;
}
.export-as-trigger {
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 12px 14px;
  background: #fff;
  font-size: 14px;
  color: #aaa;
  cursor: pointer;
  font-family: inherit;
  gap: 4px;
  transition: border-color 0.15s;
}
.export-as-trigger:hover {
  border-color: #bbb;
}
.export-as-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}
.export-format-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}
.export-format-item:hover {
  background: #faf5fd;
}
.export-format-item--active {
  background: #faf5fd;
  color: #d94fa3;
}
.export-format-icon {
  color: #888;
}
.export-format-item--active .export-format-icon {
  color: #d94fa3;
}
.export-format-item + .export-format-item {
  border-top: 1px solid #f0f0f0;
}

.export-progress-wrap {
  padding: 16px 0;
}
.export-progress-bar {
  height: 8px;
  border-radius: 999px;
  background: #f0e0f8;
  overflow: hidden;
  margin-bottom: 16px;
}
.export-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #d94fa3, #ab2e95);
  border-radius: 999px;
  transition: width 0.15s ease;
}
.export-progress-label {
  font-size: 14px;
  color: #555;
  text-align: center;
}
.export-done-msg {
  font-size: 14px;
  color: #555;
  padding: 12px 0;
}
.export-done-link {
  color: #d94fa3;
  font-weight: 600;
  text-decoration: underline;
}

.export-btn {
  background: linear-gradient(135deg, #d94fa3, #ab2e95);
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 10px 32px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}
.export-btn:hover:not(:disabled) {
  opacity: 0.9;
}
.export-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
