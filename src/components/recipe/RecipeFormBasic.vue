<template>
  <div>
    <v-sheet class="rounded-lg pa-4 mb-4">
      <label class="text-subtitle-1 font-weight-medium d-block mb-2">Recipe name</label>
      <v-text-field
        :model-value="recipeName"
        placeholder="e.g. Grilled Chicken Salad"
        variant="outlined"
        density="comfortable"
        rounded="lg"
        class="recipe-field"
        :error-messages="recipeNameError ? [recipeNameError] : []"
        :error="!!recipeNameError"
        @update:model-value="$emit('update:recipeName', $event)"
      />
    </v-sheet>

    <v-sheet class="rounded-lg pa-4 mb-4">
      <v-row>
        <v-col cols="12" md="6">
          <SingleCombobox
            :model-value="recipeCuisine"
            label="Cuisine Type"
            :items="cuisineOptions"
            :base-items="baseCuisines"
            category="cuisines"
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
            category="tags"
            placeholder="-"
            @update:model-value="$emit('update:recipeTags', $event)"
            @option-added="onTagAdded"
          />
        </v-col>
      </v-row>
    </v-sheet>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SingleCombobox from '@/components/common/singleCombobox.vue'
import MultiCombobox from '@/components/common/multiCombobox.vue'

const props = defineProps({
  recipeName: { type: String, default: '' },
  recipeCuisine: { type: [String, Number, Object], default: null },
  recipeTags: { type: Array, default: () => [] },
  recipeNameError: { type: String, default: null },
  enumsStore: { type: Object, default: null },
})
defineEmits(['update:recipeName', 'update:recipeCuisine', 'update:recipeTags'])

const cuisineOptions = computed(() => props.enumsStore?.cuisines ?? [])
const tagOptions = computed(() => props.enumsStore?.tags ?? [])
const baseCuisines = computed(() => props.enumsStore?.baseCuisines ?? props.enumsStore?.cuisines ?? [])
const baseTags = computed(() => props.enumsStore?.baseTags ?? props.enumsStore?.tags ?? [])

function onCuisineAdded(value) {
  if (typeof props.enumsStore?.addCustomCuisine === 'function') props.enumsStore.addCustomCuisine(value)
}
function onTagAdded(value) {
  if (typeof props.enumsStore?.addCustomTag === 'function') props.enumsStore.addCustomTag(value)
}
</script>

<style scoped>
.recipe-field :deep(.v-field) {
  background: #fff;
  border-radius: 8px;
}
</style>
