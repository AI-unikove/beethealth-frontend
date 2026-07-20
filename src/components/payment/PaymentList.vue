<template>
  <CrudList
    :headers="headers"
    :items="pagedPayments"
    :items-length="filteredPayments.length"
    :loading="loading"
    :page="page"
    :items-per-page="itemsPerPage"
    :show-refresh="false"
    item-value="_id"
    @update:page="page = $event"
    @update:items-per-page="itemsPerPage = $event"
  >
    <!-- Search -->
    <template #search>
      <v-text-field
        v-model="search"
        placeholder="Search by client name"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        variant="outlined"
        hide-details
        clearable
        class="payment-search-field"
      />
    </template>

    <!-- Filter tabs replace the default add button -->
    <template #add-action>
      <PaymentFilters v-model="statusFilter" />
    </template>

    <!-- Hide default toolbar icons -->
    <template #toolbar-actions></template>

    <!-- Client name with avatar -->
    <template #[`item.clientName`]="{ item }">
      <div class="d-flex align-center gap-2">
        <InitialsAvatar :name="item.clientName" :src="item.clientAvatar" :size="34" />
        <span class="payment-client-name">{{ item.clientName }}</span>
      </div>
    </template>

    <!-- Joined date -->
    <template #[`item.joinedAt`]="{ item }">
      <span class="payment-date-text">{{ formatShortDate(item.joinedAt) }}</span>
    </template>

    <!-- Amount -->
    <template #[`item.amount`]="{ item }">
      <span class="payment-amount-text">₹{{ (item.amount || 0).toLocaleString('en-IN') }}</span>
    </template>

    <!-- Status badge -->
    <template #[`item.status`]="{ item }">
      <PaymentStatusBadge :status="item.status" />
    </template>

    <!-- Notify action -->
    <template #[`item.action`]="{ item }">
      <div class="notifyBtnWrap">
        <button
          class="button notify-btn"
          :class="{ 'notify-btn--completed': item.status === 'Completed' }"
          :disabled="item.status === 'Completed'"
          @click.stop="$emit('notify', item)"
        >
          <b>Notify</b>
        </button>
      </div>
    </template>

    <!-- Last action date -->
    <template #[`item.lastActionAt`]="{ item }">
      <span class="payment-date-text">{{ formatShortDate(item.lastActionAt) }}</span>
    </template>
  </CrudList>
</template>

<script setup>
import { ref, computed } from 'vue'
import CrudList from '@/components/common/CrudList.vue'
import InitialsAvatar from '@/components/common/InitialsAvatar.vue'
import PaymentFilters from '@/components/payment/PaymentFilters.vue'
import PaymentStatusBadge from '@/components/payment/PaymentStatusBadge.vue'

const props = defineProps({
  payments: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['notify', 'refresh'])

const headers = [
  { title: 'Client Name', key: 'clientName', sortable: false },
  { title: 'Joined', key: 'joinedAt', sortable: false },
  { title: 'Amount', key: 'amount', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Action', key: 'action', sortable: false, align: 'center' },
  { title: 'Last Action', key: 'lastActionAt', sortable: false },
]

const search = ref('')
const statusFilter = ref('all')
const page = ref(1)
const itemsPerPage = ref(10)

const filteredPayments = computed(() => {
  let list = props.payments

  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((p) => (p.clientName || '').toLowerCase().includes(q))
  }

  if (statusFilter.value !== 'all') {
    const target = statusFilter.value.charAt(0).toUpperCase() + statusFilter.value.slice(1)
    list = list.filter((p) => p.status === target)
  }

  return list
})

const pagedPayments = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  return filteredPayments.value.slice(start, start + itemsPerPage.value)
})

function formatShortDate(dateStr) {
  if (!dateStr) return '–'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.payment-search-field {
  min-width: 240px;
  max-width: 320px;
}

.payment-client-name {
  font-size: 14px;
  font-weight: 500;
  color: #272727;
}

.payment-amount-text {
  font-size: 14px;
  font-weight: 600;
  color: #272727;
}

.payment-date-text {
  font-size: 14px;
  color: #555;
}

.notify-btn {
  min-width: 80px;
}

.notify-btn--completed {
  opacity: 0.4;
  pointer-events: none;
}
</style>
