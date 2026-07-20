<template>
  <v-container class="add-recipe-page px-5 py-4">
    <AddRecipePageHeader
      :loading="recipesStore.loading"
      :save-disabled="!isFormValid || !!duplicateError"
      @delete="handleDeleteClick"
      @save-draft="saveAsDraft"
      @save="saveRecipe"
    />
    <RecipeNameSection
      :recipe-name="form.recipeName"
      :recipe-name-error="duplicateError"
      :similar-recipe-suggestions="similarSuggestionsList"
      @update:recipe-name="onRecipeNameUpdate"
      @pick-suggestion="onPickSuggestion"
    />
    <AddRecipeContentCard
      :form="form"
      :document-formats="DOCUMENT_FORMATS"
      :selected-file="selectedFile"
      :uploading="uploading"
      :upload-error="uploadError"
      :extract-loading="extractLoading"
      @switch-format="switchDocumentFormat"
      @document-file-selected="onDocumentFileSelected"
      @clear-upload-error="uploadError = null"
      @fill-with-ai="fillWithBeetAi"
    />
    <RecipeMetaSection
      :recipe-cuisine="form.recipeCuisine"
      :recipe-tags="form.recipeTags"
      :enums-store="enumsStore"
      @update:recipe-cuisine="form.recipeCuisine = $event"
      @update:recipe-tags="form.recipeTags = $event"
    />
    <RecipeIngredientsSection
      :form="form"
      @add-ingredient="addIngredient"
      @remove-ingredient="removeIngredient"
    />
    <RecipeMacrosSection :form="form" />
    <RecipeDialog v-model="recipesStore.visible.view" :recipe="recipesStore.item" />
    <EditRecipeDialog v-model="recipesStore.visible.edit" :recipe="recipesStore.item" />
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AddRecipePageHeader from '@/components/recipe/AddRecipePageHeader.vue'
import RecipeNameSection from '@/components/recipe/RecipeNameSection.vue'
import AddRecipeContentCard from '@/components/recipe/AddRecipeContentCard.vue'
import RecipeMetaSection from '@/components/recipe/RecipeMetaSection.vue'
import RecipeIngredientsSection from '@/components/recipe/RecipeIngredientsSection.vue'
import RecipeMacrosSection from '@/components/recipe/RecipeMacrosSection.vue'
import RecipeDialog from '@/components/recipe/recipeDialog.vue'
import EditRecipeDialog from '@/components/recipe/EditRecipeDialog.vue'
import { useRecipeForm } from '@/composables/useRecipeForm'
import { useEnumsStore } from '@/stores/enums.store'
import { getRecipes } from '@/services/recipes.service'

const router = useRouter()
const route = useRoute()
const enumsStore = useEnumsStore()
const initialName = computed(() => route.query?.name ?? '')

const {
  form,
  selectedFile,
  uploading,
  uploadError,
  duplicateError,
  similarRecipeNames,
  extractLoading,
  isFormValid,
  DOCUMENT_FORMATS,
  recipesStore,
  switchDocumentFormat,
  addIngredient,
  removeIngredient,
  onDocumentFileSelected,
  fillWithBeetAi,
  buildPayload,
  resetForm,
} = useRecipeForm({ initialRecipeName: initialName.value })

const similarSuggestionsList = computed(() => {
  const v = similarRecipeNames?.value ?? similarRecipeNames
  return Array.isArray(v) ? v : []
})

onMounted(() => {
  if (initialName.value) form.recipeName = initialName.value
})

function onRecipeNameUpdate(value) {
  form.recipeName = value
}
async function resolveRecipeIdByName(name) {
  const trimmed = String(name ?? '').trim()
  if (!trimmed) return null
  const body = await getRecipes({ search: trimmed, limit: 25, skip: 0 })
  const data = body?.data ?? body
  const list = Array.isArray(data) ? data : (data?.recipes ?? data?.data ?? [])
  const norm = (n) =>
    String(n ?? '')
      .trim()
      .toLowerCase()
  const target = norm(trimmed)
  const hit = list.find((r) => norm(r.recipeName ?? r.name) === target)
  return hit?._id ?? hit?.id ?? null
}

async function onPickSuggestion(picked) {
  const name = typeof picked === 'string' ? picked.trim() : String(picked?.name ?? '').trim()
  const id = typeof picked === 'object' && picked != null ? picked.id : null
  if (!name && !id) return

  try {
    if (id) {
      await recipesStore.fetchRecipe(id)
      recipesStore.openDialog('view')
      return
    }
    const resolvedId = await resolveRecipeIdByName(name)
    if (resolvedId) {
      await recipesStore.fetchRecipe(resolvedId)
      recipesStore.openDialog('view')
    }
  } catch {
    /* view recipe failed */
  }
}
function safeInternalPath(q) {
  if (typeof q !== 'string' || !q.startsWith('/') || q.startsWith('//')) return null
  return q
}

function navigateAfterRecipeAction() {
  const back = safeInternalPath(route.query.returnTo)
  if (back) {
    router.push(back)
    return
  }
  router.push({ name: 'recipes' })
}

function handleDeleteClick() {
  navigateAfterRecipeAction()
}
async function saveAsDraft() {
  if (!isFormValid.value) return
  duplicateError.value = null
  recipesStore.clearError()
  try {
    await recipesStore.addRecipe(buildPayload(true))
    await recipesStore.fetchAllRecipes()
    resetForm()
    navigateAfterRecipeAction()
  } catch {
    /* error handled by store */
  }
}
async function saveRecipe() {
  if (!isFormValid.value) return
  duplicateError.value = null
  recipesStore.clearError()
  try {
    if (await recipesStore.recipeExistsByName(form.recipeName.trim())) {
      duplicateError.value = 'This recipe already exists.'
      return
    }
    await recipesStore.addRecipe(buildPayload())
    await recipesStore.fetchAllRecipes()
    resetForm()
    navigateAfterRecipeAction()
  } catch {
    /* error handled by store */
  }
}
</script>
