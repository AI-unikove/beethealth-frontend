<template>
  <div class="client-filters mb-3">
    <div class="d-flex align-center flex-wrap gap-3 mb-2">
      <MultiSelectDropDown
        v-model="dietPlansModel"
        label="Diet Plan"
        :items="dietPlanOptions"
        hide-selection
      />
      <MultiSelectDropDown
        v-model="progressModel"
        label="Progress"
        :items="progressOptions"
        hide-selection
      />
      <v-spacer />
      <button v-if="hasAnyFilter" class="clear-all" type="button" @click="clearAll">
        Clear All
      </button>
    </div>

    <div v-if="hasAnyFilter" class="selected-chips">
      <v-chip
        v-for="(d, i) in dietPlansModel"
        :key="'dp-' + i"
        size="small"
        class="mr-2 mb-2"
        color="grey-lighten-3"
        variant="flat"
        closable
        @click:close="removeDietPlan(d)"
      >
        {{ d }}
      </v-chip>
      <v-chip
        v-for="(p, i) in progressModel"
        :key="'pr-' + i"
        size="small"
        class="mr-2 mb-2"
        color="grey-lighten-3"
        variant="flat"
        closable
        @click:close="removeProgress(p)"
      >
        {{ p }}
      </v-chip>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MultiSelectDropDown from '@/components/common/multiSelectDropDown.vue'

const props = defineProps({
  dietPlans: {
    type: Array,
    default: () => [],
  },
  progress: {
    type: Array,
    default: () => [],
  },
  dietPlanOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:dietPlans', 'update:progress'])

const progressOptions = ['On-track', 'Moderate', 'Inactive', 'Critical']

const dietPlansModel = computed({
  get: () => props.dietPlans,
  set: (v) => emit('update:dietPlans', v),
})

const progressModel = computed({
  get: () => props.progress,
  set: (v) => emit('update:progress', v),
})

const hasAnyFilter = computed(
  () => (dietPlansModel.value?.length || 0) > 0 || (progressModel.value?.length || 0) > 0,
)

function clearAll() {
  emit('update:dietPlans', [])
  emit('update:progress', [])
}

function removeDietPlan(d) {
  emit(
    'update:dietPlans',
    (props.dietPlans || []).filter((x) => x !== d),
  )
}

function removeProgress(p) {
  emit(
    'update:progress',
    (props.progress || []).filter((x) => x !== p),
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
