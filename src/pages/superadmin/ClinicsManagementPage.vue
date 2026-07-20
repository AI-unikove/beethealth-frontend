<template>
  <v-container class="clients-page px-5 py-4">
    <PageHeader :title="clinicHeaderTitle" subtitle="Clinics  ›  Clinic Management">
      <template #actions>
        <OverviewSettingsMenu
          button-label="Clinic Settings"
          :items="clinicSettingItems"
          @select="handleClinicSetting"
        />
      </template>
    </PageHeader>

    <v-row class="overview-top" dense>
      <v-col cols="12" lg="8">
        <StatCards :items="statCards" />
        <CrudList
          :headers="headers"
          :items="displayedRows"
          :items-length="totalBranches"
          :page="page"
          :items-per-page="itemsPerPage"
          @update:page="onTablePage"
          @update:items-per-page="onTableItemsPerPage"
          :loading="loading"
          add-button-text="Create Branch"
          :show-refresh="false"
          @add="openAddBranchDialog"
        >
          <template #search>
            <div class="search-container">
              <input
                v-model="search"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                hide-details
                class="search-box"
                placeholder="Search by client name"
              />
            </div>
          </template>

          <template #toolbar-actions>
            <div class="d-flex ga-2 align-center">
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
            <strong class="branch-link" @click="openEditBranch(item)">{{ item.branch }}</strong>
          </template>
          <template #[`item.location`]="{ item }">{{ item.location }}</template>
          <template #[`item.employees`]="{ item }">{{ item.employees }}</template>
          <template #[`item.clients`]="{ item }">{{ item.clients }}</template>
          <template #[`item.actions`]="{ item }">
            <v-menu location="bottom end" offset="4">
              <template #activator="{ props }">
                <span v-bind="props" icon variant="text" size="small" class="action-dots-btn">
                  <v-icon>mdi-dots-vertical</v-icon>
                </span>
              </template>
              <v-list class="action-menu-list" density="compact" min-width="170">
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
          </template>
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
    <!-- Billing and Finance Dialog -->
    <CrudDialog
      v-model="showBillingDialog"
      title="Bill and Financial Settings"
      max-width="980"
      :show-footer="false"
      :show-header-close="true"
    >
      <div class="billing-layout">
        <v-card elevation="0" class="billing-profile-card">
          <div class="billing-avatar-wrap">
            <div class="billing-avatar">🤩</div>
            <h3 class="billing-name">{{ currentClinic?.name || 'Clinic Name' }}</h3>
          </div>

          <div class="billing-profile-grid">
            <div class="billing-field">
              <span>GST Number</span><strong>{{ currentClinic?.gstNumber || '—' }}</strong>
            </div>
            <div class="billing-field">
              <span>Bank Name</span><strong>{{ currentClinic?.bankName || '—' }}</strong>
            </div>
            <div class="billing-field">
              <span>Account Number</span><strong>{{ currentClinic?.accountNumber || '—' }}</strong>
            </div>
            <div class="billing-field">
              <span>Pan Number</span><strong>{{ currentClinic?.panNumber || '—' }}</strong>
            </div>
          </div>

          <v-btn class="billing-edit-btn" rounded="pill" variant="flat">Edit Details</v-btn>
        </v-card>

        <div class="billing-right">
          <div class="billing-metrics">
            <div class="metric-box">
              <span>Billing Frequency</span>
              <strong class="metric-chip chip-green">Monthly</strong>
            </div>
            <div class="metric-box">
              <span>Next Invoice Date</span>
              <strong class="metric-chip chip-peach">12 April, 2026</strong>
            </div>
            <div class="metric-box">
              <span>Payment Method</span>
              <strong class="metric-chip chip-blue">Bank Transfer</strong>
            </div>
          </div>

          <v-table class="billing-table" density="compact">
            <thead>
              <tr>
                <th>Date Added</th>
                <th>Invoice No.</th>
                <th>Cycle</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in invoices" :key="invoice.invoiceNo + invoice.dateAdded">
                <td>{{ invoice.dateAdded }}</td>
                <td>{{ invoice.invoiceNo }}</td>
                <td>{{ invoice.cycle }}</td>
                <td>{{ invoice.amount }}</td>
                <td>
                  <v-menu location="bottom end" offset="4">
                    <template #activator="{ props }">
                      <v-chip
                        v-bind="props"
                        size="small"
                        variant="flat"
                        :class="['status-chip', `status-${invoice.status}`, 'status-dropdown']"
                      >
                        {{ invoice.statusLabel }}
                        <v-icon size="14" class="ml-1">mdi-chevron-down</v-icon>
                      </v-chip>
                    </template>
                    <v-list class="menu-list" density="compact" min-width="140">
                      <v-list-item
                        v-for="opt in invoiceStatusOptions"
                        :key="opt.value"
                        :active="invoice.status === opt.value"
                        @click="setInvoiceStatus(invoice, opt)"
                      >
                        <v-list-item-title>{{ opt.label }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </div>
    </CrudDialog>

    <!-- Add Employee Dialog (Clinic Management — no Choose Clinic, has Branch) -->
    <AddEmployeeDialog
      v-model="showAddEmployeeDialog"
      :branch-options="branchOptions"
      @submit="submitEmployee"
    />

    <!-- Create Branch Dialog (Clinic Management — no Choose Clinic) -->
    <CreateBranchDialog v-model="showCreateBranchDialog" @submit="submitBranch" />

    <!-- Edit Branch Dialog -->
    <CreateBranchDialog
      v-model="showEditBranchDialog"
      title="Edit Branch"
      submit-label="Save Changes"
      subtitle="Update branch details to keep this location information current."
      :initial-data="editingBranch?._raw"
      :loading="submitting"
      @submit="submitBranch"
    />

    <!-- Edit Clinic Dialog -->
    <CrudDialog
      v-model="showEditClinicDialog"
      title="Edit Clinic"
      max-width="640"
      :show-footer="false"
      :show-header-close="true"
    >
      <ClinicForm
        :initial-data="selectedClinic || {}"
        submit-label="Save Changes"
        :loading="submitting"
        @submit="submitEditClinic"
        @cancel="showEditClinicDialog = false"
      />
    </CrudDialog>

    <!-- Add Branch Dialog -->
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
            :items="branchOptions"
            variant="outlined"
            hide-details
            class="soft-input"
          />
        </div>
        <v-btn type="submit" class="employee-submit-btn" rounded="pill" variant="flat">
          Cancel
        </v-btn>
        <v-btn type="submit" class="employee-submit-btn" rounded="pill" variant="flat">
          Confirm
        </v-btn>
      </v-form>
    </CrudDialog>

    <!-- Delete Branch Confirmation Dialog -->
    <v-dialog v-model="showDeleteBranchDialog" max-width="440">
      <v-card class="delete-dialog-card">
        <div class="delete-dialog-header">
          <h3>Delete Branch</h3>
          <v-btn
            icon
            variant="text"
            size="small"
            :disabled="deletingBranch"
            @click="showDeleteBranchDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <p class="delete-dialog-body">
          This will <strong class="text-error">permanently remove</strong>
          <strong>
            {{ editingBranch?.branch || editingBranch?.branchName || 'this branch' }}</strong
          >
          from the list. Are you sure?
        </p>
        <div class="delete-dialog-actions">
          <v-btn
            variant="text"
            class="delete-confirm-btn"
            :loading="deletingBranch"
            @click="confirmDeleteBranchAction"
          >
            Delete
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Delete Clinic Confirmation Dialog -->
    <v-dialog v-model="showDeleteClinicDialog" max-width="440">
      <v-card class="delete-dialog-card">
        <div class="delete-dialog-header">
          <h3>Delete Clinic</h3>
          <v-btn
            icon
            variant="text"
            size="small"
            :disabled="deleting"
            @click="showDeleteClinicDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <p class="delete-dialog-body">
          This will <strong class="text-error">permanently remove</strong>
          <strong> {{ selectedClinic?.name || 'this clinic' }}</strong> from your list of clinics.
          Are you sure?
        </p>
        <div class="delete-dialog-actions">
          <v-btn
            variant="text"
            class="delete-confirm-btn"
            :loading="deleting"
            @click="confirmDeleteClinic"
          >
            Delete
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSnackbarStore } from '@/stores/snackbar.store'
import PageHeader from '@/components/common/PageHeader.vue'
import CrudList from '@/components/common/CrudList.vue'
import CrudDialog from '@/components/common/CrudDialog.vue'
import AIAssistantCard from '@/components/common/AIAssistantCard.vue'
import StatCards from '@/components/superadmin/StatCards.vue'
import OverviewQuickAccessCard from '@/components/common/OverviewQuickAccessCard.vue'
import OverviewSettingsMenu from '@/components/common/OverviewSettingsMenu.vue'
import ClinicForm from '@/components/superadmin/ClinicForm.vue'
import MultiSelectDropDown from '@/components/common/multiSelectDropDown.vue'
import CreateBranchDialog from '@/components/common/CreateBranchDialog.vue'
import AddEmployeeDialog from '@/components/common/AddEmployeeDialog.vue'
import {
  getClinics,
  updateClinic,
  deleteClinic,
  toggleClinicStatus,
} from '@/services/clinic.service'
import {
  getBranches,
  createBranch,
  updateBranch,
  toggleBranchStatus as toggleBranchStatusApi,
  deleteBranch,
} from '@/services/branch.service'
import { createStaff } from '@/services/staff.service'

