<template>
  <v-card class="side-highlight" elevation="0">
    <!-- Header -->
    <div class="d-flex justify-space-between align-items-center mb-3">
      <button class="expandBtn button buttonBg">
        <b>{{ expandText }}</b>
      </button>
      <v-btn icon size="small" variant="text" @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <!-- Title and Description -->
    <h5 class="card-title mb-2">{{ title }}</h5>
    <p class="card-description">{{ description }}</p>

    <!-- Action Buttons -->
    <span variant="text" class="action-btn-pink mb-2" block @click="$emit('add-handle')">
      {{ addTitle }}
    </span>

    <span variant="text" class="action-btn-pink mb-2" block @click="$emit('show-attention')">
      {{ showAttentionTitle }}
    </span>

    <span variant="text" class="action-btn-pink mb-3" block @click="$emit('suggest-plan')">
      {{ suggestPlanTitle }}
    </span>

    <!-- Message Input -->
    <div class="message-input-wrapper input-with-icon">
      <v-text-field
        v-model="message"
        placeholder="Write a message"
        variant="outlined"
        density="comfortable"
        hide-details
        @keyup.enter="handleSendMessage"
      >
        <template #append-inner>
          <span class="micIcon" @click="handleSendMessage">
            <img src="../../assets/images/mic.svg" alt="mic" />
          </span>
        </template>
      </v-text-field>
    </div>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  expandText: {
    type: String,
    default: 'Expand',
  },
  title: {
    type: String,
    default: 'What can I help with?',
  },
  description: {
    type: String,
    default:
      'I can help you create, review, and improve plans, analyze client progress, or answer questions — all through chat or voice.',
  },
  addTitle: {
    type: String,
    default: '',
  },
  showAttentionTitle: {
    type: String,
    default: '',
  },
  suggestPlanTitle: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'add-handle', 'show-attention', 'suggest-plan', 'send-message'])

const message = ref('')

function handleSendMessage() {
  if (message.value.trim()) {
    emit('send-message', message.value)
    message.value = ''
  }
}
</script>
