<template>
  <div class="payment-filters d-flex gap-2">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      class="tab-items"
      :class="{ active: modelValue === tab.value }"
      @click="$emit('update:modelValue', tab.value)"
    >
      <b>{{ tab.label }}</b>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: 'all',
  },
})

defineEmits(['update:modelValue'])

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Overdue', value: 'overdue' },
]
</script>
