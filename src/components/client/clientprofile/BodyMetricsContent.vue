<template>
  <v-container class="body-metrics-content" fluid>
    <h2 class="text-h5 font-weight-semibold text-grey-darken-3 mb-4">Body Metrics</h2>

    <v-alert v-if="!sortedRecords.length" type="info" variant="tonal" class="mb-4" rounded="lg">
      No body measurements recorded yet. Add entries with measurement dates to see charts and
      trends.
    </v-alert>

    <v-row v-if="sortedRecords.length" class="mb-4">
      <v-col v-for="card in summaryCards" :key="card.title" cols="12" sm="6" md="3">
        <v-card variant="elevated" elevation="0" rounded="lg" class="pa-4 fill-height">
          <div class="text-body-2 text-medium-emphasis mb-1">{{ card.title }}</div>
          <div class="text-h4 font-weight-bold text-grey-darken-3">{{ card.value }}</div>
          <div
            class="text-body-2 font-weight-medium mt-1"
            :class="
              card.changeClass === 'change-down'
                ? 'text-success'
                : card.changeClass === 'change-up'
                  ? 'text-error'
                  : 'text-medium-emphasis'
            "
          >
            {{ card.change }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Weight over time -->
    <v-card
      v-if="sortedRecords.length && weightChartHasData"
      variant="elevated"
      elevation="0"
      rounded="lg"
      class="mb-4 pa-4"
    >
      <v-card-title class="text-h6 font-weight-semibold text-grey-darken-3 px-0 pb-3">
        Weight (kg)
        <span class="text-body-2 text-medium-emphasis font-weight-regular">· last 5 visits</span>
      </v-card-title>
      <div class="chart-wrap">
        <Line :data="weightChartData" :options="weightChartOptions" />
      </div>
    </v-card>

    <!-- Client Performance overview table -->
    <v-card
      v-if="sortedRecords.length"
      variant="elevated"
      elevation="0"
      rounded="lg"
      class="mb-4 pa-4"
    >
      <v-card-title class="text-h6 font-weight-semibold text-grey-darken-3 px-0 pb-3">
        Client performance overview
      </v-card-title>
      <v-data-table
        :headers="performanceHeaders"
        :items="performanceRows"
        item-value="metric"
        class="performance-table elevation-0"
        :items-per-page="-1"
        hide-default-footer
      >
        <template #[`item.change`]="{ item }">
          <v-chip
            :color="
              item.changeClass === 'change-down'
                ? 'success'
                : item.changeClass === 'change-up'
                  ? 'error'
                  : 'grey'
            "
            variant="tonal"
            size="small"
            class="font-weight-semibold"
          >
            {{ item.change }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>

    <!-- AI Insight -->
    <v-card variant="elevated" elevation="0" rounded="lg" class="pa-4">
      <v-card-title class="text-h6 font-weight-semibold text-grey-darken-3 px-0 pb-3">
        AI Insight
      </v-card-title>
      <v-chip color="success" variant="tonal" size="small" class="mb-3 font-weight-semibold">
        Progressing Well
      </v-chip>
      <p class="text-body-2 text-grey-darken-3 mb-0" style="line-height: 1.6">
        {{ aiInsightText }}
      </p>
    </v-card>
  </v-container>
</template>

<script setup>
import { useClientStore } from '@/stores/client.store'
import { normalizeBodyMetricsToEntries } from '@/utils/bodyMetrics'
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

defineProps({
  clientData: { type: Object, default: null },
})

const clientStore = useClientStore()

function measurementTime(record) {
  const d = record?.measurementDate ?? record?.measurement_date
  if (!d) return 0
  const t = new Date(d).getTime()
  return Number.isNaN(t) ? 0 : t
}

function metricsOf(record) {
  return record?.metrics && typeof record.metrics === 'object' ? record.metrics : {}
}

const sortedRecords = computed(() => {
  const list = normalizeBodyMetricsToEntries(clientStore.bodyMetrics)
  return [...list].sort((a, b) => measurementTime(a) - measurementTime(b))
})

/** Most recent measurement rows only (used for charts) */
const CHART_RECENT_COUNT = 5
const recordsForCharts = computed(() => {
  const rows = sortedRecords.value
  if (rows.length <= CHART_RECENT_COUNT) return rows
  return rows.slice(-CHART_RECENT_COUNT)
})

function formatShortDate(record) {
  const t = measurementTime(record)
  if (!t) return '—'
  return new Date(t).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })
}

