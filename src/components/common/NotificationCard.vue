<template>
  <div class="notification-card">
    <span class="notif-badge">{{ title }}</span>

    <p class="notif-message">{{ message }}</p>

    <!-- Actions -->
    <div class="notif-actions">
      <button
        v-for="(action, idx) in actions"
        :key="idx"
        :class="action.type === 'primary' ? 'button' : 'button buttonBg'"
      >
        <b>{{ action.label }}</b>
      </button>
    </div>
    <!-- Dots indicator -->
    <div class="notif-dots">
      <span v-for="i in 5" :key="i" class="dot" :class="{ 'dot--active': i === 1 }" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  actions: { type: Array, default: () => [] },
})
</script>

<style scoped>
.notification-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 20px;
}

.notification-card .notif-badge {
  display: inline-block;
  background: #fff3ef;
  color: #e0541b;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 20px;
  margin-bottom: 14px;
  letter-spacing: 0.02em;
  width: 112px;
}
.notification-card .notif-dots {
  display: flex;
  gap: 5px;
  align-items: center;
  margin-bottom: 20px;
  margin-left: 4px;
}
.dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #e0e0e0;
}

.dot--active {
  background: #e0541b;
}

.notif-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.notif-btn {
  padding: 7px 22px;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition:
    opacity 0.15s,
    transform 0.1s;
}

.notif-btn:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

.notif-btn--secondary {
  background: #ede7f6;
  color: #4a148c;
}

.notif-btn--primary {
  background: #7c3aed;
  color: #fff;
}
</style>
