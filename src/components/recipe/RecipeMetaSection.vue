<template>
  <v-sheet class="rounded-lg pa-4 mb-4">
    <v-row>
      <v-col cols="12" md="6">
        <SingleCombobox
          :model-value="recipeCuisine"
          label="Cuisine Type"
          :items="cuisineOptions"
          :base-items="baseCuisines"
          :category="RECIPE_CUISINE_CATEGORY"
          placeholder="-"
          @update:model-value="$emit('update:recipeCuisine', $event)"
          @option-added="onCuisineAdded"
        />
      </v-col>
      <v-col cols="12" md="6">
        <MultiCombobox
          :model-value="recipeTags"
          label="Tags"
          :items="tagOptions"
          :base-items="baseTags"
          :category="RECIPE_TAGS_CATEGORY"
          placeholder="-"
          class="mb-4"
          hide-details
          @update:model-value="$emit('update:recipeTags', $event)"
          @option-added="onTagAdded"
        />
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import SingleCombobox from '@/components/common/singleCombobox.vue'
import MultiCombobox from '@/components/common/multiCombobox.vue'

/** Backend dropdown-search and enums API category (must match backend; e.g. recipe.cuisines / recipe.tags) */
const RECIPE_CUISINE_CATEGORY = 'recipe.cuisines'
const RECIPE_TAGS_CATEGORY = 'recipe.tags'

const props = defineProps({
  recipeCuisine: { type: [String, Number, Object], default: null },
  recipeTags: { type: Array, default: () => [] },
  enumsStore: { type: Object, default: null },
})
defineEmits(['update:recipeCuisine', 'update:recipeTags'])

const baseCuisines = computed(() => props.enumsStore?.baseCuisines ?? [])
const baseTags = computed(() => props.enumsStore?.baseTags ?? [])
const cuisineOptions = computed(() => props.enumsStore?.cuisines ?? [])

/** Local custom tags (same pattern as Medical History in client profile: base + custom) */
const customTagOptions = ref([])
const tagOptions = computed(() => [
  ...(baseTags.value || []),
  ...(customTagOptions.value || []).filter((t) => t && !baseTags.value.includes(t)),
])

watch(
  () => [props.recipeTags, baseTags.value],
  () => {
    const tags = props.recipeTags || []
    const base = baseTags.value || []
    const custom = tags
      .map((t) => (t != null ? String(t).trim() : ''))
      .filter((s) => s && !base.includes(s))
    const next = [...new Set([...(customTagOptions.value || []), ...custom])]
    if (
      next.length !== (customTagOptions.value || []).length ||
      next.some((v, i) => (customTagOptions.value || [])[i] !== v)
    ) {
      customTagOptions.value = next
    }
  },
  { immediate: true, deep: true },
)

function onCuisineAdded(value) {
  if (typeof props.enumsStore?.addCustomCuisine === 'function') {
    props.enumsStore.addCustomCuisine(value)
  }
}

function onTagAdded(value) {
  const v = value != null ? String(value).trim() : ''
  if (!v || customTagOptions.value.includes(v)) return
  customTagOptions.value = [...customTagOptions.value, v]
  if (typeof props.enumsStore?.addCustomTag === 'function') {
    props.enumsStore.addCustomTag(value)
  }
}
</script>
