<template>
  <v-container class="clients-page px-5 py-4">
    <div class="page-header mb-6">
      <div>
        <p class="greeting-text">
          Hello, <strong class="clinic-name-highlight">{{ clinicName }}.</strong> Welcome to your
          Dashboard!
        </p>
        <h1 class="page-title">Your Clinic Overview</h1>
      </div>
    </div>

    <v-row class="overview-top" dense>
      <v-col cols="12" lg="8">
        <StatCards :items="statCards" />
        <CrudList
          :headers="headers"
          :items="displayedRows"
          :items-length="tableItemsLength"
          :page="page"
          :items-per-page="itemsPerPage"
          :loading="branchStore.loading"
          :show-refresh="false"
          add-button-text=""
          @update:page="onTablePage"
          @update:items-per-page="onTableItemsPerPage"
        >
          <template #search>
            <div class="search-container">
              <input v-model="search" class="search-box" placeholder="Search by client name" />
            </div>
          </template>

          <template #toolbar-actions>
            <div class="d-flex ga-2 align-center">
              <!-- Sort: hover to open -->
              <v-menu
                v-model="sortMenu"
                location="bottom end"
                :close-on-content-click="true"
                open-on-hover
                offset="8"
              >
                <template #activator="{ props }">
                  <span
                    v-bind="props"
                    variant="text"
                    size="small"
                    :class="selectedSortKey === 'default' ? 'round-btn icon-btn' : 'sort-chip-btn'"
                  >
                    <template v-if="selectedSortKey === 'default'">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="21"
                        height="21"
                        viewBox="0 0 21 21"
                        fill="none"
                      >
                        <path
                          d="M15.6914 3.55957V15.1699L15.7939 15.0684L17.9688 12.8906L19.1221 14.0439L14.875 18.29L10.6289 14.0439L11.7822 12.8906L13.959 15.0684L14.0615 15.1699V15.0254L14.0605 3.55957H15.6914ZM10.3721 6.95508L9.21875 8.1084L7.04395 5.93164L6.94141 5.83008V17.4404H5.31055L5.31152 5.97461V5.83008L5.20898 5.93164L3.03223 8.1084L1.87891 6.95508L6.12598 2.70898L10.3721 6.95508Z"
                          fill="#AEAEAE"
                          stroke="white"
                          stroke-width="0.12"
                        />
                      </svg>
                    </template>
                    <template v-else>
                      <span class="sort-chip-label">{{ selectedSortLabel }}</span>
                      <v-icon size="14" class="ml-1">mdi-chevron-down</v-icon>
                    </template>
                  </span>
                </template>

                <v-list class="menu-list" density="compact" min-width="220">
                  <v-list-item
                    v-for="option in sortOptions"
                    :key="option.key"
                    :active="selectedSortKey === option.key"
                    @click="selectSort(option.key)"
                  >
                    <v-list-item-title>{{ option.label }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <!-- Filter -->
              <button
                class="round-btn icon-btn"
                :class="{ 'filter-active': showFilters }"
                @click="toggleFilters"
              >
                <img src="../../assets/images/setting.svg" alt="Filters" />
              </button>
            </div>
          </template>

          <template #add-action>
            <span class="hide-default-add" aria-hidden="true" />
          </template>

          <template #filters>
            <div v-if="showFilters" class="branch-filter-panel mb-3">
              <div class="d-flex align-center flex-wrap ga-3 mb-2">
                <MultiSelectDropDown
                  v-model="filterCities"
                  label="City"
                  :items="cityOptions"
                  hide-selection
                />
                <MultiSelectDropDown
                  v-model="filterAreas"
                  label="Area"
                  :items="areaOptions"
                  hide-selection
                />
                <v-spacer />
                <button
                  v-if="hasAnyFilter"
                  class="filter-clear-all"
                  type="button"
                  @click="clearAllFilters"
                >
                  Clear All
                </button>
              </div>
              <div v-if="hasAnyFilter" class="selected-filter-chips">
                <v-chip
                  v-for="(c, i) in filterCities"
                  :key="'city-' + i"
                  size="small"
                  class="mr-2 mb-2"
                  color="grey-lighten-3"
                  variant="flat"
                  closable
                  @click:close="removeCity(c)"
                >
                  {{ c }}
                </v-chip>
                <v-chip
                  v-for="(a, i) in filterAreas"
                  :key="'area-' + i"
                  size="small"
                  class="mr-2 mb-2"
                  color="grey-lighten-3"
                  variant="flat"
                  closable
                  @click:close="removeArea(a)"
                >
                  {{ a }}
                </v-chip>
              </div>
            </div>
          </template>

          <template #[`item.branch`]="{ item }">
            <strong class="branch-link" @click="goToBranch(item)">{{ item.branch }}</strong>
          </template>
          <template #[`item.city`]="{ item }">{{ item.city }}</template>
          <template #[`item.area`]="{ item }">{{ item.area }}</template>
          <template #[`item.employees`]="{ item }">{{ item.employees }}</template>
          <template #[`item.clients`]="{ item }">{{ item.clients }}</template>
          <!-- <template #[`item.actions`]="{ item }">
            <v-menu location="bottom end" offset="4">
              <template #activator="{ props }">
                <span v-bind="props" class="action-dots-btn">
                  <v-icon>mdi-dots-vertical</v-icon>
                </span>
              </template>
              <v-list class="action-menu-list" density="compact" min-width="170">
                <v-list-item @click="goToBranch(item)">
                  <v-list-item-title>View</v-list-item-title>
                </v-list-item>
                <v-list-item @click="openEditBranchForm(item)">
                  <v-list-item-title>Edit</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleToggleBranchStatus(item)">
                  <v-list-item-title>{{
                    item.status === 'inactive' ? 'Mark as Active' : 'Mark as Inactive'
                  }}</v-list-item-title>
                </v-list-item>
                <v-list-item @click="confirmDeleteBranch(item)">
                  <v-list-item-title class="text-error">Delete</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template> -->
        </CrudList>
      </v-col>

      <v-col cols="12" lg="4">
        <OverviewQuickAccessCard :actions="quickAccessActions" @select="handleQuickAccess" />
        <AIAssistantCard
          add-title="Add new recipe"
          show-attention-title="Show allergy-prone recipes"
          suggest-plan-title="Suggest recipes for less active clients"
        />
      </v-col>
    </v-row>

    <!-- Create Branch Dialog (Clinic Owner — no Choose Clinic) -->
    <CreateBranchDialog
      v-model="showCreateBranchDialog"
      :loading="createBranchLoading"
      @submit="submitBranch"
    />

    <!-- Add Employee Dialog (Clinic Owner — no Choose Clinic, has Branch) -->
    <AddEmployeeDialog
      v-model="showAddEmployeeDialog"
      :branch-options="branchSelectOptions"
      :loading="addEmployeeLoading"
      @submit="submitEmployee"
    />

    <!-- Add Client Dialog -->
    <CrudDialog
      v-model="showAddClientDialog"
      title="Add Client - Select Branch"
      max-width="540"
      :show-footer="false"
      :show-header-close="true"
    >
      <div class="dialog-subtitle">Select the branch for this client to be added to</div>
      <v-form class="dialog-form" @submit.prevent="submitAddClient">
        <div class="form-field-block">
          <label class="field-label">Branch</label>
          <v-select
            v-model="employeeForm.branch"
            placeholder="Select"
            :items="branchNameOptions"
            variant="outlined"
            hide-details
            class="soft-input"
          />
        </div>
        <v-btn
          variant="text"
          class="employee-submit-btn"
          rounded="pill"
          @click="showAddClientDialog = false"
        >
          Cancel
        </v-btn>
        <v-btn type="submit" class="employee-submit-btn" rounded="pill" variant="flat">
          Confirm
        </v-btn>
      </v-form>
    </CrudDialog>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import CrudList from '@/components/common/CrudList.vue'
import AIAssistantCard from '@/components/common/AIAssistantCard.vue'
import StatCards from '@/components/superadmin/StatCards.vue'
import OverviewQuickAccessCard from '@/components/common/OverviewQuickAccessCard.vue'
import CreateBranchDialog from '@/components/common/CreateBranchDialog.vue'
import AddEmployeeDialog from '@/components/common/AddEmployeeDialog.vue'
import MultiSelectDropDown from '@/components/common/multiSelectDropDown.vue'
import CrudDialog from '@/components/common/CrudDialog.vue'
import { createBranch } from '@/services/branch.service'
import { createStaff } from '@/services/staff.service'
import { useAuthStore } from '@/stores/auth.store'
import { useBranchStore } from '@/stores/branch.store'
import { useSnackbarStore } from '@/stores/snackbar.store'

const router = useRouter()
const authStore = useAuthStore()
const branchStore = useBranchStore()
const snackbar = useSnackbarStore()

const clinicName = ref('Huston Health')
const createBranchLoading = ref(false)
const addEmployeeLoading = ref(false)
const page = ref(1)
const itemsPerPage = ref(10)
const search = ref('')
const sortMenu = ref(false)
const showFilters = ref(false)
const selectedSortKey = ref('default')
const filterCities = ref([])
const filterAreas = ref([])
const showCreateBranchDialog = ref(false)
const showAddEmployeeDialog = ref(false)
const showAddClientDialog = ref(false)
// const editingBranch = ref(null)
// const showDeleteBranchDialog = ref(false)
const employeeForm = ref({})

const quickAccessActions = [
  {
    key: 'create-branch',
    label: 'Create Branch',
    icon: 'mdi-plus-circle',
    iconClass: 'icon-branch',
  },
  {
    key: 'add-employee',
    label: 'Add Employee',
    icon: 'mdi-plus-circle',
    iconClass: 'icon-employee',
  },
  {
    key: 'create-onboarding',
    label: 'Create Onboarding Form',
    icon: 'mdi-plus-circle',
    iconClass: 'icon-onboarding',
  },
  {
    key: 'add-client',
    label: 'Add Client',
    icon: 'mdi-plus-circle',
    iconClass: 'icon-client',
  },
]

const headers = [
  { title: 'Branch', key: 'branch', sortable: false },
  { title: 'City', key: 'city', sortable: false },
  { title: 'Area', key: 'area', sortable: false },
  { title: 'No. of Employees', key: 'employees', sortable: false },
  { title: 'No. of Clients', key: 'clients', sortable: false },
  // { title: '', key: 'actions', sortable: false, align: 'end' },
]

const sortOptions = [
  { key: 'default', label: 'Default' },
  { key: 'branch-asc', label: 'Branch: Alphabetical' },
  { key: 'city-asc', label: 'City: Alphabetical' },
  { key: 'area-asc', label: 'Area: Alphabetical' },
  { key: 'employees-asc', label: 'No. of Employees: Least to Most' },
  { key: 'employees-desc', label: 'No. of Employees: Most to Least' },
  { key: 'clients-asc', label: 'No. of Clients: Least to Most' },
  { key: 'clients-desc', label: 'No. of Clients: Most to Least' },
]

const allBranches = computed(() =>
  branchStore.branches.map((b) => ({
    id: b._id || b.id,
    branch: b.branchName || '—',
    city: b.city || '—',
    area: b.area || '—',
    employees: b.numberOfEmployees ?? 0,
    clients: b.numberOfClients ?? 0,
    status: b.status === 'active' ? 'active' : 'inactive',
  })),
)

const cityOptions = computed(() =>
  [...new Set(allBranches.value.map((r) => r.city).filter(Boolean))].sort(),
)

const areaOptions = computed(() => {
  const baseRows = filterCities.value.length
    ? allBranches.value.filter((r) => filterCities.value.includes(r.city))
    : allBranches.value
  return [...new Set(baseRows.map((r) => r.area).filter(Boolean))].sort()
})

const hasAnyFilter = computed(() => filterCities.value.length > 0 || filterAreas.value.length > 0)

const statCards = computed(() => [
  { key: 'branches', label: 'Branches', value: branchStore.branchesTotal, colorClass: 'greenBg' },
  {
    key: 'employees',
    label: 'Team Members',
    value: branchStore.totalEmployees,
    colorClass: 'peachBg',
  },
  { key: 'clients', label: 'Clients', value: branchStore.totalClients, colorClass: 'blueBg' },
])

const branchNameOptions = computed(() => [...new Set(allBranches.value.map((b) => b.branch))])

const branchSelectOptions = computed(() =>
  branchStore.branches.map((b) => ({
    title: b.branchName || '—',
    value: String(b._id || b.id),
  })),
)

const tableItemsLength = computed(() => {
  if (filterCities.value.length > 0 || filterAreas.value.length > 0) {
    return filteredBranches.value.length
  }
  return branchStore.branchesTotal
})

const selectedSortLabel = computed(() => {
  return sortOptions.find((o) => o.key === selectedSortKey.value)?.label || 'Default'
})

const filteredBranches = computed(() => {
  let rows = allBranches.value

  if (filterCities.value.length > 0) {
    rows = rows.filter((r) => filterCities.value.includes(r.city))
  }

  if (filterAreas.value.length > 0) {
    rows = rows.filter((r) => filterAreas.value.includes(r.area))
  }

  return rows
})

const displayedRows = computed(() => {
  const rows = [...filteredBranches.value]
  switch (selectedSortKey.value) {
    case 'branch-asc':
      return rows.sort((a, b) => a.branch.localeCompare(b.branch))
    case 'city-asc':
      return rows.sort((a, b) => a.city.localeCompare(b.city))
    case 'area-asc':
      return rows.sort((a, b) => a.area.localeCompare(b.area))
    case 'employees-asc':
      return rows.sort((a, b) => a.employees - b.employees)
    case 'employees-desc':
      return rows.sort((a, b) => b.employees - a.employees)
    case 'clients-asc':
      return rows.sort((a, b) => a.clients - b.clients)
    case 'clients-desc':
      return rows.sort((a, b) => b.clients - a.clients)
    default:
      return rows
  }
})

function fetchBranches(opts = {}) {
  const p = opts.page ?? page.value
  const perPage = opts.limit ?? itemsPerPage.value
  const skip = (p - 1) * perPage
  const clinicId = authStore.user?.clinicId
  const params = { skip, limit: perPage, ...(clinicId ? { clinicId } : {}) }
  if (search.value.trim()) params.search = search.value.trim()
  if (selectedSortKey.value !== 'default') params.sort = selectedSortKey.value
  return branchStore.fetchAllBranches(params)
}

function onTablePage(p) {
  page.value = p
}

function onTableItemsPerPage(n) {
  itemsPerPage.value = n
}

function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const debouncedSearch = debounce(() => {
  page.value = 1
  fetchBranches({ page: 1 })
}, 400)

watch(search, debouncedSearch)
watch([page, itemsPerPage], () => fetchBranches(), { immediate: true })

function selectSort(key) {
  selectedSortKey.value = key
  sortMenu.value = false
  page.value = 1
  fetchBranches({ page: 1 })
}

function clearAllFilters() {
  filterCities.value = []
  filterAreas.value = []
}

function removeCity(c) {
  filterCities.value = filterCities.value.filter((x) => x !== c)
}

function removeArea(a) {
  filterAreas.value = filterAreas.value.filter((x) => x !== a)
}

function toggleFilters() {
  showFilters.value = !showFilters.value
}

// function openEditBranchForm(item) {
//   editingBranch.value = item
//   // TODO: open edit branch dialog
// }

// function handleToggleBranchStatus(item) {
//   item.status = item.status === 'inactive' ? 'active' : 'inactive'
// }

// function confirmDeleteBranch(item) {
//   editingBranch.value = item
//   showDeleteBranchDialog.value = true
// }

function goToBranch(item) {
  router.push(`/clinic-owner/branches/${item.id}`)
}

function handleQuickAccess(action) {
  if (action.key === 'create-branch') {
    showCreateBranchDialog.value = true
  } else if (action.key === 'add-employee') {
    showAddEmployeeDialog.value = true
  } else if (action.key === 'add-client') {
    showAddClientDialog.value = true
  } else if (action.key === 'create-onboarding') {
    //router.push('/clinic-owner/onboarding')
  }
}

// eslint-disable-next-line complexity
async function submitBranch(data) {
  const clinicId = authStore.user?.clinicId
  if (!clinicId || !data?.branchName) return

  createBranchLoading.value = true
  try {
    const payload = {
      clinicId,
      branchName: data.branchName,
      address: data.address || undefined,
      area: data.area || undefined,
      postalCode: data.postalCode || undefined,
      city: data.city || undefined,
      phone: data.phone ? `+91${data.phone}` : undefined,
      email: data.email || undefined,
    }

    const response = await createBranch(payload)
    const created = response?.data

    if (created) {
      branchStore.addBranchToList(created)
    }

    showCreateBranchDialog.value = false
    snackbar.showSuccess('Branch created successfully')
  } catch (err) {
    snackbar.showError(err?.response?.data?.message || err.message || 'Failed to create branch')
  } finally {
    createBranchLoading.value = false
  }
}

async function submitEmployee(data) {
  const clinicId = authStore.user?.clinicId
  if (!clinicId) return

  addEmployeeLoading.value = true
  try {
    const payload = {
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      roleName: data.role,
      clinicId,
      branchId: data.branch || undefined,
    }

    await createStaff(payload)
    snackbar.showSuccess('Employee added successfully')
    fetchBranches()
  } catch (err) {
    snackbar.showError(err?.response?.data?.message || err.message || 'Failed to add employee')
  } finally {
    addEmployeeLoading.value = false
  }
}

function submitAddClient() {
  showAddClientDialog.value = false
  router.push('/add-client')
}

onMounted(() => {})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.greeting-text {
  font-size: 14px;
  color: #5a6170;
  margin: 0 0 4px;
}

.clinic-name-highlight {
  color: #e06a2c;
  font-weight: 700;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2430;
  margin: 0;
  padding: 0 15px;
}

.overview-top {
  margin-bottom: 2px;
}

.round-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #d8dee8;
  border-radius: 50%;
  min-width: 34px;
}

