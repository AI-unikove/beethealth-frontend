<template>
  <v-card class="side-card" elevation="2">
    <v-chip size="small" class="mb-2">
      <v-icon start size="small">{{ icon }}</v-icon>
      {{ badge }}
    </v-chip>
    <h5 class="card-title">{{ title }}</h5>
    <button class="button buttonBg mt-3" @click="$emit('view-plan')">
      <b>{{ buttonText }}</b>
    </button>
  </v-card>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'mdi-star',
  },
  badge: {
    type: String,
    default: 'Top-performing plan',
  },
  title: {
    type: String,
    default:
      'Balanced Lifestyle Plan is performing exceptionally — 8 clients reached their goals this month.',
  },
  buttonText: {
    type: String,
    default: 'View plan',
  },
})

defineEmits(['view-plan'])
</script>

<style scoped>
.side-card {
  background: #fff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}

.action-btn {
  border-radius: 30px;
  text-transform: none;
  font-weight: 600;
}
</style>
