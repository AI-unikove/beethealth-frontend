<template>
  <div class="clients-header d-flex justify-space-between align-center mb-6">
    <div>
      <h1 class="text-h4 font-weight-bold">{{ title }}</h1>
      <p class="text-body-2 text-medium-emphasis mt-1">{{ subtitle }}</p>
    </div>
    <a color="primary" size="large" prepend-icon="mdi-plus" @click="$emit('add-client')">
      {{ buttonText }}
    </a>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Clients',
  },
  subtitle: {
    type: String,
    default: 'Manage your client information',
  },
  buttonText: {
    type: String,
    default: 'Add New Client',
  },
})

defineEmits(['add-client'])
</script>

<style scoped>
.clients-header {
  margin-bottom: 24px;
}
</style>
