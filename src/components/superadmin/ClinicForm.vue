<template>
  <v-form ref="formRef" class="clinic-form" @submit.prevent="submitForm">
    <div class="form-field-block">
      <label class="field-label">Clinic Name</label>
      <v-text-field
        v-model="form.name"
        placeholder="Name"
        variant="outlined"
        :rules="rules.name"
        class="clinic-input"
        required
      />
    </div>

    <div class="form-field-block">
      <label class="field-label">Clinic Logo</label>
      <input
        ref="fileInput"
        type="file"
        class="visually-hidden"
        accept="image/*"
        @change="onFileSelected"
      />
      <button type="button" class="upload-dropzone" @click="triggerUpload">
        <v-icon size="34" color="#d2d4da">mdi-cloud-upload-outline</v-icon>
        <span class="upload-label">Add file</span>
        <span v-if="selectedFileName" class="upload-file-name">{{ selectedFileName }}</span>
      </button>
    </div>

    <div class="form-field-block">
      <label class="field-label">Tagline</label>
      <v-text-field
        v-model="form.tagline"
        placeholder="Tagline"
        variant="outlined"
        hide-details="auto"
        class="clinic-input"
      />
    </div>

    <div class="form-field-block">
      <label class="field-label">Phone Number</label>
      <div class="phone-input-row">
        <div class="phone-code">+91</div>
        <v-text-field
          v-model="form.clinicMobileNumber"
          placeholder="Mobile number"
          variant="outlined"
          :rules="rules.mobile"
          class="clinic-input phone-input"
          type="tel"
          required
        />
      </div>
    </div>

    <div class="form-field-block">
      <label class="field-label">Email</label>
      <v-text-field
        v-model="form.clinicEmail"
        placeholder="hustonhealth@gmail.com"
        variant="outlined"
        :rules="rules.email"
        class="clinic-input"
        type="email"
        required
      />
    </div>
    <div class="paymentWrap">
      <div class="payment-section-label">Payment Details</div>

      <div class="form-field-block">
        <label class="field-label">GST Number</label>
        <v-text-field
          v-model="form.gstNumber"
          placeholder="GSTINXXXXXXXX"
          variant="outlined"
          :rules="rules.gstNumber"
          hide-details="auto"
          class="clinic-input"
        />
      </div>

      <div class="form-field-block">
        <label class="field-label">Bank Name</label>
        <v-text-field
          v-model="form.bankName"
          placeholder="XYZ Bank"
          variant="outlined"
          hide-details="auto"
          class="clinic-input"
        />
      </div>

      <div class="form-field-block">
        <label class="field-label">Account Number</label>
        <v-text-field
          v-model="form.accountNumber"
          placeholder="*********3182"
          variant="outlined"
          :rules="rules.accountNumber"
          hide-details="auto"
          class="clinic-input"
        />
      </div>

      <div class="form-field-block">
        <label class="field-label">Pan Number</label>
        <v-text-field
          v-model="form.panNumber"
          placeholder="AGDNEF8238"
          variant="outlined"
          :rules="rules.panNumber"
          hide-details="auto"
          class="clinic-input"
        />
      </div>
    </div>
    <div class="form-actions">
      <button class="button" type="submit" :loading="loading" :disabled="loading">
        <b>{{ submitLabel }}</b>
      </button>
    </div>
  </v-form>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    default: 'Create Clinic',
  },
  submitLabel: {
    type: String,
    default: 'Save',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])
const formRef = ref(null)
const fileInput = ref(null)
const selectedFileName = ref('')

const form = reactive({
  name: '',
  clinicLogo: '',
  tagline: '',
  clinicMobileNumber: '',
  clinicEmail: '',
  gstNumber: '',
  bankName: '',
  accountNumber: '',
  panNumber: '',
})

const required = (fieldName) => (value) => {
  if (String(value || '').trim()) return true
  return `${fieldName} is required`
}

const rules = {
  name: [
    required('Clinic name'),
    (value) =>
      String(value || '').trim().length >= 2 || 'Clinic name must be at least 2 characters',
  ],
  mobile: [
    required('Phone number'),
    (value) =>
      String(value || '').replace(/\D/g, '').length === 10 || 'Enter a valid 10 digit phone number',
  ],
  email: [
    required('Email'),
    (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim()) ||
      'Enter a valid email address',
  ],
  gstNumber: [
    (value) =>
      !String(value || '').trim() ||
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(String(value).trim()) ||
      'Enter a valid GST number',
  ],
  accountNumber: [
    (value) =>
      !String(value || '').trim() ||
      /^\d{9,18}$/.test(String(value).trim()) ||
      'Enter a valid account number',
  ],
  panNumber: [
    (value) =>
      !String(value || '').trim() ||
      /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(String(value).trim()) ||
      'Enter a valid PAN number',
  ],
}

function applyInitialData(data = {}) {
  form.name = data.name || ''
  form.clinicLogo = data.clinicLogo || ''
  form.tagline = data.clinicBio || data.tagline || ''
  form.clinicMobileNumber = String(data.clinicMobileNumber || '')
  form.clinicEmail = data.clinicEmail || ''
  form.gstNumber = data.gstNumber || ''
  form.bankName = data.bankName || ''
  form.accountNumber = data.accountNumber || ''
  form.panNumber = data.panNumber || ''
  selectedFileName.value = data.clinicLogo || ''
}

watch(
  () => props.initialData,
  (value) => {
    applyInitialData(value)
    if (formRef.value) {
      formRef.value.resetValidation()
    }
  },
  { immediate: true },
)

async function submitForm() {
  const result = await formRef.value?.validate()
  if (!result?.valid) return

  emit('submit', {
    name: form.name.trim(),
    clinicLogo: form.clinicLogo || selectedFileName.value,
    clinicBio: form.tagline.trim(),
    clinicMobileNumber: Number(String(form.clinicMobileNumber).replace(/\D/g, '')),
    clinicEmail: form.clinicEmail.trim(),
    gstNumber: form.gstNumber.trim(),
    bankName: form.bankName.trim(),
    accountNumber: form.accountNumber.trim(),
    panNumber: form.panNumber.trim(),
  })
}

function triggerUpload() {
  fileInput.value?.click()
}

function onFileSelected(event) {
  const [file] = event.target.files || []
  if (!file) return
  selectedFileName.value = file.name
  form.clinicLogo = file.name
}
</script>

<style scoped>
.clinic-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #555c68;
}

.clinic-input :deep(.v-field) {
  border-radius: 18px;
  background: #f8f8fb;
  box-shadow: none;
}

.clinic-input :deep(.v-field__outline) {
  display: none;
}

.clinic-input :deep(input) {
  color: #2f3441;
}

.upload-dropzone {
  min-height: 106px;
  border: 1px dashed #d4d8df;
  border-radius: 12px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #8a919d;
}

.upload-label {
  font-size: 12px;
  color: #7a818d;
}

.upload-file-name {
  font-size: 12px;
  color: #4d5360;
}

.phone-code {
  min-width: 44px;
  height: 57px;
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

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  margin-top: 8px;
}

.submit-btn {
  min-height: 44px;
  border-radius: 999px;
  background: #f7dff1;
  color: #b13c92;
  text-transform: none;
  font-weight: 600;
  box-shadow: none;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
