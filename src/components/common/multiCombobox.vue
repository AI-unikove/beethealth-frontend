<template>
  <v-combobox
    :model-value="modelValue"
    :items="normalizedItems"
    item-title="title"
    item-value="value"
    :label="label"
    :placeholder="placeholder"
    :custom-filter="dropdownFilter"
    multiple
    chips
    variant="outlined"
    density="compact"
    class="profile-field"
    hide-details
    clearable
    @update:model-value="onModelUpdate"
  >
    <template #no-data>
      <v-list-item>
        <v-list-item-title class="text-medium-emphasis">
          Type above and press Enter to add a new option
        </v-list-item-title>
      </v-list-item>
    </template>
  </v-combobox>
</template>

<script setup>
import { computed } from 'vue'
import { useDropdownSearch } from '@/composables/useDropdownSearch'
import { addEnumOptions } from '@/services/enums.service'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  items: {
    type: Array,
    required: true,
  },
  baseItems: {
    type: Array,
    default: () => [],
  },
  category: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '-',
  },
})

const emit = defineEmits(['update:modelValue', 'option-added'])

const { filter: dropdownFilter } = useDropdownSearch({ category: computed(() => props.category) })

function toValue(v) {
  if (v == null) return ''
  if (typeof v === 'object' && v !== null && ('value' in v || 'title' in v)) {
    return String(v.value ?? v.title ?? '').trim()
  }
  return String(v).trim()
}

const baseSet = computed(() => new Set((props.baseItems || []).map((o) => String(o).trim())))

const normalizedItems = computed(() => {
  const arr = props.items || []
  const seen = new Set()
  return arr
    .map((item) => {
      if (item != null && typeof item === 'object' && ('title' in item || 'value' in item)) {
        return { title: item.title ?? item.value, value: item.value ?? item.title }
      }
      const s = String(item)
      return { title: s, value: item }
    })
    .filter((entry) => {
      const key = String(entry.value ?? entry.title).trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
})

async function onModelUpdate(newVal) {
  const prev = props.modelValue || []
  const raw = Array.isArray(newVal)
    ? newVal
    : newVal != null && toValue(newVal) !== ''
      ? [...prev, newVal]
      : prev
  const seen = new Set()
  const next = []
  for (const v of raw) {
    const str = toValue(v)
    if (!str || seen.has(str)) continue
    seen.add(str)
    next.push(str)
  }
  const added = next.filter((s) => !prev.some((p) => toValue(p) === s))
  const toAdd = added.filter((str) => str.length >= 2 && !baseSet.value.has(str) && props.category)
  if (toAdd.length > 0) {
    const results = await Promise.allSettled(
      toAdd.map((str) => addEnumOptions(props.category, [str])),
    )
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') emit('option-added', toAdd[i])
    })
  }
  emit('update:modelValue', next)
}
</script>

<style scoped>
:deep(.v-field) {
  background: rgba(0, 0, 0, 0.04) !important;
  border: none !important;
  border-radius: 8px;
  box-shadow: none !important;
}

:deep(.v-field:hover) {
  background: rgba(0, 0, 0, 0.06) !important;
}

:deep(.v-field.v-field--focused),
:deep(.v-field.v-field--active) {
  background: rgba(0, 0, 0, 0.05) !important;
  box-shadow: none !important;
  border: none !important;
}

:deep(.v-field .v-label) {
  font-weight: 700;
  color: #272727;
}

:deep(.v-field__input) {
  color: #272727;
  text-align: left;
}

:deep(.v-chip) {
  font-weight: 500;
}
</style>
