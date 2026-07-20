<template>
  <v-dialog
    :model-value="modelValue"
    max-width="900"
    scrollable
    transition="fade-transition"
    class="medical-preview-dialog-root"
    @update:model-value="onDialogUpdate"
  >
    <div v-if="record" class="preview-layout">
      <div class="preview-sheet">
        <button
          type="button"
          class="preview-fab preview-fab--close"
          aria-label="Close"
          title="Close"
          @click="close"
        >
          <v-icon size="22" class="preview-fab__ico">mdi-close</v-icon>
        </button>

        <div class="preview-sheet__body">
          <div v-if="record.structuredReport" class="structured-report-shell">
            <StructuredLabReportView :report="record.structuredReport" />
          </div>

          <div v-else-if="isPdf" class="preview-pdf-wrap">
            <v-progress-linear
              v-if="pdfLoading"
              indeterminate
              color="primary"
              class="pdf-progress"
            />
            <div v-if="pdfLoadError" class="pa-8 text-center">
              <p class="text-body-2 text-medium-emphasis mb-0">Preview could not be loaded.</p>
            </div>
            <div v-show="!pdfLoadError" ref="pdfHostRef" class="preview-pdf-canvas-host" />
          </div>

          <div v-else-if="isImage" class="preview-image-wrap">
            <img :src="record.fileUrl" :alt="record.fileName || ''" class="preview-image" />
          </div>

          <div v-else class="pa-10 text-center">
            <p class="text-body-2 text-medium-emphasis mb-6">
              Inline preview is not available for this file type.
            </p>
          </div>
        </div>

        <div v-if="hasFileActions" class="preview-fabs">
          <button
            type="button"
            class="preview-fab"
            aria-label="Download"
            title="Download"
            @click="downloadFile"
          >
            <v-icon size="22" class="preview-fab__ico">mdi-download</v-icon>
          </button>
          <button
            type="button"
            class="preview-fab"
            aria-label="Open in full screen"
            title="Open in new tab"
            @click="openInNewTab"
          >
            <v-icon size="22" class="preview-fab__ico">mdi-fullscreen</v-icon>
          </button>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import StructuredLabReportView from './StructuredLabReportView.vue'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  record: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const pdfHostRef = ref(null)
const pdfLoading = ref(false)
const pdfLoadError = ref(false)

let renderGeneration = 0

const mime = computed(() => {
  const rec = props.record
  if (!rec) {
    return ''
  }
  const m = rec.mimeType || ''
  if (m) {
    return m
  }
  const u = (rec.fileUrl || '').toLowerCase()
  if (u.endsWith('.pdf') || /\.pdf(\?|#|$)/i.test(u)) {
    return 'application/pdf'
  }
  if (/\.(png|jpe?g|gif|webp|bmp)$/i.test(u)) {
    return 'image/*'
  }
  return ''
})

const isPdf = computed(() => mime.value.includes('pdf'))
const isImage = computed(() => mime.value.startsWith('image/'))

const hasFileActions = computed(() => {
  const u = props.record?.fileUrl
  return typeof u === 'string' && u.trim().length > 0
})

watch(
  () => [props.modelValue, props.record?.fileUrl, isPdf.value],
  () => {
    queuePdfRender()
  },
  { flush: 'post' },
)

onBeforeUnmount(() => {
  renderGeneration += 1
  clearPdfHost()
})

function clearPdfHost() {
  const el = pdfHostRef.value
  if (el) {
    el.innerHTML = ''
  }
}

async function queuePdfRender() {
  if (!props.modelValue || !props.record || !isPdf.value) {
    pdfLoading.value = false
    pdfLoadError.value = false
    clearPdfHost()
    return
  }

  const url = props.record.fileUrl
  if (!url || typeof url !== 'string') {
    pdfLoadError.value = true
    return
  }

  const gen = ++renderGeneration
  pdfLoading.value = true
  pdfLoadError.value = false
  clearPdfHost()

  await nextTick()
  if (gen !== renderGeneration) {
    return
  }

  const host = pdfHostRef.value
  if (!host) {
    pdfLoading.value = false
    return
  }

  await loadPdfIntoHost(gen, url, host)
}

async function loadPdfIntoHost(gen, url, host) {
  try {
    const loadingTask = pdfjsLib.getDocument({ url })
    const pdf = await loadingTask.promise
    if (gen !== renderGeneration) {
      await pdf.destroy().catch(() => {})
      return
    }
    const maxW = Math.max(320, host.clientWidth || host.offsetWidth || 640)
    await appendPdfPagesSequential(pdf, host, gen, maxW)
  } catch (e) {
    console.error(e)
    if (gen === renderGeneration) {
      pdfLoadError.value = true
      clearPdfHost()
    }
  } finally {
    if (gen === renderGeneration) {
      pdfLoading.value = false
    }
  }
}

/** Renders pages one-by-one (required for canvas + memory). */
async function appendPdfPagesSequential(pdf, host, gen, maxW) {
  /* eslint-disable no-await-in-loop -- sequential PDF page render */
  const numPages = pdf.numPages
  try {
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (gen !== renderGeneration) {
        return
      }
      const page = await pdf.getPage(pageNum)
      const base = page.getViewport({ scale: 1 })
      const scale = Math.min(2, maxW / base.width)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height
      canvas.className = 'pdf-page-canvas'
      const renderTask = page.render({
        canvasContext: ctx,
        viewport,
      })
      await renderTask.promise
      host.appendChild(canvas)
    }
  } finally {
    await pdf.destroy().catch(() => {})
  }
  /* eslint-enable no-await-in-loop */
}

