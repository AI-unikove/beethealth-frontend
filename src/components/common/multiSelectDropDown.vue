<template>
  <v-select
    :model-value="modelValue"
    :items="normalizedItems"
    item-title="title"
    item-value="value"
    :label="label"
    :placeholder="placeholder"
    multiple
    :chips="!hideSelection"
    :closable-chips="!hideSelection"
    variant="outlined"
    density="compact"
    class="profile-field"
    hide-details
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #selection="{ item, index }">
      <template v-if="!hideSelection">
        <v-chip
          v-if="modelValue.length === 0"
          color="grey"
          variant="flat"
          size="small"
          class="placeholder-chip"
        >
          {{ placeholder }}
        </v-chip>
        <v-chip
          v-else-if="index < 2"
          closable
          size="small"
          @click:close="removeSelected(item.raw ?? item)"
        >
          {{ item.raw?.title ?? item.raw ?? item.title ?? item }}
        </v-chip>
        <span
          v-if="index === 2 && modelValue.length > 2"
          class="text-grey text-caption align-self-center ml-1"
        >
          (+{{ modelValue.length - 2 }} others)
        </span>
      </template>
    </template>
  </v-select>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  items: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  hideSelection: {
    type: Boolean,
    default: false,
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
      return { title: item.title ?? item.value, value: item.value ?? item.title, raw: item }
    }
    return { title: String(item), value: item, raw: item }
  })
})

function removeSelected(item) {
  const raw = item?.raw ?? item
  const current = [...(props.modelValue || [])]
  const idx =
    typeof raw === 'object' && raw !== null && 'value' in raw
      ? current.indexOf(raw.value)
      : current.indexOf(raw)
  if (idx !== -1) current.splice(idx, 1)
  emit('update:modelValue', current)
}
</script>
