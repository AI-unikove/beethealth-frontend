<template>
  <v-container class="branch-dashboard px-5 py-4">
    <PageHeader :title="branchName" :subtitle="`${clinicName}  ›  ${branchName}`">
      <template #actions>
        <button
          class="button buttonBg"
          rounded="pill"
          variant="outlined"
          @click="showAddEmployeeDialog = true"
        >
          <b>Add employee</b>
        </button>
        <button class="button" rounded="pill" variant="flat" @click="$router.push('/add-client')">
          <b>Add client</b>
        </button>
      </template>
    </PageHeader>

    <v-row class="overview-top" dense>
      <!-- Branch Profile Card -->
      <v-col cols="12" lg="3">
        <v-card elevation="0" class="branch-profile-card">
          <div class="profile-avatar-wrap">
            <InitialsAvatar :name="clinicName" size="80" />
          </div>
          <h3 class="profile-name">{{ clinicName }}</h3>

          <div class="profile-info-grid">
            <div class="profile-info-row">
              <span class="info-label">Mobile</span>
              <span class="info-value">{{ branchMobile || '—' }}</span>
            </div>
            <v-divider />
            <div class="profile-info-row">
              <span class="info-label">Email</span>
              <span class="info-value">{{ branchEmail || '—' }}</span>
            </div>
          </div>

          <OverviewSettingsMenu
            button-label="Settings"
            :items="branchSettingItems"
            @select="handleBranchSetting"
          />
        </v-card>
      </v-col>

      <!-- Stats -->
      <v-col cols="12" lg="9">
        <v-row dense>
          <v-col cols="12" md="6">
            <div
              class="overview-card clickable-stat"
              elevation="0"
              @click="showTeamMembersDialog = true"
            >
              <div class="overview-stat-label">Team members</div>
              <div class="overview-stat-pill greenBg">{{ employeeCount }}</div>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div
              class="overview-card clickable-stat"
              elevation="0"
              @click="showClientsDialog = true"
            >
              <div class="overview-stat-label">Clients</div>
              <div class="overview-stat-pill peachBg">{{ clientCount }}</div>
            </div>
          </v-col>
        </v-row>

        <!-- Employee List -->
        <div elevation="0" class="employee-list-card mt-3">
          <div class="employee-list-toolbar">
            <div class="search-container">
              <input
                v-model="search"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                hide-details
                class="search-box"
                placeholder="Search by Employee name"
              />
            </div>
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
                <v-list class="menu-list" density="compact" min-width="200">
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
                  <button v-bind="props" icon class="button buttonBgNone">
                    <b><img src="../../assets/images/setting.svg" alt="Filters" /></b>
                  </button>
                </template>
                <v-list class="menu-list filter-menu" density="compact" min-width="190">
                  <v-list-item :ripple="false" class="filter-header">
                    <template #title><span>Filter by Status</span></template>
                    <template #append><v-icon size="14">mdi-chevron-down</v-icon></template>
                  </v-list-item>
                  <v-list-item
                    v-for="opt in statusFilterOptions"
                    :key="opt.key"
                    :active="selectedStatusFilter === opt.key"
                    rounded="lg"
                    @click="selectStatusFilter(opt.key)"
                  >
                    <v-list-item-title>{{ opt.label }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <v-table class="employee-table" density="comfortable">
            <thead>
              <tr>
                <th>Name DDD</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="employee in displayedEmployees" :key="employee.id">
                <td>
                  <strong>{{ employee.name }}</strong>
                </td>
                <td>{{ employee.role }}</td>
                <td>
                  <span
                    size="small"
                    variant="flat"
                    :class="[
                      'status-chip',
                      employee.status === 'active' ? 'status-completed' : 'status-inactive',
                    ]"
                  >
                    {{ employee.status === 'active' ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <v-menu location="bottom end" offset="4">
                    <template #activator="{ props }">
                      <span v-bind="props" icon variant="text" size="small">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </span>
                    </template>
                    <v-list class="action-menu-list" density="compact" min-width="160">
                      <v-list-item @click="editEmployee(employee)">
                        <v-list-item-title>Edit</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="toggleEmployeeStatus(employee)">
                        <v-list-item-title>{{
                          employee.status === 'active' ? 'Mark as inactive' : 'Mark as active'
                        }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="confirmDeleteEmployee(employee)">
                        <v-list-item-title class="text-error">Delete</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
              </tr>
              <tr v-if="!displayedEmployees.length">
                <td colspan="4" class="text-center pa-6 text-medium-emphasis">
                  No employees found.
                </td>
              </tr>
            </tbody>
          </v-table>

          <div class="table-footer">
            <span class="showing-label"
              >Showing 1-{{ displayedEmployees.length }} of
              {{ displayedEmployees.length }} clients</span
            >
            <div class="d-flex align-center ga-1">
              <v-btn icon variant="text" size="x-small" :disabled="page <= 1" @click="page--">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              <span class="page-label">{{ page }} / {{ totalPages }}</span>
              <v-btn
                icon
                variant="text"
                size="x-small"
                :disabled="page >= totalPages"
                @click="page++"
              >
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Add Employee Dialog (Branch — no Choose Clinic, no Branch dropdown) -->
    <AddEmployeeDialog
      v-model="showAddEmployeeDialog"
      :show-branch="false"
      :loading="addEmployeeLoading"
      @submit="submitEmployee"
    />

    <CreateBranchDialog
      v-model="showEditBranchDialog"
      title="Edit Branch"
      submit-label="Save Changes"
      subtitle="Update branch details to keep this location information current."
      :initial-data="editingBranch"
      :loading="isSubmittingBranch"
      @submit="submitEditBranch"
    />

    <v-dialog v-model="showDeleteBranchDialog" max-width="440">
      <v-card class="delete-dialog-card">
        <div class="delete-dialog-header">
          <h3>Delete Branch</h3>
          <v-btn
            icon
            variant="text"
            size="small"
            :disabled="isDeletingBranch"
            @click="showDeleteBranchDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <p class="delete-dialog-body">
          This will <strong class="text-error">permanently remove</strong>
          <strong> {{ branchName || 'this branch' }}</strong> from your branch list. Are you sure?
        </p>
        <div class="delete-dialog-actions">
          <v-btn
            variant="text"
            class="delete-confirm-btn"
            :loading="isDeletingBranch"
            @click="confirmDeleteBranch"
          >
            Delete
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Team Members Dialog -->
    <v-dialog v-model="showTeamMembersDialog" max-width="900" scrollable>
      <v-card class="modal-card">
        <div class="modal-header">
          <h2 class="modal-title">Team members</h2>
          <v-btn icon variant="text" size="small" @click="showTeamMembersDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <!-- Role filter tabs + toolbar -->
        <div class="modal-tabs">
          <span
            v-for="role in tmRoleOptions"
            :key="role"
            :class="['role-tab', tmRoleFilter === role ? 'role-tab-active' : '']"
            @click="selectTmRole(role)"
          >
            {{ tmRoleLabels[role] }}
          </span>
          <div class="modal-toolbar-right">
            <div class="tm-search-container">
              <v-icon size="16" class="tm-search-icon">mdi-magnify</v-icon>
              <input
                v-model="tmSearch"
                class="tm-search-input"
                placeholder="Search by team member name"
              />
            </div>
            <!-- Chat -->
            <v-btn
              icon
              variant="text"
              size="small"
              class="round-btn icon-btn"
              @click="showBroadcastDialog = true"
            >
              <v-icon size="18" color="#9ca3af">mdi-message-outline</v-icon>
            </v-btn>
            <!-- View toggle -->
            <v-btn
              icon
              variant="text"
              size="small"
              :class="['round-btn', 'icon-btn', tmViewActive ? 'tm-view-btn-active' : '']"
              @click="tmViewActive = !tmViewActive"
            >
              <v-icon size="18" :color="tmViewActive ? '#c44d9b' : '#9ca3af'">mdi-grid</v-icon>
            </v-btn>
            <!-- Filter -->
            <v-menu
              v-model="tmFilterMenu"
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
              <v-list class="menu-list filter-menu" density="compact" min-width="180">
                <v-list-item :ripple="false" class="filter-header">
                  <template #title><span>Filter by Status</span></template>
                  <template #append><v-icon size="14">mdi-chevron-down</v-icon></template>
                </v-list-item>
                <v-list-item
                  v-for="opt in statusFilterOptions"
                  :key="opt.key"
                  :active="tmStatusFilter === opt.key"
                  rounded="lg"
                  @click="selectTmStatusFilter(opt.key)"
                >
                  <v-list-item-title>{{ opt.label }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>

        <!-- Multiselect toolbar -->
        <div v-if="tmViewActive" class="tm-multiselect-toolbar">
          <v-checkbox
            :model-value="tmAllSelected"
            :indeterminate="tmIsIndeterminate"
            hide-details
            density="compact"
            class="tm-select-all-cb"
            @click.prevent="toggleTmSelectAll"
          />
          <button class="tm-bulk-btn" :disabled="!tmSelectedIds.length" @click="bulkMarkTmInactive">
            Mark as inactive
          </button>
          <button
            class="tm-bulk-btn"
            :disabled="!tmSelectedIds.length"
            @click="confirmBulkDeleteTm"
          >
            Delete
          </button>
        </div>

        <!-- Card grid -->
        <div class="tm-card-grid">
          <div v-if="!pagedTmEmployees.length" class="tm-empty">No employees found.</div>
          <div
            v-for="emp in pagedTmEmployees"
            :key="emp.id"
            :class="['tm-member-card', tmSelectedIds.includes(emp.id) ? 'tm-selected' : '']"
            @click="tmViewActive ? toggleTmSelect(emp.id) : null"
          >
            <div class="tm-card-header">
              <div class="d-flex align-center ga-2">
                <InitialsAvatar :name="emp.name" size="50" />
                <div>
                  <div class="tm-name">{{ emp.name }}</div>
                  <div class="tm-role">{{ emp.role }}</div>
                </div>
              </div>
              <v-menu
                v-if="!tmSelectedIds.includes(emp.id)"
                location="bottom end"
                offset="4"
                @click.stop
              >
                <template #activator="{ props }">
                  <span
                    v-bind="props"
                    icon
                    variant="text"
                    size="x-small"
                    class="tm-dots"
                    @click.stop
                  >
                    <v-icon size="18">mdi-dots-vertical</v-icon>
                  </span>
                </template>
                <v-list class="action-menu-list" density="compact" min-width="160">
                  <v-list-item @click="editEmployee(emp)">
                    <v-list-item-title>Change role</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="toggleEmployeeStatus(emp)">
                    <v-list-item-title>{{
                      emp.status === 'active' ? 'Mark as inactive' : 'Mark as active'
                    }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="confirmDeleteEmployee(emp)">
                    <v-list-item-title class="text-error">Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <p class="tm-joined">at {{ clinicName }} since {{ emp.joinedDate }}</p>

            <div class="tm-contact">
              <div class="tm-contact-row">
                <v-icon size="14" class="tm-contact-icon">mdi-email-outline</v-icon>
                <span>{{ emp.email }}</span>
              </div>
              <div class="tm-contact-row">
                <v-icon size="14" class="tm-contact-icon">mdi-phone-outline</v-icon>
                <span>{{ emp.phone }}</span>
              </div>
            </div>

            <span
              size="small"
              variant="flat"
              :class="[
                'status-chip',
                emp.status === 'active' ? 'status-active' : 'status-inactive',
              ]"
            >
              {{ emp.status === 'active' ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>

        <div class="modal-footer">
          <span class="showing-label"
            >Showing 1-{{ pagedTmEmployees.length }} of
            {{ filteredTmEmployees.length }} employees</span
          >
          <div class="d-flex align-center ga-1">
            <v-btn icon variant="text" size="x-small" :disabled="tmPage <= 1" @click="tmPage--">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <span class="page-label">{{ tmPage }} / {{ tmTotalPages }}</span>
            <v-btn
              icon
              variant="text"
              size="x-small"
              :disabled="tmPage >= tmTotalPages"
              @click="tmPage++"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <!-- Clients Dialog -->
    <v-dialog v-model="showClientsDialog" max-width="800" scrollable>
      <v-card class="modal-card">
        <div class="modal-header">
          <h2 class="modal-title">Clients</h2>
          <v-btn icon variant="text" size="small" @click="showClientsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="modal-search-bar">
          <div class="client-search-group">
            <!-- Search -->
            <div class="client-search-wrap">
              <v-icon size="16" class="client-search-icon">mdi-magnify</v-icon>
              <input
                v-model="clientSearch"
                class="client-search-input"
                placeholder="Search by client name"
              />
            </div>
            <!-- Sort -->
            <v-menu
              v-model="clientSortMenu"
              location="bottom end"
              :close-on-content-click="true"
              offset="8"
            >
              <template #activator="{ props }">
                <button
                  v-bind="props"
                  :class="[
                    'client-icon-btn',
                    clientSortKey !== 'default' ? 'client-icon-btn-active' : '',
                  ]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 21 21"
                    fill="none"
                  >
                    <path
                      d="M15.6914 3.55957V15.1699L15.7939 15.0684L17.9688 12.8906L19.1221 14.0439L14.875 18.29L10.6289 14.0439L11.7822 12.8906L13.959 15.0684L14.0615 15.1699V15.0254L14.0605 3.55957H15.6914ZM10.3721 6.95508L9.21875 8.1084L7.04395 5.93164L6.94141 5.83008V17.4404H5.31055L5.31152 5.97461V5.83008L5.20898 5.93164L3.03223 8.1084L1.87891 6.95508L6.12598 2.70898L10.3721 6.95508Z"
                      fill="currentColor"
                      stroke="white"
                      stroke-width="0.12"
                    />
                  </svg>
                </button>
              </template>
              <v-list class="menu-list" density="compact" min-width="260">
                <v-list-item
                  v-for="opt in clientSortOptions"
                  :key="opt.key"
                  :active="clientSortKey === opt.key"
                  @click="selectClientSort(opt.key)"
                >
                  <v-list-item-title>{{ opt.label }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <!-- Filter by Nutritionist -->
            <v-menu
              v-model="clientFilterMenu"
              location="bottom end"
              :close-on-content-click="false"
              offset="8"
            >
              <template #activator="{ props }">
                <button
                  v-bind="props"
                  :class="[
                    'client-icon-btn',
                    clientNutritionistFilter ? 'client-icon-btn-active' : '',
                  ]"
                >
                  <img src="../../assets/images/setting.svg" alt="Filters" />
                </button>
              </template>
              <div class="nutritionist-filter-panel">
                <div class="nf-header">
                  <span class="nf-title">Nutritionist</span>
                  <v-icon size="16" class="nf-chevron">mdi-chevron-up</v-icon>
                </div>
                <div class="nf-search-row">
                  <input
                    v-model="nutritionistFilterSearch"
                    class="nf-search-input"
                    placeholder="Type name"
                  />
                </div>
                <div class="nf-list">
                  <div
                    v-for="n in filteredNutritionistOptions"
                    :key="n"
                    :class="['nf-option', clientNutritionistFilter === n ? 'nf-option-active' : '']"
                    @click="selectClientNutritionistFilter(n)"
                  >
                    {{ n }}
                  </div>
                  <div v-if="!filteredNutritionistOptions.length" class="nf-empty">No results</div>
                </div>
              </div>
            </v-menu>
          </div>
        </div>

        <div class="modal-table-scroll" @scroll="onClientsScroll">
          <v-table class="modal-table" density="comfortable">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Assigned Nutritionist</th>
                <th>Last Visit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="client in allClients" :key="client.id">
                <td>
                  <div class="d-flex align-center ga-2">
                    <InitialsAvatar :name="client.name" size="32" />
                    <strong>{{ client.name }}</strong>
                  </div>
                </td>
                <td>
                  <v-menu
                    location="bottom"
                    :close-on-content-click="false"
                    offset="4"
                    @update:model-value="nutritionistDropdownSearch = ''"
                  >
                    <template #activator="{ props }">
                      <div v-bind="props" class="nutritionist-cell">
                        <span>{{ client.nutritionist }}</span>
                        <v-icon size="14" class="ml-1 text-medium-emphasis"
                          >mdi-chevron-down</v-icon
                        >
                      </div>
                    </template>
                    <div class="nutritionist-dropdown">
                      <input
                        v-model="nutritionistDropdownSearch"
                        class="nd-search"
                        placeholder="Type name"
                      />
                      <div
                        v-for="n in filteredBranchNutritionists"
                        :key="n.id"
                        :class="[
                          'nd-option',
                          client.nutritionistId === n.id ? 'nd-option-current' : '',
                        ]"
                        @click="onNutritionistSelect(client, n)"
                      >
                        {{ n.name }}
                      </div>
                      <div
                        v-if="!filteredBranchNutritionists.length && !branchNutritionistsLoading"
                        class="nd-empty"
                      >
                        No results
                      </div>
                      <div v-if="branchNutritionistsLoading" class="nd-empty">Loading...</div>
                    </div>
                  </v-menu>
                </td>
                <td>{{ client.lastAppointment }}</td>
              </tr>
              <tr v-if="!allClients.length && !clientsLoading">
                <td colspan="3" class="text-center pa-6 text-medium-emphasis">No clients found.</td>
              </tr>
            </tbody>
          </v-table>

          <div v-if="clientsLoading" class="text-center pa-3 text-medium-emphasis">Loading...</div>
          <div
            v-else-if="!clientsHasMore && allClients.length"
            class="text-center pa-3 text-medium-emphasis"
            style="font-size: 12px"
          >
            No more clients
          </div>
        </div>

        <div class="modal-footer">
          <span class="showing-label"
            >Showing {{ allClients.length }} of {{ clientsTotal }} clients</span
          >
        </div>
      </v-card>
    </v-dialog>

    <!-- Edit Employee Dialog -->
    <CrudDialog
      v-model="showEditEmployeeDialog"
      title="Edit Employee"
      max-width="640"
      :show-footer="false"
      :show-header-close="true"
    >
      <div class="dialog-subtitle">Update the employee's details, role, and status.</div>
      <v-form v-if="editingEmployee" class="employee-form" @submit.prevent="saveEditEmployee">
        <div class="form-field-block">
          <label class="field-label">Name</label>
          <v-text-field
            v-model="editingEmployee.name"
            placeholder="Name"
            variant="outlined"
            hide-details
            class="soft-input"
          />
        </div>
        <div class="form-field-block">
          <label class="field-label">Email</label>
          <v-text-field
            v-model="editingEmployee.email"
            placeholder="hustonhealth@gmail.com"
            variant="outlined"
            hide-details
            class="soft-input"
          />
        </div>
        <div class="form-field-block">
          <label class="field-label">Phone Number</label>
          <div class="phone-input-row">
            <div class="phone-code">+91</div>
            <v-text-field
              v-model="editingEmployee.phone"
              placeholder="99999 99999"
              variant="outlined"
              hide-details
              class="soft-input phone-input"
            />
          </div>
        </div>
        <div class="form-field-block">
          <label class="field-label">Branch</label>
          <v-select
            v-model="editingEmployee.branch"
            placeholder="Select"
            :items="editEmployeeBranchOptions"
            variant="outlined"
            hide-details
            class="soft-input"
          />
        </div>
        <div class="form-field-block">
          <label class="field-label">Role</label>
          <v-select
            v-model="editingEmployee.role"
            placeholder="Select"
            :items="roleOptions"
            variant="outlined"
            hide-details
            class="soft-input"
          />
        </div>
        <div class="form-field-block">
          <label class="field-label">Status</label>
          <v-select
            v-model="editingEmployee.status"
            placeholder="Select"
            :items="[
              { title: 'Active', value: 'active' },
              { title: 'Inactive', value: 'inactive' },
            ]"
            variant="outlined"
            hide-details
            class="soft-input"
          />
        </div>
        <v-btn
          type="submit"
          class="employee-submit-btn"
          rounded="pill"
          variant="flat"
          :loading="saveEditEmployeeLoading"
          :disabled="saveEditEmployeeLoading"
        >
          Save Changes
        </v-btn>
      </v-form>
    </CrudDialog>

    <!-- Broadcast Message Dialog -->
    <v-dialog v-model="showBroadcastDialog" max-width="520">
      <v-card class="broadcast-card">
        <div class="broadcast-header">
          <div>
            <h3 class="broadcast-title">Send Broadcast Message</h3>
            <p class="broadcast-subtitle">Send a message to your entire team</p>
          </div>
        </div>
        <div class="broadcast-body">
          <textarea
            v-model="broadcastMessage"
            class="broadcast-textarea"
            placeholder="Type a message for your team"
            rows="4"
          />
        </div>
        <div class="broadcast-footer">
          <v-btn
            variant="outlined"
            rounded="pill"
            class="broadcast-cancel-btn"
            @click="closeBroadcast"
          >
            Cancel
          </v-btn>
          <v-btn variant="flat" rounded="pill" class="broadcast-send-btn" @click="closeBroadcast">
            Send
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Confirm Reassign Nutritionist -->
    <v-dialog v-model="showReassignDialog" max-width="420">
      <v-card class="reassign-card">
        <h3 class="reassign-title">Confirm Nutritionist Change</h3>
        <p class="reassign-body">
          You are about to <span class="reassign-highlight">reassign</span>
          <strong> {{ reassignClient?.name }}</strong> from <strong>{{ reassignFrom }}</strong> to
          <strong>{{ reassignTo }}</strong
          >.
        </p>
        <p class="reassign-sub">
          This change will take effect immediately. Do you want to continue?
        </p>
        <div class="reassign-actions">
          <v-btn
            variant="outlined"
            rounded="pill"
            class="reassign-btn"
            :loading="reassignLoading"
            :disabled="reassignLoading"
            @click="confirmReassign"
            >Reassign</v-btn
          >
          <v-btn
            variant="outlined"
            rounded="pill"
            class="reassign-btn"
            :disabled="reassignLoading"
            @click="showReassignDialog = false"
            >Cancel</v-btn
          >
        </div>
      </v-card>
    </v-dialog>

    <!-- Delete Employee Confirmation -->
    <v-dialog v-model="showDeleteEmployeeDialog" max-width="420">
      <v-card class="delete-dialog-card">
        <div class="delete-dialog-header">
          <h3>Delete Employee</h3>
          <v-btn icon variant="text" size="small" @click="showDeleteEmployeeDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <p class="delete-dialog-body">
          This will <strong class="text-error">permanently remove</strong>
          <strong> {{ employeeToDelete?.name }}</strong> from this branch. Are you sure?
        </p>
        <div class="delete-dialog-actions">
          <v-btn variant="text" class="delete-confirm-btn" @click="deleteEmployee"> Delete </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import CrudDialog from '@/components/common/CrudDialog.vue'
import InitialsAvatar from '@/components/common/InitialsAvatar.vue'
import OverviewSettingsMenu from '@/components/common/OverviewSettingsMenu.vue'
import AddEmployeeDialog from '@/components/common/AddEmployeeDialog.vue'
import CreateBranchDialog from '@/components/common/CreateBranchDialog.vue'
import {
  deleteBranch,
  getBranchById,
  getBranchClients,
  getBranches,
  toggleBranchStatus,
  updateBranch,
} from '@/services/branch.service'
import { getClinicById } from '@/services/clinic.service'
import {
  createStaff,
  getEmployees,
  updateEmployeeStatus as updateEmployeeStatusApi,
  updateEmployee as updateEmployeeApi,
} from '@/services/staff.service'
import { assignClientNutritionist } from '@/services/client.service'
import { useSnackbarStore } from '@/stores/snackbar.store'

const route = useRoute()
const router = useRouter()
const snackbar = useSnackbarStore()

const clinicName = ref('Clinic')
const branchName = ref('Branch')
const branchMobile = ref('')
const branchEmail = ref('')
const branchStatus = ref('active')
const branchId = ref('')
const clinicId = ref('')
const isTogglingBranchStatus = ref(false)
const isSubmittingBranch = ref(false)
const isDeletingBranch = ref(false)
const showEditBranchDialog = ref(false)
const showDeleteBranchDialog = ref(false)
const editingBranch = ref(null)

const search = ref('')
const sortMenu = ref(false)
const filterMenu = ref(false)
const selectedSortKey = ref('default')
const selectedStatusFilter = ref('all')
const page = ref(1)
const pageSize = 20

const showAddEmployeeDialog = ref(false)
const addEmployeeLoading = ref(false)
const showDeleteEmployeeDialog = ref(false)
const showEditEmployeeDialog = ref(false)
const showTeamMembersDialog = ref(false)
const showClientsDialog = ref(false)
const employeeToDelete = ref(null)
const editingEmployee = ref(null)

// Team Members dialog state
const tmSearch = ref('')
const tmFilterMenu = ref(false)
const tmSortKey = ref('default')
const tmRoleFilter = ref('all')
const tmStatusFilter = ref('all')
const tmPage = ref(1)
const tmPageSize = 20
const tmSelectedIds = ref([])
const tmViewActive = ref(false)
const showBroadcastDialog = ref(false)
const broadcastMessage = ref('')

// Clients dialog state
const clientSearch = ref('')
const clientSortMenu = ref(false)
const clientFilterMenu = ref(false)
const clientSortKey = ref('default')
const clientNutritionistFilter = ref('')
const clientPage = ref(1)

// Nutritionist filter/dropdown search
const nutritionistFilterSearch = ref('')
const nutritionistDropdownSearch = ref('')

// Reassign dialog
const showReassignDialog = ref(false)
const reassignClient = ref(null)
const reassignFrom = ref('')
const reassignTo = ref('')
const reassignToId = ref('')
const reassignLoading = ref(false)

const allClients = ref([])
const clientsTotal = ref(0)
const clientsLoading = ref(false)
const clientsSkip = ref(0)
const clientsLimit = 20
const clientsHasMore = ref(false)

function mapClient(c) {
  const nutritionistObj = c.assignedNutritionistId
  const nutritionistId =
    nutritionistObj && typeof nutritionistObj === 'object'
      ? String(nutritionistObj._id || nutritionistObj.id || '')
      : nutritionistObj
        ? String(nutritionistObj)
        : ''
  const nutritionistName =
    nutritionistObj && typeof nutritionistObj === 'object'
      ? nutritionistObj.name || 'Unassigned'
      : 'Unassigned'

  return {
    id: c._id || c.id,
    name: c.profile?.fullName || '—',
    nutritionistId,
    nutritionist: nutritionistName,
    lastAppointment: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-GB') : '—',
    status: c.status || 'active',
  }
}

// eslint-disable-next-line complexity
async function fetchBranchClients(reset = false) {
  if (!branchId.value) return
  if (clientsLoading.value) return
  if (!reset && !clientsHasMore.value) return

  if (reset) {
    clientsSkip.value = 0
    allClients.value = []
    clientsHasMore.value = false
  }

  const params = { skip: clientsSkip.value, limit: clientsLimit }
  if (clientSearch.value.trim()) params.search = clientSearch.value.trim()
  if (clientSortKey.value === 'recent') params.sort = 'createdAt-desc'
  else if (clientSortKey.value === 'older') params.sort = 'createdAt-asc'
  else if (clientSortKey.value === 'default') params.sort = 'name-asc'

  clientsLoading.value = true
  /* eslint-disable require-atomic-updates */
  try {
    const response = await getBranchClients(branchId.value, params)
    const items = response?.data ?? []
    const mapped = Array.isArray(items) ? items.map(mapClient) : []

    allClients.value = reset ? mapped : [...allClients.value, ...mapped]
    clientsTotal.value = response?.pagination?.total ?? allClients.value.length
    clientsSkip.value += mapped.length
    clientsHasMore.value = clientsSkip.value < clientsTotal.value
  } catch (err) {
    snackbar.showError(err?.response?.data?.message || err.message || 'Failed to fetch clients')
  } finally {
    clientsLoading.value = false
  }
  /* eslint-enable require-atomic-updates */
}

const debouncedFetchClients = debounce(() => fetchBranchClients(true), 400)

// BRANCH NUTRITIONISTS — for reassignment dropdown
const branchNutritionists = ref([]) // [{ id, name }]
const branchNutritionistsLoading = ref(false)

async function fetchBranchNutritionists() {
  if (!branchId.value) return
  branchNutritionistsLoading.value = true
  try {
    const response = await getEmployees({ branchId: branchId.value, limit: 100 })
    const items = response?.data?.data ?? response?.data ?? []
    const list = Array.isArray(items) ? items : []
    branchNutritionists.value = list
      .filter((e) => {
        const display = String(e?.roleId?.displayName || '').toLowerCase()
        return display === 'nutritionist'
      })
      .map((e) => ({ id: String(e._id || e.id), name: e.name || '—' }))
  } catch {
    branchNutritionists.value = []
  } finally {
    branchNutritionistsLoading.value = false
  }
}

watch(showClientsDialog, (open) => {
  if (open) {
    fetchBranchClients(true)
    fetchBranchNutritionists()
  }
})
watch(clientSearch, debouncedFetchClients)
watch(clientSortKey, () => fetchBranchClients(true))

function onClientsScroll(event) {
  const el = event.target
  if (!el) return
  const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50
  if (nearBottom && clientsHasMore.value && !clientsLoading.value) {
    fetchBranchClients(false)
  }
}

// const employeeForm = ref({
//   name: '',
//   email: '',
//   phone: '',
//   role: null,
// })

const roleOptions = ['Nutritionist', 'Receptionist']

const branchSettingItems = computed(() => [
  { title: 'Edit', value: 'edit' },
  {
    title: branchStatus.value === 'inactive' ? 'Mark as active' : 'Mark as inactive',
    value: 'inactive',
  },
  { title: 'Delete', value: 'delete' },
])

const sortOptions = [
  { key: 'default', label: 'Default' },
  { key: 'name-asc', label: 'Name: Alphabetical' },
  { key: 'role-asc', label: 'Role: Alphabetical' },
  { key: 'status-active', label: 'Status: Active First' },
  { key: 'status-inactive', label: 'Status: Inactive First' },
]

const statusFilterOptions = [
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
]

// Branches of the current clinic — used in Edit Employee dialog branch dropdown
const clinicBranchesForEdit = ref([])
const clinicBranchesLoading = ref(false)

async function fetchClinicBranchesForEdit() {
  const cid = clinicId.value
  if (!cid) return
  clinicBranchesLoading.value = true
  try {
    const response = await getBranches({ clinicId: cid, limit: 100 })
    const items = response?.data ?? response?.branches ?? response ?? []
    clinicBranchesForEdit.value = Array.isArray(items) ? items : []
  } catch {
    clinicBranchesForEdit.value = []
  } finally {
    clinicBranchesLoading.value = false
  }
}

const editEmployeeBranchOptions = computed(() => {
  const list = clinicBranchesForEdit.value
  if (Array.isArray(list) && list.length) {
    return list.map((b) => ({
      title: b.branchName || '—',
      value: String(b._id || b.id || ''),
    }))
  }
  // Fallback: current branch only
  const name = branchName.value || 'Branch'
  return [{ title: name, value: String(branchId.value || '') }]
})

const tmRoleOptions = ['all', 'Nutritionist', 'Admin Team', 'Finance', 'Other']
const tmRoleLabels = {
  all: 'All',
  Nutritionist: 'Nutritionist',
  'Admin Team': 'Admin Team',
  Finance: 'Finance',
  Other: 'Other',
}

const clientSortOptions = [
  { key: 'default', label: 'Alphabetical' },
  { key: 'recent', label: 'Last Appointment: Recent First' },
  { key: 'older', label: 'Last Appointment: Older First' },
]

// Nutritionist options (derived from allClients)
const nutritionistOptions = computed(() => [
  ...new Set(allClients.value.map((c) => c.nutritionist)),
])

const filteredNutritionistOptions = computed(() => {
  const q = nutritionistFilterSearch.value.trim().toLowerCase()
  if (!q) return nutritionistOptions.value
  return nutritionistOptions.value.filter((n) => n.toLowerCase().includes(q))
})

// Filter branch nutritionists list by search input — used in reassignment dropdown
const filteredBranchNutritionists = computed(() => {
  const q = nutritionistDropdownSearch.value.trim().toLowerCase()
  if (!q) return branchNutritionists.value
  return branchNutritionists.value.filter((n) => String(n.name).toLowerCase().includes(q))
})

const filteredTmEmployees = computed(() => {
  const q = tmSearch.value.trim().toLowerCase()
  let rows = allEmployees.value

  if (tmRoleFilter.value !== 'all') {
    rows = rows.filter((e) => e.role === tmRoleFilter.value)
  }
  if (tmStatusFilter.value !== 'all') {
    rows = rows.filter((e) => e.status === tmStatusFilter.value)
  }
  if (q) {
    rows = rows.filter((e) =>
      [e.name, e.role, e.email, e.phone].some((v) => v.toLowerCase().includes(q)),
    )
  }

  const sorted = [...rows]
  switch (tmSortKey.value) {
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'role-asc':
      sorted.sort((a, b) => a.role.localeCompare(b.role))
      break
    case 'status-active':
      sorted.sort((a) => (a.status === 'active' ? -1 : 1))
      break
  }
  return sorted
})

const tmTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTmEmployees.value.length / tmPageSize)),
)
const pagedTmEmployees = computed(() => {
  const start = (tmPage.value - 1) * tmPageSize
  return filteredTmEmployees.value.slice(start, start + tmPageSize)
})

