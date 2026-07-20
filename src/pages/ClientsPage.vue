<template>
  <v-container class="clients-page px-5 py-4">
    <h2 class="page-title mb-4">Clients</h2>

    <LoadingState
      v-if="clientStore.loading && !clientStore.clients.length"
      message="Loading clients..."
    />

    <ErrorAlert
      v-else-if="clientStore.error"
      :message="clientStore.error"
      show-retry
      @retry="loadClients"
    />

    <v-row v-else>
      <v-col cols="12" lg="8">
        <ClientList
          :clients="clientStore.clients"
          :loading="clientStore.loading"
          @row-click="handleRowClick"
          @refresh="loadClients"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </v-col>

      <v-col cols="12" lg="4">
        <TopPerformingCard
          class="mb-4"
          icon="mdi-star"
          badge="Top-performing plan"
          title="Balanced Lifestyle Plan is performing exceptionally — 8 clients reached their goals this month."
          button-text="View plan"
          @view-plan="handleViewPlan"
        />

        <AIAssistantCard
          expand-text="Expand"
          title="What can I help with?"
          descriptions="I can help you create, review, and improve plans, analyze client progress, or answer questions — all through chat or voice."
          add-title="🆕 Add new client"
          show-attention-title="🚨 Show clients needs attention"
          suggest-plan-title="💡 Suggest plan for stagnant clients"
          @close="handleCloseAssistant"
          @add-handle="handleAdd"
          @show-attention="handleShowAttention"
          @suggest-plan="handleSuggestPlan"
          @send-message="handleSendMessage"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useClientStore } from '@/stores/client.store'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import ClientList from '@/components/client/ClientList.vue'
import TopPerformingCard from '@/components/common/TopPerformingCard.vue'
import AIAssistantCard from '@/components/common/AIAssistantCard.vue'

const clientStore = useClientStore()
const router = useRouter()

async function loadClients() {
  try {
    await clientStore.fetchAllClients()
  } catch {
    // Snackbar shows via axios interceptor
  }
}

function handleRowClick(item) {
  const clientId = item._id || item.id
  router.push(`/client/${clientId}`)
}

function handleEdit(_item) {
  // TODO: Implement edit functionality
}

function handleDelete(_item) {
  // TODO: Implement delete functionality
}

function handleViewPlan() {
  // TODO: Navigate to plan details
}

function handleCloseAssistant() {
  // TODO: Hide assistant card
}

function handleAdd() {
  router.push('/add-client')
}

function handleShowAttention() {
  // TODO: Filter clients by attention status
}

function handleSuggestPlan() {
  // TODO: AI suggestion logic
  // TODO: AI suggestion logic
}

function handleSendMessage(_message) {
  // TODO: Send message to AI assistant
}
</script>

<style scoped>
.page-title {
  font-size: 32px;
  font-weight: 700;
  padding: 0 15px;
}

.side-card {
  background: #fff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}

.action-btn {
  border-radius: 30px;
  text-transform: none;
  font-weight: 600;
}

.expand-text {
  font-size: 14px;
  font-weight: 600;
}

.card-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}
</style>
