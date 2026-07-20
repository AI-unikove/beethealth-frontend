<!-- eslint-disable vue/no-mutating-props -->
<template>
  <v-card class="add-recipe-content-card rounded-lg pa-5 mb-4">
    <h2 class="add-recipe-section-title mb-4">Add Recipe</h2>

    <div class="d-flex flex-wrap gap-2 mb-4 add-recipe-pills">
      <v-btn
        rounded="pill"
        class="text-none add-recipe-pill"
        :class="{
          'add-recipe-pill--active': form.recipeDocumentFormat === documentFormats.WRITEUP,
        }"
        :variant="form.recipeDocumentFormat === documentFormats.WRITEUP ? 'flat' : 'outlined'"
        @click="$emit('switch-format', documentFormats.WRITEUP)"
      >
        Write text
      </v-btn>
      <v-btn
        rounded="pill"
        class="text-none add-recipe-pill"
        :class="{ 'add-recipe-pill--active': form.recipeDocumentFormat === documentFormats.LINK }"
        :variant="form.recipeDocumentFormat === documentFormats.LINK ? 'flat' : 'outlined'"
        @click="$emit('switch-format', documentFormats.LINK)"
      >
        Paste link
      </v-btn>
      <v-btn
        rounded="pill"
        class="text-none add-recipe-pill"
        :class="{
          'add-recipe-pill--active': form.recipeDocumentFormat === documentFormats.DOCUMENT,
        }"
        :variant="form.recipeDocumentFormat === documentFormats.DOCUMENT ? 'flat' : 'outlined'"
        @click="$emit('switch-format', documentFormats.DOCUMENT)"
      >
        Upload PDF/Image
      </v-btn>
    </div>

    <template v-if="form.recipeDocumentFormat === documentFormats.WRITEUP">
      <v-textarea
        v-model="form.recipeInstructions"
        placeholder="Type or paste your recipe instructions here..."
        variant="outlined"
        density="comfortable"
        rows="6"
        hide-details
        rounded="lg"
        bg-color="white"
        class="recipe-instructions mb-4"
      />
    </template>
    <template v-else-if="form.recipeDocumentFormat === documentFormats.LINK">
      <v-text-field
        v-model="form.recipeDocument"
        label="Recipe link or URL"
        placeholder="Paste Recipe Link or URL here"
        prepend-inner-icon="mdi-link-variant"
        variant="outlined"
        density="comfortable"
        hide-details
        rounded="lg"
        bg-color="white"
        class="mb-2 recipe-link-field"
      />
      <div class="link-preview-wrap mb-4">
        <div v-if="youtubeEmbedSrc" class="link-preview-frame">
          <iframe
            :src="youtubeEmbedSrc"
            title="YouTube video preview"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
              web-share;
            "
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          />
        </div>
        <div v-else-if="vimeoEmbedSrc" class="link-preview-frame">
          <iframe
            :src="vimeoEmbedSrc"
            title="Vimeo video preview"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
          />
        </div>
        <div v-else-if="genericLinkPreview" class="link-preview-generic pa-4">
          <v-icon color="primary" size="40">mdi-web</v-icon>
          <p class="text-body-2 font-weight-medium mb-0">{{ genericLinkPreview.hostname }}</p>
          <p class="text-caption text-medium-emphasis text-truncate w-100 mb-2">
            {{ genericLinkPreview.href }}
          </p>
          <v-btn
            color="primary"
            variant="tonal"
            size="small"
            class="text-none"
            :href="genericLinkPreview.href"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open link
          </v-btn>
        </div>
        <div v-else class="link-preview-placeholder">
          <span class="text-medium-emphasis">Preview</span>
        </div>
      </div>
    </template>

    <template v-else-if="form.recipeDocumentFormat === documentFormats.DOCUMENT">
      <input
        ref="fileInputRef"
        type="file"
        class="d-none"
        accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
        @change="onNativeFileChange"
      />
      <div
        class="upload-dropzone"
        :class="{
          'upload-dropzone--busy': uploading,
          'upload-dropzone--drag': dragOver,
        }"
        role="button"
        tabindex="0"
        @click="triggerFilePick"
        @keydown.enter.prevent="triggerFilePick"
        @keydown.space.prevent="triggerFilePick"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="onDrop"
      >
        <v-icon size="56" :color="dragOver ? 'primary' : 'grey-lighten-1'" class="mb-2">
          mdi-cloud-upload-outline
        </v-icon>
        <p class="upload-dropzone__primary mb-1">Add file</p>
        <p class="upload-dropzone__hint">Size limit: 10MB</p>
        <p v-if="selectedFileName" class="upload-dropzone__file text-caption mt-3 mb-0">
          {{ selectedFileName }}
        </p>
      </div>

      <v-alert
        v-if="uploadError"
        type="error"
        closable
        class="mt-3 mb-2"
        @click:close="$emit('clear-upload-error')"
      >
        {{ uploadError }}
      </v-alert>
      <v-alert v-if="uploading" type="info" class="mt-3 mb-2">
        <v-progress-linear indeterminate color="primary" class="mb-2" />
        Uploading file…
      </v-alert>
    </template>

    <div class="beet-ai-block mb-4">
      <v-btn
        size="large"
        rounded="pill"
        variant="flat"
        class="fill-with-ai-btn"
        :disabled="extractLoading"
        @click="$emit('fill-with-ai')"
      >
        Fill with Beet AI
      </v-btn>

      <div v-if="extractLoading" class="beet-ai-fetching mt-3">
        <div class="beet-ai-fetching__row">
          <div class="beet-ai-fetching__progress" aria-hidden="true" title="Loading">
            <div class="beet-ai-seg-spinner-wrap">
              <svg
                class="beet-ai-seg-spinner"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="#ff9800"
                  stroke-width="4"
                  stroke-linecap="butt"
                  stroke-dasharray="5 7"
                />
              </svg>
            </div>
          </div>
          <div class="beet-ai-fetching__text">
            <div class="beet-ai-fetching__title">Fetching details..</div>
            <div class="beet-ai-fetching__timer">Approx. wait time {{ remainingWaitSeconds }}s</div>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import {
  extractYoutubeVideoId,
  getYoutubeEmbedSrc,
  extractVimeoVideoId,
  getVimeoEmbedSrc,
  getSafeUrlForPreview,
} from '@/utils/linkPreview.js'