.icon-btn {
  color: #8f98a8;
  box-shadow: none;
}

.sort-chip-btn {
  border: 1px solid #e7b6d7;
  border-radius: 18px;
  min-height: 34px;
  height: 34px;
  min-width: 34px;
  padding: 0 10px;
  color: #be5da1;
  text-transform: none;
}

.sort-chip-label {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1;
}

.hide-default-add {
  display: none;
}

.branch-filter-panel {
  padding: 6px 0 2px;
}

.filter-clear-all {
  border: none;
  background: transparent;
  color: #ff4b4b;
  font-size: 13px;
  cursor: pointer;
}

.selected-filter-chips {
  margin-top: 4px;
}

.filter-active img {
  filter: brightness(0) saturate(100%) invert(39%) sepia(35%) saturate(900%) hue-rotate(270deg);
}

.view-btn {
  background: #f8e6f3;
  color: #af5f9a;
  min-width: 64px;
}

.action-dots-btn {
  color: #8a919d;
}

.action-menu-list {
  border: 1px solid #e7e9ef;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(23, 29, 42, 0.1);
}

.menu-list {
  border: 1px solid #e7e9ef;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(23, 29, 42, 0.1);
}

:deep(.client-table thead th) {
  background: #ebecef;
  color: #272727;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
}

.branch-link {
  cursor: pointer;
  color: #2e3442;
}

.branch-link:hover {
  text-decoration: underline;
  color: #b13c92;
}

.dialog-subtitle {
  color: #8a919d;
  font-size: 13px;
  margin-bottom: 16px;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-field-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #555c68;
}

.soft-input :deep(.v-field) {
  border-radius: 18px;
  background: #f8f8fb;
  box-shadow: none;
}

.soft-input :deep(.v-field__outline) {
  display: none;
}

.phone-code {
  min-width: 44px;
  height: 44px;
  border-radius: 18px;
  background: #f8f8fb;
  color: #555c68;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
}

.phone-input {
  flex: 1;
}

.dialog-submit-btn {
  margin-top: 6px;
  min-height: 44px;
  border-radius: 999px;
  background: #f7dff1;
  color: #b13c92;
  text-transform: none;
  font-weight: 600;
  box-shadow: none;
}
</style>
