<template>
  <div class="client-table">
    <CrudList
      :headers="headers"
      :items="filteredClients"
      :items-length="tableItemsLength"
      :page="page"
      :items-per-page="itemsPerPage"
      :loading="loading"
      :sort-by="noColumnSort"
      :row-props="clientRowProps"
      add-button-text="Add client"
      @add="handleAddClient"
      @refresh="handleRefresh"
      @row-click="handleRowClick"
      @update:page="onTablePage"
      @update:items-per-page="onTableItemsPerPage"
    >
      <template #search>
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            class="search-box"
            placeholder="Search by client name or plan"
          />
        </div>
      </template>

      <!-- Our own select column header checkbox -->
      <template #[`header.select`]>
        <v-checkbox
          :model-value="bulkPageSelectionState === 'all'"
          :indeterminate="bulkPageSelectionState === 'partial'"
          hide-details
          density="compact"
          color="#d94fa3"
          :disabled="pageSelectableIds.length === 0"
          @update:model-value="toggleSelectAllOnPage"
          @click.stop
        />
      </template>

      <!-- Our own select column row checkbox -->
      <template #[`item.select`]="{ item }">
        <v-checkbox
          :model-value="selectedRows.includes(item._id || item.id)"
          :disabled="isOnHold(item)"
          hide-details
          density="compact"
          color="#d94fa3"
          @click.stop
          @update:model-value="(v) => toggleClientSelection(item._id || item.id, v)"
        />
      </template>

      <template #toolbar-actions>
        <button
          type="button"
          class="icon-btn client-bulk-trigger"
          :class="{ 'client-bulk-trigger--filled': bulkPageSelectionFilled }"
          :aria-label="bulkPageSelectAriaLabel"
          :aria-pressed="showBulkPanel"
          @click="showBulkPanel = !showBulkPanel"
        >
          <v-icon size="18">{{ bulkPageSelectIcon }}</v-icon>
        </button>
        <v-menu location="bottom" :close-on-content-click="true">
          <template #activator="{ props: sortMenuProps }">
            <button
              type="button"
              class="client-sort-pill"
              aria-label="Sort clients"
              v-bind="sortMenuProps"
            >
              <span class="client-sort-pill__label">{{ selectedSortLabel }}</span>
              <v-icon size="20" class="client-sort-pill__chevron" aria-hidden="true">
                mdi-chevron-down
              </v-icon>
            </button>
          </template>
          <v-list density="compact" class="client-sort-menu py-2" min-width="300">
            <v-list-item
              v-for="opt in CLIENT_SORT_OPTIONS"
              :key="opt.value"
              rounded="lg"
              class="client-sort-menu__item"
              :class="{ 'client-sort-menu__item--active': clientSort === opt.value }"
              @click="selectSort(opt.value)"
            >
              <v-list-item-title class="client-sort-menu__title text-body-2">
                {{ opt.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <button class="icon-btn" type="button" @click="toggleFilters">
          <img src="../../assets/images/setting.svg" alt="Filters" />
        </button>
      </template>

      <template #bulk-toolbar>
        <div v-if="showBulkPanel" class="client-bulk-toolbar">
          <v-btn
            v-for="action in BULK_ACTIONS"
            :key="action.key"
            variant="outlined"
            size="small"
            rounded="pill"
            class="client-bulk-toolbar__btn text-none"
            @click="onBulkAction(action.key)"
          >
            {{ action.label }}
          </v-btn>
        </div>
      </template>

      <template #filters>
        <ClientFilters
          v-if="showFilters"
          v-model:diet-plans="filterDietPlans"
          v-model:progress="filterProgress"
          :diet-plan-options="uniqueDietPlans"
        />
      </template>

      <!-- Name Column with Avatar -->
      <template #[`item.name`]="{ item }">
        <div class="client-name-cell">
          <div class="client-name">
            <v-avatar class="client-avatar" :class="{ 'client-avatar--on-hold': isOnHold(item) }">
              <v-img
                :src="avatarSrc(item)"
                :alt="item.profile?.fullName || item.fullName || 'Client'"
                cover
              />
            </v-avatar>
            <span>{{ item.profile?.fullName || item.fullName || 'N/A' }}</span>
          </div>
          <div v-if="isHighlighted(item)" class="needs-attention-badge">
            <v-icon size="14" color="#d94fa3">mdi-flag</v-icon>
            Client needs attention
          </div>
        </div>
      </template>

      <!-- Tags Column -->
      <template #[`item.tags`]="{ item }">
        <div class="tags-container">
          <span
            v-for="(diet, index) in getSpecialDiet(item)"
            :key="'diet-' + index"
            class="tag tag-purple"
          >
            {{ diet }}
          </span>
          <span
            v-for="(restriction, index) in getDietaryRestrictions(item)"
            :key="'restriction-' + index"
            class="tag tag-orange"
          >
            {{ restriction }}
          </span>
        </div>
      </template>

      <!-- Diet Plan Column -->
      <template #[`item.dietPlan`]="{ item }">
        {{ item.dietPlan || item.profile?.dietPlan || 'Balanced Lifestyle' }}
      </template>

      <!-- Progress Column -->
      <template #[`item.progress`]="{ item }">
        <span v-if="isOnHold(item)" class="status-badge onhold"> On Hold </span>
        <span
          v-else
          class="status-badge"
          :class="getStatusClass(item.onboardingStatus || item.status || item.progress)"
        >
          {{ formatStatus(item.onboardingStatus || item.status || item.progress) }}
        </span>
      </template>

      <!-- Action Column -->
      <template #[`item.action`]="{ item }">
        <v-menu
          v-model="menuOpenByItem[item._id]"
          :close-on-content-click="true"
          :disabled="isOnHold(item)"
          location="bottom end"
          origin="top end"
          transition="scale-transition"
        >
          <template #activator="{ props: menuProps }">
            <v-icon
              class="action-icon"
              size="small"
              v-bind="menuProps"
              :style="isOnHold(item) ? 'opacity: 0.3; pointer-events: none' : ''"
              @click.stop
            >
              mdi-dots-vertical
            </v-icon>
          </template>
          <v-list density="compact" min-width="180">
            <v-list-item title="View profile" @click.stop="viewProfile(item)" />
            <v-list-item
              title="Edit details"
              @click.stop="openIndividualAction('editProfile', item)"
            />
            <v-list-item
              title="Assign diet plan"
              @click.stop="openIndividualAction('assignPlan', item)"
            />
            <v-list-item
              title="Schedule appointment"
              @click.stop="openIndividualAction('scheduleAppointment', item)"
            />
            <v-list-item
              title="Send message"
              @click.stop="openIndividualAction('sendMessage', item)"
            />
            <v-list-item
              title="Highlight profile"
              @click.stop="openIndividualAction('highlight', item)"
            />
            <v-list-item
              title="Request payment"
              @click.stop="openIndividualAction('requestPayment', item)"
            />
            <v-list-item
              title="Put on hold"
              @click.stop="openIndividualAction('putOnHold', item)"
            />
            <v-list-item title="Add notes" @click.stop="openIndividualAction('addNotes', item)" />
            <v-list-item
              title="Export profile"
              @click.stop="openIndividualAction('exportProfile', item)"
            />
          </v-list>
        </v-menu>
      </template>
    </CrudList>

    <!-- Bulk action dialogs -->
    <BulkAssignPlanDialog
      v-model="dialogs.assignPlan"
      :clients="activeBulkClients"
      @done="onBulkDone"
    />
    <BulkSendMessageDialog
      v-model="dialogs.message"
      :clients="activeBulkClients"
      @done="onBulkDone"
    />
    <BulkRequestPaymentDialog
      v-model="dialogs.requestPayment"
      :clients="activeBulkClients"
      @done="onBulkDone"
    />
    <BulkAddTagDialog v-model="dialogs.addTag" :clients="activeBulkClients" @done="onBulkDone" />
    <BulkExportDialog v-model="dialogs.export" :clients="activeBulkClients" @done="onBulkDone" />
    <BulkHighlightDialog
      v-model="dialogs.highlight"
      :clients="activeBulkClients"
      @done="onBulkDone"
    />
    <BulkDeleteDialog v-model="dialogs.delete" :clients="activeBulkClients" @done="onBulkDone" />

    <!-- Individual (3-dot) action dialogs -->
    <UpdateClientProfileDialog
      v-if="individualDialogs.editProfile"
      v-model="individualDialogs.editProfile"
      :client-data="activeClient || {}"
      @save="
        onIndividualDone({
          action: 'edit-profile',
          clientId: activeClient?._id || activeClient?.id,
        })
      "
    />
    <ScheduleMeetingDialog
      v-model="individualDialogs.scheduleAppointment"
      :default-guests="activeClient ? [activeClient] : []"
      @saved="onIndividualDone({ action: 'schedule-appointment', clientId: activeClient?._id })"
    />
    <BulkSendMessageDialog
      v-model="individualDialogs.sendMessage"
      :clients="activeClient ? [activeClient] : []"
      @done="onIndividualDone"
    />
    <BulkRequestPaymentDialog
      v-model="individualDialogs.requestPayment"
      :clients="activeClient ? [activeClient] : []"
      @done="onIndividualDone"
    />
    <BulkHighlightDialog
      v-model="individualDialogs.highlight"
      :clients="activeClient ? [activeClient] : []"
      @done="onIndividualDone"
    />
    <BulkExportDialog
      v-model="individualDialogs.exportProfile"
      :clients="activeClient ? [activeClient] : []"
      @done="onIndividualDone"
    />
    <BulkAssignPlanDialog
      v-model="individualDialogs.assignPlan"
      :clients="activeClient ? [activeClient] : []"
      @done="onIndividualDone"
    />
    <IndividualPutOnHoldDialog
      v-model="individualDialogs.putOnHold"
      :client="activeClient"
      @done="onIndividualDone"
    />
    <IndividualAddNotesDialog
      v-model="individualDialogs.addNotes"
      :client="activeClient"
      @done="onIndividualDone"
    />
  </div>
</template>

<script setup>
import router from '@/router'
import CrudList from '@/components/common/CrudList.vue'
import ClientFilters from '@/components/client/ClientFilters.vue'
import BulkAssignPlanDialog from '@/components/client/BulkAssignPlanDialog.vue'
import BulkSendMessageDialog from '@/components/client/BulkSendMessageDialog.vue'
import BulkRequestPaymentDialog from '@/components/client/BulkRequestPaymentDialog.vue'
import BulkAddTagDialog from '@/components/client/BulkAddTagDialog.vue'
import BulkExportDialog from '@/components/client/BulkExportDialog.vue'
import BulkHighlightDialog from '@/components/client/BulkHighlightDialog.vue'
import BulkDeleteDialog from '@/components/client/BulkDeleteDialog.vue'
import IndividualPutOnHoldDialog from '@/components/client/IndividualPutOnHoldDialog.vue'
import IndividualAddNotesDialog from '@/components/client/IndividualAddNotesDialog.vue'
import UpdateClientProfileDialog from '@/components/client/clientprofile/updateClientProfileDialog.vue'
import ScheduleMeetingDialog from '@/components/common/ScheduleMeetingDialog.vue'
import { useClientStore } from '@/stores/client.store'
import { getClientAvatarSrc } from '@/utils/clientAvatar'
import { getDietaryRestrictions, getSpecialDiet } from './clientprofile/client.helper'
import { CLIENT_SORT_OPTIONS, DEFAULT_CLIENT_SORT } from '@/constants/clientListSort'
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  clients: {
    type: Array,
    required: true,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['row-click', 'refresh', 'edit', 'delete', 'bulk-action'])

// ── Bulk action dialog state ───────────────────────────────────────────────
const dialogs = reactive({
  assignPlan: false,
  message: false,
  requestPayment: false,
  addTag: false,
  export: false,
  highlight: false,
  delete: false,
})

// ── Individual (3-dot) action dialog state ────────────────────────────────
const activeClient = ref(null)
const activeBulkClients = ref([])
const individualDialogs = reactive({
  editProfile: false,
  scheduleAppointment: false,
  sendMessage: false,
  requestPayment: false,
  highlight: false,
  exportProfile: false,
  putOnHold: false,
  addNotes: false,
})

/** Local sets for optimistic highlight / on-hold UI (until backend returns) */
const localHighlightedIds = ref(new Set())
const localOnHoldIds = ref(new Set())

function openIndividualAction(action, item) {
  activeClient.value = item
  individualDialogs[action] = true
}

function onIndividualDone({ action, clientId }) {
  // Optimistically update local state
  if (action === 'put-on-hold') {
    localOnHoldIds.value = new Set([...localOnHoldIds.value, clientId])
  }
  if (action === 'highlight') {
    localHighlightedIds.value = new Set([...localHighlightedIds.value, clientId])
  }
  emit('refresh')
}

/** Row-props function: add CSS class + inline style for highlighted / on-hold rows */
function clientRowProps({ item }) {
  const raw = item?.raw ?? item
  const id = raw._id || raw.id
  const highlighted = raw.isHighlighted || localHighlightedIds.value.has(id)
  const onHold =
    raw.isOnHold ||
    raw.status === 'on_hold' ||
    raw.onboardingStatus === 'on_hold' ||
    localOnHoldIds.value.has(id)
  if (highlighted) return { class: 'client-row--highlighted' }
  if (onHold) return { class: 'client-row--on-hold' }
  return {}
}

const BULK_ACTIONS = [
  { key: 'assign-plan', label: 'Assign Plan' },
  { key: 'message', label: 'Message' },
  { key: 'request-payment', label: 'Request Payment' },
  { key: 'add-tag', label: 'Add Tag' },
  { key: 'export', label: 'Export' },
  { key: 'highlight', label: 'Highlight' },
  { key: 'delete', label: 'Delete' },
]

/** Row ids (`_id`) selected in the table */
const selectedRows = ref([])
const searchQuery = ref('')
const clientStore = useClientStore()
const page = ref(1)
const itemsPerPage = ref(10)
const menuOpenByItem = reactive({})
const showFilters = ref(false)
const filterDietPlans = ref([])
const filterProgress = ref([])
/** Server-side sort (GET /clients?sort=…) */
const clientSort = ref(DEFAULT_CLIENT_SORT)
/** Column sorting disabled; order comes from server via `sort` query. */
const noColumnSort = ref([])

const headers = [
  { title: '', key: 'select', sortable: false, width: 48 },
  { title: 'Name', key: 'name', sortable: false },
  { title: 'Tags', key: 'tags', sortable: false },
  { title: 'Diet Plan', key: 'dietPlan', sortable: false },
  { title: 'Progress', key: 'progress', sortable: false },
  { title: 'Action', key: 'action', sortable: false, align: 'center' },
]

const uniqueDietPlans = computed(() => {
  const seen = new Set()
  for (const c of props.clients) {
    const dp = c.dietPlan || c.profile?.dietPlan
    if (dp) seen.add(dp)
  }
  return [...seen].sort()
})

const filteredClients = computed(() => {
  let result = props.clients

  if (filterDietPlans.value.length > 0) {
    result = result.filter((client) => {
      const dp = client.dietPlan || client.profile?.dietPlan || 'Balanced Lifestyle'
      return filterDietPlans.value.includes(dp)
    })
  }

  if (filterProgress.value.length > 0) {
    result = result.filter((client) => {
      const status = formatStatus(client.onboardingStatus || client.status || client.progress)
      return filterProgress.value.includes(status)
    })
  }

  return result
})

const tableItemsLength = computed(() => {
  if (filterDietPlans.value.length > 0 || filterProgress.value.length > 0) {
    return filteredClients.value.length
  }
  return clientStore.clientsTotal
})

watch([page, itemsPerPage], () => {
  selectedRows.value = []
})

/** IDs for rows visible on the current page only — excludes on-hold rows. */
const pageSelectableIds = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredClients.value
    .slice(start, end)
    .filter((c) => !isOnHold(c))
    .map((c) => c._id || c.id)
    .filter(Boolean)
})

