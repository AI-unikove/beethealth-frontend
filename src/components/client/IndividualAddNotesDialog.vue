<template>
  <v-dialog
    :model-value="modelValue"
    max-width="460"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="notes-dialog pa-6">
      <div class="notes-dialog__header">
        <h3 class="notes-dialog__title">Add Notes</h3>
        <button class="notes-dialog__close" @click="$emit('update:modelValue', false)">
          <v-icon size="20">mdi-close</v-icon>
        </button>
      </div>

      <p class="notes-section-label">Client</p>
      <div class="notes-client-chip mb-4">
        <v-avatar size="28">
          <v-img :src="avatarSrc" :alt="clientName" cover />
        </v-avatar>
        <span class="notes-client-chip__name">{{ clientName }}</span>
      </div>

      <textarea
        v-model="notes"
        class="notes-textarea"
        placeholder="Add notes for this client…"
        rows="5"
      />

      <div class="d-flex justify-end mt-4">
        <button class="notes-save-btn" :disabled="!notes.trim() || saving" @click="handleSave">
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { addClientNotes } from '@/services/client.service'
import { getClientAvatarSrc } from '@/utils/clientAvatar'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  client: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'done'])

const notes = ref('')
const saving = ref(false)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      // Pre-fill with existing notes if present
      notes.value = props.client?.goalsProfile?.additionalNotes || ''
    }
  },
)

const clientName = computed(() => {
  if (!props.client) return 'Client'
  return props.client.profile?.fullName || props.client.fullName || 'Client'
})

const avatarSrc = computed(() => {
  return getClientAvatarSrc(props.client?.profile?.gender, props.client?.profile?.avatar)
})

async function handleSave() {
  if (!notes.value.trim() || !props.client) return
  saving.value = true
  try {
    const id = props.client._id || props.client.id
    await addClientNotes(id, notes.value.trim())
    emit('done', { action: 'add-notes', clientId: id, notes: notes.value.trim() })
    emit('update:modelValue', false)
  } catch (e) {
    console.error('Add notes failed:', e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.notes-dialog {
  border-radius: 16px !important;
}
.notes-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.notes-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}
.notes-dialog__close {
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
.notes-dialog__close:hover {
  background: #f0f0f0;
}
.notes-section-label {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}
.notes-client-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px 5px 5px;
  background: #f5f5f5;
  border-radius: 999px;
  border: 1px solid #e8e8e8;
}
.notes-client-chip__name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}
.notes-textarea {
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
  min-height: 120px;
}
.notes-textarea:focus {
  border-color: #d94fa3;
  background: #fff;
}
.notes-textarea::placeholder {
  color: #aaa;
}
.notes-save-btn {
  background: linear-gradient(135deg, #d94fa3, #ab2e95);
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 10px 32px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  font-family: inherit;
  min-width: 100px;
}
.notes-save-btn:hover:not(:disabled) {
  opacity: 0.9;
}
.notes-save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
