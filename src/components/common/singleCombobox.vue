<template>
  <v-combobox
    :model-value="modelValue"
    :items="normalizedItems"
    item-title="title"
    item-value="value"
    :label="label"
    :placeholder="placeholder"
    :custom-filter="dropdownFilter"
    variant="outlined"
    density="compact"
    :class="inputClass"
    :hide-details="hideDetails"
    :hint="hint"
    :persistent-hint="!!hint"
    clearable
    @update:model-value="onModelUpdate"
    @blur="onBlur"
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
import { addEnumOptions } from '@/services/enums.service'
import { useDropdownSearch } from '@/composables/useDropdownSearch'

const MIN_LENGTH_TO_ADD = 2

const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  items: { type: Array, required: true },
  baseItems: { type: Array, default: () => [] },
  category: { type: String, default: '' },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  hideDetails: { type: Boolean, default: false },
  inputClass: { type: String, default: 'profile-field' },
  placeholder: { type: String, default: '-' },
})

const emit = defineEmits(['update:modelValue', 'option-added'])
const { filter: dropdownFilter } = useDropdownSearch({ category: computed(() => props.category) })

const baseSet = computed(() => new Set((props.baseItems || []).map((o) => String(o).trim())))
const itemsSet = computed(() => new Set((props.items || []).map((o) => String(o).trim())))

const normalizedItems = computed(() => {
  const arr = props.items || []
  return arr.map((item) => {
    if (item != null && typeof item === 'object' && ('title' in item || 'value' in item)) {
      return { title: item.title ?? item.value, value: item.value ?? item.title }
    }
    const s = String(item)
    return { title: s, value: item }
  })
})

function toValue(v) {
  if (v == null || v === '') return ''
  if (typeof v === 'object' && v !== null && ('value' in v || 'title' in v)) {
    return String(v.value ?? v.title ?? '').trim()
  }
  return String(v).trim()
}

function onModelUpdate(newVal) {
  const str = toValue(newVal)
  emit('update:modelValue', str === '' || newVal == null ? null : str)
}

async function onBlur() {
  const str = toValue(props.modelValue)
  if (
    !str ||
    str.length < MIN_LENGTH_TO_ADD ||
    baseSet.value.has(str) ||
    itemsSet.value.has(str) ||
    !props.category
  ) {
    return
  }
  try {
    await addEnumOptions(props.category, [str])
    emit('option-added', str)
  } catch {
    // Snackbar shows via axios interceptor if API failed
  }
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
</style>
