<template>
  <div class="template-filters mb-3">
    <div class="d-flex align-center flex-wrap gap-3 mb-2">
      <MultiSelectDropDown
        v-model="templateNamesModel"
        label="Template Name"
        :items="templateNameOptions"
        hide-selection
      />
      <MultiSelectDropDown
        v-model="durationsModel"
        label="Duration"
        :items="durationOptions"
        hide-selection
      />
      <v-spacer />
      <button v-if="hasAnyFilter" class="clear-all" type="button" @click="clearAll">
        Clear All
      </button>
    </div>

    <div v-if="hasAnyFilter" class="selected-chips">
      <v-chip
        v-for="(n, i) in templateNamesModel"
        :key="'n-' + i"
        size="small"
        class="mr-2 mb-2"
        color="grey-lighten-3"
        variant="flat"
        closable
        @click:close="removeTemplateName(n)"
      >
        {{ n }}
      </v-chip>
      <v-chip
        v-for="(d, i) in durationsModel"
        :key="'d-' + i"
        size="small"
        class="mr-2 mb-2"
        color="grey-lighten-3"
        variant="flat"
        closable
        @click:close="removeDuration(d)"
      >
        {{ d }}
      </v-chip>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MultiSelectDropDown from '@/components/common/multiSelectDropDown.vue'

const props = defineProps({
  durations: {
    type: Array,
    default: () => [],
  },
  durationOptions: {
    type: Array,
    default: () => [],
  },
  templateNames: {
    type: Array,
    default: () => [],
  },
  templateNameOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:durations', 'update:templateNames'])

const durationsModel = computed({
  get: () => props.durations,
  set: (v) => emit('update:durations', v),
})

const templateNamesModel = computed({
  get: () => props.templateNames,
  set: (v) => emit('update:templateNames', v),
})

const hasAnyFilter = computed(
  () => (durationsModel.value?.length || 0) > 0 || (templateNamesModel.value?.length || 0) > 0,
)

function clearAll() {
  emit('update:durations', [])
  emit('update:templateNames', [])
}

function removeDuration(d) {
  emit(
    'update:durations',
    (props.durations || []).filter((x) => x !== d),
  )
}

function removeTemplateName(n) {
  emit(
    'update:templateNames',
    (props.templateNames || []).filter((x) => x !== n),
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