/** selectedRows is a plain array of _id strings — fully owned by us, no Vuetify sync */
const selectedRowIds = computed(() => selectedRows.value.filter(Boolean))

/** Full client objects for the current selection */
const selectedClients = computed(() => {
  const ids = new Set(selectedRowIds.value)
  if (ids.size === 0) return []
  return props.clients.filter((c) => ids.has(c._id || c.id))
})

function toggleClientSelection(id, checked) {
  if (!id) return
  if (checked) {
    if (!selectedRows.value.includes(id)) selectedRows.value = [...selectedRows.value, id]
  } else {
    selectedRows.value = selectedRows.value.filter((x) => x !== id)
  }
}

const showBulkPanel = ref(false)

/** Header checkbox + toolbar icon: none | partial | all on this page */
const bulkPageSelectionState = computed(() => {
  const ids = pageSelectableIds.value
  if (ids.length === 0) return 'none'
  const onPage = selectedRowIds.value.filter((id) => ids.includes(id))
  if (onPage.length === 0) return 'none'
  if (onPage.length === ids.length) return 'all'
  return 'partial'
})

const bulkPageSelectionFilled = computed(
  () => bulkPageSelectionState.value === 'partial' || bulkPageSelectionState.value === 'all',
)

const bulkPageSelectIcon = computed(() => {
  switch (bulkPageSelectionState.value) {
    case 'all':
      return 'mdi-checkbox-marked'
    case 'partial':
      return 'mdi-checkbox-intermediate'
    default:
      return 'mdi-checkbox-blank-outline'
  }
})