const props = defineProps({
  form: { type: Object, required: true },
  documentFormats: { type: Object, required: true },
  selectedFile: { type: [Object, File, Array], default: null },
  uploading: { type: Boolean, default: false },
  uploadError: { type: String, default: null },
  extractLoading: { type: Boolean, default: false },
})

const emit = defineEmits([
  'switch-format',
  'document-file-selected',
  'clear-upload-error',
  'fill-with-ai',
])

const ESTIMATED_WAIT_SEC = 28

const fileInputRef = ref(null)
const dragOver = ref(false)
const remainingWaitSeconds = ref(0)
let waitCountdownId = null

function clearWaitCountdown() {
  if (waitCountdownId != null) {
    clearInterval(waitCountdownId)
    waitCountdownId = null
  }
}

watch(
  () => props.extractLoading,
  (loading) => {
    clearWaitCountdown()
    if (!loading) {
      remainingWaitSeconds.value = 0
      return
    }
    remainingWaitSeconds.value = ESTIMATED_WAIT_SEC
    waitCountdownId = setInterval(() => {
      if (remainingWaitSeconds.value > 0) {
        remainingWaitSeconds.value -= 1
      }
    }, 1000)
  },
)

onUnmounted(() => {
  clearWaitCountdown()
})

const linkInput = computed(() => props.form.recipeDocument)

const youtubeEmbedSrc = computed(() => {
  const id = extractYoutubeVideoId(linkInput.value)
  return id ? getYoutubeEmbedSrc(id) : ''
})

const vimeoEmbedSrc = computed(() => {
  const id = extractVimeoVideoId(linkInput.value)
  return id ? getVimeoEmbedSrc(id) : ''
})

