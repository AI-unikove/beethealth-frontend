<template>
  <v-container class="clients-page px-5 py-4">
    <PageHeader title="Your Overview" subtitle="Hello. Welcome to your Dashboard!" />

    <v-row class="overview-top" dense>
      <v-col cols="12" lg="8">
        <StatCards :items="statCards" />

        <CrudList
          class="mt-4"
          :headers="headers"
          :items="displayedClinics"
          :items-length="totalClinics"
          :page="page"
          :items-per-page="itemsPerPage"
          @update:page="onTablePage"
          @update:items-per-page="onTableItemsPerPage"
          :loading="loading"
          add-button-text="Create Clinic"
          :show-refresh="false"
          @add="openCreate"
        >
          <template #search>
            <div class="search-container">
              <input
                v-model="search"
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
                      <span class="sort-chip-label">{{ selectedSortButtonLabel }}</span>
                      <v-icon size="14" class="ml-1">mdi-chevron-down</v-icon>
                    </template>
                  </span>
                </template>

                <v-list class="menu-list" density="compact" min-width="190">
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

              <v-menu
                v-model="filterMenu"
                location="bottom end"
                :close-on-content-click="false"
                open-on-hover
                offset="8"
              >
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon variant="text" size="small" class="round-btn icon-btn">
                    <img src="../../assets/images/setting.svg" alt="Filters" />
                  </v-btn>
                </template>

                <v-list class="menu-list payment-filter-menu" density="compact" min-width="170">
                  <v-list-item class="payment-filter-header" :ripple="false">
                    <template #title>
                      <span>Payments</span>
                    </template>
                    <template #append>
                      <v-icon size="14">mdi-chevron-down</v-icon>
                    </template>
                  </v-list-item>

                  <v-list-item
                    v-for="option in paymentFilterOptions"
                    :key="option.key"
                    :active="selectedPaymentFilter === option.key"
                    rounded="lg"
                    @click="selectPaymentFilter(option.key)"
                    :class="['listSub', `payment-${option.key}`]"
                  >
                    <v-list-item-title :class="['payment-item-label', `payment-${option.key}`]">
                      {{ option.label }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>

          <template #add-action>
            <span class="hide-default-add" aria-hidden="true" />
          </template>

          <template #[`item.name`]="{ item }">
            <span
              class="clinic-name-link"
              @click="router.push(`/super-admin/clinics?Id=${item._id || item.id}`)"
            >
              <v-chip
                v-if="item.status && item.status.toLowerCase() === 'inactive'"
                size="x-small"
                variant="flat"
                class="inactive-badge mr-1"
                >Inactive</v-chip
              >
              {{ item.name }}
            </span>
          </template>
          <template #[`item.branches`]="{ item }">{{ item.branches || 0 }}</template>
          <template #[`item.teamMembers`]="{ item }">{{ item.teamMembers || 0 }}</template>
          <template #[`item.clients`]="{ item }">{{ item.clients || 0 }}</template>

          <template #[`item.paymentStatus`]="{ item }">
            <!-- ADD inactive class -->
            <span
              size="small"
              variant="flat"
              :class="['status-badge', `status-${normalizePaymentStatus(item.paymentStatus)}`]"
            >
              {{ toPaymentLabel(item.paymentStatus) }}
            </span>
          </template>

          <template #[`item.actions`]="{ item }">
            <v-menu location="bottom end" offset="4">
              <template #activator="{ props }">
                <span v-bind="props" icon variant="text" size="small" class="action-dots-btn">
                  <v-icon>mdi-dots-vertical</v-icon>
                </span>
              </template>
              <v-list class="action-menu-list" density="compact" min-width="170">
                <v-list-item @click="openEdit(item)">
                  <v-list-item-title>Edit</v-list-item-title>
                </v-list-item>
                <v-list-item @click="markInactive(item)">
                  <v-list-item-title>{{
                    item.status === 'inactive' ? 'Mark as Active' : 'Mark as Inactive'
                  }}</v-list-item-title>
                </v-list-item>
                <v-list-item @click="openDeleteClinic(item)">
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
          class="mt-4"
        />
      </v-col>
    </v-row>
    <!-- create Clinic Dialog -->
    <CrudDialog
      v-model="showCreateDialog"
      :title="selectedClinic ? 'Edit Clinic' : 'Create Clinic'"
      max-width="640"
      :show-footer="false"
      :show-header-close="true"
    >
      <ClinicForm
        :initial-data="selectedClinic || {}"
        :title="selectedClinic ? 'Edit Clinic' : 'Create Clinic'"
        :submit-label="selectedClinic ? 'Save Changes' : 'Create Clinic'"
        :loading="submitting"
        @submit="submitClinic"
        @cancel="closeDialog"
      />
    </CrudDialog>
    <!-- Create Branch Dialog -->
    <CreateBranchDialog
      v-model="showCreateBranchDialog"
      show-clinic
      :clinic-options="branchClinicOptions"
      :loading="submitting"
      @submit="submitBranch"
    />

    <!-- Add Employee Dialog  -->
    <AddEmployeeDialog
      v-model="showAddEmployeeDialog"
      show-clinic
      show-branch
      :clinic-options="clinicOptions"
      :branch-options="branchOptions"
      @submit="submitEmployee"
    />

    <!-- Delete Clinic Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="440">
      <v-card class="delete-dialog-card">
        <div class="delete-dialog-header">
          <h3>Delete Clinic</h3>
          <v-btn
            icon
            variant="text"
            size="small"
            :disabled="deleting"
            @click="showDeleteDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <p class="delete-dialog-body">
          This will <strong class="text-error">permanently remove </strong>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSnackbarStore } from '@/stores/snackbar.store'
