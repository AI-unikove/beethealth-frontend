<template>
  <v-alert :type="type" variant="tonal" class="mb-4">
    <div class="d-flex justify-space-between align-center">
      <span>{{ message }}</span>
      <v-btn v-if="showRetry" size="small" @click="handleRetry">Retry</v-btn>
    </div>
  </v-alert>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'warning', 'info', 'success'].includes(value),
  },
  showRetry: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['retry'])

function handleRetry() {
  emit('retry')
}
</script>
