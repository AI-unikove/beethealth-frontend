import { defineStore } from 'pinia'
import { ref } from 'vue'

const SNACKBAR_TYPES = Object.freeze({
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success',
  INFO: 'info',
})

export const useSnackbarStore = defineStore('snackbar', () => {
  const message = ref('')
  const show = ref(false)
  const color = ref(SNACKBAR_TYPES.ERROR)
  const timeout = ref(5000)
  let hideTimer = null

  function showSnackbar(text, type = SNACKBAR_TYPES.ERROR, options = {}) {
    if (hideTimer) clearTimeout(hideTimer)
    message.value = text || 'Something went wrong.'
    color.value = type
    timeout.value = options.timeout ?? 5000
    show.value = true
    hideTimer = setTimeout(() => {
      show.value = false
      hideTimer = null
    }, timeout.value)
  }

  function showError(text, options = {}) {
    showSnackbar(text, SNACKBAR_TYPES.ERROR, options)
  }

  function showWarning(text, options = {}) {
    showSnackbar(text, SNACKBAR_TYPES.WARNING, options)
  }

  function showSuccess(text, options = {}) {
    showSnackbar(text, SNACKBAR_TYPES.SUCCESS, options)
  }

  function showInfo(text, options = {}) {
    showSnackbar(text, SNACKBAR_TYPES.INFO, options)
  }

  function close() {
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = null
    show.value = false
  }

  return {
    message,
    show,
    color,
    timeout,
    showError,
    showWarning,
    showSuccess,
    showInfo,
    close,
  }
})