import PageHeader from '@/components/common/PageHeader.vue'
import CrudList from '@/components/common/CrudList.vue'
import CrudDialog from '@/components/common/CrudDialog.vue'
import AIAssistantCard from '@/components/common/AIAssistantCard.vue'
import StatCards from '@/components/superadmin/StatCards.vue'
import OverviewQuickAccessCard from '@/components/common/OverviewQuickAccessCard.vue'
import ClinicForm from '@/components/superadmin/ClinicForm.vue'
import CreateBranchDialog from '@/components/common/CreateBranchDialog.vue'
import AddEmployeeDialog from '@/components/common/AddEmployeeDialog.vue'
import { createBranch } from '@/services/branch.service'
import { createStaff } from '@/services/staff.service'
import {
  getClinics,
  createClinic,
  updateClinic,
  deleteClinic,
  toggleClinicStatus,
} from '@/services/clinic.service'

const router = useRouter()
const snackbar = useSnackbarStore()
const allClinics = ref([])
const search = ref('')
const page = ref(1)
const itemsPerPage = ref(10)
const totalClinics = ref(0)
const loading = ref(false)
const submitting = ref(false)
const selectedClinic = ref(null)
const showCreateDialog = ref(false)
const showCreateBranchDialog = ref(false)
const showAddEmployeeDialog = ref(false)
const showDeleteDialog = ref(false)
const deleting = ref(false)
const sortMenu = ref(false)
const filterMenu = ref(false)
const selectedSortKey = ref('default')
const selectedPaymentFilter = ref('all')

const headers = [
  { title: 'Clinic Name', key: 'name', sortable: false },
  { title: 'No. of Branches', key: 'branches', sortable: false },
  { title: 'No. of Employees', key: 'teamMembers', sortable: false },
  { title: 'No. of Clients', key: 'clients', sortable: false },
  { title: 'Payment', key: 'paymentStatus', sortable: false },
  { title: 'Action', key: 'actions', sortable: false },
]

const sortOptions = [
  { key: 'default', label: 'Default' },
  { key: 'name-asc', label: 'Name: Alphabetical' },
  { key: 'branches-asc', label: 'No. of Branches: Least to Most' },
  { key: 'branches-desc', label: 'No. of Branches: Most to Least' },
  { key: 'employees-asc', label: 'No. of Employees: Least to Most' },
  { key: 'employees-desc', label: 'No. of Employees: Most to Least' },
  { key: 'clients-asc', label: 'No. of Clients: Least to Most' },
  { key: 'clients-desc', label: 'No. of Clients: Most to Least' },
]

const paymentFilterOptions = [
  { key: 'completed', label: 'Completed' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'pending', label: 'Pending' },
]

/* STATS */
const stats = ref({ clinics: 0, branches: 0, employees: 0 })

const statCards = computed(() => [
  { key: 'clinics', label: 'No. of Clinics', value: stats.value.clinics, colorClass: 'greenBg' },
  {
    key: 'branches',
    label: 'No. of Branches',
    value: stats.value.branches,
    colorClass: 'peachBg',
  },
  {
    key: 'employees',
    label: 'No. of Employees',
    value: stats.value.employees,
    colorClass: 'blueBg',
  },
])

