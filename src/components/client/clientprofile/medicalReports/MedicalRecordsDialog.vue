<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1040"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="medical-records-card" elevation="0">
      <header class="mrd-header">
        <div class="mrd-header-left">
          <button
            type="button"
            class="mrd-back"
            aria-label="Back to folders"
            title="Back to folders"
            @click="goBack"
          >
            <v-icon size="20" color="grey-darken-2">mdi-arrow-left</v-icon>
          </button>
          <h2 class="mrd-title">{{ dialogTitle }}</h2>
        </div>
        <button type="button" class="mrd-close" aria-label="Close" @click="close">
          <v-icon size="20" color="grey-darken-1">mdi-close</v-icon>
        </button>
      </header>

      <v-card-text
        class="mrd-body"
        :class="{ 'mrd-body--drag': isDragOver }"
        tabindex="-1"
        @dragenter.prevent="onDragEnter"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop"
      >
        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4 rounded" />

        <p v-if="loadError" class="text-error text-body-2 mb-4">{{ loadError }}</p>

        <p class="text-body-2 text-medium-emphasis mb-3 mrd-drop-hint">
          <!-- Drag and drop files here, paste from the clipboard (Ctrl+V), or use Add file. -->
        </p>

        <div class="records-grid">
          <div v-for="rec in displayRecords" :key="rec.key" class="record-tile">
            <div class="record-tile__inner">
              <button type="button" class="record-tile__main" @click="openPreview(rec)">
                <div class="record-tile__thumb">
                  <iframe
                    v-if="rec.pdfPreviewSrc"
                    class="record-tile__pdf"
                    :src="rec.pdfPreviewSrc"
                    :title="rec.fileName || 'PDF'"
                    tabindex="-1"
                  />
                  <img
                    v-else-if="rec.thumbSrc"
                    :src="rec.thumbSrc"
                    :alt="rec.fileName"
                    class="record-tile__img"
                  />
                  <div
                    v-else-if="rec.structuredHint"
                    class="record-tile__structured d-flex flex-column align-center justify-center text-center px-3"
                  >
                    <span class="record-tile__structured-title text-body-2">
                      {{ rec.structuredHint.title }}
                    </span>
                    <span
                      v-if="rec.structuredHint.subtitle"
                      class="record-tile__structured-sub text-caption text-medium-emphasis mt-1"
                    >
                      {{ rec.structuredHint.subtitle }}
                    </span>
                  </div>
                  <div v-else class="record-tile__placeholder d-flex align-center justify-center">
                    <v-icon size="40" color="grey">mdi-file-document-outline</v-icon>
                  </div>
                </div>
              </button>
              <button
                v-if="canDownload(rec)"
                type="button"
                class="record-tile__download-btn"
                title="Download medical record"
                aria-label="Download medical record"
                @click.stop="downloadRecord(rec)"
              >
                <v-icon size="20" class="record-tile__download-ico">mdi-download</v-icon>
              </button>
              <button
                type="button"
                class="record-tile__preview-btn"
                title="Preview medical record"
                aria-label="Preview medical record"
                @click.stop="openPreview(rec)"
              >
                <v-icon size="20" class="record-tile__preview-ico">mdi-fullscreen</v-icon>
              </button>
            </div>
          </div>

          <button type="button" class="add-file-tile" @click="triggerFileInput">
            <v-icon size="44" color="grey-darken-1" class="add-file-tile__icon">
              mdi-cloud-upload-outline
            </v-icon>
            <span class="add-file-tile__title">Add file</span>
            <span class="add-file-tile__hint">PDF or images · max 10MB</span>
          </button>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          class="visually-hidden"
          accept="image/*,.pdf,application/pdf"
          multiple
          @change="onFilesSelected"
        />
      </v-card-text>

      <footer class="mrd-footer">
        <button
          type="button"
          class="mrd-save"
          :disabled="!pendingFiles.length || saving"
          @click="savePending"
        >
          <v-progress-circular
            v-if="saving"
            indeterminate
            size="18"
            width="2"
            class="mrd-save__spinner"
            color="green-darken-4"
          />
          Save
        </button>
      </footer>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000">
      {{ snackbar.text }}
    </v-snackbar>

    <MedicalRecordPreviewDialog v-model="previewOpen" :record="previewRecord" />
  </v-dialog>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import MedicalRecordPreviewDialog from './MedicalRecordPreviewDialog.vue'
