<template>
  <v-container class="create-template-page px-5 py-4">
    <div class="d-block mb-6 gap-4">
      <div class="breadcrumbWrap">
        <router-link to="/templates">Templates</router-link>
        <v-icon size="small" color="grey-darken-1">mdi-chevron-right</v-icon>
        <span>{{ isEditMode ? 'Template Details' : 'Add Template: Create New Template' }}</span>
      </div>
      <div class="commanHead">
        <h1 class="page-title">
          {{ isEditMode ? templateName || 'Template Details' : 'Create New Template' }}
        </h1>
        <div class="d-flex gap-3 flex-wrap">
          <v-btn
            v-if="isEditMode"
            :disabled="loading"
            variant="outlined"
            color="error"
            rounded="lg"
            @click="handleDeleteTemplate"
          >
            <v-progress-circular v-if="loading" indeterminate size="20" class="mr-2" />
            Delete template
          </v-btn>
          <v-btn
            v-if="!isEditMode"
            :disabled="loading"
            variant="outlined"
            color="grey-darken-2"
            rounded="lg"
            @click="handleSaveDraft"
          >
            <v-progress-circular v-if="loading" indeterminate size="20" class="mr-2" />
            Save as draft
          </v-btn>
          <v-btn
            :disabled="loading"
            color="primary"
            variant="flat"
            rounded="lg"
            @click="handleSaveTemplate"
          >
            <v-progress-circular v-if="loading" indeterminate size="20" class="mr-2" />
            {{ isEditMode ? 'Save changes' : 'Save template' }}
          </v-btn>
        </div>
      </div>
    </div>

    <v-row>
      <v-col cols="12" lg="4">
        <v-card class="mb-6" elevation="1">
          <v-card-title class="text-h6">Average Daily Macros</v-card-title>
          <v-card-text>
            <div class="emptyBeforeContent">Add food items to see macro breakdown</div>
            <div class="d-flex flex-wrap gap-4">
              <div>
                <v-chip color="success" size="small">Protein</v-chip> <span class="ml-2">— g</span>
              </div>
              <div>
                <v-chip color="primary" size="small">Carbs</v-chip> <span class="ml-2">— g</span>
              </div>
              <div>
                <v-chip color="error" size="small">Fat</v-chip> <span class="ml-2">— g</span>
              </div>
              <div>
                <v-chip color="warning" size="small">Fiber</v-chip> <span class="ml-2">— g</span>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card elevation="1">
          <v-card-title class="text-h6">Daily Chart</v-card-title>
          <v-card-text class="text-center py-12 grey--text text--lighten-1">
            <v-icon size="64" color="grey-lighten-2">mdi-chart-bar</v-icon>
            <div class="mt-4 text-body-1">
              Daily nutrition breakdown will appear here once items are added
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="8">
        <v-card class="mb-6" elevation="1">
          <v-card-text class="pt-6">
            <v-row dense>
              <v-col cols="12" md="4">
                <div class="text-subtitle-1 font-weight-medium mb-2">Template name</div>
                <v-text-field
                  v-model="templateName"
                  placeholder="e.g. Weight Loss - Beginner"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  rounded="lg"
                />
              </v-col>

              <v-col cols="12" md="4">
                <div class="text-subtitle-1 font-weight-medium mb-2">Duration</div>
                <div class="d-flex gap-2 grayBg p-0">
                  <v-text-field
                    v-model.number="durationValue"
                    type="number"
                    min="1"
                    placeholder="eg: 8"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    rounded="lg"
                    class="flex-grow-1"
                  />

                  <v-select
                    v-model="durationUnit"
                    :items="durationUnitOptions"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    rounded="lg"
                    class="duration-unit-select"
                  >
                    <template #selection="{ item }">
                      <span class="duration-unit-text">{{
                        item?.raw?.label || item?.title || ''
                      }}</span>
                    </template>
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props" :title="item?.raw?.label || item?.title || ''" />
                    </template>
                  </v-select>
                </div>
              </v-col>

              <v-col cols="12" md="4">
                <div class="text-subtitle-1 font-weight-medium mb-2">Target Group</div>
                <v-combobox
                  v-model="targetGroup"
                  v-model:search="targetGroupSearchText"
                  :items="targetGroupSuggestions"
                  :custom-filter="targetGroupFilter"
                  placeholder="eg: Women"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  rounded="lg"
                  clearable
                >
                  <template #no-data>
                    <v-list-item>
                      <v-list-item-title>
                        {{
                          targetGroupSearchText
                            ? `Press Enter to add "${targetGroupSearchText.trim()}"`
                            : 'No target groups found'
                        }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </v-combobox>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <TemplateWeekExpansionPanels
          :weekly-meals="weeklyMeals"
          :food-suggestions="foodSuggestions"
        />
      </v-col>
    </v-row>

    <AddRecipesModal
      ref="addRecipesModalRef"
      v-model="showAddRecipesModal"
      :items="getAllItems()"
      @done="finalizeTemplateSave"
      @add-recipe="onAddRecipeFromModal"
    />

    <v-dialog v-model="showDeleteDialog" max-width="440" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <span>Delete Template</span>
          <v-spacer />
          <v-btn icon variant="text" class="repeat-close-btn" @click="showDeleteDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <div class="text-body-2">Are you sure you want to delete this template?</div>
        </v-card-text>

        <v-card-actions class="pb-6 px-6">
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :disabled="loading" @click="confirmDeleteTemplate"
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <AssignTemplateDialog
      v-model="showAssignDialog"
      :template-name="savedTemplateName"
      :template-id="savedTemplateId"
      :assigned-client-ids="assignedClientIds"
      @assigned="handleTemplateAssigned"
      @skip="handleSkipAssignment"
    />

    <AlertDialog
      v-model="showAlertDialog"
      :title="alertTitle"
      :message="alertMessage"
      confirm-text="OK"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRecipesStore } from '@/stores/recipes.store'
