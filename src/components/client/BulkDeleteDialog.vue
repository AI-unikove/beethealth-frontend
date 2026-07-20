<template>
  <v-dialog
    :model-value="modelValue"
    max-width="460"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="bulk-dialog pa-6">
      <div class="bulk-dialog__header">
        <h3 class="bulk-dialog__title">Delete Clients</h3>
        <button class="bulk-dialog__close" @click="$emit('update:modelValue', false)">
          <v-icon size="20">mdi-close</v-icon>
        </button>
      </div>

      <p class="delete-message">
        This will <strong>permanently remove</strong>
        <template v-if="clientNames.length <= 3">
          <span v-for="(name, i) in clientNames" :key="i">
            <strong>{{ name }}</strong
            ><template v-if="i < clientNames.length - 1">, </template>
          </span>
        </template>
        <template v-else>
          <strong>{{ clientNames.slice(0, 3).join(', ') }}</strong>
          and <strong>{{ clientNames.length - 3 }} more</strong>
        </template>
        from your client list. Are you sure?
      </p>

      <div class="d-flex justify-end mt-6 gap-3">
        <button class="cancel-btn" @click="$emit('update:modelValue', false)">Cancel</button>
        <button class="delete-btn" :disabled="deleting" @click="handleDelete">
          {{ deleting ? 'Deleting…' : 'Delete' }}
        </button>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useClientStore } from '@/stores/client.store'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  clients: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'done'])

const clientStore = useClientStore()
const deleting = ref(false)
const localClients = ref([])

watch(
  () => props.modelValue,
  (open) => {
    if (open) localClients.value = [...props.clients]
  },
)

const clientNames = computed(() =>
  localClients.value.map((c) => c.profile?.fullName || c.fullName || 'N/A'),
)

async function handleDelete() {
  if (localClients.value.length === 0) return
  deleting.value = true
  try {
    await Promise.all(localClients.value.map((c) => clientStore.removeClient(c._id || c.id)))
    emit('done', {
      action: 'delete',
      clientIds: localClients.value.map((c) => c._id || c.id),
    })
    emit('update:modelValue', false)
  } catch (e) {
    console.error('Delete failed:', e)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.bulk-dialog {
  border-radius: 16px !important;
}
.bulk-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.bulk-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}
.bulk-dialog__close {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.15s;
}
.bulk-dialog__close:hover {
  background: #f0f0f0;
}
.delete-message {
  font-size: 14px;
  color: #444;
  line-height: 1.6;
}
.gap-3 {
  gap: 12px;
}
.cancel-btn {
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  padding: 9px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.cancel-btn:hover {
  background: #f5f5f5;
}
.delete-btn {
  background: #d32f2f;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 10px 28px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  font-family: inherit;
  min-width: 90px;
}
.delete-btn:hover:not(:disabled) {
  opacity: 0.88;
}
.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