const quickAccessActions = [
  {
    key: 'create-clinic',
    label: 'Create Clinic',
    icon: 'mdi-plus-circle',
    iconClass: 'icon-clinic',
  },
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
]

const clinicOptions = computed(() => {
  return allClinics.value
    .filter((clinic) => clinic?._id && clinic?.name)
    .map((clinic) => ({
      title: String(clinic.name).trim(),
      value: String(clinic._id),
    }))
})

const branchClinicOptions = computed(() => {
  return allClinics.value
    .filter((clinic) => clinic?._id && clinic?.name)
    .map((clinic) => ({
      title: String(clinic.name).trim(),
      value: String(clinic._id),
    }))
})

const branchOptions = computed(() => [])

const selectedSortLabel = computed(() => {
  const selected = sortOptions.find((option) => option.key === selectedSortKey.value)
  return selected?.label || 'Default'
})

const selectedSortButtonLabel = computed(() => {
  if (selectedSortKey.value === 'name-asc') return 'Alphabetical'
  return selectedSortLabel.value
})

const displayedClinics = computed(() => allClinics.value)

function selectSort(key) {
  selectedSortKey.value = key
  sortMenu.value = false
  page.value = 1
  loadClinics()
}

function selectPaymentFilter(key) {
  selectedPaymentFilter.value = selectedPaymentFilter.value === key ? 'all' : key
  filterMenu.value = false
}

function handleQuickAccess(action) {
  if (!action?.key) return

  if (action.key === 'create-clinic') {
    openCreate()
    return
  }

  if (action.key === 'create-branch') {
    openCreateBranch()
    return
  }

  if (action.key === 'add-employee') {
    openAddEmployee()
  }
}

function normalizePaymentStatus(value) {
  const normalized = String(value || 'completed')
    .toLowerCase()
    .trim()
  if (normalized === 'complete') return 'completed'
  if (!['completed', 'overdue', 'pending'].includes(normalized)) return 'completed'
  return normalized
}

function toPaymentLabel(value) {
  const status = normalizePaymentStatus(value)
  return status.charAt(0).toUpperCase() + status.slice(1)
}

/* API */
function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const debouncedSearch = debounce(() => {
  page.value = 1
  loadClinics()
}, 400)

watch(search, debouncedSearch)
watch([page, itemsPerPage], () => loadClinics())

function onTablePage(p) {
  page.value = p
}

function onTableItemsPerPage(n) {
  itemsPerPage.value = n
}