const bulkPageSelectAriaLabel = computed(() => {
  switch (bulkPageSelectionState.value) {
    case 'all':
      return 'Clear selection on this page'
    case 'partial':
      return 'Select all on this page'
    default:
      return 'Select all on this page'
  }
})

function toggleSelectAllOnPage() {
  const ids = pageSelectableIds.value
  if (ids.length === 0) return
  const selectedIdSet = new Set(selectedRows.value)
  const allSelected = ids.every((id) => selectedIdSet.has(id))
  if (allSelected) {
    selectedRows.value = selectedRows.value.filter((id) => !ids.includes(id))
  } else {
    const toAdd = ids.filter((id) => !selectedIdSet.has(id))
    selectedRows.value = [...selectedRows.value, ...toAdd]
  }
}

function onBulkAction(key) {
  const dialogMap = {
    'assign-plan': 'assignPlan',
    message: 'message',
    'request-payment': 'requestPayment',
    'add-tag': 'addTag',
    export: 'export',
    highlight: 'highlight',
    delete: 'delete',
  }
  const dialogKey = dialogMap[key]
  if (dialogKey) {
    // Snapshot exact selected client objects at click time
    activeBulkClients.value = [...selectedClients.value]
    dialogs[dialogKey] = true
  } else {
    emit('bulk-action', { action: key, ids: [...selectedRowIds.value] })
  }
}