function formatKg(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return `${Number(n).toFixed(1)} kg`
}

function formatCm(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return `${Number(n).toFixed(1)} cm`
}

function deltaText(prev, curr, unit) {
  if (prev == null || curr == null || Number.isNaN(Number(prev)) || Number.isNaN(Number(curr))) {
    return 'No comparison'
  }
  const diff = Number(curr) - Number(prev)
  if (Math.abs(diff) < 0.01) return 'No change'
  const sign = diff > 0 ? '+' : ''
  const u = unit === 'kg' ? ' kg' : ' cm'
  return `${sign}${diff.toFixed(1)}${u}`
}

function deltaClass(prev, curr, lowerIsBetter) {
  if (prev == null || curr == null || Number.isNaN(Number(prev)) || Number.isNaN(Number(curr))) {
    return 'change-neutral'
  }
  const diff = Number(curr) - Number(prev)
  if (Math.abs(diff) < 0.01) return 'change-neutral'
  if (diff < 0) return lowerIsBetter ? 'change-down' : 'change-up'
  return lowerIsBetter ? 'change-up' : 'change-down'
}

const summaryCards = computed(() => {
  const rows = sortedRecords.value
  if (!rows.length) return []
  const last = rows[rows.length - 1]
  const prev = rows.length > 1 ? rows[rows.length - 2] : null
  const mLast = metricsOf(last)
  const mPrev = prev ? metricsOf(prev) : null

  const defs = [
    { title: 'Weight', key: 'weight', format: formatKg, unit: 'kg', lowerIsBetter: true },
    { title: 'Chest', key: 'chest', format: formatCm, unit: 'cm', lowerIsBetter: false },
    { title: 'Abs', key: 'abs', format: formatCm, unit: 'cm', lowerIsBetter: true },
    { title: 'Hips', key: 'hips', format: formatCm, unit: 'cm', lowerIsBetter: true },
  ]

  return defs.map(({ title, key, format, unit, lowerIsBetter }) => {
    const v = mLast[key]
    const p = mPrev?.[key]
    return {
      title,
      value: format(v),
      change: prev ? deltaText(p, v, unit) : 'Latest entry',
      changeClass: prev ? deltaClass(p, v, lowerIsBetter) : 'change-neutral',
    }
  })
})

const weightChartData = computed(() => {
  const rows = recordsForCharts.value
  const labels = rows.map(formatShortDate)
  const data = rows.map((r) => {
    const w = metricsOf(r).weight
    return w == null || Number.isNaN(Number(w)) ? null : Number(w)
  })
  return {
    labels,
    datasets: [
      {
        label: 'Weight (kg)',
        data,
        borderColor: '#e57373',
        backgroundColor: 'rgba(229, 115, 115, 0.12)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#e57373',
        spanGaps: true,
      },
    ],
  }
})

const weightChartHasData = computed(() =>
  weightChartData.value.datasets[0].data.some((v) => v != null),
)

const weightChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index', intersect: false },
  },
  scales: {
    y: {
      title: { display: true, text: 'kg' },
      beginAtZero: false,
    },
    x: {
      ticks: { maxRotation: 45, minRotation: 0 },
    },
  },
}

/** Up to 4 snapshot rows for the table (spread across timeline if many points) */
const snapshotRecords = computed(() => {
  const sorted = sortedRecords.value
  const n = sorted.length
  if (n === 0) return []
  if (n <= 4) return sorted
  const idx = [0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1]
  const unique = [...new Set(idx)].sort((a, b) => a - b)
  return unique.map((i) => sorted[i])
})

const TABLE_METRICS = [
  { key: 'weight', label: 'Weight (kg)', decimals: 1 },
  { key: 'chest', label: 'Chest (cm)', decimals: 1 },
  { key: 'abs', label: 'Abs (cm)', decimals: 1 },
  { key: 'hips', label: 'Hips (cm)', decimals: 1 },
  { key: 'arms', label: 'Arms (cm)', decimals: 1 },
  { key: 'thighs', label: 'Thighs (cm)', decimals: 1 },
]