const tmAllSelected = computed(() => {
  const ids = pagedTmEmployees.value.map((e) => e.id)
  return ids.length > 0 && ids.every((id) => tmSelectedIds.value.includes(id))
})
const tmIsIndeterminate = computed(() => {
  const ids = pagedTmEmployees.value.map((e) => e.id)
  const count = ids.filter((id) => tmSelectedIds.value.includes(id)).length
  return count > 0 && count < ids.length
})

function selectTmRole(role) {
  tmRoleFilter.value = role
  tmPage.value = 1
}

function selectTmStatusFilter(key) {
  tmStatusFilter.value = tmStatusFilter.value === key ? 'all' : key
  tmFilterMenu.value = false
  tmPage.value = 1
}

function toggleTmSelect(id) {
  const idx = tmSelectedIds.value.indexOf(id)
  if (idx === -1) tmSelectedIds.value.push(id)
  else tmSelectedIds.value.splice(idx, 1)
}

function toggleTmSelectAll() {
  const ids = pagedTmEmployees.value.map((e) => e.id)
  if (tmAllSelected.value) {
    tmSelectedIds.value = tmSelectedIds.value.filter((id) => !ids.includes(id))
  } else {
    ids.forEach((id) => {
      if (!tmSelectedIds.value.includes(id)) tmSelectedIds.value.push(id)
    })
  }
}