function onBulkDone({ action, clientIds }) {
  // Clear selection after any bulk action
  selectedRows.value = []
  emit('bulk-action', { action, ids: clientIds })
  if (action === 'delete') {
    // Refresh list since items were removed
    emit('refresh')
  }
}

function handleRowClick(item) {
  if (isOnHold(item)) return
  emit('row-click', item)
}

function viewProfile(item) {
  const clientId = item._id || item.id
  router.push(`/client/${clientId}`)
}

function isHighlighted(item) {
  const id = item._id || item.id
  return item.isHighlighted || localHighlightedIds.value.has(id)
}

function isOnHold(item) {
  const id = item._id || item.id
  return (
    item.isOnHold ||
    item.status === 'on_hold' ||
    item.onboardingStatus === 'on_hold' ||
    localOnHoldIds.value.has(id)
  )
}

function debounce(func, delay) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), delay)
  }
}

function fetchPage(opts = {}) {
  const p = opts.page ?? page.value
  const perPage = opts.limit ?? itemsPerPage.value
  const skip = (p - 1) * perPage
  const params = { skip, limit: perPage, sort: clientSort.value }
  if (searchQuery.value.length >= 1) params.name = searchQuery.value
  return clientStore.fetchAllClients(params)
}

function selectSort(value) {
  if (clientSort.value === value) return
  clientSort.value = value
  page.value = 1
  fetchPage({ page: 1, limit: itemsPerPage.value })
}

