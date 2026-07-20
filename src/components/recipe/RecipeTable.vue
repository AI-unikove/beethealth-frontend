<template>
  <div>
    <CrudList
      :headers="headers"
      :items="sortedRecipes"
      :items-length="tableItemsLength"
      :page="recipesStore.pagination.page"
      :items-per-page="recipesStore.pagination.itemsPerPage"
      :loading="recipesStore.loading"
      :sort-by="sortBy"
      item-value="name"
      add-button-text="Add Recipe"
      :load-data="loadCrudList"
      @add="goToAddRecipe"
      @edit="handleEdit"
      @row-click="handleRowClick"
      @update:page="onTablePage"
      @update:items-per-page="onTableItemsPerPage"
      @update:sort-by="sortBy = $event"
    >
      <template #search>
        <div class="search-container">
          <input
            v-model="search"
            clearable
            type="text"
            class="search-box"
            placeholder="Search by recipe name or cuisine"
          />
        </div>
      </template>

      <template #toolbar-actions>
        <button class="icon-btn" @click="toggleFilters">
          <img src="@/assets/images/setting.svg" alt="Filters" />
        </button>
      </template>

      <template #filters>
        <RecipeFilters
          v-if="showFilters"
          v-model:cuisines="filterCuisines"
          v-model:tags="filterTags"
        />
      </template>

      <template #[`item.name`]="{ item }">
        <div class="client-name d-flex align-center flex-wrap">
          <span v-if="item.isDraft" class="draft-badge">Draft</span>
          <span>{{ crudListFormatters.titleCase(item.name) }}</span>
        </div>
      </template>

      <template #[`item.cuisine`]="{ item }">
        {{ item.cuisine || '–' }}
      </template>

      <template #[`item.tags`]="{ item }">
        <template v-if="item.tags?.length">
          <v-chip
            v-for="(tag, i) in item.tags"
            :key="i"
            size="small"
            color="deep-purple"
            variant="tonal"
            class="mr-1 recipe-tag-chip"
          >
            {{ tag }}
          </v-chip>
        </template>
        <span v-else class="text-grey">–</span>
      </template>

      <template #[`item.format`]="{ item }">
        <div
          class="addFileNotes"
          :class="{ 'format-clickable': item.format === 'Document' || item.format === 'Link' }"
          @click.stop="openDocument(item)"
        >
          <v-icon v-if="item.format === 'Document'" color="grey-darken-1">mdi-file-outline</v-icon>
          <v-icon v-else-if="item.format === 'Write-Up'" color="green">mdi-file-document</v-icon>
          <v-icon v-else color="primary">mdi-link</v-icon>
          <span class="ml-2">{{ item.format || '–' }}</span>
        </div>
      </template>

      <template #[`item.action`]="{ item }">
        <v-menu
          v-model="menuOpenByItem[item.name]"
          :close-on-content-click="true"
          location="bottom end"
          origin="top end"
          transition="scale-transition"
        >
          <template #activator="{ props: menuProps }">
            <v-icon class="action-icon" size="small" v-bind="menuProps" @click.stop>
              mdi-dots-vertical
            </v-icon>
          </template>
          <v-list density="compact" min-width="160">
            <v-list-item title="Edit recipe" @click="handleEdit(item)" />
            <v-list-item title="Delete recipe" @click="handleDelete(item)" />
          </v-list>
        </v-menu>
      </template>
    </CrudList>

    <!-- Dialogs -->
    <EditRecipeDialog v-model="recipesStore.visible.edit" :recipe="recipesStore.item" />
    <DeleteRecipeDialog v-model="recipesStore.visible.delete" :recipe="recipesStore.item" />
    <RecipeDialog v-model="recipesStore.visible.view" :recipe="recipesStore.item" />
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import CrudList from '@/components/common/CrudList.vue'
import RecipeFilters from '@/components/recipe/recipeFilters.vue'
import EditRecipeDialog from '@/components/recipe/EditRecipeDialog.vue'
import DeleteRecipeDialog from '@/components/recipe/DeleteRecipeDialog.vue'
import RecipeDialog from '@/components/recipe/recipeDialog.vue'
import { useRecipesStore } from '@/stores/recipes.store'
import { formatLabel, normalizeTags } from '@/components/recipe/recipe.helper'
import { crudListFormatters } from '@/components/common/crudListFormatters'

const router = useRouter()
const recipesStore = useRecipesStore()

function goToAddRecipe() {
  router.push({ name: 'add-recipe' })
}

