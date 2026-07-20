<template>
  <div class="perf-card">
    <h3 class="card-title">Client Performance Overview</h3>

    <!-- Filter chips + avatar + action icons in one row -->
    <div class="controls-row">
      <!-- Filter chips (left) -->
      <div class="filter-chips">
        <button
          v-for="f in filters"
          :key="f.value"
          class="chip"
          :class="{ 'chip--active': activeFilter === f.value }"
          @click="activeFilter = f.value"
        >
          <i>{{ f.label }}</i>
        </button>
      </div>
    </div>

    <!-- Client list (2-column grid) -->
    <div class="client-list">
      <div v-for="client in filteredClients" :key="client.name + client.status" class="client-row">
        <div class="client-avatar" :style="{ background: client.avatarBg }">
          {{ client.initial }}
        </div>

        <div class="client-info">
          <div class="client-top">
            <span class="client-name">{{ client.name }}</span>
          </div>
          <div class="client-detail">
            <span
              class="status-badge"
              :style="{ background: statusBg(client.status), color: statusColor(client.status) }"
            >
              {{ client.status }}
            </span>
            {{ client.detail }}
          </div>
          <div class="client-ai">{{ client.ai }}</div>
        </div>

        <div class="notifyBtnWrap">
          <button class="button">
            <b>Send Notification</b>
          </button>

          <!-- Action icon buttons (right) -->
          <div class="action-icons">
            <div v-for="a in actions" :key="a.label" class="action-icon-btn">
              <button class="action-icon-circle" :title="a.label">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path :d="a.path" />
                  <path v-if="a.path2" :d="a.path2" />
                </svg>
              </button>
              <span class="action-icon-label">{{ a.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeFilter = ref('all')

const filters = [
  {
    label: 'All',
    value: 'all',
    activeBg: '#ede7f6',
    activeBorder: '#c4b5fd',
    activeColor: '#7c3aed',
  },
  {
    label: 'On-track',
    value: 'on-track',
    activeBg: '#d1fae5',
    activeBorder: '#6ee7b7',
    activeColor: '#059669',
  },
  {
    label: 'Moderate',
    value: 'moderate',
    activeBg: '#cceef2',
    activeBorder: '#67d4e0',
    activeColor: '#0e7490',
  },
  {
    label: 'Critical',
    value: 'critical',
    activeBg: '#fee2e2',
    activeBorder: '#fca5a5',
    activeColor: '#dc2626',
  },
]

const actions = [
  {
    label: 'Encourage',
    path: 'M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z',
    path2: 'M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3',
  },
  {
    label: 'Remind',
    path: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9',
    path2: 'M13.73 21a2 2 0 0 1-3.46 0',
  },
  {
    label: 'Appreciate',
    path: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  },
]

const clients = [
  {
    name: 'Arjun Mehta',
    initial: 'A',
    avatarBg: '#3B82F6',
    status: 'Critical',
    detail: 'Lunch: 786 / 600 kcal +15%',
    ai: 'AI: Already consumed almost half daily calories with 2 meals left. AI recommends suggesting a lighter dinner and increased activity.',
  },
  {
    name: 'Riya Mukherji',
    initial: 'R',
    avatarBg: '#EC4899',
    status: 'Moderate',
    detail: 'Breakfast: Noopal / Water: 1.0 / 2 lt.',
    ai: 'AI: Riya has skipped breakfast and logged low nutrition today — may indicate inconsistency or busy schedule.',
  },
  {
    name: 'Arjan Mehta',
    initial: 'A',
    avatarBg: '#14B8A6',
    status: 'On-track',
    detail: 'Meals: Logged 3 / 4 (75% compliance)',
    ai: 'AI: Sreha is maintaining great balance across meals and hydration — AI suggests sending a quick encouragement message.',
  },
  {
    name: 'Arjun Mehta',
    initial: 'A',
    avatarBg: '#78716C',
    status: 'Inactive',
    detail: 'Last logged: 3 days ago',
    ai: 'AI: No meal or activity data since 3 days. AI suggests sending a gentle reminder or checking in for support.',
  },
  {
    name: 'Arjun Mehta',
    initial: 'A',
    avatarBg: '#78716C',
    status: 'Inactive',
    detail: 'Last logged: 3 days ago',
    ai: 'AI: No meal or activity data since 3 days. AI suggests sending a gentle reminder.',
  },
]

const filteredClients = computed(() => {
  if (activeFilter.value === 'all') return clients
  return clients.filter((c) => c.status.toLowerCase().replace(/\s+/g, '-') === activeFilter.value)
})

function statusColor(status) {
  const map = {
    Critical: '#dc2626',
    Moderate: '#0e7490',
    'On-track': '#059669',
    Inactive: '#6b7280',
  }
  return map[status] || '#6b7280'
}
function statusBg(status) {
  const map = {
    Critical: '#fee2e2',
    Moderate: '#cceef2',
    'On-track': '#d1fae5',
    Inactive: '#f3f4f6',
  }
  return map[status] || '#f3f4f6'
}
</script>

<style scoped>
.perf-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

/* Controls row: chips left + action icons right */
.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-chips .chip {
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: 0.15px;
  border: 2px solid transparent;
  background: #f8f8f8;
  color: #272727;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.filter-chips i {
  font-style: normal;
  position: relative;
  z-index: 2;
}
.filter-chips .chip--active {
  font-weight: 600;
  border-radius: 29px;
  background:
    linear-gradient(white, white) padding-box,
    linear-gradient(135deg, #f7c6ff, #ffd6a5) border-box;
  border: 2px solid transparent;
  box-shadow: 0 2px 0 0 #d7c8e2;
  position: relative;
  overflow: hidden;
}
.filter-chips .chip--active::before {
  content: '';
  position: absolute;
  background: #f4e3f1;
  width: 100%;
  height: 100%;
  z-index: 0;
  top: 0;
  left: 0;
}

/* Action icon buttons */

/* ── Client list — 2-column grid in wide layout ── */
.client-list {
  display: grid;
  gap: 10px;
  flex: 1;
}

.client-list .client-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 24px 12px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;
}

.client-list .client-row .client-row:hover {
  background: #f5f0ff;
}

.client-list .client-row .client-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.client-list .client-row .client-info {
  flex: 1;
  min-width: 0;
}

.client-list .client-row .client-top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 3px;
}

.client-list .client-row .client-name {
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0.15px;
  color: #272727;
}

.client-list .client-row .status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 20px;
}

.client-list .client-row .client-detail {
  font-size: 11px;
  color: #777;
  margin-bottom: 4px;
}

.client-list .client-row .client-ai {
  font-size: 14px;
  color: #6d6d6d;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0.1px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notify-btn {
  flex-shrink: 0;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  background: #ffffff;
  color: #ab2e95;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
  align-self: flex-start;
  margin-top: 2px;
  border: 1px;
  border-color: #ab2e95;
  border-style: solid;
}

.notify-btn:hover {
  opacity: 0.85;
}
</style>