import { useClientStore } from '@/stores/client.store'
import { useTemplatesStore } from '@/stores/templates.store'
import TemplateWeekExpansionPanels from '@/components/template/TemplateWeekExpansionPanels.vue'
import {
  DAYS_OF_WEEK,
  createEmptyWeeklyMealsFromSchedule,
  DEFAULT_MEAL_SCHEDULE,
  buildWeeklyMealsFromApiTemplate,
} from '@/utils/templateWeekMeals'
import AddRecipesModal from '@/components/template/AddRecipesModal.vue'
import AssignTemplateDialog from '@/components/template/AssignTemplateDialog.vue'
import AlertDialog from '@/components/common/AlertDialog.vue'
import templateService from '@/services/templates.service'
import mealScheduleService from '@/services/mealSchedule.service'

/** Persist template form when navigating to Add Recipe page; restored via ?resumeTemplate=1 */
const CREATE_TEMPLATE_RESUME_KEY = 'beet:createTemplateAddRecipeResume'

const router = useRouter()
const route = useRoute()
const recipesStore = useRecipesStore()
const clientStore = useClientStore()
const templatesStore = useTemplatesStore()
const addRecipesModalRef = ref(null)

const templateName = ref('')
const durationValue = ref(null)
const durationUnit = ref('week')
const targetGroup = ref('')
const targetGroupSearchText = ref('')
const loading = ref(false)
const showAddRecipesModal = ref(false)
const showAssignDialog = ref(false)
const savedTemplateId = ref(null)
const savedTemplateName = ref('')
const pendingPayload = ref(null)
const showDeleteDialog = ref(false)
const showAlertDialog = ref(false)
const alertTitle = ref('Validation')
const alertMessage = ref('')

const templateId = computed(() => route.params.id)
const isEditMode = computed(() => Boolean(templateId.value))

const assignedClientIds = computed(() => {
  const ids = new Set()
  for (const template of templatesStore.templates || []) {
    for (const client of template.assignedTo || []) {
      if (client?._id || client?.id) {
        ids.add(client._id || client.id)
      }
    }
  }
  return Array.from(ids)
})

const foodSuggestions = computed(() => {
  const names = (recipesStore.recipes || [])
    .map((recipe) => recipe?.recipeName)
    .filter((name) => typeof name === 'string' && name.trim())

  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b))
})

const targetGroupSuggestions = computed(() => {
  const groups = (templatesStore.templates || [])
    .map((template) => template?.description)
    .filter((group) => typeof group === 'string' && group.trim())

  return Array.from(new Set(groups.map((group) => group.trim()))).sort((a, b) => a.localeCompare(b))
})

