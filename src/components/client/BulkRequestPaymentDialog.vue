<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="bulk-dialog pa-6">
      <div class="bulk-dialog__header">
        <h3 class="bulk-dialog__title">Request Payment</h3>
        <button class="bulk-dialog__close" @click="$emit('update:modelValue', false)">
          <v-icon size="20">mdi-close</v-icon>
        </button>
      </div>

      <p class="bulk-section-label">Selected clients</p>
      <div class="payment-cards-row">
        <div v-for="client in localClients" :key="clientId(client)" class="payment-card">
          <div class="payment-card__header">
            <v-avatar size="32" class="payment-card__avatar">
              <v-img :src="avatarSrc(client)" :alt="clientName(client)" cover />
            </v-avatar>
            <div class="payment-card__info">
              <span class="payment-card__name">{{ clientName(client) }}</span>
              <a href="#" class="payment-card__stripe" @click.prevent>Add stripe</a>
            </div>
            <button class="payment-card__remove" @click="removeClient(clientId(client))">×</button>
          </div>
          <div class="payment-card__details">
            <div class="payment-detail">
              <span class="payment-detail__label">Amount</span>
              <span class="payment-detail__value">{{ getAmount(client) }}</span>
            </div>
            <div class="payment-detail">
              <span class="payment-detail__label">Start Date</span>
              <span class="payment-detail__value">{{ getStartDate(client) }}</span>
            </div>
            <div class="payment-detail">
              <span class="payment-detail__label">Due Date</span>
              <span class="payment-detail__value">{{ getDueDate(client) }}</span>
            </div>
            <div class="payment-detail">
              <span class="payment-detail__label">Last Payment</span>
              <span class="payment-detail__value">{{ getLastPayment(client) }}</span>
            </div>
            <div class="payment-detail">
              <span class="payment-detail__label">Status</span>
              <span class="payment-status" :class="getPaymentStatusClass(client)">{{
                getPaymentStatus(client)
              }}</span>
            </div>
          </div>
        </div>
        <button class="add-client-btn" @click.prevent>Add Client</button>
      </div>

      <div class="d-flex justify-end mt-5">
        <button
          class="bulk-action-btn"
          :disabled="localClients.length === 0"
          @click="handleSendRequest"
        >
          Send request
        </button>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getClientAvatarSrc } from '@/utils/clientAvatar'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  clients: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'done'])

const localClients = ref([])

watch(
  () => props.modelValue,
  (open) => {
    if (open) localClients.value = [...props.clients]
  },
)

function clientId(c) {
  return c._id || c.id
}
function clientName(c) {
  return c.profile?.fullName || c.fullName || 'N/A'
}
function avatarSrc(c) {
  return getClientAvatarSrc(c?.profile?.gender, c?.profile?.avatar)
}
function removeClient(id) {
  localClients.value = localClients.value.filter((c) => clientId(c) !== id)
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 'N/A'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getAmount(c) {
  const billing = c.billingInfo || c.payment || c.subscription || {}
  const amt = billing.amount ?? billing.fee ?? billing.monthlyFee ?? null
  return amt != null ? `₹${Number(amt).toLocaleString('en-IN')}` : '₹—'
}

function getStartDate(c) {
  const billing = c.billingInfo || c.payment || c.subscription || {}
  return formatDate(billing.startDate ?? billing.createdAt ?? c.createdAt)
}

function getDueDate(c) {
  const billing = c.billingInfo || c.payment || c.subscription || {}
  return formatDate(billing.dueDate ?? billing.nextBillingDate ?? null)
}

function getLastPayment(c) {
  const billing = c.billingInfo || c.payment || c.subscription || {}
  return formatDate(billing.lastPaymentDate ?? billing.lastPaidAt ?? null)
}

function getPaymentStatus(c) {
  const billing = c.billingInfo || c.payment || c.subscription || {}
  const status = billing.paymentStatus ?? billing.status ?? 'Pending'
  return String(status)
}

function getPaymentStatusClass(c) {
  const status = getPaymentStatus(c).toLowerCase()
  if (status === 'overdue' || status === 'failed') return 'payment-status--overdue'
  if (status === 'paid' || status === 'active') return 'payment-status--paid'
  return 'payment-status--pending'
}

function handleSendRequest() {
  // UI only — backend integration pending
  emit('done', {
    action: 'request-payment',
    clientIds: localClients.value.map(clientId),
  })
  emit('update:modelValue', false)
}
</script>

<style scoped>
.bulk-dialog {
  border-radius: 16px !important;
}
.bulk-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.bulk-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}
.bulk-dialog__close {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.15s;
}
.bulk-dialog__close:hover {
  background: #f0f0f0;
}
.bulk-section-label {
  font-size: 13px;
  font-weight: 500;
  color: #555;
  margin-bottom: 10px;
}
.payment-cards-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}
.payment-card {
  background: #fafafa;
  border: 1px solid #ebebeb;
  border-radius: 12px;
  padding: 12px;
  min-width: 150px;
  max-width: 170px;
  flex: 1 1 150px;
}
.payment-card__header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}
.payment-card__avatar {
  flex-shrink: 0;
}
.payment-card__info {
  flex: 1;
  min-width: 0;
}
.payment-card__name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.payment-card__stripe {
  font-size: 11px;
  color: #d94fa3;
  text-decoration: underline;
}
.payment-card__remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #999;
  line-height: 1;
  padding: 0;
  flex-shrink: 0;
}
.payment-card__remove:hover {
  color: #d94fa3;
}
.payment-card__details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.payment-detail {
  display: flex;
  flex-direction: column;
}
.payment-detail__label {
  font-size: 10px;
  color: #999;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.payment-detail__value {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}
.payment-status {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  margin-top: 2px;
}
.payment-status--overdue {
  background: #fff0f0;
  color: #d32f2f;
}
.payment-status--paid {
  background: #e8f5e9;
  color: #2e7d32;
}
.payment-status--pending {
  background: #fff8e1;
  color: #f57f17;
}
.add-client-btn {
  background: #fff;
  border: 1.5px dashed #d94fa3;
  color: #d94fa3;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 999px;
  align-self: center;
  transition: background 0.15s;
  font-family: inherit;
}
.add-client-btn:hover {
  background: #fff0f7;
}
.bulk-action-btn {
  background: linear-gradient(135deg, #d94fa3, #ab2e95);
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 10px 32px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  min-width: 130px;
}
.bulk-action-btn:hover:not(:disabled) {
  opacity: 0.9;
}
.bulk-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