const genericLinkPreview = computed(() => {
  if (youtubeEmbedSrc.value || vimeoEmbedSrc.value) return null
  const url = getSafeUrlForPreview(linkInput.value)
  if (!url || !/^https?:$/i.test(url.protocol)) return null
  return { href: url.href, hostname: url.hostname.replace(/^www\./, '') }
})

const selectedFileName = computed(() => {
  const f = props.selectedFile
  const file = Array.isArray(f) ? f[0] : f
  if (file && typeof file.name === 'string') return file.name
  return ''
})

function triggerFilePick() {
  if (props.uploading) return
  fileInputRef.value?.click()
}

function emitFiles(files) {
  const file = files?.[0]
  if (!file) {
    emit('document-file-selected', null)
    return
  }
  emit('document-file-selected', [file])
}

function onNativeFileChange(e) {
  const files = e.target.files
  emitFiles(files)
  e.target.value = ''
}

function onDrop(e) {
  dragOver.value = false
  if (props.uploading) return
  const files = e.dataTransfer?.files
  emitFiles(files)
}
</script>

<style scoped>
.add-recipe-content-card {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.add-recipe-section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #272727;
  line-height: 1.3;
}

.add-recipe-pill {
  min-height: 40px;
  padding: 0 20px;
  letter-spacing: normal;
  border-color: transparent !important;
}

.add-recipe-pill:not(.add-recipe-pill--active) {
  background: #f0f0f0 !important;
  color: #424242 !important;
}

.add-recipe-pill--active {
  background: #fce8f9 !important;
  color: #7b2864 !important;
  border: 1px solid #c084b8 !important;
}

.add-recipe-pill--active :deep(.v-btn__overlay) {
  opacity: 0;
}

.recipe-instructions :deep(.v-field) {
  background: #fff;
  border-radius: 8px;
}

.recipe-link-field :deep(.v-field) {
  border-radius: 8px;
}

.link-preview-wrap {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  min-height: 200px;
  background: #fafafa;
}

.link-preview-frame {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  height: 0;
  background: #000;
}

.link-preview-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.link-preview-placeholder {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-preview-generic {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-height: 160px;
}

.upload-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 32px 24px;
  border: 2px dashed #cfd8dc;
  border-radius: 12px;
  background: #fafafa;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.upload-dropzone:hover:not(.upload-dropzone--busy) {
  border-color: #a65898;
  background: #fdf8fc;
}

.upload-dropzone--drag:not(.upload-dropzone--busy) {
  border-color: #a65898;
  background: #fdf8fc;
}

.upload-dropzone--busy {
  cursor: wait;
  opacity: 0.85;
}

.upload-dropzone__primary {
  font-size: 1rem;
  font-weight: 500;
  color: #616161;
}

.upload-dropzone__hint {
  font-size: 0.8125rem;
  color: #9e9e9e;
  margin: 0;
}

.upload-dropzone__file {
  color: #7b2864;
  font-weight: 500;
  word-break: break-all;
  text-align: center;
  max-width: 100%;
}

.beet-ai-block {
  padding-left: 14px;
  border-left: 3px solid #90caf9;
}

.fill-with-ai-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #6a1b5c !important;
  background: linear-gradient(90deg, #fce4ec 0%, #ffffff 100%) !important;
  box-shadow: none !important;
}

.fill-with-ai-btn:hover:not(:disabled) {
  filter: brightness(0.98);
}

.fill-with-ai-btn:disabled {
  opacity: 0.85;
}

.beet-ai-fetching__row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.beet-ai-fetching__progress {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  padding-top: 2px;
}

.beet-ai-seg-spinner-wrap {
  width: 100%;
  height: 100%;
  animation: beet-ai-spin 0.85s linear infinite;
}

.beet-ai-seg-spinner {
  width: 100%;
  height: 100%;
  display: block;
}

@keyframes beet-ai-spin {
  to {
    transform: rotate(360deg);
  }
}

.beet-ai-fetching__text {
  flex: 1;
  min-width: 0;
}

.beet-ai-fetching__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #424242;
  line-height: 1.35;
}

.beet-ai-fetching__timer {
  font-size: 0.8125rem;
  color: #9e9e9e;
  margin-top: 2px;
  line-height: 1.35;
}
</style>
