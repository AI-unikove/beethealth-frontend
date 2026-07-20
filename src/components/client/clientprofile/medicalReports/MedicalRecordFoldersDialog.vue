<template>
  <v-dialog
    :model-value="modelValue"
    max-width="860"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="folder-dialog-card" elevation="0">
      <header class="folder-dialog-header">
        <h2 class="folder-dialog-title">View Medical Records</h2>
        <button
          type="button"
          class="folder-dialog-close"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon size="20" color="grey-darken-1">mdi-close</v-icon>
        </button>
      </header>

      <v-card-text class="folder-dialog-body">
        <div class="folder-grid">
          <button
            v-for="folder in normalizedFolders"
            :key="folder.name"
            type="button"
            class="folder-card"
            @click="selectFolder(folder.name)"
          >
            <span class="folder-card-icon-wrap" aria-hidden="true">
              <v-icon size="26" color="pink-darken-2">mdi-folder-outline</v-icon>
            </span>
            <span class="folder-card-content">
              <span class="folder-card-name">{{ folder.name }}</span>
            </span>
            <span class="folder-card-right">
              <span class="folder-card-count">{{ folder.count }}</span>
              <v-icon size="16" color="grey-darken-1">mdi-chevron-right</v-icon>
            </span>
          </button>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const DEFAULT_FOLDERS = [
  { name: 'Diagnostics', count: 0 },
  { name: 'Health Summaries', count: 0 },
  { name: 'Insurance', count: 0 },
  { name: 'Lab Reports', count: 0 },
  { name: 'Prescriptions', count: 0 },
  { name: 'Vaccination Records', count: 0 },
  { name: 'Other', count: 0 },
]

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  folders: {
    type: Array,
    default: () => [
      { name: 'Diagnostics', count: 0 },
      { name: 'Health Summaries', count: 0 },
      { name: 'Insurance', count: 0 },
      { name: 'Lab Reports', count: 0 },
      { name: 'Prescriptions', count: 0 },
      { name: 'Vaccination Records', count: 0 },
      { name: 'Other', count: 0 },
    ],
  },
})

const emit = defineEmits(['update:modelValue', 'select'])

const normalizedFolders = computed(() => {
  const normalized = []
  for (const folder of props.folders || []) {
    if (typeof folder === 'string') {
      const name = folder.trim()
      if (name) {
        normalized.push({ name, count: 0 })
      }
      continue
    }
    if (!folder || typeof folder !== 'object') {
      continue
    }
    const name = (folder.name || folder.folderName || '').trim()
    if (!name) {
      continue
    }
    const count = Number(folder.count || 0)
    normalized.push({
      name,
      count: Number.isFinite(count) && count >= 0 ? count : 0,
    })
  }
  if (!normalized.length) {
    return DEFAULT_FOLDERS
  }
  const seen = new Set()
  return normalized.filter((item) => {
    if (seen.has(item.name)) {
      return false
    }
    seen.add(item.name)
    return true
  })
})

function selectFolder(folder) {
  emit('select', folder)
  emit('update:modelValue', false)
}
</script>

<style scoped>
.folder-dialog-card {
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 5px 8px rgba(0, 0, 0, 0.05),
    0 26px 54px rgba(0, 0, 0, 0.12);
}

.folder-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 34px 14px;
}

.folder-dialog-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  color: #2f2f2f;
}

.folder-dialog-close {
  width: 42px;
  height: 42px;
  border: 1px solid #f3c8e6;
  border-radius: 50%;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.folder-dialog-body {
  padding: 6px 34px 34px !important;
}

.folder-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.folder-card {
  border: 1px solid #e9e9e9;
  background: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  min-height: 44px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.folder-card:hover {
  border-color: #d9d9d9;
  background: #fcfcfc;
}

.folder-card:focus-visible {
  outline: 2px solid #b24b92;
  outline-offset: 2px;
}

.folder-card-icon-wrap {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff2fb;
}

.folder-card-content {
  display: block;
  min-width: 0;
}

.folder-card-name {
  font-size: 1.02rem;
  font-weight: 500;
  color: #5f5f5f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-card-count {
  font-size: 1.02rem;
  font-weight: 500;
  color: #666;
}

.folder-card-right {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 900px) {
  .folder-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .folder-dialog-header {
    padding-left: 18px;
    padding-right: 18px;
  }

  .folder-dialog-body {
    padding-left: 18px !important;
    padding-right: 18px !important;
  }

  .folder-grid {
    grid-template-columns: 1fr;
  }
}
</style>
