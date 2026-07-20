<template>
  <div class="typeform-wrapper">
    <header class="typeform-custom-header">
      <div class="header-step" aria-live="polite">{{ stepText }}</div>
      <button type="button" class="header-close" aria-label="Close" @click="handleClose">×</button>
    </header>

    <div v-show="!formReady" class="typeform-loading-overlay" aria-live="polite">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading questionnaire…</p>
    </div>

    <div class="typeform-form-box">
      <div class="typeform-logo-cover" aria-hidden="true"></div>
      <div ref="typeformContainer" class="typeform-embed-container"></div>
    </div>

    <app-footer compact />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { createWidget } from '@typeform/embed'
import '@typeform/embed/build/css/widget.css'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()
const typeformContainer = ref(null)
const formReady = ref(false)
const questionRefs = ref([])
/** 1-based index of the currently displayed question */
const currentStep = ref(1)

/** Total steps: assume 2 when form is ready but no refs yet (1st question often doesn't fire onQuestionChanged). */
const totalSteps = computed(() => {
  const n = questionRefs.value.length
  if (n === 0) return formReady.value ? 2 : 1
  if (n === 1) return 2
  return n
})
const stepText = computed(() => `${currentStep.value} of ${totalSteps.value}`)

function onQuestionChange() {
  const refs = questionRefs.value
  const idx = refs.indexOf(ref)
  if (idx === -1) {
    const wasEmpty = refs.length === 0
    questionRefs.value = [...refs, ref]
    // First ref we see is often from navigating to Q2 (Q1 doesn't fire on load).
    currentStep.value = wasEmpty ? 2 : questionRefs.value.length
  } else {
    currentStep.value = idx + 1
  }
}

let typeformWidget = null

onMounted(() => {
  if (typeformContainer.value) {
    typeformWidget = createWidget('UNlwln3W', {
      container: typeformContainer.value,
      hideHeaders: true,
      hideFooter: true,
      opacity: 100,

      onReady: () => {
        formReady.value = true
      },

      onQuestionChanged: ({ ref: questionRef }) => {
        onQuestionChange(questionRef)
      },

      onSubmit: ({ responseId }) => {
        router.push({
          path: '/onboarding-complete',
          query: { responseId },
        })
      },
    })
  }
})

function handleClose() {
  router.back()
}

onUnmounted(() => {
  if (typeformWidget) {
    typeformWidget.unmount?.()
  }
})
</script>

<style scoped>
.typeform-wrapper {
  width: 100vw;
  min-height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: #f5f5f5;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.typeform-custom-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #eee;
  z-index: 10;
  position: relative;
}

.header-step {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  font-weight: 600;
  color: #333;
  /* font-family: 'IBM Plex Sans', sans-serif; */
  pointer-events: none;
}

.header-close {
  width: 36px;
  height: 36px;
  margin-left: auto;
  border: none;
  border-radius: 50%;
  background: #f1f3f8;
  color: #333;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background 0.2s;
}

.header-close:hover {
  background: #e3e5ea;
}

.typeform-loading-overlay {
  position: absolute;
  inset: 0;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 5;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e5e5;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  margin: 0;
  font-size: 14px;
  color: #666;
  /* font-family: 'IBM Plex Sans', sans-serif; */
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.typeform-form-box {
  flex: 1;
  min-height: 0;
  margin: 20px 24px;
  border: 2px dashed #3b82f6;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  position: relative;
}

/* Covers top-left logo area inside Typeform iframe */
.typeform-logo-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 80px;
  height: 80px;
  background: #fff;
  z-index: 5;
  pointer-events: none;
}

.typeform-embed-container {
  width: 100%;
  height: 100%;
  min-height: 80vh;
  position: relative;
}
</style>
