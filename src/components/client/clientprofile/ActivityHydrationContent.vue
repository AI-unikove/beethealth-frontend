<template>
  <div class="activity-hydration-content">
    <!-- Header: Title + Period dropdown -->
    <div class="content-header">
      <h2 class="page-title">Activity & Hydration</h2>
      <v-select
        v-model="selectedPeriod"
        :items="periodOptions"
        density="compact"
        variant="outlined"
        hide-details
        class="period-select v-btn"
      />
    </div>

    <!-- Top row: Activity (left) + Hydration & Sleep (right) -->
    <v-row class="top-cards">
      <!-- Left: Activity card + 4 sub-metrics -->
      <v-col cols="12" md="6">
        <div class="card activity-card">
          <h3 class="card-title">Activity</h3>
          <div class="primary-metric">
            <span class="value">{{ activity.current }}</span>
          </div>
          <p class="metric-sub">out of {{ activity.target }} Kcal</p>
          <div class="progress-wrap">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: activityPercent + '%' }"></div>
            </div>
          </div>
          <div class="text-center">
            <span class="badge badge-activity">{{ activity.badge }}</span>
          </div>
          <p class="card-desc">{{ activity.description }}</p>
          <!-- Sub-metrics 2x2 -->
          <v-row class="sub-metrics" no-gutters>
            <v-col v-for="m in activitySubMetrics" :key="m.title" cols="6" class="sub-metric-col">
              <div class="sub-metric-card">
                <span class="sub-metric-title">{{ m.title }}</span>
                <span class="sub-metric-value"
                  ><b>{{ m.value }}</b
                  ><small>{{ m.weight }}</small></span
                >
              </div>
            </v-col>
          </v-row>
        </div>
      </v-col>

      <!-- Right: Hydration + Sleep -->
      <v-col cols="12" md="6">
        <div class="card hydration-card">
          <h3 class="card-title">Hydration</h3>
          <div class="primary-metric">
            <span class="value">{{ hydration.current }}</span>
          </div>
          <p class="metric-sub">out of {{ hydration.target }}</p>
          <span class="badge badge-hydration">{{ hydration.badge }}</span>
          <p class="card-desc">{{ hydration.description }}</p>
        </div>
        <div class="card sleep-card">
          <h3 class="card-title">Sleep</h3>
          <div class="primary-metric">
            <span class="value">{{ sleep.current }}</span>
            <span class="unit">h</span>
          </div>
          <p class="metric-sub">out of {{ sleep.target }}</p>
          <span class="badge badge-sleep">{{ sleep.badge }}</span>
          <p class="card-desc">{{ sleep.description }}</p>
        </div>
      </v-col>
    </v-row>

    <!-- Activity Graph -->
    <div class="card graph-card">
      <div class="graph-header">
        <v-icon size="24" class="graph-nav" @click="graphPrev">mdi-chevron-left</v-icon>
        <h3 class="graph-title">Activity Graph</h3>
        <v-icon size="24" class="graph-nav" @click="graphNext">mdi-chevron-right</v-icon>
      </div>
      <div class="graph-container">
        <svg viewBox="0 0 600 220" class="activity-graph-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="#f8b4c4" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#f8b4c4" stop-opacity="0.05" />
            </linearGradient>
          </defs>
          <!-- Y-axis labels -->
          <text
            v-for="(_, i) in 6"
            :key="'y' + i"
            class="axis-label axis-y"
            :y="paddingTop + i * (graphHeight / 5)"
            x="28"
            text-anchor="end"
          >
            {{ 500 - i * 100 }}
          </text>
          <!-- X-axis labels -->
          <text
            v-for="(label, i) in xLabels"
            :key="'x' + i"
            class="axis-label axis-x"
            :x="paddingLeft + (i / (xLabels.length - 1)) * graphWidth"
            :y="graphHeight + paddingTop + 18"
            text-anchor="middle"
          >
            {{ label }}
          </text>
          <!-- Area fill -->
          <path :d="areaPath" fill="url(#areaGradient)" />
          <!-- Line -->
          <path
            :d="linePath"
            fill="none"
            stroke="#e88a9e"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Tooltip marker (7am–8am, 240 kcal) -->
          <line
            :x1="tooltipX"
            y1="paddingTop"
            :x2="tooltipX"
            :y2="graphHeight + paddingTop"
            class="tooltip-line"
          />
          <rect
            :x="tooltipX - 44"
            :y="tooltipY - 36"
            width="88"
            height="36"
            rx="6"
            class="tooltip-box"
          />
          <text :x="tooltipX" :y="tooltipY - 20" class="tooltip-time" text-anchor="middle">
            7am - 8am
          </text>
          <text :x="tooltipX" :y="tooltipY - 6" class="tooltip-value" text-anchor="middle">
            240 kcal
          </text>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineProps({
  clientData: {
    type: Object,
    required: true,
  },
})

