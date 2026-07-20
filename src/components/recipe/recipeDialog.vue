<template>
  <CrudDialog
    :model-value="modelValue"
    max-width="560"
    :title="recipeTitle"
    :show-footer="false"
    show-header-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="pa-4 rounded-xl">
      <v-card-title class="d-flex recipeTitle">
        <div>
          <div class="text-subtitle-2 text-grey">{{ recipeCuisineLabel }}</div>
        </div>
      </v-card-title>

      <div class="d-flex flex-wrap ga-2 my-2" v-if="props.recipe?.recipeTags?.length">
        <v-chip
          v-for="value in props.recipe?.recipeTags"
          :key="value"
          color="purple-lighten-4"
          size="small"
          >{{ value }}</v-chip
        >
      </div>

      <!-- Macro Values -->
      <div
        v-if="
          props.recipe?.macros?.calories ||
          props.recipe?.macros?.protein ||
          props.recipe?.macros?.carbohydrates ||
          props.recipe?.macros?.fats ||
          props.recipe?.macros?.fiber
        "
      >
        <div v-if="props.recipe?.macros?.calories" class="my-2 font-weight-medium">
          <span class="macroValues">
            <b>Calories:</b> {{ props.recipe?.macros?.calories }} kcal
          </span>
        </div>

        <!-- Nutrition Info -->
        <div class="d-flex flex-wrap ga-2 my-2 fatsValue">
          <v-chip v-if="props.recipe?.macros?.protein" size="small" color="grey-lighten-3">
            Protein: <small>{{ formatMacroGram(props.recipe?.macros?.protein) }}</small>
          </v-chip>
          <v-chip v-if="props.recipe?.macros?.carbohydrates" size="small" color="grey-lighten-3">
            Carbohydrates: <small>{{ formatMacroGram(props.recipe?.macros?.carbohydrates) }}</small>
          </v-chip>
          <v-chip v-if="props.recipe?.macros?.fats" size="small" color="grey-lighten-3">
            Fats: <small>{{ formatMacroGram(props.recipe?.macros?.fats) }}</small>
          </v-chip>
          <v-chip v-if="props.recipe?.macros?.fiber" size="small" color="grey-lighten-3">
            Fiber: <small>{{ formatMacroGram(props.recipe?.macros?.fiber) }}</small>
          </v-chip>
        </div>
      </div>

      <!-- Ingredients (from API: recipe.ingredients) -->
      <div v-if="ingredientRows.length" class="ingredientsWrap">
        <h3>Ingredients</h3>
        <ul>
          <li v-for="(row, idx) in ingredientRows" :key="idx">
            <span>{{ row.quantityLabel }}</span>
            <span>{{ row.name }}</span>
          </li>
        </ul>
      </div>
      <div v-else class="mb-3">
        <h3 class="text-body-1 font-weight-medium mb-1">Ingredients</h3>
        <p class="text-body-2 text-medium-emphasis mb-0">No ingredients listed for this recipe.</p>
      </div>

      <!-- Recipe instructions / document -->
      <v-card-text class="px-0 text-body-2 text-grey-darken-1">
        <h3 class="text-body-1 font-weight-medium mb-2">Recipe</h3>
        <!-- Show as link for document/link formats -->
        <p
          v-if="
            props.recipe?.recipeDocumentFormat === 'document' ||
            props.recipe?.recipeDocumentFormat === 'link'
          "
        >
          <a
            :href="props.recipe?.recipeDocument"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary text-decoration-underline"
          >
            {{ props.recipe?.recipeDocumentFormat === 'document' ? 'View Document' : 'Open Link' }}
          </a>
        </p>
        <!-- Show as plain text for writeup -->
        <p v-else class="mb-0">
          {{ props.recipe?.recipeDocument }}
        </p>
      </v-card-text>

      <!-- Footer Button -->
      <v-card-actions class="justify-center">
        <button class="text-none px-8 button" @click="openEditDialog()">Edit Recipe</button>
      </v-card-actions>
    </v-card>
  </CrudDialog>
</template>
<script setup>
import { computed } from 'vue'
import CrudDialog from '../common/CrudDialog.vue'
import { useRecipesStore } from '@/stores/recipes.store'

const recipesStore = useRecipesStore()

const props = defineProps({
  recipe: {
    type: Object,
    default: null,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])

const recipeTitle = computed(() => {
  const r = props.recipe
  if (!r) return 'New Recipe'
  return String(r.recipeName ?? r.name ?? 'Recipe').trim() || 'Recipe'
})

const recipeCuisineLabel = computed(() => {
  const r = props.recipe
  if (!r) return ''
  return String(r.recipeCuisine ?? r.cuisine ?? '').trim()
})

/** Append " g" only if the API value is not already suffixed with a unit */
function formatMacroGram(value) {
  const s = String(value ?? '').trim()
  if (!s) return ''
  if (/g$/i.test(s) || /kcal$/i.test(s)) return s
  return `${s} g`
}

function quantityLabelForIngredient(item) {
  if (!item || typeof item !== 'object') return '—'
  const q = item.quantity
  const m = String(item.measurement ?? '').trim()
  if (q != null && String(q).trim() !== '') {
    return m ? `${String(q).trim()} ${m}`.trim() : String(q).trim()
  }
  return m || '—'
}

const ingredientRows = computed(() => {
  const raw = props.recipe?.ingredients
  if (!Array.isArray(raw) || !raw.length) return []
  return raw
    .map((i) => {
      const name = String(i?.name ?? i?.itemName ?? '').trim()
      return {
        name: name || '—',
        quantityLabel: quantityLabelForIngredient(i),
      }
    })
    .filter((row) => row.name !== '—' || row.quantityLabel !== '—')
})

function openEditDialog() {
  recipesStore.openDialog('edit', props.recipe)
}
</script>