const router = useRouter()
const route = useRoute()
const snackbar = useSnackbarStore()

const loading = ref(false)
const submitting = ref(false)
const allRows = ref([])
const rawClinics = ref([])
const search = ref('')
const page = ref(1)
const itemsPerPage = ref(10)
const totalBranches = ref(0)
const sortMenu = ref(false)
const showFilters = ref(false)
const selectedSortKey = ref('default')
const filterCities = ref([])
const filterAreas = ref([])
const showBillingDialog = ref(false)
const showAddEmployeeDialog = ref(false)
const showCreateBranchDialog = ref(false)
const showAddClientDialog = ref(false)
const showEditClinicDialog = ref(false)
const showDeleteClinicDialog = ref(false)
const selectedClinic = ref(null)
const deleting = ref(false)
const editingBranch = ref(null)
const showEditBranchDialog = ref(false)
const showDeleteBranchDialog = ref(false)
const deletingBranch = ref(false)

const employeeForm = ref({})

const headers = [
  { title: 'Branch', key: 'branch', sortable: false },
  { title: 'City', key: 'city', sortable: false },
  { title: 'Area', key: 'area', sortable: false },
  { title: 'No. of Employees', key: 'employees', sortable: false },
  { title: 'No. of Clients', key: 'clients', sortable: false },
  { title: '', key: 'actions', sortable: false, align: 'end' },
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

const clinicSettingItems = computed(() => {
  const currentStatus = currentClinic.value?.status
  return [
    { title: 'Billing and Finance', value: 'billing' },
    { title: 'Edit Clinic', value: 'edit' },
    {
      title: currentStatus === 'inactive' ? 'Mark as Active' : 'Mark as Inactive',
      value: 'inactive',
    },
    { title: 'Delete Clinic', value: 'delete' },
  ]
})

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
    key: 'add-client',
    label: 'Add Client',
    icon: 'mdi-plus-circle',
    iconClass: 'icon-client',
  },
]

