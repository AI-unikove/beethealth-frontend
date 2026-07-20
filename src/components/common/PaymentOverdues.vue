<template>
  <div class="payment-card">
    <h3 class="card-title">Payment Overdues</h3>

    <div class="overdue-list">
      <div v-for="(item, idx) in overdues" :key="idx" class="overdue-row">
        <div class="overdue-left">
          <div class="overdue-avatar">{{ item.initial }}</div>
          <div class="overdue-info">
            <div class="overdue-name">{{ item.name }}</div>
            <div class="overdue-detail">{{ item.detail }}</div>
          </div>
        </div>
        <button class="button buttonBg"><b>Remind</b></button>
      </div>
    </div>
  </div>
</template>

<script setup>
const overdues = [
  { initial: 'A', name: 'Arjun Mehta', detail: 'Payment pending for Sep 2025' },
  { initial: 'R', name: 'Rohit Sharma', detail: 'Payment pending for Oct 2025' },
  { initial: 'P', name: 'Priya Kapoor', detail: 'Payment pending for Oct 2025' },
  { initial: 'S', name: 'Sneha Patel', detail: 'Payment pending for Nov 2025' },
  { initial: 'V', name: 'Vikram Singh', detail: 'Payment pending for Nov 2025' },
]
</script>

<style scoped>
.payment-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
}

.payment-card .card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 14px;
}

.payment-card .overdue-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-card .overdue-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #ebecef;
}

.payment-card .overdue-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.payment-card .overdue-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #3b82f6;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.payment-card .overdue-name {
  color: #272727;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px; /* 142.857% */
  letter-spacing: 0.1px;
}

.payment-card .overdue-detail {
  color: #6d6d6d;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px; /* 133.333% */
  letter-spacing: 0.1px;
}

.payment-card .remind-btn {
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;

  color: #ab2e95;

  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  padding: 8px 16px;
  background:
    linear-gradient(white, white) padding-box,
    linear-gradient(135deg, #f7c6ff, #ffd6a5) border-box;
  border: 2px solid transparent;
  box-shadow: 0 2px 0 0 #d7c8e2;
}

.payment-card .remind-btn:hover {
}
</style>
