<template>
  <v-menu location="bottom end" offset="8">
    <template #activator="{ props }">
      <button v-bind="props" class="button" variant="flat" rounded="pill">
        <b>{{ buttonLabel }}</b>
      </button>
    </template>

    <v-list class="overview-settings-list" density="compact" min-width="180">
      <v-list-item
        v-for="item in items"
        :key="item.value || item.title"
        :title="item.title"
        @click="$emit('select', item)"
      />
    </v-list>
  </v-menu>
</template>

<script setup>
defineProps({
  buttonLabel: {
    type: String,
    default: 'Settings',
  },
  items: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['select'])
</script>

<style scoped>
.overview-settings-btn {
  background: #f9dff0;
  color: #b24b97;
  font-weight: 600;
  text-transform: none;
  min-width: 140px;
  box-shadow: none;
}

.overview-settings-list {
  border: 1px solid #e7e9ef;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(23, 29, 42, 0.1);
}
</style>
