<template>
  <div class="empty-state">
    <v-icon :size="iconSize" :color="iconColor" class="mb-4">
      {{ icon }}
    </v-icon>
    <h3 class="text-h6 mb-2">{{ title }}</h3>
    <p class="text-body-2 text-medium-emphasis mb-4">{{ description }}</p>
    <slot name="actions"></slot>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'mdi-inbox',
  },
  iconSize: {
    type: [Number, String],
    default: 64,
  },
  iconColor: {
    type: String,
    default: 'grey-lighten-1',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 64px 40px;
}
</style>
