<template>
  <div
    v-if="validSuggestions.length"
    class="recipe-name-suggestions text-body-2 d-flex align-center flex-wrap gap-1"
  >
    <span class="text-medium-emphasis">Did you mean one of these</span>
    <template v-for="(entry, i) in validSuggestions" :key="(entry.id || '') + entry.name + i">
      <v-btn
        variant="text"
        size="small"
        color="primary"
        class="px-1 min-w-0 text-none"
        @click="$emit('pick', entry)"
      >
        {{ entry.name }}
      </v-btn>
      <span v-if="i < validSuggestions.length - 1" class="text-grey">, </span>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  suggestions: { type: Array, default: () => [] },
})
defineEmits(['pick'])
/** @returns {{ id: string | null, name: string } | null} */
function toSuggestionEntry(s) {
  if (s == null) return null
  if (typeof s === 'string') {
    const name = s.trim()
    return name ? { id: null, name } : null
  }
  if (typeof s === 'object') {
    const name = String(s.name ?? s.title ?? s.recipeName ?? s.value ?? '').trim()
    if (!name) return null
    const rawId = s._id ?? s.id
    const id = rawId != null && String(rawId).trim() !== '' ? String(rawId) : null
    return { id, name }
  }
  return null
}
const validSuggestions = computed(() => {
  const list = props.suggestions || []
  return list.map(toSuggestionEntry).filter(Boolean)
})
</script>

<style scoped>
.recipe-name-suggestions {
  line-height: 1.6;
}
</style>
