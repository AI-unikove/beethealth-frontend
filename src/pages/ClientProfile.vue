<template>
  <div class="client-profile-page">
    <v-container>
      <v-breadcrumbs :items="breadcrumbItems" class="custom-breadcrumb">
        <template #divider>
          <span class="divider">›</span>
        </template>
      </v-breadcrumbs>
    </v-container>

    <LoadingState v-if="loading" message="Loading client profile..." />

    <ErrorAlert v-else-if="error" :message="error" show-retry @retry="loadClientData" />

    <v-container v-else-if="clientData">
      <div class="grap-panel">
        <div class="left-panel">
          <ClientProfileCard
            :client-data="clientData"
            @save="onProfileSave"
            @medical-records-updated="loadClientData"
          />
        </div>

        <div class="right-panel">
          <ClientTabs :active-tab="activeTab" @update:active-tab="activeTab = $event" />

          <div v-show="activeTab === 0">
            <FoodDietContent
              :client-data="clientData"
              @diet-plan-view-change="dietPlanViewOpen = $event"
            />
          </div>

          <div v-show="activeTab === 1">
            <ActivityHydrationContent :client-data="clientData" />
          </div>

          <div v-show="activeTab === 2">
            <BodyMetricsContent :client-data="clientData" />
          </div>
        </div>
      </div>
    </v-container>

    <div v-else class="text-center pa-16">
      <v-icon size="64" color="grey-lighten-1">mdi-account-alert</v-icon>
      <h2 class="text-h5 mt-4">Client not found</h2>
      <v-btn color="primary" class="mt-6" @click="goBack">
        <v-icon start>mdi-arrow-left</v-icon>
        Back to Dashboard
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClientStore } from '@/stores/client.store'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import {
  ClientProfileCard,
  ClientTabs,
  FoodDietContent,
  ActivityHydrationContent,
  BodyMetricsContent,
} from '@/components/client/clientprofile'

const route = useRoute()
const router = useRouter()
const clientStore = useClientStore()

const loading = ref(true)
const error = ref(null)
const clientData = ref(null)
const activeTab = ref(0)
/** True when Food & Diet tab shows the assigned template (View diet plan). */
const dietPlanViewOpen = ref(false)

const breadcrumbItems = computed(() => {
  const clientName = clientData.value?.profile?.fullName || clientData.value?.fullName || 'Client'
  const capitalizedName = clientName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  const items = [
    { title: 'Clients', disabled: false, to: '/clients' },
    { title: `Profile: ${capitalizedName}`, disabled: false },
  ]

  if (activeTab.value === 0 && dietPlanViewOpen.value) {
    items.push({ title: 'View Diet Plan', disabled: true })
  }

  return items
})

async function loadClientData() {
  const clientId = route.params.id
  loading.value = true
  error.value = null

  try {
    await clientStore.fetchClientById(clientId)
    await clientStore.fetchClientBodyMetrics(clientId)

    if (clientStore.currentClient) {
      clientData.value = clientStore.currentClient
    } else {
      error.value = 'Client not found'
    }
  } catch (err) {
    error.value = err.message || 'Failed to load client profile'
  } finally {
    loading.value = false
  }
}
function onProfileSave(updatedClient) {
  clientData.value = updatedClient
}

onMounted(() => {
  loadClientData()
})

function goBack() {
  router.push('/')
}
</script>

<style scoped>
.client-profile-page {
  background: #f9fafb;
  min-height: 100vh;
  padding-bottom: 40px;
}

.custom-breadcrumb {
  padding: 20px 0;
}

.custom-breadcrumb :deep(.v-breadcrumbs-item) {
  font-size: 14px;
}

.divider {
  margin: 0 8px;
  color: #999;
}

.grap-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 20px;
}

.left-panel {
  width: 368px;
  display: inline-flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  position: relative;
  z-index: 0;
}

.right-panel {
  flex: 1;
  display: inline-flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  position: relative;
  z-index: 1;
}

@media (max-width: 960px) {
  .grap-panel {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
  }

  .right-panel {
    width: 100%;
  }
}
</style>
