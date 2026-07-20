<template>
  <CrudDialog
    :model-value="modelValue"
    title="Edit Recipe"
    max-width="720"
    :show-footer="true"
    save-label="Save Recipe"
    :save-loading="recipesStore.loading"
    :save-disabled="!isFormValid"
    show-delete
    delete-label="Delete Recipe"
    @update:model-value="$emit('update:modelValue', $event)"
    @save="saveRecipe"
    @delete="handleDelete"
  >
    <div class="new-recipe-dialog-content">
      <p class="text-body-2 text-grey mb-4">
        Fill in the plan details and add meals or snacks for each day to create a personalized diet
        plan for your clients.
      </p>

      <!-- AI Assistance Card -->
      <v-card class="pa-4 mb-5 rounded-lg useAiBox">
        <div class="useAiBoxContent">
          <h4>Use AI Assistance</h4>
          <p>You can use our AI voice to fill in the details and create your diet plan faster.</p>
          <v-btn color="white" rounded class="text-capitalize"> Talk to Beet AI </v-btn>
        </div>
      </v-card>

      <!-- Recipe Name -->
      <v-text-field
        v-model="form.recipeName"
        label="Recipe Name"
        placeholder="eg: Dosa, Chicken Stew"
        variant="solo"
        density="comfortable"
        class="mb-4"
      />

      <!-- Cuisine & Tags -->
      <v-row>
        <v-col cols="6">
          <SingleSelectDropDown
            v-model="form.recipeCuisine"
            label="Cuisine type"
            :items="cuisines"
          />
        </v-col>

        <v-col cols="6">
          <MultiSelectDropDown v-model="form.recipeTags" label="Tags" :items="tagOptions" />
        </v-col>
      </v-row>

      <!-- Macro Values: calories row, then four nutrients -->
      <div class="macro-values-block mt-4">
        <p class="macro-values-title mb-3">Macro Values</p>

        <v-row dense>
          <v-col cols="12" sm="8" md="6" lg="5">
            <v-text-field
              v-model="form.calories"
              label="Calories"
              placeholder="380-400"
              :suffix="caloriesSuffix"
              variant="outlined"
              density="comfortable"
              hide-details
              rounded="lg"
              class="macro-input"
              bg-color="grey-lighten-4"
            />
          </v-col>
        </v-row>

        <v-row dense class="mt-3">
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="form.protein"
              label="Protein"
              placeholder="32-35"
              :suffix="proteinSuffix"
              variant="outlined"
              density="comfortable"
              hide-details
              rounded="lg"
              class="macro-input"
              bg-color="grey-lighten-4"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="form.carbohydrates"
              label="Carbohydrates"
              placeholder="10-12"
              :suffix="carbohydratesSuffix"
              variant="outlined"
              density="comfortable"
              hide-details
              rounded="lg"
              class="macro-input"
              bg-color="grey-lighten-4"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="form.fats"
              label="Fats"
              placeholder="22-24"
              :suffix="fatsSuffix"
              variant="outlined"
              density="comfortable"
              hide-details
              rounded="lg"
              class="macro-input"
              bg-color="grey-lighten-4"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="form.fiber"
              label="Fiber"
              placeholder="3-4"
              :suffix="fiberSuffix"
              variant="outlined"
              density="comfortable"
              hide-details
              rounded="lg"
              class="macro-input"
              bg-color="grey-lighten-4"
            />
          </v-col>
        </v-row>
      </div>

      <RecipeIngredientsSection
        :form="form"
        @add-ingredient="addIngredient"
        @remove-ingredient="removeIngredient"
      />

      <!-- Recipe document: write text / link / PDF -->
      <div class="mt-4">
        <div class="mb-3">
          <v-btn
            :color="
              form.recipeDocumentFormat === 'writeup' || form.recipeDocumentFormat === 'Write-Up'
                ? 'primary'
                : undefined
            "
            :variant="
              form.recipeDocumentFormat === 'writeup' || form.recipeDocumentFormat === 'Write-Up'
                ? 'flat'
                : 'outlined'
            "
            rounded
            class="mr-2 text-capitalize"
            @click="switchDocumentFormat('writeup')"
          >
            Write text
          </v-btn>
          <v-btn
            :color="
              form.recipeDocumentFormat === 'link' || form.recipeDocumentFormat === 'Link'
                ? 'primary'
                : undefined
            "
            :variant="
              form.recipeDocumentFormat === 'link' || form.recipeDocumentFormat === 'Link'
                ? 'flat'
                : 'outlined'
            "
            rounded
            class="mr-2 text-capitalize"
            @click="switchDocumentFormat('link')"
          >
            Paste Link
          </v-btn>
          <v-btn
            :color="
              form.recipeDocumentFormat === 'document' || form.recipeDocumentFormat === 'Document'
                ? 'primary'
                : undefined
            "
            :variant="
              form.recipeDocumentFormat === 'document' || form.recipeDocumentFormat === 'Document'
                ? 'flat'
                : 'outlined'
            "
            rounded
            class="text-capitalize"
            @click="switchDocumentFormat('document')"
          >
            Upload PDF
          </v-btn>
        </div>

        <!-- Write text: textarea -->
        <v-textarea
          v-if="form.recipeDocumentFormat === 'writeup' || form.recipeDocumentFormat === 'Write-Up'"
          v-model="form.recipeDocumentWriteup"
          placeholder="Type or paste your recipe here..."
          variant="solo"
          density="comfortable"
          rows="4"
          class="mb-4"
        />

        <!-- Paste Link: URL field -->
        <v-text-field
          v-if="form.recipeDocumentFormat === 'link'"
          v-model="form.recipeDocumentLink"
          label="Recipe link or URL"
          placeholder="Paste Recipe Link or URL here"
          variant="solo"
          density="comfortable"
          class="mb-4"
        />

        <!-- Upload PDF: file input -->
        <div v-if="form.recipeDocumentFormat === 'document'">
          <v-file-input
            v-model="selectedFile"
            label="Upload PDF"
            placeholder="Choose a PDF file"
            accept="application/pdf"
            variant="solo"
            density="comfortable"
            class="mb-2"
            :loading="uploading"
            :disabled="uploading"
            @update:model-value="onDocumentFileSelected"
          />
          <p
            v-if="form.recipeDocumentPdfUrl && !selectedFile"
            class="text-caption text-medium-emphasis mb-4"
          >
            Current file:
            <a
              :href="form.recipeDocumentPdfUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary"
            >
              Open PDF
            </a>
          </p>
        </div>

        <v-alert
          v-if="uploadError"
          type="error"
          closable
          class="mb-4"
          @click:close="uploadError = null"
        >
          {{ uploadError }}
        </v-alert>

        <v-alert v-if="uploading" type="info" class="mb-4">
          <v-progress-linear indeterminate color="primary" class="mb-2" />
          Uploading file to cloud storage...
        </v-alert>
      </div>
    </div>
  </CrudDialog>