const search = ref('')
const filterCuisines = ref([])
const filterTags = ref([])
const menuOpenByItem = reactive({})
const showFilters = ref(false)
const sortBy = ref([])

const headers = [
  { title: 'Recipe Name', key: 'name', sortable: true, formatter: 'titleCase' },
  { title: 'Cuisine', key: 'cuisine', sortable: true },
  { title: 'Tags', key: 'tags', sortable: true },
  { title: 'Format', key: 'format', sortable: false },
  { title: 'Action', key: 'action', sortable: false, align: 'center' },
]

function loadCrudList() {
  fetchRecipesWithFilters()
}

function fetchRecipesWithFilters() {
  const params = {}

  if (search.value?.trim()) {
    params.search = search.value.trim()
  }

  if (filterCuisines.value?.length) {
    params.cuisines = Array.isArray(filterCuisines.value)
      ? filterCuisines.value.join(',')
      : filterCuisines.value
  }

  if (filterTags.value?.length) {
    params.tags = Array.isArray(filterTags.value) ? filterTags.value.join(',') : filterTags.value
  }

  recipesStore.fetchAllRecipes(params)
}

function onTablePage(page) {
  if (recipesStore.pagination.page === page) {
    return
  }
  recipesStore.pagination.page = page
  fetchRecipesWithFilters()
}

function onTableItemsPerPage(itemsPerPage) {
  if (recipesStore.pagination.itemsPerPage === itemsPerPage) {
    return
  }
  recipesStore.pagination.itemsPerPage = itemsPerPage
  recipesStore.pagination.page = 1
  fetchRecipesWithFilters()
}

watch(
  [search, filterCuisines, filterTags],
  () => {
    recipesStore.pagination.page = 1
    fetchRecipesWithFilters()
  },
  { deep: true },
)

const filteredRecipes = computed(() => {
  const raw = Array.isArray(recipesStore.recipes) ? recipesStore.recipes : []

  return raw.map((r) => {
    const rawTags = r.recipeTags ?? r.tags
    return {
      _id: r._id ?? r.id,
      name: r.name ?? r.recipeName ?? 'N/A',
      isDraft: !!r.isDraft,
      cuisine: r.cuisine ?? r.recipeCuisine ?? '–',
      tags: normalizeTags(rawTags),
      format: r.format ?? formatLabel(r.recipeDocumentFormat) ?? '–',
      documentUrl: r.recipeDocument,
    }
  })
})

function getRecipeSortValue(item, key) {
  if (key === 'name') return (item.name || '').toLowerCase()
  if (key === 'cuisine') return (item.cuisine === '–' ? '' : item.cuisine || '').toLowerCase()
  if (key === 'tags') return (item.tags?.[0] || '').toLowerCase()
  return ''
}

const sortedRecipes = computed(() => {
  if (sortBy.value.length === 0) return filteredRecipes.value

  const { key, order } = sortBy.value[0]
  return [...filteredRecipes.value].sort((a, b) => {
    const aVal = getRecipeSortValue(a, key)
    const bVal = getRecipeSortValue(b, key)
    if (aVal < bVal) return order === 'desc' ? 1 : -1
    if (aVal > bVal) return order === 'desc' ? -1 : 1
    return 0
  })
})

const tableItemsLength = computed(() => {
  const total = recipesStore.pagination.totalItems
  if (typeof total === 'number' && total > 0) {
    return total
  }
  return filteredRecipes.value.length
})

function handleEdit(item) {
  recipesStore.fetchRecipe(item._id).then(() => recipesStore.openDialog('edit'))
}

function handleDelete(item) {
  recipesStore.openDialog('delete', item)
}

function handleRowClick(item) {
  recipesStore.fetchRecipe(item._id).then(() => recipesStore.openDialog('view'))
}

function openDocument(item) {
  if (item.documentUrl && (item.format === 'Document' || item.format === 'Link')) {
    window.open(item.documentUrl, '_blank', 'noopener,noreferrer')
  }
}

function toggleFilters() {
  showFilters.value = !showFilters.value
}
</script>

<style scoped>
.search-container {
  flex: 1;
  max-width: 420px;
}

.recipe-search {
  width: 100%;
}

.recipe-tag-chip {
  font-weight: 500;
}

.format-clickable {
  cursor: pointer;
}

.format-clickable:hover {
  opacity: 0.7;
}

.draft-badge {
  color: #c17a3a;
  font-weight: 500;
  margin-right: 6px;
}
</style>
