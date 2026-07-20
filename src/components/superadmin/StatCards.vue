<template>
  <v-row class="overview-stat-row">
    <v-col v-for="item in items" :key="item.key || item.label" cols="12" sm="4">
      <div class="overview-card clickable-stat" elevation="0" @click="emit('click', item)">
        <v-card-text>
          <div class="overview-stat-label">{{ item.label }}</div>
          <div class="overview-stat-pill" :class="item.colorClass">{{ item.value }}</div>
        </v-card-text>
      </div>
    </v-col>
  </v-row>
</template>

<script setup>
const emit = defineEmits(['click'])
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>
