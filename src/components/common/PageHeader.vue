<template>
  <div class="page-header">
    <div class="superHear">
      <p v-if="subtitle">{{ subtitle }}</p>
      <h1>{{ title }}</h1>
    </div>
    <div v-if="$slots.actions" class="header-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>