const branchForm = ref({})

const invoices = [
  {
    dateAdded: '12 Jan 26',
    invoiceNo: 'INV-1023',
    cycle: 'Jan 2025',
    amount: '₹12,000',
    status: 'pending',
    statusLabel: 'Pending',
  },
  {
    dateAdded: '12 Dec 25',
    invoiceNo: 'INV-1023',
    cycle: 'Jan 2025',
    amount: '₹12,000',
    status: 'overdue',
    statusLabel: 'Overdue',
  },
  {
    dateAdded: '12 Nov 25',
    invoiceNo: 'INV-1023',
    cycle: 'Jan 2025',
    amount: '₹12,000',
    status: 'completed',
    statusLabel: 'Completed',
  },
]

const invoiceStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed', label: 'Completed' },
]

const selectedClinicId = computed(() => String(route.query.Id || route.query.id || '').trim())

const currentClinic = computed(() => {
  if (!rawClinics.value.length) return null
  const clinic = selectedClinicId.value
    ? rawClinics.value.find((c) => String(c._id) === selectedClinicId.value)
    : null
  return clinic || rawClinics.value[0] || null
})

const clinicHeaderTitle = computed(() => {
  return currentClinic.value?.name || currentClinic.value?.clinicName || 'Clinic'
})