function bulkMarkTmInactive() {
  tmSelectedIds.value.forEach((id) => {
    const emp = allEmployees.value.find((e) => e.id === id)
    if (emp) emp.status = 'inactive'
  })
  tmSelectedIds.value = []
}

function confirmBulkDeleteTm() {
  allEmployees.value = allEmployees.value.filter((e) => !tmSelectedIds.value.includes(e.id))
  tmSelectedIds.value = []
}

function selectClientSort(key) {
  clientSortKey.value = key
  clientSortMenu.value = false
}

// function selectClientStatusFilter(key) {
//   clientStatusFilter.value = clientStatusFilter.value === key ? 'all' : key
//   clientFilterMenu.value = false
// }

function selectClientNutritionistFilter(name) {
  clientNutritionistFilter.value = clientNutritionistFilter.value === name ? '' : name
  clientFilterMenu.value = false
  clientPage.value = 1
}

function onNutritionistSelect(client, nutritionist) {
  // Backward compatible: support either an object { id, name } or a plain string
  const newId = typeof nutritionist === 'object' ? String(nutritionist.id || '') : ''
  const newName =
    typeof nutritionist === 'object' ? String(nutritionist.name || '') : String(nutritionist || '')
  if (newId && client.nutritionistId === newId) return
  if (!newId && client.nutritionist === newName) return
  reassignClient.value = client
  reassignFrom.value = client.nutritionist
  reassignTo.value = newName
  reassignToId.value = newId
  showReassignDialog.value = true
}

