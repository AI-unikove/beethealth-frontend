<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h4 font-weight-bold">Create Clinic</h2>
      <v-btn variant="outlined" @click="$router.push('/super-admin/clinics')">Back</v-btn>
    </div>

    <ClinicForm
      title="Create Clinic"
      submit-label="Create Clinic"
      :loading="loading"
      @submit="onSubmit"
      @cancel="$router.push('/super-admin/clinics')"
    />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ClinicForm from '@/components/superadmin/ClinicForm.vue'
import { createClinic } from '@/services/clinic.service'

const router = useRouter()
const loading = ref(false)

async function onSubmit(payload) {
  loading.value = true
  try {
    await createClinic(payload)
    router.push('/super-admin/clinics')
  } finally {
    loading.value = false
  }
}
</script>