async function loadClinics() {
  loading.value = true
  try {
    const skip = (page.value - 1) * itemsPerPage.value
    const limit = itemsPerPage.value
    const params = { skip, limit }
    if (search.value.trim()) params.search = search.value.trim()
    if (selectedSortKey.value !== 'default') params.sort = selectedSortKey.value

    // Check what getClinics returns now
    const res = await getClinics(params)
    allClinics.value = res.data || []
    totalClinics.value = res.pagination?.total || allClinics.value.length

    if (res.summary) {
      stats.value.clinics = res.summary.totalClinics || 0
      stats.value.branches = res.summary.totalBranches || 0
      stats.value.employees = res.summary.totalEmployees || 0
    }
  } catch (error) {
    snackbar.showError(error?.message || 'Failed to load clinics')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  selectedClinic.value = null
  showCreateDialog.value = true
}

async function markInactive(item) {
  const clinicId = item?._id || item?.id
  if (!clinicId) return
  await toggleClinicStatus(clinicId)
  await loadClinics()
}

function openDeleteClinic(item) {
  selectedClinic.value = item
  showDeleteDialog.value = true
}

async function confirmDeleteClinic() {
  const clinicId = selectedClinic.value?._id
  if (!clinicId) return
  selectedClinic.value = null
  showDeleteDialog.value = false
  deleting.value = true
  try {
    await deleteClinic(clinicId)
    await loadClinics()
  } finally {
    deleting.value = false
  }
}

function openEdit(item) {
  selectedClinic.value = item
  showCreateDialog.value = true
}

function closeDialog() {
  showCreateDialog.value = false
}

function resetBranchForm() {}

function resetEmployeeForm() {}

function openCreateBranch() {
  resetBranchForm()
  showCreateBranchDialog.value = true
}

function openAddEmployee() {
  resetEmployeeForm()
  showAddEmployeeDialog.value = true
}

async function submitBranch(data) {
  submitting.value = true
  try {
    const clinicId = String(data?.clinic || '').trim()
    if (!clinicId) {
      throw new Error('Please select a clinic')
    }
    const branchData = buildBranchData(data, clinicId)
    await createBranch(branchData)
    showCreateBranchDialog.value = false
    await loadClinics()
    snackbar.showSuccess('Branch created successfully')
  } catch (error) {
    console.error('Failed to create branch:', error)
    snackbar.showError(
      error?.response?.data?.message || error?.message || 'Failed to create branch',
    )
  } finally {
    submitting.value = false
  }
}

function buildBranchData(data, clinicId) {
  return {
    clinicId,
    branchName: data?.branchName,
    address: data?.address,
    area: data?.area,
    postalCode: data?.postalCode,
    city: data?.city,
    phone: data?.phone,
    email: data?.email,
  }
}

async function submitEmployee(data) {
  submitting.value = true
  try {
    const clinicId = data.clinic || selectedClinic.value?._id

    // We pass branchName if it exists
    const branchId = data.branch || null

    if (!clinicId) {
      throw new Error('Please select a valid clinic')
    }

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

async function submitClinic(data) {
  submitting.value = true
  try {
    if (selectedClinic.value?._id) {
      await updateClinic(selectedClinic.value._id, data)
      snackbar.showSuccess('Clinic updated successfully')
    } else {
      await createClinic(data)
      snackbar.showSuccess('Clinic created successfully')
    }
    await loadClinics()
    showCreateDialog.value = false
  } catch (error) {
    console.error('Failed to save clinic:', error)
    snackbar.showError(error?.response?.data?.message || error?.message || 'Failed to save clinic')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await loadClinics()
  resetBranchForm()
  resetEmployeeForm()
})
</script>

<style scoped>
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

.super-admin-page {
  background: #fbfbfd;
}

.overview-top {
  margin-bottom: 2px;
}

.overview-bottom {
  margin-top: 2px;
}

.clinic-name-link {
  cursor: pointer;
  color: #2e3442;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.clinic-name-link:hover {
  color: #b13c92;
  text-decoration: underline;
}

.inactive-badge {
  background: #fff3cd;
  color: #9a6700;
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
  padding: 0 6px;
}

.action-dots-btn {
  color: #8e93a0;
}

.action-menu-list {
  border: 1px solid #e7e9ef;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(23, 29, 42, 0.1);
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

.status-completed {
  color: #5f880d;
  background: #eef4d0;
}

.status-overdue {
  color: #dc6f28;
  background: #f7e1ce;
}

.status-pending {
  color: #2e78bf;
  background: #dce9f7;
}

.menu-list {
  border: 1px solid #e7e9ef;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(23, 29, 42, 0.1);
  padding: 10px;
}
.v-overlay-container .v-menu > .v-overlay__content > .menu-list.payment-filter-menu {
  padding: 6px !important;
}

.payment-filter-menu {
  padding: 6px;
}

.payment-filter-header {
  min-height: 34px;
}

.payment-filter-header :deep(.v-list-item-title) {
  font-weight: 500;
  color: #4d5360;
}

.listSub {
  border-radius: 8px;
  margin: 8px 0;
  border: 2px solid transparent;
  opacity: 0.6;
}
.listSub.payment-completed {
  background: #eef4d0;
  color: #5f880d;
}
.listSub.payment-overdue {
  background: #ffe7e0;
  color: #e85708;
}
.listSub.payment-pending {
  background: #dbf3f3;
  color: #0c75a5;
}
.listSub .payment-item-label {
  font-weight: 600;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
}
.v-list-item--active.listSub.payment-completed {
  border: 2px solid #c6df4b;
  opacity: 1;
  color: #6a8a10;
}
.v-list-item--active.listSub.payment-overdue {
  border: 2px solid #e85708;
  opacity: 1;
  color: #e85708 !important;
}
.v-list-item--active.listSub.payment-pending {
  border: 2px solid #0c75a5;
  opacity: 1;
  color: #0c75a5;
}

.payment-completed {
  color: #6a8a10 !important;
}

.payment-overdue {
  color: #df7a27 !important;
}

.payment-pending {
  color: #2f7ec6 !important;
}

.dialog-subtitle {
  color: #8a919d;
  font-size: 13px;
  margin-bottom: 14px;
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

:deep(.client-table thead th) {
  background: #ebecef;
  color: #272727;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
}

@media (max-width: 960px) {
  .sort-chip-label {
    max-width: 110px;
  }
}
</style>
