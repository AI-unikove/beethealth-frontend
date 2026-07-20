<template>
  <div class="meal-card">
    <h3 class="card-title">Meal Compliance</h3>

    <div class="chart-wrap">
      <Doughnut :data="chartData" :options="chartOptions" :plugins="plugins" />
    </div>

    <!-- Legend -->
    <div class="legend-bar">
      <span v-for="item in legend" :key="item.label" class="legend-item">
        <span class="legend-dot" :style="{ background: item.color }" />
        {{ item.label }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement } from 'chart.js'

ChartJS.register(ArcElement)

/* DATA */
const values = [28, 12, 8]

const colors = ['#DDE6B5', '#C7E3E6', '#F6D6CC']
const pillColors = ['#5B8C00', '#1E7FA3', '#E85D1F']

const AVG = 78

/* CENTER TEXT */
const centerPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    const { ctx } = chart
    const meta = chart.getDatasetMeta(0)
    if (!meta?.data?.length) return

    const { x, y } = meta.data[0]

    ctx.save()
    ctx.textAlign = 'center'

    ctx.font = '600 26px sans-serif'
    ctx.fillStyle = '#333'
    ctx.fillText(`${AVG}%`, x, y - 6)

    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#888'
    ctx.fillText('Avg Compliance', x, y + 14)

    ctx.restore()
  },
}

/* PILLS (perfect alignment) */
const pillPlugin = {
  id: 'pills',
  afterDraw(chart) {
    const { ctx } = chart
    const meta = chart.getDatasetMeta(0)

    ctx.save()

    meta.data.forEach((arc, i) => {
      const angle = (arc.startAngle + arc.endAngle) / 2
      const r = arc.outerRadius + 12

      const x = arc.x + Math.cos(angle) * r
      const y = arc.y + Math.sin(angle) * r

      drawPill(ctx, x, y, `${values[i]} Clients`, pillColors[i])
    })

    ctx.restore()
  },
}

/* DRAW PILL */
function drawPill(ctx, x, y, text, bg) {
  const w = 70,
    h = 22,
    r = 11

  ctx.beginPath()
  ctx.moveTo(x - w / 2 + r, y - h / 2)
  ctx.arcTo(x + w / 2, y - h / 2, x + w / 2, y + h / 2, r)
  ctx.arcTo(x + w / 2, y + h / 2, x - w / 2, y + h / 2, r)
  ctx.arcTo(x - w / 2, y + h / 2, x - w / 2, y - h / 2, r)
  ctx.arcTo(x - w / 2, y - h / 2, x + w / 2, y - h / 2, r)
  ctx.closePath()

  ctx.fillStyle = bg
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
}

/* CHART DATA */
const chartData = {
  datasets: [
    {
      data: values,
      backgroundColor: colors,
      borderColor: '#fff',
      borderWidth: 3,
    },
  ],
}

/* ✅ FIXED OPTIONS */
const chartOptions = {
  responsive: true,
  cutout: '50%', // 🔥 THIS FIXES THICKNESS
  rotation: -90,
  plugins: {
    legend: { display: false },
  },
  layout: {
    padding: 35,
  },
}

const plugins = [centerPlugin, pillPlugin]

/* LEGEND */
const legend = [
  { label: 'Critical', color: '#E85D1F' },
  { label: 'Moderate', color: '#1E7FA3' },
  { label: 'On-track', color: '#5B8C00' },
]
</script>

<style scoped>
.meal-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
}

.chart-wrap {
  max-width: 260px;
  margin: auto;
}

.legend-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #555;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>