const selectedSortLabel = computed(() => {
  return sortOptions.find((option) => option.key === selectedSortKey.value)?.label || 'Default'
})

const cityOptions = computed(() => {
  return [...new Set(allRows.value.map((r) => r.city).filter(Boolean))].sort()
})

const areaOptions = computed(() => {
  const baseRows = filterCities.value.length
    ? allRows.value.filter((r) => filterCities.value.includes(r.city))
    : allRows.value
  return [...new Set(baseRows.map((r) => r.area).filter(Boolean))].sort()
})

const hasAnyFilter = computed(() => filterCities.value.length > 0 || filterAreas.value.length > 0)

const displayedRows = computed(() => allRows.value)

const statCards = computed(() => {
  const branches = currentClinic.value?.branches || 0
  const employees = currentClinic.value?.teamMembers || 0
  const clients = currentClinic.value?.clients || 0

  return [
    { key: 'branches', label: 'Branches', value: branches, colorClass: 'greenBg' },
    { key: 'employees', label: 'Team Members', value: employees, colorClass: 'peachBg' },
    { key: 'clients', label: 'Clients', value: clients, colorClass: 'blueBg' },
  ]
})

const branchOptions = computed(() =>
  allRows.value.map((row) => ({ title: row.branch, value: row.id || row._id })),
)

async function loadClinics() {
  loading.value = true
  try {
    const response = await getClinics({ limit: 1000 })
    const clinics = response.data || []
    rawClinics.value = clinics

    const targetClinic = selectedClinicId.value
      ? clinics.find((clinic) => String(clinic._id) === selectedClinicId.value)
      : null
    const resolvedClinic = targetClinic || clinics[0] || null
    selectedClinic.value = resolvedClinic

    const clinicId = resolvedClinic?._id
    if (clinicId) {
      await loadBranches(clinicId)
    } else {
      allRows.value = []
    }
  } finally {
    loading.value = false
  }
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
  if (currentClinic.value?._id) loadBranches(currentClinic.value._id)
}, 400)

watch(search, debouncedSearch)
watch([page, itemsPerPage], () => {
  if (currentClinic.value?._id) loadBranches(currentClinic.value._id)
})

function onTablePage(p) {
  page.value = p
}

function onTableItemsPerPage(n) {
  itemsPerPage.value = n
}

async function loadBranches(clinicId) {
  const skip = (page.value - 1) * itemsPerPage.value
  const limit = itemsPerPage.value
  const params = { clinicId, skip, limit }
  if (search.value.trim()) params.search = search.value.trim()
  if (selectedSortKey.value !== 'default') params.sort = selectedSortKey.value

  const branchResponse = await getBranches(params)
  const branches = branchResponse.data || []
  totalBranches.value = branchResponse.pagination?.total || branches.length

  allRows.value = branches.map((b) => ({
    id: b._id,
    branch: b.branchName || '—',
    city: b.city || '—',
    area: b.area || '—',
    postalCode: b.postalCode || '—',
    employees: Number(b.numberOfEmployees || 0),
    clients: Number(b.numberOfClients || 0),
    status: b.status || 'active',
    _raw: b,
  }))
}

function setInvoiceStatus(invoice, opt) {
  invoice.status = opt.value
  invoice.statusLabel = opt.label
}

function selectSort(key) {
  selectedSortKey.value = key
  sortMenu.value = false
  page.value = 1
  if (currentClinic.value?._id) loadBranches(currentClinic.value._id)
}