watch(
  [page, itemsPerPage],
  () => {
    fetchPage()
  },
  { immediate: true },
)

const searchClients = debounce(async () => {
  page.value = 1
  await fetchPage({ page: 1, limit: itemsPerPage.value })
}, 400)

watch(searchQuery, (val) => {
  if (val.length < 1 && val.length !== 0) return
  searchClients(val)
})

function onTablePage(p) {
  page.value = p
}

function onTableItemsPerPage(n) {
  itemsPerPage.value = n
}

function toggleFilters() {
  showFilters.value = !showFilters.value
}

function handleAddClient() {
  router.push('/add-client')
}

function handleRefresh() {
  emit('refresh')
}

function avatarSrc(item) {
  return getClientAvatarSrc(item?.profile?.gender, item?.profile?.avatar)
}

function formatStatus(status) {
  if (!status) return 'On-track'

  const statusMap = {
    completed: 'On-track',
    in_progress: 'Moderate',
    pending: 'Inactive',
    active: 'On-track',
    inactive: 'Inactive',
    critical: 'Critical',
    moderate: 'Moderate',
    ontrack: 'On-track',
    'on-track': 'On-track',
  }

  const normalized = status.toLowerCase().replace('_', '-')
  return statusMap[normalized] || status
}

function getStatusClass(status) {
  if (!status) return 'ontrack'

  const normalized = status.toLowerCase().replace('_', '-')
  const classMap = {
    completed: 'ontrack',
    'in-progress': 'moderate',
    in_progress: 'moderate',
    pending: 'inactive',
    active: 'ontrack',
    inactive: 'inactive',
    critical: 'critical',
    moderate: 'moderate',
    ontrack: 'ontrack',
    'on-track': 'ontrack',
  }

  return classMap[normalized] || 'inactive'
}

