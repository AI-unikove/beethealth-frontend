<!-- src/components/recipe/RecipeFilters.vue -->
<template>
  <div class="recipe-filters mb-3">
    <!-- Filters row -->
    <div class="d-flex align-center flex-wrap gap-3 mb-2">
      <MultiSelectDropDown
        v-model="cuisinesModel"
        label="Cuisine"
        :items="cuisineOptions"
        hide-selection
      />
      <MultiSelectDropDown v-model="tagsModel" label="Tags" :items="tagOptions" hide-selection />

      <v-spacer />
      <button v-if="hasAnyFilter" class="clear-all" type="button" @click="clearAll">
        Clear All
      </button>
    </div>

    <!-- Selected chips -->
    <div class="selected-chips" v-if="hasAnyFilter">
      <v-chip
        v-for="(c, i) in cuisinesModel"
        :key="'c-' + i"
        size="small"
        class="mr-2 mb-2"
        color="grey-lighten-3"
        variant="flat"
        @click:close="removeCuisine(c)"
        closable
      >
        {{ c }}
      </v-chip>

      <v-chip
        v-for="(t, i) in tagsModel"
        :key="'t-' + i"
        size="small"
        class="mr-2 mb-2"
        color="grey-lighten-3"
        variant="flat"
        @click:close="removeTag(t)"
        closable
      >
        {{ t }}
      </v-chip>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MultiSelectDropDown from '@/components/common/multiSelectDropDown.vue'
import { useEnumsStore } from '@/stores/enums.store'

const props = defineProps({
  cuisines: {
    type: Array,
    default: () => [],
  },
  tags: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:cuisines', 'update:tags'])

const enumsStore = useEnumsStore()
const cuisineOptions = computed(() => enumsStore.cuisines ?? [])
const tagOptions = computed(() => enumsStore.tags ?? [])

// v-model proxies
const cuisinesModel = computed({
  get: () => props.cuisines,
  set: (v) => emit('update:cuisines', v),
})

const tagsModel = computed({
  get: () => props.tags,
  set: (v) => emit('update:tags', v),
})

const hasAnyFilter = computed(
  () => (cuisinesModel.value?.length || 0) > 0 || (tagsModel.value?.length || 0) > 0,
)

function clearAll() {
  emit('update:cuisines', [])
  emit('update:tags', [])
}

function removeCuisine(c) {
  emit(
    'update:cuisines',
    (props.cuisines || []).filter((x) => x !== c),
  )
}

function removeTag(t) {
  emit(
    'update:tags',
    (props.tags || []).filter((x) => x !== t),
  )
}
</script>

<style scoped>
.clear-all {
  border: none;
  background: transparent;
  color: #ff4b4b;
  font-size: 13px;
  cursor: pointer;
}

.selected-chips {
  margin-top: 4px;
}
</style>
