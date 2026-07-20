<template>
  <v-dialog
    :model-value="modelValue"
    max-width="420"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="hold-dialog pa-6">
      <div class="hold-dialog__header">
        <h3 class="hold-dialog__title">Put on <span class="hold-highlight">Hold</span></h3>
        <button class="hold-dialog__close" @click="$emit('update:modelValue', false)">
          <v-icon size="20">mdi-close</v-icon>
        </button>
      </div>

      <p class="hold-dialog__message">
        This will put <strong>{{ clientName }}</strong
        >'s plan on <span class="hold-highlight">hold</span>. Are you sure?
      </p>

      <div class="d-flex justify-end mt-6">
        <button class="hold-confirm-btn" :disabled="saving" @click="handleConfirm">
          {{ saving ? 'Processing…' : 'Put on hold' }}
        </button>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { putClientOnHold } from '@/services/client.service'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  client: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'done'])

const saving = ref(false)

const clientName = computed(() => {
  if (!props.client) return 'this client'
  return props.client.profile?.fullName || props.client.fullName || 'this client'
})

async function handleConfirm() {
  if (!props.client) return
  saving.value = true
  try {
    const id = props.client._id || props.client.id
    await putClientOnHold(id)
    emit('done', { action: 'put-on-hold', clientId: id })
    emit('update:modelValue', false)
  } catch (e) {
    console.error('Put on hold failed:', e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.hold-dialog {
  border-radius: 16px !important;
}
.hold-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.hold-dialog__title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}
.hold-highlight {
  background: #ffe066;
  border-radius: 4px;
  padding: 0 3px;
  color: #1a1a1a;
}
.hold-dialog__close {
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
.hold-dialog__close:hover {
  background: #f0f0f0;
}
.hold-dialog__message {
  font-size: 14px;
  color: #444;
  line-height: 1.6;
}
.hold-confirm-btn {
  background: linear-gradient(135deg, #d94fa3, #ab2e95);
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 10px 28px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  font-family: inherit;
  min-width: 130px;
}
.hold-confirm-btn:hover:not(:disabled) {
  opacity: 0.9;
}
.hold-confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
