<template>
  <v-container class="payments-page px-5 py-4">
    <h2 class="page-title mb-4">Payments</h2>

    <v-row>
      <v-col cols="12" lg="8">
        <LoadingState
          v-if="paymentStore.loading && !paymentStore.payments.length"
          message="Loading payments..."
        />

        <ErrorAlert
          v-else-if="paymentStore.error"
          :message="paymentStore.error"
          show-retry
          @retry="loadPayments"
        />

        <PaymentList
          v-else
          :payments="paymentStore.payments"
          :loading="paymentStore.loading"
          @notify="handleNotify"
          @refresh="loadPayments"
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
          description="I can help you track payments, send reminders, and follow up with clients — all through chat or voice."
          add-title="💳 Send payment reminders"
          show-attention-title="🚨 Show overdue clients"
          suggest-plan-title="💡 Suggest follow-up actions"
          @close="handleCloseAssistant"
          @add-handle="handleSendReminders"
          @show-attention="handleShowOverdue"
          @suggest-plan="handleSuggestFollowUp"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePaymentStore } from '@/stores/payment.store'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import PaymentList from '@/components/payment/PaymentList.vue'
import TopPerformingCard from '@/components/common/TopPerformingCard.vue'
import AIAssistantCard from '@/components/common/AIAssistantCard.vue'

const paymentStore = usePaymentStore()

async function loadPayments() {
  try {
    await paymentStore.fetchPayments()
  } catch {
    // Error shown via ErrorAlert
  }
}

async function handleNotify(payment) {
  try {
    await paymentStore.sendNotification(payment._id)
  } catch {
    // Error handled in store
  }
}

function handleViewPlan() {}
function handleCloseAssistant() {}
function handleSendReminders() {}
function handleShowOverdue() {}
function handleSuggestFollowUp() {}

onMounted(loadPayments)
</script>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #272727;
}
</style>