</template>

<script setup>
import { reactive, computed, watch, ref } from 'vue'
import CrudDialog from '@/components/common/CrudDialog.vue'
import SingleSelectDropDown from '@/components/common/singleSelectDropDown.vue'
import MultiSelectDropDown from '@/components/common/multiSelectDropDown.vue'
import RecipeIngredientsSection from '@/components/recipe/RecipeIngredientsSection.vue'
import { useRecipesStore } from '@/stores/recipes.store'
import { useEnumsStore } from '@/stores/enums.store'
import { uploadFile } from '@/services/gcp.service'
import { macroCaloriesSuffix, macroGramSuffix } from '@/utils/recipeMacroUnits'

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

const emit = defineEmits(['update:modelValue', 'cancel', 'saved'])

const recipesStore = useRecipesStore()
const enumsStore = useEnumsStore()

const cuisines = computed(() => enumsStore.cuisines)
const tagOptions = computed(() => enumsStore.tags)

const form = reactive({
  recipeName: '',
  recipeCuisine: null,
  recipeTags: [],
  ingredients: [],
  /** Kept separate so switching Write text / Link / PDF does not clear other tabs */
  recipeDocumentWriteup: '',
  recipeDocumentLink: '',
  recipeDocumentPdfUrl: '',
  recipeDocumentFormat: 'writeup',
  calories: '',
  protein: '',
  carbohydrates: '',
  fats: '',
  fiber: '',
})

const caloriesSuffix = computed(() => macroCaloriesSuffix(form.calories))
const proteinSuffix = computed(() => macroGramSuffix(form.protein))
const carbohydratesSuffix = computed(() => macroGramSuffix(form.carbohydrates))
const fatsSuffix = computed(() => macroGramSuffix(form.fats))
const fiberSuffix = computed(() => macroGramSuffix(form.fiber))

const selectedFile = ref(null)
const uploading = ref(false)
const uploadError = ref(null)

function normalizeDocumentFormat(raw) {
  if (raw === 'Write-Up' || raw === 'writeup') return 'writeup'
  if (raw === 'Link' || raw === 'link') return 'link'
  if (raw === 'Document' || raw === 'document') return 'document'
  return raw || 'writeup'
}

function populateBasicFields(recipe) {
  form.recipeName = recipe.recipeName || ''
  form.recipeCuisine = recipe.recipeCuisine || null
  form.recipeTags = recipe.recipeTags ? [...recipe.recipeTags] : []
  const doc = recipe.recipeDocument || ''
  const fmt = normalizeDocumentFormat(recipe.recipeDocumentFormat)
  form.recipeDocumentFormat = fmt
  form.recipeDocumentWriteup = ''
  form.recipeDocumentLink = ''
  form.recipeDocumentPdfUrl = ''
  if (fmt === 'writeup') {
    form.recipeDocumentWriteup = doc
  } else if (fmt === 'link') {
    form.recipeDocumentLink = doc
  } else if (fmt === 'document') {
    form.recipeDocumentPdfUrl = doc
  }
}

