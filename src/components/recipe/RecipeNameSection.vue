<template>
  <v-sheet class="rounded-lg pa-4">
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
    <RecipeNameSuggestions
      v-if="hasSimilarSuggestions"
      :suggestions="similarRecipeSuggestions"
      class="mt-2"
      @pick="$emit('pick-suggestion', $event)"
    />
  </v-sheet>
</template>

<script setup>
import { computed } from 'vue'
import RecipeNameSuggestions from '@/components/recipe/RecipeNameSuggestions.vue'

const props = defineProps({
  recipeName: { type: String, default: '' },
  recipeNameError: { type: String, default: null },
  similarRecipeSuggestions: { type: Array, default: () => [] },
})
defineEmits(['update:recipeName', 'pick-suggestion'])

const hasSimilarSuggestions = computed(() => (props.similarRecipeSuggestions || []).length > 0)
</script>

<style scoped>
.recipe-field :deep(.v-field) {
  background: #fff;
  border-radius: 8px;
}
</style>