function close() {
  emit('update:modelValue', false)
}

function onDialogUpdate(value) {
  emit('update:modelValue', value)
}

function suggestedFileName() {
  const n = props.record?.fileName
  if (n && String(n).trim()) {
    return String(n).trim()
  }
  const url = props.record?.fileUrl || ''
  try {
    const path = new URL(url, window.location.origin).pathname
    const last = path.split('/').filter(Boolean).pop()
    if (last) {
      return last.split('?')[0] || 'medical-record'
    }
  } catch {
    /* ignore */
  }
  return 'medical-record'
}

async function downloadFile() {
  const url = props.record?.fileUrl
  if (!url || typeof url !== 'string') {
    return
  }
  const name = suggestedFileName()
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
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

function openInNewTab() {
  const url = props.record?.fileUrl
  if (!url || typeof url !== 'string') {
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.preview-layout {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 8px;
  min-height: min-content;
  box-sizing: border-box;
}

.preview-sheet {
  position: relative;
  width: 100%;
  max-width: min(720px, 100%);
  max-height: min(88vh, 900px);
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: visible;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.preview-sheet__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.preview-pdf-wrap {
  position: relative;
  width: 100%;
  min-height: 280px;
  background: #eceff1;
}

.pdf-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
}

.preview-pdf-canvas-host {
  padding: 12px 12px 20px;
  box-sizing: border-box;
}

.preview-pdf-canvas-host :deep(.pdf-page-canvas) {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  margin: 0 auto 12px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: none;
}

.preview-pdf-canvas-host :deep(.pdf-page-canvas:last-child) {
  margin-bottom: 0;
}

.preview-image-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #eceff1;
  min-height: 200px;
}

.preview-image {
  max-width: 100%;
  width: auto;
  height: auto;
  max-height: min(70vh, 800px);
  object-fit: contain;
}

.structured-report-shell {
  position: relative;
  min-height: 200px;
  background: #fff;
  padding: 8px 8px 24px;
}

:deep(.lab-report--cbc .lab-report__card) {
  border: none;
  box-shadow: none;
}

.preview-fab__ico {
  color: #f48fb1;
}

.preview-fab--close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
}

.preview-fabs {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.preview-fab {
  pointer-events: auto;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.08);
  transition:
    background 0.15s ease,
    transform 0.1s ease;
}

.preview-fab:hover {
  background: #fce4ec;
  transform: scale(1.04);
}

.preview-fab:hover .preview-fab__ico {
  color: #ec407a;
}
</style>

<style>
.medical-preview-dialog-root .v-overlay__scrim {
  background-color: rgba(0, 0, 0, 0.55) !important;
  backdrop-filter: blur(2px);
}

/* One surface only: strip default overlay content chrome so it doesn’t look stacked */
.medical-preview-dialog-root .v-overlay__content {
  padding: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  overflow: visible;
}
</style>
