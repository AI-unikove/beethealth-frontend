<template>
  <div class="weight-card">
    <h3 class="card-title">Weight Trend</h3>

    <div class="trends">
      <div v-for="item in trends" :key="item.label" class="trend-row">
        <div class="trend-label">{{ item.label }}</div>
        <div class="bar-track">
          <div class="bar-fill" :style="{ width: item.value + '%', background: item.color }">
            <span class="bar-value" :style="{ color: item.textColor }">{{ item.value }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const trends = [
  { label: 'Progressing towards goal', value: 57, color: '#EEF4D0', textColor: '#5f880d' },
  { label: 'No Major Change', value: 28, color: '#DBF3F3', textColor: '#0c75a5' },
  { label: 'Moving Away from Goal', value: 25, color: '#FFE7E0', textColor: '#e85708' },
]
</script>

<style scoped>
.weight-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 16px;
}

.trends {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.trend-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.trend-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

/* Thick bar with value inside */
.bar-track {
  height: 64px;
  background: #f0f0f5;
  border-radius: 16px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  min-width: 40px;
  transition: width 0.5s ease;
}

.bar-value {
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
</style>
