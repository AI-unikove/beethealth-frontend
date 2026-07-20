<template>
  <v-container class="home-page px-5 py-4">
    <div class="home-header">
      <h2 class="greeting">Good morning Joseph! <span>🌤️</span></h2>
    </div>

    <div class="v-row mb-4">
      <div class="notification-col v-col-lg-7">
        <NotificationCard
          :title="latestNotif?.title || 'Needs Attention'"
          :message="latestNotif?.body || 'No new alerts.'"
          :actions="[
            { label: 'Ignore', type: 'secondary' },
            { label: 'Message', type: 'primary' },
          ]"
        />
      </div>
      <div class="stats-col v-col-lg-4">
        <StatsCard />
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="v-row">
        <div class="v-col-lg-8">
          <div class="v-row">
            <div class="v-col-lg-6">
              <div class="cell cell--meal">
                <MealComplianceCard />
              </div>
            </div>
            <div class="v-col-lg-6">
              <div class="cell cell--weight">
                <WeightTrendCard />
              </div>
            </div>

            <div class="v-col-lg-12">
              <div class="cell cell--perf">
                <PerformanceOverview />
              </div>
            </div>
          </div>
        </div>
        <div class="v-col-lg-4">
          <div class="cell cell--quick">
            <QuickAccess />
          </div>
          <div class="cell cell--sidebar">
            <MeetingsList />
            <PaymentOverdues />
          </div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import NotificationCard from '../components/common/NotificationCard.vue'
import StatsCard from '../components/common/StatsCard.vue'
import MealComplianceCard from '../components/common/MealComplianceCard.vue'
import WeightTrendCard from '../components/common/WeightTrendCard.vue'
import PerformanceOverview from '../components/common/PerformanceOverview.vue'
import QuickAccess from '../components/common/QuickAccess.vue'
import MeetingsList from '../components/common/MeetingsList.vue'
import PaymentOverdues from '../components/common/PaymentOverdues.vue'
import { useNotificationStore } from '@/stores/notification.store'

const notificationStore = useNotificationStore()
const latestNotif = computed(() => notificationStore.sortedNotifications[0] || null)

onMounted(() => {
  // notificationStore.attachFcmListener()
  notificationStore.loadNotifications()
})
</script>

<style scoped>
.home-header {
  margin-bottom: 18px;
}

.greeting {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a2e;
}

.top-row {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  margin-bottom: 16px;
  align-items: stretch;
}

.notification-col,
.stats-col {
  display: flex;
  flex-direction: column;
}

.cell--meal {
  grid-column: 1;
  grid-row: 1;
}

.cell--weight {
  grid-column: 2;
  grid-row: 1;
}

.cell--quick {
  grid-column: 3;
  grid-row: 1;
}

.cell--perf {
  grid-column: 1 / 3;
  grid-row: 2;
}

.cell--sidebar {
  grid-column: 3;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 1100px) {
  .top-row {
    grid-template-columns: 1fr;
  }

  .cell--meal {
    grid-column: 1;
    grid-row: 1;
  }

  .cell--weight {
    grid-column: 2;
    grid-row: 1;
  }

  .cell--quick {
    grid-column: 1;
    grid-row: 2;
  }

  .cell--perf {
    grid-column: 1 / -1;
    grid-row: 3;
  }

  .cell--sidebar {
    grid-column: 2;
    grid-row: 2;
  }
}

@media (max-width: 700px) {
  .cell--meal,
  .cell--weight,
  .cell--quick,
  .cell--perf,
  .cell--sidebar {
    grid-column: 1 !important;
    grid-row: auto !important;
  }
}
</style>
