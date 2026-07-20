<template>
  <div class="loading-container">
    <v-progress-circular indeterminate color="primary" :size="size" />
    <p v-if="message" class="loading-message mt-4">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 64,
  },
  message: {
    type: String,
    default: 'Loading...',
  },
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 20px;
}

.loading-message {
  color: rgb(107, 114, 128);
  font-size: 14px;
}
</style>
