<template>
  <span class="payment-status-badge" :class="`status-${normalizedStatus}`">
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

const normalizedStatus = computed(() => (props.status || '').toLowerCase())
</script>

<style scoped>
.payment-status-badge {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.status-pending {
  background: #e8eef9;
  color: #3d6ec7;
}

.status-overdue {
  background: #fff0e0;
  color: #c45c0a;
}

.status-completed {
  background: #e6f9ef;
  color: #2a8a52;
}
</style>
