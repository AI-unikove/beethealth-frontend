<template>
  <v-container fluid class="pa-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h4 font-weight-bold">Edit Clinic</h2>
      <v-btn variant="outlined" @click="$router.push('/super-admin/clinics')">Back</v-btn>
    </div>

    <ClinicForm
      title="Edit Clinic"
      submit-label="Save Changes"
      :initial-data="clinic"
      :loading="loading"
      @submit="onSubmit"
      @cancel="$router.push('/super-admin/clinics')"
    />
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ClinicForm from '@/components/superadmin/ClinicForm.vue'
import { getClinicById, updateClinic } from '@/services/clinic.service'

const route = useRoute()
const router = useRouter()
const clinic = ref({})
const loading = ref(false)

async function loadClinic() {
  const response = await getClinicById(route.params.id)
  clinic.value = response.data || {}
}

async function onSubmit(payload) {
  loading.value = true
  try {
    await updateClinic(route.params.id, payload)
    router.push('/super-admin/clinics')
  } finally {
    loading.value = false
  }
}

onMounted(loadClinic)
</script>
