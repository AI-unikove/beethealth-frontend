<template>
  <CrudDialog
    :model-value="modelValue"
    title="Add Employee"
    max-width="640"
    :show-footer="false"
    :show-header-close="true"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="dialog-subtitle">Add a new employee and manage their role and permissions.</div>

    <v-form class="dialog-form" @submit.prevent="handleSubmit">
      <!-- Choose Clinic — Super Admin only -->
      <div v-if="showClinic" class="form-field-block">
        <label class="field-label">Choose Clinic</label>
        <v-select
          v-model="form.clinic"
          placeholder="Select"
          :items="clinicOptions"
          variant="outlined"
          hide-details
          class="soft-input"
        />
      </div>

      <div class="form-field-block">
        <label class="field-label">Name</label>
        <v-text-field
          v-model="form.name"
          placeholder="Name"
          variant="outlined"
          hide-details
          class="soft-input"
        />
      </div>

      <div class="form-field-block">
        <label class="field-label">Email</label>
        <v-text-field
          v-model="form.email"
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
            v-model="form.phone"
            placeholder="Mobile number"
            variant="outlined"
            hide-details
            class="soft-input phone-input"
          />
        </div>
      </div>

      <!-- Branch — hidden on BranchDashboard -->
      <div v-if="showBranch" class="form-field-block">
        <label class="field-label">Branch</label>
        <v-select
          v-model="form.branch"
          placeholder="Select"
          :items="localBranchOptions"
          :disabled="showClinic && !form.clinic"
          variant="outlined"
          hide-details
          class="soft-input"
        />
      </div>

      <div class="form-field-block">
        <label class="field-label">Role</label>
        <v-select
          v-model="form.role"
          placeholder="Select"
          :items="roleOptions"
          variant="outlined"
          hide-details
          class="soft-input"
        />
      </div>

      <v-btn
        type="submit"
        class="dialog-submit-btn"
        rounded="pill"
        variant="flat"
        :loading="loading"
      >
        Add Employee
      </v-btn>
    </v-form>
  </CrudDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getBranches } from '@/services/branch.service'
import CrudDialog from './CrudDialog.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  showClinic: { type: Boolean, default: false },
  showBranch: { type: Boolean, default: true },
  clinicOptions: { type: Array, default: () => [] },
  branchOptions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const roleOptions = ['Dietitian', 'Nutritionist', 'Coach', 'Manager']

const defaultForm = () => ({
  clinic: null,
  name: '',
  email: '',
  phone: '',
  branch: null,
  role: null,
})

const form = ref(defaultForm())

const localBranchOptions = ref([])

watch(
  () => form.value.clinic,
  async (newClinicId) => {
    form.value.branch = null
    localBranchOptions.value = []
    if (newClinicId) {
      try {
        const response = await getBranches({ clinicId: newClinicId, limit: 1000 })
        const branches = response.data || []
        localBranchOptions.value = branches.map((b) => ({
          title: b.branchName || b.branch || '—',
          value: b._id || b.id,
        }))
      } catch (err) {
        console.error('Failed to load branches', err)
      }
    }
  },
)

// Fallback to prop if not using showClinic
watch(
  () => props.branchOptions,
  (val) => {
    if (!props.showClinic) {
      localBranchOptions.value = val
    }
  },
  { immediate: true },
)

watch(
  () => props.modelValue,
  (val) => {
    if (val) form.value = defaultForm()
  },
)

function handleSubmit() {
  emit('submit', { ...form.value })
  emit('update:modelValue', false)
}
</script>

<style scoped>
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
  font-size: 14px;
  font-weight: 500;
  color: #333;
  padding: 10px 14px;
  border-radius: 18px;
  background: #f8f8fb;
  white-space: nowrap;
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
