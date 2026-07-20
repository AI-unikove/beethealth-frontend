<template>
  <CrudDialog
    :model-value="modelValue"
    :title="title"
    max-width="640"
    :show-footer="false"
    :show-header-close="true"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="dialog-subtitle">
      {{ dialogSubtitle }}
    </div>

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
        <label class="field-label">Branch Name</label>
        <v-text-field
          v-model="form.branchName"
          placeholder="Name"
          variant="outlined"
          hide-details
          class="soft-input"
        />
      </div>

      <div class="form-field-block">
        <label class="field-label">Address</label>
        <label class="field-label field-label-sub">Building, Street</label>
        <v-text-field
          v-model="form.address"
          placeholder="Building, street name"
          variant="outlined"
          hide-details
          class="soft-input"
        />
      </div>

      <div class="form-field-block">
        <label class="field-label">Area</label>
        <v-text-field
          v-model="form.area"
          placeholder="Area name"
          variant="outlined"
          hide-details
          class="soft-input"
        />
      </div>

      <div class="form-field-block">
        <label class="field-label">Postal Code</label>
        <v-text-field
          v-model="form.postalCode"
          placeholder="Postal code"
          variant="outlined"
          hide-details
          class="soft-input"
        />
      </div>

      <div class="form-field-block">
        <label class="field-label">City</label>
        <v-text-field
          v-model="form.city"
          placeholder="City name"
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

      <v-btn
        type="submit"
        class="dialog-submit-btn"
        rounded="pill"
        variant="flat"
        :loading="loading"
      >
        {{ submitLabel }}
      </v-btn>
    </v-form>
  </CrudDialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import CrudDialog from './CrudDialog.vue'

const props = defineProps({
  title: { type: String, default: 'Create New Branch' },
  submitLabel: { type: String, default: 'Create Branch' },
  subtitle: { type: String, default: '' },
  modelValue: { type: Boolean, default: false },
  showClinic: { type: Boolean, default: false },
  clinicOptions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  initialData: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const defaultForm = () => ({
  clinic: null,
  branchName: '',
  address: '',
  area: '',
  postalCode: '',
  city: '',
  phone: '',
  email: '',
})

const form = ref(defaultForm())

const dialogSubtitle = computed(() => {
  if (props.subtitle) return props.subtitle
  return String(props.title).toLowerCase().includes('edit')
    ? 'Update branch details to keep location, team, and contact information accurate.'
    : 'Add a new branch to your dashboard and manage locations, teams, and clients all in one place.'
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.value = props.initialData ? { ...defaultForm(), ...props.initialData } : defaultForm()
    }
  },
)

function handleSubmit() {
  emit('submit', { ...form.value })
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

.field-label-sub {
  font-weight: 400;
  color: #8a919d;
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