async function confirmReassign() {
  const targetClient = reassignClient.value
  if (!targetClient) {
    showReassignDialog.value = false
    return
  }
  const targetName = reassignTo.value
  const targetId = reassignToId.value
  // No id (legacy string path) → fall back to local-only update to preserve existing behavior
  if (!targetId) {
    targetClient.nutritionist = targetName
    showReassignDialog.value = false
    reassignClient.value = null
    reassignFrom.value = ''
    reassignTo.value = ''
    reassignToId.value = ''
    return
  }
  reassignLoading.value = true
  try {
    await assignClientNutritionist(targetClient.id, targetId)
    /* eslint-disable require-atomic-updates */
    targetClient.nutritionist = targetName
    targetClient.nutritionistId = targetId
    snackbar.showSuccess('Nutritionist reassigned successfully')
    showReassignDialog.value = false
    reassignClient.value = null
    reassignFrom.value = ''
    reassignTo.value = ''
    reassignToId.value = ''
    /* eslint-enable require-atomic-updates */
  } catch (err) {
    snackbar.showError(
      err?.response?.data?.message || err.message || 'Failed to reassign nutritionist',
    )
  } finally {
    reassignLoading.value = false
  }
}

function closeBroadcast() {
  showBroadcastDialog.value = false
  broadcastMessage.value = ''
}

