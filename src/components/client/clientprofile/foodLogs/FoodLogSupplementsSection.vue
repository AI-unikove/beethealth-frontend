<template>
  <div class="log-card">
    <div class="section-title">Supplements</div>
    <div class="items-list">
      <div v-for="(supplement, index) in supplements" :key="index" class="supplements">
        <span>{{ supplement.name }}</span>
        <span :class="supplement.taken ? 'takenActive' : ''">{{
          supplement.taken ? 'Taken' : '—'
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  supplements: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.log-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.items-list {
  margin-top: 10px;
}

.supplements {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.supplements:last-child {
  border-bottom: none;
}

.takenActive {
  color: #5f880d;
  font-weight: 600;
}
</style>
