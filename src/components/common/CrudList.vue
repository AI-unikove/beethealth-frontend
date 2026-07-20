<template>
  <v-container>
    <div class="client-wrapper">
      <!-- Actions Bar -->
      <div class="search-actions-bar">
        <slot name="search"></slot>
        <v-spacer />
        <div class="actions-container">
          <div class="header-icons">
            <slot name="toolbar-actions">
              <button v-if="showRefresh" class="icon-btn" @click="$emit('refresh')">
                <img src="@/assets/images/setting.svg" alt="Settings" />
              </button>
            </slot>
          </div>
          <slot name="add-action">
            <button class="button" @click="$emit('add')">
              <b>{{ addButtonText }}</b>
            </button>
          </slot>
        </div>
      </div>

      <!-- Bulk actions row (e.g. client multi-select toolbar) -->
      <slot name="bulk-toolbar"></slot>

      <!-- Filters slot -->
      <slot name="filters"></slot>

      <!-- Data Table (Vuetify) - server-side pagination; column content via slots -->
      <v-data-table-server
        :headers="headers"
        :items="items"
        :items-length="itemsLength"
        :loading="loading"
        :item-value="itemValue"
        v-model:page="pageModel"
        v-model:items-per-page="itemsPerPageModel"
        v-model:sort-by="sortByModel"
        v-model:selected="selectedModel"
        :show-select="selectable"
        :items-per-page-options="itemsPerPageOptions"
        :row-props="rowProps"
        class="client-table elevation-0"
        hover
        @update:options="handleOptionsUpdate"
        @click:row="handleRowClick"
      >
        <!-- Select-all header slot from parent (e.g. ClientList); placeholder if unset -->
        <template v-if="selectable" #[`header.data-table-select`]="slotData">
          <slot name="header.data-table-select" v-bind="slotData || {}">
            <span class="crud-select-header-placeholder" aria-hidden="true" />
          </slot>
        </template>
        <!-- Forward all slots; use formatter when no slot and header has formatter -->
        <template v-for="(name, index) in tableSlots" :key="index" #[name]="slotData">
          <slot v-if="hasSlot(name)" :name="name" v-bind="slotData || {}" />
          <span v-else>{{ getFormattedCellValue(name, slotData) }}</span>
        </template>
      </v-data-table-server>
    </div>
  </v-container>
</template>

<script setup>
import { computed, ref, watch, useSlots, onMounted } from 'vue'
import { crudListFormatters } from './crudListFormatters'

const slots = useSlots()
const tableSlots = computed(() => {
  const fromSlots = Object.keys(slots).filter(
    (name) =>
      name !== 'toolbar-actions' &&
      name !== 'add-action' &&
      name !== 'search' &&
      name !== 'filters' &&
      name !== 'bulk-toolbar',
  )
  const fromHeaders = (props.headers || []).map((h) => `item.${h.key}`)
  const merged = [...new Set([...fromSlots, ...fromHeaders])]
  /* Rendered explicitly above so v-for does not duplicate */
  return merged.filter((n) => !(props.selectable && n === 'header.data-table-select'))
})

function hasSlot(name) {
  return !!slots[name]
}

function keyFromSlot(slotName) {
  return slotName?.replace?.('item.', '') ?? ''
}

function getFormattedCellValue(slotName, slotData) {
  const key = keyFromSlot(slotName)
  const header = (props.headers || []).find((h) => h.key === key)
  const formatter = header?.formatter
  const value = slotData?.item?.[key]
  if (formatter) {
    const fn = typeof formatter === 'function' ? formatter : crudListFormatters[formatter]
    return fn ? fn(value) : value
  }
  return value ?? '–'
}

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
  itemsLength: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  itemValue: {
    type: String,
    default: '_id',
  },
  addButtonText: {
    type: String,
    default: 'Add',
  },
  itemsPerPageOptions: {
    type: Array,
    default: () => [5, 10, 25, 50, 100],
  },
  showRefresh: {
    type: Boolean,
    default: true,
  },
  /** When provided, page is controlled (v-model:page) */
  page: {
    type: Number,
    default: undefined,
  },
  /** When provided, itemsPerPage is controlled (v-model:itemsPerPage) */
  itemsPerPage: {
    type: Number,
    default: undefined,
  },
  /** Function to load list data. Called on mount and when refresh is clicked. */
  loadData: {
    type: Function,
    default: undefined,
  },
  /** External sort-by state (v-model:sortBy) */
  sortBy: {
    type: Array,
    default: undefined,
  },
  /** Show checkbox column + bind v-model:selected */
  selectable: {
    type: Boolean,
    default: false,
  },
  /** Selected row ids (must match item-value); v-model:selected from parent */
  selected: {
    type: Array,
    default: () => [],
  },
  /**
   * Optional function (item) => ({ class: '...' }) passed as :row-props to the table.
   * Allows callers to apply per-row CSS classes (e.g. highlighted, on-hold).
   */
  rowProps: {
    type: Function,
    default: undefined,
  },
})

const emit = defineEmits([
  'row-click',
  'add',
  'refresh',
  'update:page',
  'update:itemsPerPage',
  'update:sortBy',
  'update:selected',
])

const pageInternal = ref(1)
const itemsPerPageInternal = ref(10)
const sortByInternal = ref([])

const pageModel = computed({
  get: () => (props.page !== undefined ? props.page : pageInternal.value),
  set: (v) => {
    if (props.page === undefined) pageInternal.value = v
    emit('update:page', v)
  },
})

const itemsPerPageModel = computed({
  get: () => (props.itemsPerPage !== undefined ? props.itemsPerPage : itemsPerPageInternal.value),
  set: (v) => {
    if (props.itemsPerPage === undefined) itemsPerPageInternal.value = v
    emit('update:itemsPerPage', v)
  },
})

const sortByModel = computed({
  get: () => (props.sortBy !== undefined ? props.sortBy : sortByInternal.value),
  set: (v) => {
    if (props.sortBy === undefined) sortByInternal.value = v
    emit('update:sortBy', v)
  },
})

const selectedModel = computed({
  get: () => props.selected,
  set: (v) => emit('update:selected', v),
})

function loadCrudList() {
  if (typeof props.loadData === 'function') {
    props.loadData()
  }
}

function handleRowClick(event, { item }) {
  emit('row-click', item)
}

onMounted(() => {
  loadCrudList()
})

function handleOptionsUpdate(opts) {
  if (opts?.page != null) pageModel.value = opts.page
  if (opts?.itemsPerPage != null) itemsPerPageModel.value = opts.itemsPerPage
  if (opts?.sortBy != null) sortByModel.value = opts.sortBy
}

watch(
  [pageModel, itemsPerPageModel],
  () => {
    emit('update:page', pageModel.value)
    emit('update:itemsPerPage', itemsPerPageModel.value)
  },
  { deep: true },
)
</script>