const allEmployees = ref([])
const employeesTotal = ref(0)
const employeesLoading = ref(false)

const clientCount = ref(0)
const employeeCount = ref(0)

const selectedSortLabel = computed(() => {
  return sortOptions.find((o) => o.key === selectedSortKey.value)?.label || 'Default'
})

const filteredEmployees = computed(() => {
  const query = search.value.trim().toLowerCase()
  let rows = allEmployees.value

  if (query) {
    rows = rows.filter((e) =>
      [e.name, e.role, e.status].some((v) => String(v).toLowerCase().includes(query)),
    )
  }

  if (selectedStatusFilter.value !== 'all') {
    rows = rows.filter((e) => e.status === selectedStatusFilter.value)
  }

  return rows
})

const displayedEmployees = computed(() => {
  const rows = [...filteredEmployees.value]
  switch (selectedSortKey.value) {
    case 'name-asc':
      return rows.sort((a, b) => a.name.localeCompare(b.name))
    case 'role-asc':
      return rows.sort((a, b) => a.role.localeCompare(b.role))
    case 'status-active':
      return rows.sort((a) => (a.status === 'active' ? -1 : 1))
    case 'status-inactive':
      return rows.sort((a) => (a.status === 'inactive' ? -1 : 1))
    default:
      return rows
  }
})

