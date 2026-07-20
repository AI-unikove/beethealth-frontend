<template>
  <v-select
    :model-value="modelValue"
    :items="normalizedItems"
    item-title="title"
    item-value="value"
    :label="label"
    :placeholder="placeholder"
    variant="outlined"
    density="compact"
    :class="inputClass"
    :hide-details="hideDetails"
    :hint="hint"
    :persistent-hint="!!hint"
    clearable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #selection="{ item }">
      <v-chip
        v-if="modelValue == null || modelValue === ''"
        color="grey"
        variant="flat"
        size="small"
        class="placeholder-chip"
      >
        {{ placeholder }}
      </v-chip>
      <span v-else>{{ item?.title ?? item?.raw?.title ?? item }}</span>
    </template>
  </v-select>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null,
  },
  items: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  hint: {
    type: String,
    default: '',
  },
  hideDetails: {
    type: Boolean,
    default: false,
  },
  inputClass: {
    type: String,
    default: 'profile-field',
  },
  placeholder: {
    type: String,
    default: '-',
  },
})

const emit = defineEmits(['update:modelValue'])

// Support items as string[] or { title, value }[]; normalize for v-select
const normalizedItems = computed(() => {
  const arr = props.items || []
  return arr.map((item) => {
    if (item != null && typeof item === 'object' && ('title' in item || 'value' in item)) {
      return { title: item.title ?? item.value, value: item.value ?? item.title }
    }
    return { title: String(item), value: item }
  })
})
</script>