function getActiveRecipeDocument() {
  const fmt = normalizeDocumentFormat(form.recipeDocumentFormat)
  if (fmt === 'writeup') return form.recipeDocumentWriteup || ''
  if (fmt === 'link') return form.recipeDocumentLink || ''
  return form.recipeDocumentPdfUrl || ''
}

function populateMacroFields(recipe) {
  form.calories = recipe.macros?.calories || ''
  form.protein = recipe.macros?.protein || ''
  form.carbohydrates = recipe.macros?.carbohydrates || ''
  form.fats = recipe.macros?.fats || ''
  form.fiber = recipe.macros?.fiber || ''
}

function mapIngredientsFromRecipe(recipe) {
  const raw = recipe?.ingredients
  if (!Array.isArray(raw) || !raw.length) return []
  return raw.map((i) => {
    const q = i?.quantity
    const m = String(i?.measurement ?? '').trim()
    const qtyStr =
      q != null && String(q).trim() !== ''
        ? m
          ? `${String(q).trim()} ${m}`.trim()
          : String(q).trim()
        : m
    return {
      name: String(i?.name ?? i?.itemName ?? '').trim(),
      quantity: qtyStr,
    }
  })
}

function addIngredient() {
  form.ingredients = [...(form.ingredients || []), { name: '', quantity: '' }]
}

function removeIngredient(index) {
  const list = [...(form.ingredients || [])]
  list.splice(index, 1)
  form.ingredients = list
}

function populateFormFromRecipe(recipe) {
  if (!recipe) return

  populateBasicFields(recipe)
  populateMacroFields(recipe)
  form.ingredients = mapIngredientsFromRecipe(recipe)

  selectedFile.value = null
  uploadError.value = null
}

watch(() => props.recipe, populateFormFromRecipe, { immediate: true })

const isFormValid = computed(() => {
  const nameValid = !!form.recipeName?.trim()
  const cuisineValid = !!form.recipeCuisine
  const ingredientsValid = (form.ingredients || []).some(
    (ing) => String(ing?.name ?? '').trim().length > 0,
  )

  if (uploading.value) {
    return false
  }

  return nameValid && cuisineValid && ingredientsValid
})

function switchDocumentFormat(newFormat) {
  form.recipeDocumentFormat = newFormat
  uploadError.value = null
  if (newFormat !== 'document') {
    selectedFile.value = null
  }
}

function validateFile(file) {
  if (file.type !== 'application/pdf') {
    return 'Only PDF files are allowed'
  }

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return 'File size must be less than 10MB'
  }

  return null
}

async function onDocumentFileSelected(files) {
  const file = Array.isArray(files) ? files[0] : files

  if (!file) {
    selectedFile.value = null
    uploadError.value = null
    return
  }

  selectedFile.value = file

  const validationError = validateFile(file)
  if (validationError) {
    uploadError.value = validationError
    selectedFile.value = null
    return
  }

  try {
    uploading.value = true
    uploadError.value = null

    const publicUrl = await uploadFile(file)
    form.recipeDocumentPdfUrl = publicUrl
  } catch (error) {
    uploadError.value =
      error.response?.data?.message || error.message || 'Upload failed. Please try again.'
    selectedFile.value = null
  } finally {
    uploading.value = false
  }
}

function close() {
  emit('update:modelValue', false)
  emit('cancel')
}

async function saveRecipe() {
  if (!isFormValid.value) {
    return
  }

  try {
    const id = props.recipe?._id ?? props.recipe?.id
    const ingredients = (form.ingredients || []).map((ing) => ({
      name: String(ing?.name ?? '').trim(),
      quantity: String(ing?.quantity ?? '').trim(),
    }))

    const payload = {
      recipeName: form.recipeName.trim(),
      recipeCuisine: form.recipeCuisine,
      recipeTags: form.recipeTags || [],
      ingredients,
      recipeDocumentFormat: form.recipeDocumentFormat,
      recipeDocument: getActiveRecipeDocument(),
      macros: {
        calories: form.calories || '',
        protein: form.protein || '',
        carbohydrates: form.carbohydrates || '',
        fats: form.fats || '',
        fiber: form.fiber || '',
      },
    }

    await recipesStore.updateRecipe(id, payload)
    await recipesStore.fetchAllRecipes()
    Object.assign(form, {
      recipeName: '',
      recipeCuisine: null,
      recipeTags: [],
      ingredients: [],
      recipeDocumentWriteup: '',
      recipeDocumentLink: '',
      recipeDocumentPdfUrl: '',
      recipeDocumentFormat: 'writeup',
      calories: '',
      protein: '',
      carbohydrates: '',
      fats: '',
      fiber: '',
    })
    recipesStore.closeDialog('view')
    close()
    emit('saved')
  } catch {
    // Error handling
  }
}

function handleDelete() {
  const recipeToDelete = props.recipe
  close()
  recipesStore.openDialog('delete', recipeToDelete)
}
</script>

<style scoped>
.macro-values-title {
  font-size: 1rem;
  font-weight: 700;
  color: #272727;
}

.macro-values-block :deep(.macro-input .v-field) {
  border-radius: 10px;
}
</style>