const totalPages = computed(() => Math.max(1, Math.ceil(employeesTotal.value / pageSize)))

function selectSort(key) {
  selectedSortKey.value = key
  sortMenu.value = false
  page.value = 1
  fetchEmployees()
}

function selectStatusFilter(key) {
  selectedStatusFilter.value = selectedStatusFilter.value === key ? 'all' : key
  filterMenu.value = false
  page.value = 1
  fetchEmployees()
}

async function handleBranchSetting(item) {
  if (item.value === 'edit') {
    if (!editingBranch.value) return
    showEditBranchDialog.value = true
  } else if (item.value === 'inactive') {
    await handleToggleBranchStatus()
  } else if (item.value === 'delete') {
    showDeleteBranchDialog.value = true
  }
}

async function handleToggleBranchStatus() {
  if (!branchId.value || isTogglingBranchStatus.value) return
  const currentBranchId = branchId.value

  isTogglingBranchStatus.value = true
  try {
    const response = await toggleBranchStatus(currentBranchId)

    if (response?.data?.status) {
      branchStatus.value = response.data.status
    }
  } catch (error) {
    console.error('Failed to toggle branch status:', error)
    alert(error?.response?.data?.message || error?.message || 'Failed to update branch status')
  } finally {
    // eslint-disable-next-line require-atomic-updates
    isTogglingBranchStatus.value = false
  }
}

async function submitEditBranch(data) {
  if (!branchId.value) return
  isSubmittingBranch.value = true
  try {
    const resolvedClinicId =
      clinicId.value ||
      String(route.params.clinicId || '').trim() ||
      getObjectId(editingBranch.value?.clinicId)

    await updateBranch(branchId.value, {
      ...data,
      clinicId: resolvedClinicId,
    })

    showEditBranchDialog.value = false
    await loadBranchContext()
  } catch (error) {
    console.error('Failed to update branch:', error)
    alert(error?.response?.data?.message || error?.message || 'Failed to update branch')
  } finally {
    isSubmittingBranch.value = false
  }
}

async function confirmDeleteBranch() {
  if (!branchId.value) return
  isDeletingBranch.value = true
  try {
    await deleteBranch(branchId.value)
    showDeleteBranchDialog.value = false
    const targetClinicId = clinicId.value || String(route.params.clinicId || '').trim()
    if (targetClinicId) {
      router.push(`/super-admin/clinics?Id=${targetClinicId}`)
    } else {
      router.push('/super-admin/clinics')
    }
  } catch (error) {
    console.error('Failed to delete branch:', error)
    alert(error?.response?.data?.message || error?.message || 'Failed to delete branch')
  } finally {
    isDeletingBranch.value = false
  }
}

const saveEditEmployeeLoading = ref(false)

function editEmployee(employee) {
  // Strip "+91 " prefix from displayed phone so input box only shows digits
  const rawPhone = String(employee.phone || '').replace(/\D/g, '')
  // For branch dropdown — pre-select current branch (the one being viewed)
  const initialBranch = String(branchId.value || '')
  editingEmployee.value = {
    ...employee,
    phone: rawPhone,
    branch: initialBranch,
    email: employee.email && employee.email !== '—' ? employee.email : '',
  }
  showEditEmployeeDialog.value = true
  // Fetch clinic branches for the dropdown if not already loaded
  if (!clinicBranchesForEdit.value.length) {
    fetchClinicBranchesForEdit()
  }
}

// eslint-disable-next-line complexity
async function saveEditEmployee() {
  if (!editingEmployee.value?.id) return
  const data = editingEmployee.value
  const payload = {}
  if (data.name !== undefined && String(data.name).trim() !== '')
    payload.name = String(data.name).trim()
  if (data.email !== undefined) payload.email = String(data.email).trim()
  if (data.phone !== undefined && String(data.phone).trim() !== '') {
    payload.phone = String(data.phone).replace(/\D/g, '')
  }
  if (data.role !== undefined && String(data.role).trim() !== '') payload.roleName = data.role
  if (data.branch !== undefined && data.branch !== '') payload.branchId = data.branch
  if (data.status !== undefined) payload.status = data.status

  saveEditEmployeeLoading.value = true
  try {
    await updateEmployeeApi(data.id, payload)
    snackbar.showSuccess('Employee updated successfully')
    showEditEmployeeDialog.value = false
    await fetchEmployees()
  } catch (err) {
    snackbar.showError(err?.response?.data?.message || err.message || 'Failed to update employee')
  } finally {
    saveEditEmployeeLoading.value = false
  }
}

async function toggleEmployeeStatus(employee) {
  const nextStatus = employee.status === 'active' ? 'inactive' : 'active'
  const previousStatus = employee.status
  employee.status = nextStatus
  try {
    await updateEmployeeStatusApi(employee.id, nextStatus)
    snackbar.showSuccess(`Employee marked ${nextStatus}`)
  } catch (err) {
    // eslint-disable-next-line require-atomic-updates
    employee.status = previousStatus
    snackbar.showError(
      err?.response?.data?.message || err.message || 'Failed to update employee status',
    )
  }
}

function confirmDeleteEmployee(employee) {
  employeeToDelete.value = employee
  showDeleteEmployeeDialog.value = true
}

function deleteEmployee() {
  if (employeeToDelete.value) {
    allEmployees.value = allEmployees.value.filter((e) => e.id !== employeeToDelete.value.id)
  }
  showDeleteEmployeeDialog.value = false
  employeeToDelete.value = null
}

async function submitEmployee(data) {
  if (!data?.name) return
  addEmployeeLoading.value = true
  try {
    await createStaff({
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      roleName: data.role,
      clinicId: clinicId.value,
      branchId: branchId.value,
    })
    snackbar.showSuccess('Employee added successfully')
    showAddEmployeeDialog.value = false
    await fetchEmployees()
  } catch (err) {
    snackbar.showError(err?.response?.data?.message || err.message || 'Failed to add employee')
  } finally {
    addEmployeeLoading.value = false
  }
}

function mapEmployee(e) {
  return {
    id: e._id || e.id,
    name: e.name || '—',
    role: e.roleId?.displayName || '—',
    email: e.email || '—',
    phone: e.phone ? `+91 ${String(e.phone)}` : '—',
    joinedDate: e.createdAt
      ? new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : '—',
    status: e.status || 'active',
  }
}