const selectedSortLabel = computed(() => {
  const hit = CLIENT_SORT_OPTIONS.find((o) => o.value === clientSort.value)
  return hit?.title ?? 'Alphabetical'
})
</script>

<style scoped>
.client-sort-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  min-height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(156, 39, 176, 0.45);
  background: #fff;
  cursor: pointer;
  font: inherit;
  line-height: 1.2;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease;
}
.client-sort-pill:hover {
  background: rgba(156, 39, 176, 0.06);
}
.client-sort-pill__label {
  font-size: 14px;
  font-weight: 600;
  color: #9c27b0;
  letter-spacing: 0.01em;
}
.client-sort-pill__chevron {
  color: #9c27b0;
  flex-shrink: 0;
}

.client-sort-menu :deep(.client-sort-menu__item) {
  justify-content: center;
  min-height: 44px;
}
.client-sort-menu__title {
  width: 100%;
  text-align: center;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.55);
}
.client-sort-menu__item--active .client-sort-menu__title {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

.client-select-all-header {
  margin: -8px 0;
}

/* Toolbar select-all control (same page selection state as header checkbox) */
.client-bulk-trigger {
  border-radius: 50% !important;
  width: 40px !important;
  height: 40px !important;
}
.client-bulk-trigger--filled {
  border-color: #d94fa3 !important;
  box-shadow: 0 2px 0 0 #f8b8dc !important;
  background-color: #fff !important;
}
.client-bulk-trigger--filled :deep(.v-icon) {
  color: #d94fa3 !important;
}

.client-bulk-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px;
  padding-top: 4px;
}

.client-bulk-toolbar__select-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-bottom: 4px;
}

.client-bulk-toolbar__count {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.78);
}

.client-bulk-toolbar__select-all {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #d94fa3;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.client-bulk-toolbar__select-all:hover {
  color: #b83a8a;
}

.client-bulk-toolbar__btn {
  border-color: rgba(0, 0, 0, 0.12) !important;
  color: rgba(0, 0, 0, 0.78) !important;
  font-weight: 500;
  font-size: 13px;
  min-height: 36px;
  padding: 0 16px;
}

/* Table row selection checkboxes */
.client-table :deep(.v-selection-control .v-checkbox) {
  color: rgba(0, 0, 0, 0.38);
}

.client-table :deep(.v-checkbox .v-selection-control__input > .v-icon) {
  opacity: 1;
}

.client-table :deep(.v-selection-control--dirty .v-checkbox) {
  color: #d94fa3 !important;
}

.client-table :deep(.v-selection-control--dirty .v-selection-control__input) {
  color: #d94fa3 !important;
}

/* Row state classes injected via row-props — see non-scoped block below */

/* Grayscale avatar for on-hold clients */
.client-avatar--on-hold :deep(img) {
  filter: grayscale(100%);
}

/* Name cell wrapper to allow stacking attention badge */
.client-name-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* "Client needs attention" label */
.needs-attention-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #d94fa3;
  background: #fde8f5;
  border-radius: 999px;
  padding: 2px 8px;
  width: fit-content;
}

/* On Hold status badge */
.status-badge.onhold {
  background: #e0e0e0;
  color: #555;
  border: none;
}
</style>

<!-- Non-scoped: these target Vuetify-rendered <tr> elements which live outside Vue's scoped DOM -->
<style>
/* Highlighted row — pink text/elements, white background */
tr.client-row--highlighted td,
tr.client-row--highlighted td.v-data-table__td,
.v-table tr.client-row--highlighted td,
.v-data-table tr.client-row--highlighted td {
  color: #d94fa3 !important;
}
tr.client-row--highlighted .tag,
tr.client-row--highlighted .tag-purple,
tr.client-row--highlighted .tag-orange {
  background: #fce4f4 !important;
  color: #b5006e !important;
  border-color: #f0aad8 !important;
}
tr.client-row--highlighted .status-badge {
  background: #fce4f4 !important;
  color: #b5006e !important;
}

/* On-hold row — grayscale + disabled */
tr.client-row--on-hold {
  pointer-events: none;
}
tr.client-row--on-hold td,
tr.client-row--on-hold td.v-data-table__td,
.v-table tr.client-row--on-hold td {
  background: #fafafa !important;
  filter: grayscale(1);
  opacity: 0.65;
}
</style>
