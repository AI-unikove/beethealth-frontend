<template>
  <div class="custom-tabs">
    <div
      v-for="(tab, index) in tabs"
      :key="index"
      class="tab-items"
      :class="{ active: activeTab === index }"
      @click="selectTab(index)"
    >
      <b>{{ tab }}</b>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeTab: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:activeTab'])

const tabs = ['Food & Diet', 'Activity & Hydration', 'Body Metrics']

const selectTab = (index) => {
  emit('update:activeTab', index)
}
</script>

<style scoped>
.custom-tabs {
  display: flex;
  gap: 10px;
  border-radius: 24px;
  border: 1px solid #e0e0e0;
  background: #fbfbfb;
  padding: 2px 2px 4px 2px;
}
</style>