// eslint-disable-next-line complexity
async function fetchEmployees() {
  if (!branchId.value) return

  const skip = (page.value - 1) * pageSize
  const params = { branchId: branchId.value, skip, limit: pageSize }

  if (search.value.trim()) params.search = search.value.trim()

  if (selectedStatusFilter.value === 'active' || selectedStatusFilter.value === 'inactive') {
    params.status = selectedStatusFilter.value
  }

  const serverSortKeys = { 'name-asc': 'name-asc', 'name-desc': 'name-desc' }
  if (serverSortKeys[selectedSortKey.value]) params.sort = serverSortKeys[selectedSortKey.value]

  employeesLoading.value = true
  try {
    const response = await getEmployees(params)
    const items = response.data?.data ?? response.data ?? []
    allEmployees.value = Array.isArray(items) ? items.map(mapEmployee) : []
    employeesTotal.value = response.data?.pagination?.total ?? allEmployees.value.length
    employeeCount.value = response.data?.summary?.totalEmployees ?? employeesTotal.value
    clientCount.value = response.data?.summary?.totalClients ?? clientCount.value
  } catch (err) {
    snackbar.showError(err?.response?.data?.message || err.message || 'Failed to fetch employees')
  } finally {
    employeesLoading.value = false
  }
}

function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const debouncedFetchEmployees = debounce(() => {
  page.value = 1
  fetchEmployees()
}, 400)

watch(search, debouncedFetchEmployees)
watch(page, () => fetchEmployees())
watch(branchId, (id) => {
  if (id) fetchEmployees()
})

onMounted(() => {
  loadBranchContext()
})

async function loadBranchContext() {
  const routeBranchId = String(route.params.branchId || '').trim()
  const routeClinicId = String(route.params.clinicId || '').trim()
  branchId.value = routeBranchId
  clinicId.value = routeClinicId

  try {
    if (routeBranchId) {
      await loadBranchData(routeBranchId, routeClinicId)
    } else if (routeClinicId) {
      await loadClinicNameOnly(routeClinicId)
    }
  } catch (error) {
    console.error('Failed to load branch context:', error)
  }
}

async function loadBranchData(fetchBranchId, routeClinicId) {
  const branchResponse = await getBranchById(fetchBranchId)
  const branch = branchResponse?.data || {}
  const localBranchName = branch.branchName || branchName.value
  const localBranchMobile = branch.phone ? String(branch.phone) : ''
  const localBranchEmail = branch.email || ''
  const localBranchStatus = branch.status || 'active'
  const resolvedClinicId = getObjectId(branch.clinicId)

  editingBranch.value = branch
  branchName.value = localBranchName
  branchMobile.value = localBranchMobile
  branchEmail.value = localBranchEmail
  branchStatus.value = localBranchStatus
  if (resolvedClinicId) {
    clinicId.value = resolvedClinicId
  }

  if (!routeClinicId && resolvedClinicId) {
    await loadClinicNameOnly(resolvedClinicId)
  }
}

async function loadClinicNameOnly(fetchClinicId) {
  const clinicResponse = await getClinicById(fetchClinicId)
  const clinic = clinicResponse?.data || {}
  const localClinicName = clinic.name || clinicName.value
  clinicName.value = localClinicName
}

function getObjectId(value) {
  if (!value) return ''
  if (typeof value === 'object' && value._id) return String(value._id)
  return String(value)
}
</script>

<style scoped>
.branch-dashboard {
  background: #fbfbfd;
}

.action-btn-outline {
  border-color: #d8a4cb;
  color: #8e3f7a;
  font-weight: 500;
  text-transform: none;
}

.action-btn-filled {
  background: #c96db0;
  color: #fff;
  font-weight: 500;
  text-transform: none;
}

.branch-profile-card {
  border: 1px solid #eaedf5;
  border-radius: 16px;
  padding: 20px 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  height: 100%;
}

.profile-avatar-wrap {
  margin-bottom: 4px;
}

.profile-name {
  font-size: 18px;
  font-weight: 700;
  color: #2e3442;
  text-align: center;
}

.profile-info-grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.profile-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 13px;
}

.info-label {
  color: #8e93a0;
  font-weight: 400;
}

.info-value {
  color: #2e3442;
  font-weight: 500;
}

.stat-card {
  border: 1px solid #eaedf5;
  border-radius: 16px;
  padding: 20px 24px;
  background: #fff;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 40px;
  font-weight: 700;
}

.text-green {
  color: #5ca85c;
}

.text-peach {
  color: #e07a5f;
}

.employee-list-card {
  border-radius: 16px;
  padding: 10px;
}

.employee-list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0px;
  gap: 12px;
}

.search-input {
  min-width: 260px;
}

.search-input :deep(.v-field) {
  border-radius: 20px;
}

.round-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #d8dee8;
  border-radius: 50%;
  min-width: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-btn {
  color: #8f98a8;
}

.sort-chip-btn {
  border: 1px solid #e7b6d7;
  border-radius: 18px;
  min-height: 34px;
  height: 34px;
  min-width: 34px;
  padding: 0 10px;
  color: #be5da1;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.sort-chip-label {
  font-size: 12px;
}

.employee-table :deep(thead th) {
  background: #f2f3f7;
  color: #4d5360;
  font-weight: 600;
  font-size: 13px;
}

.employee-table :deep(tbody tr:hover) {
  background: #fafbfd;
}

.status-chip {
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #eef4d0;
  color: #5f880d;
  font-size: 14px;
  border-radius: 16px;
  padding: 4px 8px;
}

.status-inactive {
  background: #f3f4f6;
  color: #6b7280;
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

.dialog-subtitle {
  color: #8a919d;
  font-size: 13px;
  margin-bottom: 14px;
}

/* Team Members & Clients dialogs */
.modal-card {
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 12px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d3440;
}

.modal-tabs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 20px 12px;
  border-bottom: 1px solid #f0f1f5;
}

.modal-toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.modal-toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tm-search-container {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e2e4ec;
  border-radius: 20px;
  padding: 5px 12px;
  background: #fff;
  min-width: 200px;
}

.tm-search-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

.tm-search-input {
  border: none;
  outline: none;
  font-size: 13px;
  color: #3a4252;
  background: transparent;
  width: 100%;
}

.tm-search-input::placeholder {
  color: #b0b7c3;
}

.tm-view-btn-active {
  border: 1.5px solid #e879a8 !important;
  color: #c44d9b !important;
}

/* Broadcast dialog */
.broadcast-card {
  border-radius: 16px !important;
  padding: 28px 28px 24px;
}

.broadcast-header {
  margin-bottom: 16px;
}

.broadcast-title {
  font-size: 18px;
  font-weight: 700;
  color: #2d3440;
  margin: 0 0 4px;
}

.broadcast-subtitle {
  font-size: 13px;
  color: #8e93a0;
  margin: 0;
}

.broadcast-body {
  margin-bottom: 24px;
}

.broadcast-textarea {
  width: 100%;
  border: 1px solid #e2e4ec;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 14px;
  color: #3a4252;
  background: #f9fafb;
  resize: none;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.broadcast-textarea::placeholder {
  color: #b0b7c3;
}

.broadcast-textarea:focus {
  border-color: #d87abf;
  background: #fff;
}

.broadcast-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.broadcast-cancel-btn {
  border-color: #e2e4ec !important;
  color: #3a4252 !important;
  font-weight: 500;
}

.broadcast-send-btn {
  background: linear-gradient(135deg, #e879a8, #c44d9b) !important;
  color: #fff !important;
  font-weight: 500;
}

.modal-search-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f1f5;
}

.client-search-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.client-search-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e2e4ec;
  border-radius: 24px;
  padding: 7px 16px;
  background: #fff;
  min-width: 260px;
}

