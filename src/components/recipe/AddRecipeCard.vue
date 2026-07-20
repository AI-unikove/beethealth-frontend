<!-- eslint-disable vue/no-mutating-props -- form is reactive object from parent for two-way binding -->
<template>
  <v-card class="add-recipe-card rounded-lg pa-5 mb-4">
    <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-4">Add Recipe</h3>

    <div class="d-flex flex-wrap gap-2 mb-5">
      <v-btn
        :color="form.recipeDocumentFormat === documentFormats.WRITEUP ? 'primary' : undefined"
        :variant="form.recipeDocumentFormat === documentFormats.WRITEUP ? 'flat' : 'outlined'"
        rounded="pill"
        class="text-capitalize add-recipe-pill"
        @click="$emit('switch-format', documentFormats.WRITEUP)"
      >
        Write text
      </v-btn>
      <v-btn
        :color="form.recipeDocumentFormat === documentFormats.LINK ? 'primary' : undefined"
        :variant="form.recipeDocumentFormat === documentFormats.LINK ? 'flat' : 'outlined'"
        rounded="pill"
        class="text-capitalize add-recipe-pill"
        @click="$emit('switch-format', documentFormats.LINK)"
      >
        Paste Link
      </v-btn>
      <v-btn
        :color="form.recipeDocumentFormat === documentFormats.DOCUMENT ? 'primary' : undefined"
        :variant="form.recipeDocumentFormat === documentFormats.DOCUMENT ? 'flat' : 'outlined'"
        rounded="pill"
        class="text-capitalize add-recipe-pill"
        @click="$emit('switch-format', documentFormats.DOCUMENT)"
      >
        Upload PDF
      </v-btn>
    </div>

    <template v-if="form.recipeDocumentFormat === documentFormats.LINK">
      <v-text-field
        v-model="form.recipeDocument"
        label="Recipe link or URL"
        placeholder="Paste Recipe Link or URL here"
        variant="outlined"
        density="comfortable"
        hide-details
        rounded="lg"
        bg-color="white"
        class="mb-5"
      />
    </template>

    <template v-if="form.recipeDocumentFormat === documentFormats.DOCUMENT">
      <v-file-input
        :model-value="selectedFile"
        label="Upload PDF"
        placeholder="Choose a PDF file"
        accept="application/pdf"
        variant="outlined"
        density="comfortable"
        hide-details
        rounded="lg"
        bg-color="white"
        class="mb-2"
        :loading="uploading"
        :disabled="uploading"
        @update:model-value="$emit('document-file-selected', $event)"
      />
      <v-alert v-if="uploadError" type="error" closable class="mt-2 mb-5" @click:close="$emit('clear-upload-error')">
        {{ uploadError }}
      </v-alert>
      <v-alert v-if="uploading" type="info" class="mt-2 mb-5">
        <v-progress-linear indeterminate color="primary" class="mb-2" />
        Uploading file...
      </v-alert>
    </template>

    <h4 class="text-body-1 font-weight-medium text-grey-darken-3 mb-3">Ingredients</h4>
    <v-row v-if="form.ingredients?.length" dense class="ingredients-grid">
      <v-col cols="12" md="6">
        <div
          v-for="ing in ingredientsLeftColumn"
          :key="'l-' + ing._idx"
          class="ingredient-row d-flex gap-2 align-center mb-3"
        >
          <v-text-field
            v-model="form.ingredients[ing._idx].name"
            placeholder="e.g. Chicken Breast"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="white"
            class="ingredient-name flex-grow-1"
          />
          <v-text-field
            v-model="form.ingredients[ing._idx].quantity"
            placeholder="e.g. 250g"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="white"
            class="ingredient-qty"
          />
          <v-btn icon variant="text" size="small" color="grey" @click="$emit('remove-ingredient', ing._idx)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-col>
      <v-col cols="12" md="6">
        <div
          v-for="ing in ingredientsRightColumn"
          :key="'r-' + ing._idx"
          class="ingredient-row d-flex gap-2 align-center mb-3"
        >
          <v-text-field
            v-model="form.ingredients[ing._idx].name"
            placeholder="e.g. Chicken Breast"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="white"
            class="ingredient-name flex-grow-1"
          />
          <v-text-field
            v-model="form.ingredients[ing._idx].quantity"
            placeholder="e.g. 250g"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="white"
            class="ingredient-qty"
          />
          <v-btn icon variant="text" size="small" color="grey" @click="$emit('remove-ingredient', ing._idx)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <v-btn
      variant="outlined"
      color="grey-darken-1"
      rounded="lg"
      class="text-capitalize add-ingredient-btn mt-2 mb-4"
      @click="$emit('add-ingredient')"
    >
      Add Ingredient
    </v-btn>

    <v-textarea
      v-model="form.recipeInstructions"
      placeholder="Type or paste your recipe instructions here..."
      variant="outlined"
      density="comfortable"
      rows="6"
      hide-details
      rounded="lg"
      bg-color="white"
      class="recipe-instructions mb-0"
    />
  </v-card>
</template>

<script setup>
 
import { computed } from 'vue'

const props = defineProps({
  form: { type: Object, required: true },
  documentFormats: { type: Object, required: true },
  selectedFile: { type: [Object, Array], default: null },
  uploading: { type: Boolean, default: false },
  uploadError: { type: String, default: null },
})

defineEmits(['switch-format', 'add-ingredient', 'remove-ingredient', 'document-file-selected', 'clear-upload-error'])

const ingredientsList = computed(() =>
  (props.form.ingredients || []).map((_, i) => ({ _idx: i })),
)
const half = computed(() => Math.ceil(ingredientsList.value.length / 2))
const ingredientsLeftColumn = computed(() => ingredientsList.value.slice(0, half.value))
const ingredientsRightColumn = computed(() => ingredientsList.value.slice(half.value))
</script>

<style scoped>
.add-recipe-card {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.add-recipe-pill.v-btn--variant-outlined {
  background: #f0f0f0;
  border-color: transparent;
}
.ingredient-name {
  min-width: 0;
}
.ingredient-qty {
  max-width: 120px;
  min-width: 80px;
}
.add-ingredient-btn {
  background: #f0f0f0 !important;
  border: 1px solid #e0e0e0;
  color: #424242;
}
.recipe-instructions :deep(.v-field) {
  background: #fff;
  border-radius: 8px;
}
</style>