function fmtCell(val, decimals) {
  if (val == null || Number.isNaN(Number(val))) return '—'
  return Number(val).toFixed(decimals)
}

const METRIC_KEYS_LOWER_BETTER = new Set(['weight', 'abs', 'hips', 'arms', 'thighs'])

function buildPerformanceChange(key, first, last) {
  let change = '—'
  let changeClass = 'change-neutral'
  if (first == null || last == null || Number.isNaN(Number(first)) || Number.isNaN(Number(last))) {
    return { change, changeClass }
  }
  const f = Number(first)
  const l = Number(last)
  if (Math.abs(f) < 1e-9) {
    change = l === f ? '0%' : '—'
    return { change, changeClass }
  }
  const pct = ((l - f) / Math.abs(f)) * 100
  change = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
  const lowerBetter = METRIC_KEYS_LOWER_BETTER.has(key)
  if (Math.abs(pct) < 0.05) {
    changeClass = 'change-neutral'
  } else if (pct < 0) {
    changeClass = lowerBetter ? 'change-down' : 'change-up'
  } else {
    changeClass = lowerBetter ? 'change-up' : 'change-down'
  }
  return { change, changeClass }
}

const performanceHeaders = computed(() => {
  const snaps = snapshotRecords.value
  const dateCols = snaps.map((rec, i) => ({
    title: formatShortDate(rec),
    key: `d${i}`,
    sortable: false,
  }))
  return [
    { title: 'Metric', key: 'metric', sortable: false },
    ...dateCols,
    { title: '% Change', key: 'change', sortable: false, align: 'center' },
  ]
})

const performanceRows = computed(() => {
  const snaps = snapshotRecords.value
  if (!snaps.length) return []

  return TABLE_METRICS.map(({ key, label, decimals }) => {
    const row = { metric: label }
    snaps.forEach((rec, i) => {
      row[`d${i}`] = fmtCell(metricsOf(rec)[key], decimals)
    })
    const first = metricsOf(snaps[0])[key]
    const last = metricsOf(snaps[snaps.length - 1])[key]
    const { change, changeClass } = buildPerformanceChange(key, first, last)
    row.change = change
    row.changeClass = changeClass
    return row
  })
})

const aiInsightText = computed(() => {
  const rows = sortedRecords.value
  if (rows.length < 2) {
    return 'Add more measurements over time to see trend-based insights.'
  }
  const first = metricsOf(rows[0])
  const last = metricsOf(rows[rows.length - 1])
  const parts = []
  if (first.weight != null && last.weight != null) {
    const dw = Number(last.weight) - Number(first.weight)
    if (Math.abs(dw) >= 0.1) {
      parts.push(
        dw < 0
          ? `Weight decreased by about ${Math.abs(dw).toFixed(1)} kg since the first entry.`
          : `Weight increased by about ${dw.toFixed(1)} kg since the first entry.`,
      )
    }
  }
  ;['chest', 'abs', 'hips'].forEach((k) => {
    const a = first[k]
    const b = last[k]
    if (a != null && b != null && !Number.isNaN(Number(a)) && !Number.isNaN(Number(b))) {
      const d = Number(b) - Number(a)
      if (Math.abs(d) >= 0.2) {
        parts.push(`${k} changed by ${d > 0 ? '+' : ''}${d.toFixed(1)} cm across recorded visits.`)
      }
    }
  })
  if (!parts.length) {
    return 'Measurements are stable across recorded visits. Keep logging body metrics to track progress.'
  }
  return parts.join(' ')
})
</script>

<style scoped>
.body-metrics-content {
  padding: 0 0 24px;
  max-width: 100%;
}

.body-metrics-content .text-grey-darken-3 {
  color: #272727;
}

.body-metrics-content .v-card {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
}

.chart-wrap {
  position: relative;
  width: 100%;
  height: 260px;
}

.performance-table :deep(thead tr) {
  background: #ebecef;
}

.performance-table :deep(thead th) {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.performance-table :deep(tbody td) {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
</style>