import {
  fetchClientMedicalRecordsByFolder,
  normalizeMedicalRecord,
  uploadClientMedicalRecords,
} from '@/services/medicalRecords.service'
import { pdfEmbedUrl } from '@/utils/pdfEmbedUrl'

const MAX_BYTES = 10 * 1024 * 1024
const DEFAULT_FOLDER = 'Diagnostics'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  clientId: { type: String, default: '' },
  folderName: { type: String, default: 'Diagnostics' },
  /** Legacy single URL from client.medicalProfile.medicalReport */
  legacyReportUrl: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'saved', 'back'])

const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const records = ref([])
const pendingFiles = ref([])
const fileInputRef = ref(null)
const isDragOver = ref(false)

const previewOpen = ref(false)
const previewRecord = ref(null)

const snackbar = ref({ show: false, text: '', color: 'success' })

const normalizedFolderName = computed(() => {
  const v = (props.folderName || '').trim()
  return v || DEFAULT_FOLDER
})

const dialogTitle = computed(() => normalizedFolderName.value)

function showSnackbar(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

function close() {
  emit('update:modelValue', false)
}

function goBack() {
  emit('back')
}

function clearPendingFiles() {
  for (const pending of pendingFiles.value) {
    const u = pending?.record?.fileUrl
    if (typeof u === 'string' && u.startsWith('blob:')) {
      URL.revokeObjectURL(u)
    }
  }
  pendingFiles.value = []
}

function mergeLegacyEntries(list) {
  if (normalizedFolderName.value !== DEFAULT_FOLDER) {
    return list
  }
  const url = (props.legacyReportUrl || '').trim()
  if (!url) {
    return list
  }
  const dup = list.some((r) => (r.fileUrl || '') === url)
  if (dup) {
    return list
  }
  const legacy = normalizeMedicalRecord({
    _id: 'legacy-medical-report',
    fileName: 'Medical report',
    folderName: DEFAULT_FOLDER,
    fileUrl: url,
    isLegacy: true,
  })
  return legacy ? [legacy, ...list] : list
}

async function loadRecords() {
  if (!props.clientId) {
    records.value = []
    return
  }
  loading.value = true
  loadError.value = ''
  try {
    const list = await fetchClientMedicalRecordsByFolder(props.clientId, normalizedFolderName.value)
    const selectedFolder = normalizedFolderName.value
    const filtered = list.filter((record) => {
      const folder = (record?.folderName || DEFAULT_FOLDER).trim() || DEFAULT_FOLDER
      return folder === selectedFolder
    })
    records.value = mergeLegacyEntries(filtered)
  } catch (e) {
    console.error(e)
    loadError.value =
      'Could not load medical records. You can still add files and save when the API is available.'
    records.value = mergeLegacyEntries([])
  } finally {
    loading.value = false
  }
}

function thumbForRecord(rec) {
  if (rec.thumbnailUrl) {
    return rec.thumbnailUrl
  }
  const u = (rec.fileUrl || '').toLowerCase()
  const mime = rec.mimeType || ''
  if (mime.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(u)) {
    return rec.fileUrl
  }
  return ''
}

function isPdfRecord(rec) {
  const m = (rec.mimeType || '').toLowerCase()
  if (m.includes('pdf')) {
    return true
  }
  const u = (rec.fileUrl || '').toLowerCase()
  return u.endsWith('.pdf') || /\.pdf(\?|#|$)/.test(u)
}

/** Embed URL for grid PDF thumbnail (first-page preview in iframe) */
function pdfThumbEmbedUrl(url) {
  return pdfEmbedUrl(url)
}

function structuredThumbHint(rec) {
  const sr = rec.structuredReport
  if (!sr || typeof sr !== 'object') {
    return null
  }
  const title = (sr.reportTitle || 'Medical report').trim() || 'Medical report'
  const n = Array.isArray(sr.tests) ? sr.tests.length : 0
  let subtitle = ''
  if (n > 0) {
    const suffix = n === 1 ? '' : 's'
    subtitle = `${n} line${suffix}`
  }
  return { title, subtitle }
}

function tileFieldsForServerRecord(r) {
  const thumbSrc = thumbForRecord(r)
  if (thumbSrc) {
    return { thumbSrc, pdfPreviewSrc: '', structuredHint: null }
  }
  if (isPdfRecord(r) && r.fileUrl) {
    return { thumbSrc: '', pdfPreviewSrc: pdfThumbEmbedUrl(r.fileUrl), structuredHint: null }
  }
  const hint = structuredThumbHint(r)
  if (hint) {
    return { thumbSrc: '', pdfPreviewSrc: '', structuredHint: hint }
  }
  return { thumbSrc: '', pdfPreviewSrc: '', structuredHint: null }
}

const displayRecords = computed(() => {
  const server = records.value.map((r) => {
    const tf = tileFieldsForServerRecord(r)
    return {
      key: `s-${r.id}`,
      raw: r,
      fileName: r.fileName,
      thumbSrc: tf.thumbSrc,
      pdfPreviewSrc: tf.pdfPreviewSrc,
      structuredHint: tf.structuredHint,
    }
  })
  const pending = pendingFiles.value.map((p) => {
    const f = p.file
    const isImg = f.type.startsWith('image/')
    const isPdf = f.type === 'application/pdf'
    const url = p.record.fileUrl
    return {
      key: p.key,
      raw: p.record,
      fileName: f.name,
      thumbSrc: isImg ? url : '',
      pdfPreviewSrc: isPdf && url ? pdfThumbEmbedUrl(url) : '',
      structuredHint: null,
    }
  })
  return [...server, ...pending]
})

function openPreview(entry) {
  previewRecord.value = entry.raw
  previewOpen.value = true
}

function canDownload(entry) {
  const url = entry?.raw?.fileUrl
  return typeof url === 'string' && url.trim().length > 0
}

function suggestedFileName(entry) {
  const n = entry?.raw?.fileName
  if (n && String(n).trim()) {
    return String(n).trim()
  }
  const url = entry?.raw?.fileUrl || ''
  try {
    const path = new URL(url, globalThis.location.origin).pathname
    const last = path.split('/').filter(Boolean).pop()
    if (last) {
      return last.split('?')[0] || 'medical-record'
    }
  } catch {
    /* ignore */
  }
  return 'medical-record'
}

async function downloadRecord(entry) {
  const url = entry?.raw?.fileUrl
  if (!url || typeof url !== 'string') {
    return
  }
  const name = suggestedFileName(entry)
  if (url.startsWith('blob:')) {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.rel = 'noopener'
    a.click()
    return
  }
  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' })
    if (!res.ok) {
      throw new Error(String(res.status))
    }
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = name
    a.rel = 'noopener'
    a.click()
    URL.revokeObjectURL(objectUrl)
  } catch {
    globalThis.open(url, '_blank', 'noopener,noreferrer')
  }
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function isAcceptedMedicalFile(file) {
  if (!file || typeof file.size !== 'number') {
    return false
  }
  const t = (file.type || '').toLowerCase()
  if (t.startsWith('image/')) {
    return true
  }
  if (t === 'application/pdf') {
    return true
  }
  const name = (file.name || '').toLowerCase()
  if (name.endsWith('.pdf')) {
    return true
  }
  return /\.(png|jpe?g|gif|webp|bmp)$/i.test(name)
}

function dedupeFiles(files) {
  const seen = new Set()
  const out = []
  for (const f of files) {
    if (!f) {
      continue
    }
    const key = `${f.name || 'file'}-${f.size}-${f.lastModified}`
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    out.push(f)
  }
  return out
}

function addFilesFromFileList(files) {
  const raw = Array.from(files || [])
  const list = dedupeFiles(raw.filter(isAcceptedMedicalFile))
  const rejectedType = raw.filter((f) => f && !isAcceptedMedicalFile(f)).length
  if (!list.length) {
    if (raw.length) {
      showSnackbar('Only PDF and image files are allowed.', 'warning')
    }
    return
  }
  list.forEach((file, index) => {
    if (file.size > MAX_BYTES) {
      showSnackbar(`"${file.name}" is larger than 10MB.`, 'error')
      return
    }
    const objectUrl = URL.createObjectURL(file)
    const record = {
      id: `pending-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
      fileName: file.name,
      fileUrl: objectUrl,
      mimeType: file.type,
      isPending: true,
    }
    pendingFiles.value.push({
      key: record.id,
      file,
      record,
    })
  })
  if (rejectedType) {
    showSnackbar('Some items were skipped (only PDF and images).', 'warning')
  }
}

function onFilesSelected(e) {
  const input = e.target
  const files = Array.from(input.files || [])
  input.value = ''
  addFilesFromFileList(files)
}

function onDragEnter() {
  isDragOver.value = true
}

function onDragOver(e) {
  e.dataTransfer.dropEffect = 'copy'
  isDragOver.value = true
}

function onDragLeave(e) {
  const el = e.currentTarget
  const next = e.relatedTarget
  if (next && el.contains(next)) {
    return
  }
  isDragOver.value = false
}

function onDrop(e) {
  isDragOver.value = false
  const dt = e.dataTransfer
  const files = dt?.files ? Array.from(dt.files) : []
  addFilesFromFileList(files)
}

function collectFilesFromClipboardData(dt) {
  if (!dt) {
    return []
  }
  const collected = []
  if (dt.files?.length) {
    collected.push(...Array.from(dt.files))
  }
  if (dt.items?.length) {
    for (const item of dt.items) {
      if (item.kind === 'file') {
        const f = item.getAsFile()
        if (f) {
          collected.push(f)
        }
      }
    }
  }
  return dedupeFiles(collected)
}

function isPasteTargetEditable(target) {
  if (!target) {
    return false
  }
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    return true
  }
  return typeof target.isContentEditable === 'boolean' && target.isContentEditable
}

function onWindowPaste(e) {
  if (!props.modelValue || isPasteTargetEditable(e.target)) {
    return
  }
  const unique = collectFilesFromClipboardData(e.clipboardData)
  const accepted = unique.filter(isAcceptedMedicalFile)
  if (!accepted.length) {
    if (unique.length) {
      showSnackbar('Only PDF and image files are allowed.', 'warning')
    }
    return
  }
  e.preventDefault()
  addFilesFromFileList(accepted)
}

onUnmounted(() => {
  globalThis.removeEventListener('paste', onWindowPaste, true)
})

async function savePending() {
  if (!props.clientId || !pendingFiles.value.length) {
    return
  }
  const queue = pendingFiles.value
  const files = queue.map((p) => p.file)
  pendingFiles.value = []
  for (const p of queue) {
    const u = p.record?.fileUrl
    if (typeof u === 'string' && u.startsWith('blob:')) {
      URL.revokeObjectURL(u)
    }
  }
  saving.value = true
  try {
    await uploadClientMedicalRecords(props.clientId, files, normalizedFolderName.value)
    await loadRecords()
    showSnackbar('Medical records saved.')
    emit('saved')
  } catch (err) {
    console.error(err)
    showSnackbar(err.response?.data?.message || 'Upload failed. Please try again.', 'error')
  } finally {
    saving.value = false
  }
}

watch(
  () => [props.modelValue, normalizedFolderName.value],
  ([open, folderName], [prevOpen, prevFolderName]) => {
    if (open) {
      if (prevOpen && prevFolderName && prevFolderName !== folderName) {
        clearPendingFiles()
      }
      globalThis.addEventListener('paste', onWindowPaste, true)
      loadRecords()
    } else {
      globalThis.removeEventListener('paste', onWindowPaste, true)
      previewOpen.value = false
      previewRecord.value = null
      isDragOver.value = false
      clearPendingFiles()
    }
  },
)
</script>

<style scoped>
.medical-records-card {
  overflow: hidden;
  border-radius: 20px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.04),
    0 20px 48px rgba(0, 0, 0, 0.1);
}

.mrd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 28px 12px;
}

.mrd-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.mrd-title {
  margin: 0;
  font-size: 1.28rem;
  font-weight: 700;
  color: #212121;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.mrd-back {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f0f0f0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}

.mrd-back:hover {
  background: #e8e8e8;
}

.mrd-back:focus-visible {
  outline: 2px solid #00897b;
  outline-offset: 2px;
}

.mrd-close {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #f0f0f0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}

.mrd-close:hover {
  background: #e8e8e8;
}

.mrd-close:focus-visible {
  outline: 2px solid #00897b;
  outline-offset: 2px;
}

.mrd-body {
  padding: 8px 28px 24px !important;
  outline: none;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.mrd-body:focus-visible {
  box-shadow: inset 0 0 0 2px rgba(244, 143, 177, 0.5);
}

.mrd-body--drag {
  background: rgba(252, 228, 236, 0.45) !important;
  box-shadow: inset 0 0 0 2px #f48fb1;
}

.mrd-drop-hint {
  line-height: 1.45;
}

.records-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  align-items: stretch;
}

@media (max-width: 960px) {
  .records-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
}

@media (max-width: 600px) {
  .records-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .mrd-header,
  .mrd-body {
    padding-left: 18px !important;
    padding-right: 18px !important;
  }
}

.record-tile {
  display: block;
  text-align: left;
  color: inherit;
}

.record-tile__inner {
  position: relative;
}

.record-tile__main {
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  color: inherit;
  font: inherit;
}

.record-tile__preview-btn {
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 8;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fce4ec;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  transition:
    background 0.15s ease,
    transform 0.12s ease;
}

.record-tile__download-btn {
  position: absolute;
  left: 8px;
  bottom: 8px;
  z-index: 8;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fce4ec;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  transition:
    background 0.15s ease,
    transform 0.12s ease;
}

.record-tile__download-btn:hover {
  background: #f8bbd0;
  transform: scale(1.06);
}

.record-tile__download-btn:focus-visible {
  outline: 2px solid #ad1457;
  outline-offset: 2px;
}

.record-tile__download-ico {
  color: #7b1fa2 !important;
  opacity: 0.95;
}

.record-tile__preview-btn:hover {
  background: #f8bbd0;
  transform: scale(1.06);
}

.record-tile__preview-btn:focus-visible {
  outline: 2px solid #ad1457;
  outline-offset: 2px;
}

.record-tile__preview-ico {
  color: #7b1fa2 !important;
  opacity: 0.95;
}

.record-tile__thumb {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  aspect-ratio: 3 / 4;
  background: #fafafa;
}

.record-tile__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}

.record-tile__pdf {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
  pointer-events: none;
  background: #eceff1;
}

.record-tile__structured {
  width: 100%;
  height: 100%;
  min-height: 0;
  background: linear-gradient(180deg, #fafafa 0%, #eceff1 100%);
}

.record-tile__structured-title {
  font-weight: 700;
  color: #00897b;
  line-height: 1.35;
}

.record-tile__structured-sub {
  line-height: 1.25;
}

.record-tile__placeholder {
  width: 100%;
  height: 100%;
  background: #eceff1;
}

.add-file-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  aspect-ratio: 3 / 4;
  min-height: 0;
  border: 2px dashed #cfd8dc;
  border-radius: 14px;
  background: #f5f5f5;
  cursor: pointer;
  color: #757575;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.add-file-tile:hover {
  background: #eeeeee;
  border-color: #b0bec5;
}

.add-file-tile__icon {
  opacity: 0.85;
}

.add-file-tile__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #616161;
}

.add-file-tile__hint {
  font-size: 0.75rem;
  color: #9e9e9e;
  line-height: 1.3;
}

.mrd-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 28px 22px;
  border-top: 1px solid #eeeeee;
  background: #fff;
}

.mrd-save {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 132px;
  padding: 12px 32px;
  border: none;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #2e5c1a;
  background: linear-gradient(180deg, #e8f8c8 0%, #d8f0a8 100%);
  box-shadow: 0 1px 3px rgba(46, 92, 26, 0.15);
  cursor: pointer;
  transition:
    filter 0.15s ease,
    opacity 0.15s ease;
}

.mrd-save:hover:not(:disabled) {
  filter: brightness(1.03);
}

.mrd-save:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.mrd-save:focus-visible {
  outline: 2px solid #558b2f;
  outline-offset: 3px;
}

.mrd-save__spinner {
  margin-right: 4px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
