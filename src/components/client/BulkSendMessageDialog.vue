<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="bulk-dialog pa-6">
      <div class="bulk-dialog__header">
        <h3 class="bulk-dialog__title">Send Message</h3>
        <button class="bulk-dialog__close" @click="$emit('update:modelValue', false)">
          <v-icon size="20">mdi-close</v-icon>
        </button>
      </div>

      <p class="bulk-section-label">Selected clients</p>
      <div class="bulk-clients-row">
        <div v-for="client in localClients" :key="clientId(client)" class="client-chip">
          <v-avatar size="28" class="client-chip__avatar">
            <v-img :src="avatarSrc(client)" :alt="clientName(client)" cover />
          </v-avatar>
          <span class="client-chip__name">{{ clientName(client) }}</span>
          <button class="client-chip__remove" @click="removeClient(clientId(client))">×</button>
        </div>
        <button class="client-chip client-chip--add">Add Client</button>
      </div>

      <textarea
        v-model="message"
        class="message-textarea mt-4"
        placeholder="Try to up your water intake."
        rows="4"
      />

      <div class="d-flex justify-end mt-4">
        <button
          class="bulk-action-btn"
          :disabled="!message.trim() || localClients.length === 0"
          @click="handleSend"
        >
          Send
        </button>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getClientAvatarSrc } from '@/utils/clientAvatar'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  clients: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'done'])

const localClients = ref([])
const message = ref('')

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      localClients.value = [...props.clients]
      message.value = ''
    }
  },
)

function clientId(c) {
  return c._id || c.id
}
function clientName(c) {
  return c.profile?.fullName || c.fullName || 'N/A'
}
function avatarSrc(c) {
  return getClientAvatarSrc(c?.profile?.gender, c?.profile?.avatar)
}
function removeClient(id) {
  localClients.value = localClients.value.filter((c) => clientId(c) !== id)
}

function handleSend() {
  // UI only — backend integration pending
  emit('done', {
    action: 'message',
    clientIds: localClients.value.map(clientId),
    message: message.value,
  })
  emit('update:modelValue', false)
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
.bulk-section-label {
  font-size: 13px;
  font-weight: 500;
  color: #555;
  margin-bottom: 10px;
}
.bulk-clients-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}
.client-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 4px;
  background: #f5f5f5;
  border-radius: 999px;
  border: 1px solid #e0e0e0;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}
.client-chip__avatar {
  flex-shrink: 0;
}
.client-chip__name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.client-chip__remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #999;
  line-height: 1;
  padding: 0 0 0 2px;
  display: flex;
  align-items: center;
}
.client-chip__remove:hover {
  color: #d94fa3;
}
.client-chip--add {
  background: #fff;
  border: 1.5px dashed #d94fa3;
  color: #d94fa3;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 14px;
  font-size: 13px;
  border-radius: 999px;
  transition: background 0.15s;
}
.client-chip--add:hover {
  background: #fff0f7;
}
.message-textarea {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  color: #333;
  background: #fafafa;
  transition: border-color 0.15s;
}
.message-textarea:focus {
  border-color: #d94fa3;
  background: #fff;
}
.message-textarea::placeholder {
  color: #aaa;
}
.bulk-action-btn {
  background: linear-gradient(135deg, #d94fa3, #ab2e95);
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 10px 32px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  min-width: 100px;
}
.bulk-action-btn:hover:not(:disabled) {
  opacity: 0.9;
}
.bulk-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