function toggleFilters() {
  showFilters.value = !showFilters.value
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

async function handleClinicSetting(item) {
  const clinic = currentClinic.value
  if (item.value === 'billing') {
    showBillingDialog.value = true
  } else if (item.value === 'edit') {
    selectedClinic.value = clinic || null
    showEditClinicDialog.value = true
  } else if (item.value === 'inactive') {
    const clinicId = clinic?._id
    if (!clinicId) return
    await toggleClinicStatus(clinicId)
    await loadClinics()
  } else if (item.value === 'delete') {
    selectedClinic.value = clinic || null
    showDeleteClinicDialog.value = true
  }
}

function handleQuickAccess(action) {
  if (action.key === 'add-employee') {
    showAddEmployeeDialog.value = true
  } else if (action.key === 'add-client') {
    showAddClientDialog.value = true
  } else if (action.key === 'create-branch') {
    showCreateBranchDialog.value = true
  }
}

async function submitEmployee(data) {
  submitting.value = true
  try {
    const clinicId = currentClinic.value?._id || selectedClinicId.value || selectedClinic.value?._id

    if (!clinicId) {
      throw new Error('Please select a valid clinic')
    }

    const branchId = data.branch || null

    await createStaff({
      name: data.name,
      email: data.email,
      phone: data.phone,
      roleName: data.role,
      clinicId: clinicId,
      branchId: branchId,
    })
    await loadClinics()
    showAddEmployeeDialog.value = false
    snackbar.showSuccess('Employee created successfully')
  } catch (error) {
    console.error('Failed to create employee:', error)
    snackbar.showError(
      error?.response?.data?.message || error?.message || 'Failed to create employee',
    )
  } finally {
    submitting.value = false
  }
}

async function submitBranch(data) {
  if (!data?.branchName) return
  submitting.value = true
  try {
    await executeBranchSave(data)
    await finalizeAfterBranchSave()
  } catch (error) {
    console.error('Failed to save branch:', error)
    snackbar.showError(error?.response?.data?.message || error?.message || 'Failed to save branch')
  } finally {
    submitting.value = false
  }
}

async function executeBranchSave(data) {
  const clinicId = currentClinic.value?._id || selectedClinicId.value || selectedClinic.value?._id
  if (!clinicId) {
    throw new Error('Unable to identify clinic for branch creation')
  }
  const branchId = editingBranch.value?._raw?._id
  if (branchId) {
    await updateBranch(branchId, { ...data, clinicId })
  } else {
    await createBranch({ ...data, clinicId })
  }
}

async function finalizeAfterBranchSave() {
  const clinicId = currentClinic.value?._id || selectedClinicId.value || selectedClinic.value?._id
  showCreateBranchDialog.value = false
  showEditBranchDialog.value = false
  editingBranch.value = null
  if (clinicId) await loadBranches(clinicId)
}

function submitAddClient() {
  showAddClientDialog.value = false
  router.push('/add-client')
  // handle add client to selected branch
}

async function submitEditClinic(data) {
  submitting.value = true
  try {
    if (selectedClinic.value?._id) {
      await updateClinic(selectedClinic.value._id, data)
      await loadClinics()
    }
    showEditClinicDialog.value = false
  } finally {
    submitting.value = false
  }
}

async function confirmDeleteClinic() {
  const clinicId = selectedClinic.value?._id
  if (!clinicId) return
  selectedClinic.value = null
  showDeleteClinicDialog.value = false
  deleting.value = true
  try {
    await deleteClinic(clinicId)
    await loadClinics()
  } finally {
    deleting.value = false
  }
}

function openEditBranch(item) {
  const clinicId = currentClinic.value?._id
  if (!clinicId) return
  const branchId = item._raw?._id || item.id
  router.push(`/super-admin/clinics/${clinicId}/branches/${branchId}`)
}

function openEditBranchForm(item) {
  editingBranch.value = item
  showEditBranchDialog.value = true
}

async function handleToggleBranchStatus(item) {
  const id = item._raw?._id || item.id
  if (!id) return
  await toggleBranchStatusApi(id)
  const clinicId = currentClinic.value?._id
  if (clinicId) await loadBranches(clinicId)
}

function confirmDeleteBranch(item) {
  editingBranch.value = item
  showDeleteBranchDialog.value = true
}

async function confirmDeleteBranchAction() {
  const id = editingBranch.value?._raw?._id || editingBranch.value?.id
  if (!id) return
  editingBranch.value = null
  showDeleteBranchDialog.value = false
  deletingBranch.value = true
  try {
    await deleteBranch(id)
    const clinicId = currentClinic.value?._id
    if (clinicId) await loadBranches(clinicId)
  } finally {
    deletingBranch.value = false
  }
}

function openAddBranchDialog() {
  branchForm.value = {
    branchName: '',
    address: '',
    area: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
  }
  showCreateBranchDialog.value = true
}

watch(
  () => selectedClinicId.value,
  async () => {
    if (!rawClinics.value.length) return
    const clinicId = currentClinic.value?._id
    if (clinicId) await loadBranches(clinicId)
  },
)

onMounted(loadClinics)
</script>

<style scoped>
.clinic-management-page {
  background: #fbfbfd;
}

.clinic-management-page :deep(.page-header h1) {
  font-size: 42px;
}

.clinic-management-page :deep(.page-header p) {
  font-size: 12px;
  color: #8e93a0;
}

.overview-top {
  margin-bottom: 2px;
}

.overview-bottom {
  margin-top: 2px;
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

.search-input {
  min-width: 260px;
}

.search-input :deep(.v-field) {
  border-radius: 20px;
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

.filter-menu .filter-header {
  font-size: 12px;
  font-weight: 600;
  color: #8a919d;
  pointer-events: none;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dialog-subtitle {
  color: #8a919d;
  font-size: 13px;
  margin-bottom: 14px;
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

.billing-layout {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 16px;
}

.billing-profile-card {
  border: 1px solid #eaedf5;
  border-radius: 16px;
  padding: 16px;
  background: #fff;
}

.billing-avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.billing-avatar {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  background: #f7ddd5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
}

.billing-name {
  margin-top: 10px;
  font-size: 32px;
  font-weight: 700;
  color: #2d3440;
}

.billing-profile-grid {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.billing-field {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eef1f6;
  padding-bottom: 6px;
  gap: 8px;
}

.billing-field span {
  color: #959ba7;
  font-size: 12px;
}

.billing-field strong {
  color: #3a4252;
  font-size: 12px;
}

.billing-edit-btn {
  margin-top: 16px;
  width: 100%;
  background: #f8e6f3;
  color: #af5f9a;
  text-transform: none;
}

.billing-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.billing-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.metric-box {
  border: 1px solid #eaedf5;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-box span {
  font-size: 12px;
  color: #959ba7;
}

.metric-chip {
  text-align: center;
  border-radius: 8px;
  padding: 8px;
  font-size: 13px;
}

.chip-green {
  background: #dfe8c2;
  color: #5b7f12;
}

.chip-peach {
  background: #efd6cd;
  color: #d4551f;
}

.chip-blue {
  background: #cbe5ec;
  color: #1b6f9b;
}

.billing-table {
  border: 1px solid #eaedf5;
  border-radius: 12px;
  overflow: hidden;
}

.status-completed {
  color: #66810d;
  background: #d9e3bc;
}

.status-overdue {
  color: #dc6f28;
  background: #f7e1ce;
}

.status-pending {
  color: #2e78bf;
  background: #dce9f7;
}

.add-employee-subtitle {
  color: #8a919d;
  font-size: 13px;
  margin-bottom: 14px;
}

.employee-form {
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

.employee-submit-btn {
  margin-top: 6px;
  min-height: 44px;
  border-radius: 999px;
  background: #f7dff1;
  color: #b13c92;
  text-transform: none;
  font-weight: 600;
  box-shadow: none;
}

@media (max-width: 1100px) {
  .billing-layout {
    grid-template-columns: 1fr;
  }

  .billing-metrics {
    grid-template-columns: 1fr;
  }
}

.branch-link {
  cursor: pointer;
  color: #2e3442;
}

.branch-link:hover {
  text-decoration: underline;
  color: #b13c92;
}

.status-dropdown {
  cursor: pointer;
}

.delete-dialog-card {
  padding: 24px;
  border-radius: 16px;
}

.delete-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.delete-dialog-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #2e3442;
}

.delete-dialog-body {
  font-size: 14px;
  color: #555c68;
  margin-bottom: 20px;
}

.delete-dialog-actions {
  display: flex;
  justify-content: flex-end;
}

.delete-confirm-btn {
  color: #e53935;
  font-weight: 600;
  text-transform: none;
}
</style>
