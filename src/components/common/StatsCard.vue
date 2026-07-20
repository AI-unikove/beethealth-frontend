<template>
  <div class="stats-card">
    <!-- Header -->
    <div class="stats-header">
      <div class="stats-avatar">
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="#ddc9b8" />
          <circle cx="24" cy="18" r="9" fill="#a07850" />
          <ellipse cx="24" cy="42" rx="15" ry="10" fill="#a07850" />
        </svg>
      </div>

      <div class="stats-info">
        <div class="stats-name">Rohit Malhotra</div>
        <div class="stats-kcal">
          <span class="kcal-current">2,650</span>
          <span class="kcal-target"> /2,000 kcal</span>
        </div>
      </div>
    </div>

    <!-- Bars -->
    <div class="bars">
      <div v-for="n in nutrients" :key="n.label" class="nutrient-row">
        <div class="bar-track">
          <!-- Left label -->
          <span class="bar-label">{{ n.label }}</span>

          <!-- Right value section -->
          <div class="bar-value-box">{{ n.current }}/{{ n.target }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const nutrients = [
  { label: 'Carbs', current: 228, target: 190 },
  { label: 'Fat', current: 96, target: 100 },
]
</script>

<style scoped>
/* Card */
.stats-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 360px;
}

/* Header */
.stats-card .stats-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-card .stats-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
}

.stats-card .stats-avatar svg {
  width: 100%;
  height: 100%;
}

.stats-card .stats-name {
  color: #272727;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0.15px;
}

.stats-card .kcal-current {
  color: #e85708;
  font-size: 24px;
  font-weight: 500;
  line-height: 28px;
  letter-spacing: 0;
}

.stats-card .kcal-target {
  font-size: 14px;
  font-weight: 500;
  line-height: 28px;
  letter-spacing: 0;
  color: #6d6d6d;
}

/* Bars */
.stats-card .bars {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.stats-card .bars .nutrient-row {
  width: 100%;
}

/* TRACK */
.stats-card .bars .bar-track {
  position: relative;
  height: 34px;
  background: #ffe7e0;
  border-radius: 20px;
  display: flex;
  align-items: center;
  padding-left: 16px;
  overflow: hidden;
}

/* LEFT LABEL */
.stats-card .bars .bar-label {
  font-size: 14px;
  font-weight: 600;
  color: #3b2f2f;
  z-index: 1;
}

/* RIGHT VALUE BOX */
.stats-card .bars .bar-value-box {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  min-width: 110px;
  background: #ff8f6e;
  color: #fff;
  font-weight: 500;
  font-size: 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 0 20px 20px 0;
}

/* Divider line */
.stats-card .bars .bar-value-box::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 6px;
  width: 2px;
  background: #e65a2e;
  height: 100%;
}
</style>
