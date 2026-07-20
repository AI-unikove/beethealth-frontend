<template>
  <div class="qa-card">
    <h3 class="card-title">Quick Access</h3>
    <div class="qa-actions">
      <div
        v-for="item in actions"
        :key="item.label"
        class="qa-item"
        role="button"
        tabindex="0"
        @click="quickAccess(item.page)"
      >
        <div class="qa-icon" :style="{ background: item.color }">
          <img :src="getImage(item.path)" alt="image" />
        </div>
        <span class="qa-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const actions = [
  {
    label: 'Add Client',
    path: 'add-alt.svg',
    color: '#E4D7EE',
    page: 'add-client',
  },
  {
    label: 'Create Plan',
    path: 'tCreate_Plan.svg',
    color: '#FFE7E0',
    page: 'create-template',
  },
  {
    label: 'Export Report',
    path: 'ibm--elo--publishing.svg',
    color: '#D7E7FF',
    page: '',
  },
]
const getImage = (name) => {
  return new URL(`../../assets/images/${name}`, import.meta.url).href
}
function quickAccess(page) {
  router.push(`/${page}`)
}
</script>

<style scoped>
.qa-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 16px;
}

.qa-actions {
  display: flex;
  justify-content: space-around;
  gap: 8px;
}

.qa-item {
  display: flex;
  flex-direction: column;
  align-items: start;
  background: #f8f8f8;
  padding: 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: background 0.15s;
  flex: 1;
}

.qa-item:hover {
  background: #f5f0ff;
}

.qa-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #ede7f6;
  color: #7c3aed;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qa-icon svg {
  width: 18px;
  height: 18px;
}

.qa-label {
  color: #272727;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  margin-top: 20px;
  letter-spacing: 0.1px;
}
</style>