const selectedPeriod = ref('Today')
const periodOptions = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days']

// Static data
const activity = ref({
  current: '1,092',
  target: '2400',
  badge: 'Low Activity Alert',
  description:
    'Encourage light evening movement such as a walk or stretching to boost overall activity and energy expenditure.',
})
const activitySubMetrics = ref([
  { title: 'Workout', value: '729', weight: 'Kcal' },
  { title: 'Steps', value: '8,200', weight: '' },
  { title: 'Stairs Climbed', value: '2 ', weight: 'Floors' },
  { title: 'Active Minutes', value: '64 ', weight: 'mins' },
])
const activityPercent = computed(() => {
  const curr = Number(activity.value.current.replace(/,/g, ''))
  const tgt = Number(activity.value.target.replace(/,/g, ''))
  return tgt ? Math.min(100, Math.round((curr / tgt) * 100)) : 0
})

const hydration = ref({
  current: '4.2',
  target: '6.0L',
  badge: 'Good Hydration',
  description:
    'Encourage your client to sip regularly and include hydrating foods like fruits, soups, or smoothies.',
})

const sleep = ref({
  current: '4h',
  target: '8h',
  badge: 'Sleep Deprivation Detected',
  description:
    'Encourage your client to sip regularly and include hydrating foods like fruits, soups, or smoothies.',
})

// Graph: static hourly-like points (0–24h, values 0–500)
const graphPadding = { top: 24, right: 24, bottom: 36, left: 44 }
const paddingTop = graphPadding.top
const paddingLeft = graphPadding.left
const graphWidth = 600 - graphPadding.left - graphPadding.right
const graphHeight = 220 - graphPadding.top - graphPadding.bottom

const graphPoints = ref([
  { x: 0, y: 40 },
  { x: 2, y: 30 },
  { x: 4, y: 80 },
  { x: 6, y: 180 },
  { x: 7.5, y: 240 },
  { x: 8, y: 220 },
  { x: 10, y: 120 },
  { x: 12, y: 90 },
  { x: 14, y: 160 },
  { x: 16, y: 200 },
  { x: 18, y: 280 },
  { x: 20, y: 320 },
  { x: 22, y: 260 },
  { x: 24, y: 180 },
])

const xLabels = ['12am', '6am', '12pm', '6pm', '12am']

const linePath = computed(() => {
  const pts = graphPoints.value
  const scaleX = (x) => paddingLeft + (x / 24) * graphWidth
  const scaleY = (y) => paddingTop + graphHeight - (y / 500) * graphHeight
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`).join(' ')
})

const areaPath = computed(() => {
  const pts = graphPoints.value
  const scaleX = (x) => paddingLeft + (x / 24) * graphWidth
  const scaleY = (y) => paddingTop + graphHeight - (y / 500) * graphHeight
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`).join(' ')
  const bottom = `L ${scaleX(24)} ${paddingTop + graphHeight} L ${scaleX(0)} ${paddingTop + graphHeight} Z`
  return `${line} ${bottom}`
})

const tooltipX = paddingLeft + (7.5 / 24) * graphWidth
const tooltipY = paddingTop + graphHeight - (240 / 500) * graphHeight - 24

function graphPrev() {}
function graphNext() {}
</script>

<style scoped>
.activity-hydration-content {
  padding: 0 0 24px;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #272727;
  margin: 0;
  padding: 0 15px;
}

.period-select {
  max-width: 140px;
}

.top-cards {
  margin-bottom: 20px;
}

.card {
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.card:last-child {
  margin-bottom: 0;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

.badge-activity {
  background: #ffe8ec;
  color: #c45a4a;
}

.badge-hydration {
  background: #e0f4f8;
  color: #0d7a8c;
}

.badge-sleep {
  background: #ffebe6;
  color: #b84a30;
}

.hydration-card,
.sleep-card {
  margin-bottom: 16px;
}

.graph-card {
  margin-bottom: 0;
}

.graph-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
  position: relative;
}

.graph-title {
  font-size: 16px;
  font-weight: 600;
  color: #272727;
  margin: 0;
}

.graph-nav {
  color: #6d6d6d;
  cursor: pointer;
}

.graph-nav:hover {
  color: #272727;
}

.graph-container {
  width: 100%;
  min-height: 220px;
}

.activity-graph-svg {
  width: 100%;
  height: auto;
  display: block;
}

.axis-label {
  font-size: 11px;
  fill: #6d6d6d;
}

.tooltip-line {
  stroke: #e88a9e;
  stroke-width: 1;
  stroke-dasharray: 4 2;
}

.tooltip-box {
  fill: #fff;
  stroke: #e0e0e0;
  stroke-width: 1;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.08));
}

.tooltip-time {
  font-size: 11px;
  fill: #6d6d6d;
}

.tooltip-value {
  font-size: 13px;
  font-weight: 600;
  fill: #272727;
}
</style>