const durationUnitOptions = [
  { label: 'Weeks', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Half Year', value: 'half-year' },
  { label: 'Year', value: 'year' },
]

const durationUnitToDaysMap = {
  week: 7,
  month: 30,
  quarter: 90,
  'half-year': 182,
  year: 365,
}

onMounted(async () => {
  let mealSchedule = DEFAULT_MEAL_SCHEDULE
  try {
    const scheduleResponse = await mealScheduleService.getMealSchedule()
    const scheduleData = Array.isArray(scheduleResponse?.data?.data)
      ? scheduleResponse.data.data
      : []
    if (scheduleData.length) {
      mealSchedule = scheduleData
    }
  } catch {
    mealSchedule = DEFAULT_MEAL_SCHEDULE
  }

  await Promise.all([
    recipesStore.fetchAllRecipes({ limit: 1000 }),
    clientStore.fetchAllClients({ limit: 1000 }),
    templatesStore.fetchAllTemplates(),
  ])

  if (route.query.resumeTemplate === '1') {
    const restored = restoreCreateTemplateResume(mealSchedule)
    if (restored) {
      await recipesStore.fetchAllRecipes({ limit: 1000 })
      await reopenAddRecipesModalAfterResume()
      await router.replace({ path: route.path, query: {} })
      return
    }
  }

  weeklyMeals.value = createEmptyWeeklyMealsFromSchedule(mealSchedule)

  if (isEditMode.value) {
    await loadTemplateForEdit()
  }
})

const weeklyMeals = ref(createEmptyWeeklyMealsFromSchedule(DEFAULT_MEAL_SCHEDULE))

function pushNamedItemsFromList(itemList, items) {
  for (const item of itemList || []) {
    if (item.name && item.name.trim()) {
      items.push(item)
    }
  }
}

function collectItemsFromMeal(meal, items) {
  pushNamedItemsFromList(meal.items, items)
  for (const opt of meal.options || []) {
    pushNamedItemsFromList(opt.items, items)
  }
}

function getAllItems() {
  const items = []
  for (const day of DAYS_OF_WEEK) {
    const meals = weeklyMeals.value[day] || []
    for (const meal of meals) {
      collectItemsFromMeal(meal, items)
    }
  }
  return items
}

function doesMatchByInitials(value = '', query = '') {
  if (!value || !query) return false

  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toLowerCase()

  return initials.includes(query.toLowerCase())
}

function targetGroupFilter(itemTitle, queryText, item) {
  const query = (queryText || '').toString().trim().toLowerCase()
  if (!query) return true

  const rawValue = item?.raw ?? itemTitle
  const title = (rawValue || '').toString().toLowerCase()

  return title.includes(query) || doesMatchByInitials(title, query)
}

function openAlertModal(message, title = 'Validation') {
  alertTitle.value = title
  alertMessage.value = message
  showAlertDialog.value = true
}

function inferDurationFromDays(totalDays = 7) {
  const normalizedDays = Math.max(1, Number(totalDays) || 7)

  const preferredUnits = ['year', 'half-year', 'quarter', 'month', 'week']
  for (const unit of preferredUnits) {
    const daysPerUnit = durationUnitToDaysMap[unit]
    if (normalizedDays % daysPerUnit === 0) {
      return {
        value: normalizedDays / daysPerUnit,
        unit,
      }
    }
  }

  return {
    value: Math.max(1, Math.ceil(normalizedDays / durationUnitToDaysMap.week)),
    unit: 'week',
  }
}

function findRecipeByName(itemName) {
  const normalized = itemName.toLowerCase().trim()
  return recipesStore.recipes.find((r) => r.recipeName.toLowerCase().trim() === normalized)
}

function getUnmatchedItemsForCurrentPlan() {
  const allItems = getAllItems()
  const unmatchedItems = []
  const unmatchedByName = new Map()

  allItems.forEach((item) => {
    const itemName = (item?.name || '').trim()
    if (!itemName) return

    const recipe = findRecipeByName(itemName)
    if (!recipe) {
      const normalizedName = itemName.toLowerCase()
      if (!unmatchedByName.has(normalizedName)) {
        const normalizedItem = {
          ...item,
          name: itemName,
        }
        unmatchedByName.set(normalizedName, normalizedItem)
        unmatchedItems.push(normalizedItem)
      }
    }
  })

  return unmatchedItems
}

function saveCreateTemplateResume() {
  const snapshot = {
    v: 1,
    templateName: templateName.value,
    durationValue: durationValue.value,
    durationUnit: durationUnit.value,
    targetGroup: targetGroup.value,
    targetGroupSearchText: targetGroupSearchText.value,
    weeklyMeals: cloneTemplatePayload(weeklyMeals.value),
    pendingPayload: pendingPayload.value ? cloneTemplatePayload(pendingPayload.value) : null,
  }
  sessionStorage.setItem(CREATE_TEMPLATE_RESUME_KEY, JSON.stringify(snapshot))
}

function restoreCreateTemplateResume(mealScheduleFallback) {
  const raw = sessionStorage.getItem(CREATE_TEMPLATE_RESUME_KEY)
  if (!raw) return false
  sessionStorage.removeItem(CREATE_TEMPLATE_RESUME_KEY)
  try {
    const data = JSON.parse(raw)
    templateName.value = data.templateName ?? ''
    durationValue.value = data.durationValue ?? null
    durationUnit.value = data.durationUnit ?? 'week'
    targetGroup.value = data.targetGroup ?? ''
    targetGroupSearchText.value = data.targetGroupSearchText ?? ''
    weeklyMeals.value = data.weeklyMeals ?? createEmptyWeeklyMealsFromSchedule(mealScheduleFallback)
    pendingPayload.value = data.pendingPayload ?? null
    return true
  } catch {
    return false
  }
}

async function reopenAddRecipesModalAfterResume() {
  if (!pendingPayload.value) return
  const unmatchedItems = getUnmatchedItemsForCurrentPlan()
  if (unmatchedItems.length > 0) {
    showAddRecipesModal.value = true
    await nextTick()
    addRecipesModalRef.value?.setUnmatched(unmatchedItems)
  } else {
    showAddRecipesModal.value = false
  }
}

function onAddRecipeFromModal({ name }) {
  const trimmed = String(name || '').trim()
  if (!trimmed) return
  saveCreateTemplateResume()
  router.push({
    name: 'add-recipe',
    query: {
      name: trimmed,
      returnTo: `${route.path}?resumeTemplate=1`,
    },
  })
}

function checkAndMapRecipes(payload) {
  const unmatchedItems = getUnmatchedItemsForCurrentPlan()

  if (unmatchedItems.length > 0) {
    pendingPayload.value = payload
    addRecipesModalRef.value?.setUnmatched(unmatchedItems)
    showAddRecipesModal.value = true
    return false
  }

  return true
}

/** Deep clone to plain JSON data — structuredClone fails on Vue reactive proxies in nested arrays. */
function cloneTemplatePayload(payload) {
  return JSON.parse(JSON.stringify(payload))
}

function mapRecipesToPayload(payload) {
  const allItems = getAllItems()
  const itemToRecipe = {}

  for (const item of allItems) {
    const recipe = findRecipeByName(item.name)
    if (recipe) {
      itemToRecipe[item.name] = recipe._id
    }
  }

  const updatedPayload = cloneTemplatePayload(payload)

  function applyIdsToItemList(list) {
    for (const item of list || []) {
      if (itemToRecipe[item.name]) {
        item.recipeId = itemToRecipe[item.name]
      }
    }
  }

  for (const dayObj of updatedPayload.days) {
    for (const meal of dayObj.meals) {
      applyIdsToItemList(meal.items)
      for (const opt of meal.options || []) {
        applyIdsToItemList(opt.items)
      }
    }
  }

  return updatedPayload
}

function buildTemplatePayload() {
  const days = DAYS_OF_WEEK.map((day) => {
    const meals = weeklyMeals.value[day] || []
    return {
      day,
      meals: meals
        .map((meal) => ({
          mealType: meal.title,
          notes: meal.time || '',
          items: meal.items || [],
          options: meal.options || [],
        }))
        .filter((meal) => {
          const hasItems = meal.items.length > 0
          const hasOptions = meal.options.some((opt) => opt.items?.length > 0)
          return hasItems || hasOptions
        }),
    }
  })

  return {
    templateName: templateName.value,
    description: targetGroup.value,
    durationInDays:
      (Number(durationValue.value) || 1) * (durationUnitToDaysMap[durationUnit.value] || 7),
    days,
    isDraft: false,
  }
}

function hasDuplicateTemplateName(name) {
  const normalized = (name || '').trim().toLowerCase()
  if (!normalized) return false

  return (templatesStore.templates || []).some((template) => {
    const existingName = (template.templateName || '').trim().toLowerCase()
    if (!existingName) return false

    const sameTemplate = isEditMode.value && (template._id || template.id) === templateId.value
    if (sameTemplate) return false

    return existingName === normalized
  })
}

async function loadTemplateForEdit() {
  try {
    const template = await templatesStore.fetchTemplateById(templateId.value)
    if (!template) return

    templateName.value = template.templateName || ''
    targetGroup.value = template.description || ''
    const inferredDuration = inferDurationFromDays(template.durationInDays || 7)
    durationValue.value = inferredDuration.value
    durationUnit.value = inferredDuration.unit

    weeklyMeals.value = buildWeeklyMealsFromApiTemplate(template)
  } catch (err) {
    openAlertModal(err.response?.data?.message || 'Failed to load template', 'Error')
    console.error(err)
  }
}

async function handleSaveDraft() {
  if (!templateName.value.trim()) {
    openAlertModal('Please enter a template name')
    return
  }

  if (hasDuplicateTemplateName(templateName.value)) {
    openAlertModal('Template name must be unique')
    return
  }

  loading.value = true

  try {
    const payload = buildTemplatePayload()
    payload.isDraft = true
    const mappedPayload = mapRecipesToPayload(payload)
    await templateService.saveAsDraft(mappedPayload)
    router.push('/templates')
  } catch (err) {
    openAlertModal(err.response?.data?.message || 'Failed to save draft', 'Error')
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function finalizeTemplateSave() {
  const payloadToSave = pendingPayload.value
  if (!payloadToSave) return

  if (hasDuplicateTemplateName(templateName.value)) {
    openAlertModal('Template name must be unique')
    return
  }

  pendingPayload.value = null

  loading.value = true
  showAddRecipesModal.value = false

  try {
    const mappedPayload = mapRecipesToPayload(payloadToSave)
    if (isEditMode.value) {
      await templatesStore.updateTemplate(templateId.value, mappedPayload)
      router.push('/templates')
    } else {
      const response = await templateService.createTemplate(mappedPayload)
      const createdTemplate = response.data || response

      savedTemplateId.value = createdTemplate._id || createdTemplate.id
      savedTemplateName.value = createdTemplate.templateName || templateName.value
      showAssignDialog.value = true
    }
  } catch (err) {
    openAlertModal(err.response?.data?.message || 'Failed to save template', 'Error')
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function handleSaveTemplate() {
  if (!templateName.value.trim()) {
    openAlertModal('Please enter a template name')
    return
  }

  if (hasDuplicateTemplateName(templateName.value)) {
    openAlertModal('Template name must be unique')
    return
  }

  if (!durationValue.value || durationValue.value < 1) {
    openAlertModal('Please enter a valid duration')
    return
  }

  const payload = buildTemplatePayload()
  const canSave = checkAndMapRecipes(payload)

  if (!canSave) {
    return
  }

  loading.value = true

  try {
    const mappedPayload = mapRecipesToPayload(payload)
    if (isEditMode.value) {
      await templatesStore.updateTemplate(templateId.value, mappedPayload)
      router.push('/templates')
    } else {
      await templateService.createTemplate(mappedPayload)
      router.push('/templates')
    }
  } catch (err) {
    openAlertModal(err.response?.data?.message || 'Failed to save template', 'Error')
    console.error(err)
  } finally {
    loading.value = false
  }
}

function handleTemplateAssigned() {
  // Navigate to templates page after assignment
  router.push('/templates')
}

function handleSkipAssignment() {
  // Navigate to templates page without assignment
  router.push('/templates')
}

function handleDeleteTemplate() {
  showDeleteDialog.value = true
}

async function confirmDeleteTemplate() {
  if (!isEditMode.value) return

  loading.value = true
  try {
    await templatesStore.deleteTemplate(templateId.value)
    router.push('/templates')
  } catch (err) {
    openAlertModal(err.response?.data?.message || 'Failed to delete template', 'Error')
    console.error(err)
  } finally {
    loading.value = false
    showDeleteDialog.value = false
  }
}
</script>

<style scoped>
.page-title {
  font-size: 32px;
  font-weight: 700;
  padding: 0 15px;
}

.v-text-field.rounded-lg :deep(.v-field) {
  border-radius: 12px;
}

.v-btn.rounded-lg {
  border-radius: 28px;
  text-transform: none;
}

.duration-unit-select {
  min-width: 140px;
  max-width: 170px;
}

.duration-unit-text {
  white-space: nowrap;
}

/* make the repeat-dialog close icon look like plain cross with no circle */
.repeat-close-btn {
  min-width: auto;
  padding: 4px;
  background: transparent !important;
  box-shadow: none !important;
}
.repeat-close-btn .v-btn__content {
  margin: 0;
}
</style>