.client-search-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

.client-search-input {
  border: none;
  outline: none;
  font-size: 13px;
  color: #3a4252;
  background: transparent;
  width: 100%;
}

.client-search-input::placeholder {
  color: #b0b7c3;
}

.client-icon-btn {
  width: 36px;
  height: 36px;
  border: 1.5px solid #d8dee8;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #9ca3af;
  flex-shrink: 0;
  transition:
    border-color 0.15s,
    color 0.15s;
}

.client-icon-btn:hover {
  border-color: #c44d9b;
  color: #c44d9b;
}

.client-icon-btn-active {
  border-color: #c44d9b !important;
  color: #c44d9b !important;
  background: #fdf4fb;
}

.role-tab {
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7180;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}

.role-tab:hover {
  background: #f4f5f8;
}

.role-tab-active {
  background: #f3ddef;
  color: #b13c92;
}

.modal-table-scroll {
  max-height: 60vh;
  overflow-y: auto;
}

.modal-table {
  width: 100%;
}

.modal-table thead th {
  background: #f2f3f7;
  color: #4d5360;
  font-size: 13px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid #f0f1f5;
}

/* Team Members card grid */
.tm-multiselect-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px 4px;
  border-bottom: 1px solid #f0f1f5;
}

.tm-select-all-cb {
  flex-shrink: 0;
}

.tm-bulk-btn {
  padding: 5px 14px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  background: #fff;
  font-size: 13px;
  color: #3a4252;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.tm-bulk-btn:hover:not(:disabled) {
  background: #f5f6fa;
  border-color: #adb5c4;
}

.tm-bulk-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tm-member-card.tm-selected {
  border-color: #e879a8;
  box-shadow: 0 0 0 1.5px #e879a8;
  cursor: pointer;
}

.tm-card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px 20px;
  max-height: 480px;
  overflow-y: auto;
}

.tm-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #8e93a0;
  font-size: 14px;
}

.tm-member-card {
  border: 1px solid #f8f8f8;
  border-radius: 14px;
  padding: 14px;
  background: #fbfbfb;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: start;
}
.tm-member-card .status-chip {
  border-radius: 8px;
}

.tm-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-right: 20px;
  position: relative;
  width: 100%;
}
.tm-card-header .tm-dots {
  position: absolute;
  right: 0;
  top: 0px;
  color: #8a919d;
  flex-shrink: 0;
}

.tm-name {
  font-size: 20px;
  font-weight: 500;
  color: #272727;
  line-height: 1.3;
  letter-spacing: 0.1px;
}

.tm-role {
  font-size: 16px;
  color: #6d6d6d;
  margin-top: 1px;
  letter-spacing: 0.1px;
}

.tm-joined {
  font-size: 14px;
  color: #bebebe;
  line-height: 20px;
  margin: 0;
}

.tm-contact {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tm-contact-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #929292;
  word-break: break-all;
}

.tm-contact-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

@media (max-width: 700px) {
  .tm-card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .tm-card-grid {
    grid-template-columns: 1fr;
  }
}

.nutritionist-cell {
  display: inline-flex;
  align-items: center;
  color: #3a4252;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 12px;
  border: 1px solid #e4e6f0;
  border-radius: 20px;
  background: #fff;
  gap: 4px;
  transition: border-color 0.15s;
}

.nutritionist-cell:hover {
  border-color: #c44d9b;
}

/* Nutritionist inline dropdown */
.nutritionist-dropdown {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(23, 29, 42, 0.12);
  border: 1px solid #e7e9ef;
  min-width: 200px;
  padding: 8px 0 6px;
  overflow: hidden;
}

.nd-search {
  width: calc(100% - 24px);
  margin: 0 12px 6px;
  padding: 7px 12px;
  border: 1px solid #e4e6f0;
  border-radius: 20px;
  font-size: 13px;
  outline: none;
  color: #3a4252;
  display: block;
}

.nd-search::placeholder {
  color: #b8bfc9;
}

.nd-option {
  padding: 8px 18px;
  font-size: 13px;
  color: #3a4252;
  cursor: pointer;
  transition: background 0.1s;
}

.nd-option:hover {
  background: #fdf0fa;
}

.nd-option-current {
  font-weight: 600;
  color: #b13c92;
}

.nd-empty {
  padding: 8px 18px;
  font-size: 12px;
  color: #b8bfc9;
}

/* Nutritionist filter panel */
.nutritionist-filter-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(23, 29, 42, 0.12);
  border: 1px solid #e7e9ef;
  min-width: 200px;
  padding: 0 0 8px;
  overflow: hidden;
}

.nf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
  border-bottom: 1px solid #f0f1f5;
}

.nf-title {
  font-size: 13px;
  font-weight: 600;
  color: #3a4252;
}

.nf-chevron {
  color: #9ca3af;
}

.nf-search-row {
  padding: 8px 12px 4px;
}

.nf-search-input {
  width: 100%;
  padding: 7px 12px;
  border: 1px solid #e4e6f0;
  border-radius: 20px;
  font-size: 13px;
  outline: none;
  color: #3a4252;
  box-sizing: border-box;
}

.nf-search-input::placeholder {
  color: #b8bfc9;
}

.nf-list {
  max-height: 180px;
  overflow-y: auto;
}

.nf-option {
  padding: 8px 18px;
  font-size: 13px;
  color: #3a4252;
  cursor: pointer;
  transition: background 0.1s;
}

.nf-option:hover {
  background: #fdf0fa;
}

.nf-option-active {
  font-weight: 600;
  color: #b13c92;
}

.nf-empty {
  padding: 8px 18px;
  font-size: 12px;
  color: #b8bfc9;
}

/* Reassign confirmation dialog */
.reassign-card {
  border-radius: 16px !important;
  padding: 28px 28px 20px;
}

.reassign-title {
  font-size: 17px;
  font-weight: 700;
  color: #1f2430;
  margin: 0 0 14px;
}

.reassign-body {
  font-size: 14px;
  color: #3a4252;
  margin: 0 0 6px;
  line-height: 1.6;
}

.reassign-highlight {
  color: #b13c92;
  font-weight: 600;
}

.reassign-sub {
  font-size: 13px;
  color: #8e93a0;
  margin: 0 0 20px;
}

.reassign-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.reassign-btn {
  border-color: #e4e6f0 !important;
  color: #3a4252 !important;
  font-size: 13px !important;
  padding: 0 20px !important;
}

.clickable-stat {
  cursor: pointer;
  transition: box-shadow 0.15s;
}

.clickable-stat:hover {
  box-shadow: 0 4px 16px rgba(180, 60, 150, 0.12) !important;
}

.menu-list {
  border: 1px solid #e7e9ef;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(23, 29, 42, 0.1);
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  font-size: 13px;
  color: #6b7280;
  border-top: 1px solid #eaedf5;
}

.page-label {
  font-size: 13px;
  color: #4d5360;
  min-width: 36px;
  text-align: center;
}

/* Employee Dialog */
.dialog-subtitle {
  font-size: 13px;
  color: #8e93a0;
  margin-bottom: 16px;
}

.employee-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.phone-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.phone-code {
  min-width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f0f1f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #2e3442;
}

.phone-input {
  flex: 1;
}

.employee-submit-btn {
  background: #c96db0;
  color: #fff;
  width: 100%;
  height: 48px;
  margin-top: 8px;
  text-transform: none;
  font-size: 15px;
}

/* Delete Dialog */
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
