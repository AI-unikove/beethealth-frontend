<template>
  <v-dialog v-model="internalValue" max-width="560" persistent>
    <v-card rounded="xl" class="pa-2">
      <v-btn icon variant="text" class="close-btn" size="small" @click="handleClose">
        <v-icon size="20">mdi-close</v-icon>
      </v-btn>

      <v-card-text class="pa-8 pt-6">
        <!-- Success Icon -->
        <div class="text-center mb-4">
          <div class="celebration-icon">🎉</div>
        </div>

        <!-- Success Message -->
        <div class="success-message text-center mb-2">
          <template v-if="showCreationMessage">
            <strong>{{ templateName }}</strong> has been created successfully
          </template>
          <template v-else>
            Assign <strong>{{ templateName }}</strong> to client
          </template>
        </div>

        <!-- Question -->
        <div class="question-text text-center mb-6">
          {{
            showCreationMessage
              ? 'Would you like to assign this plan to your client?'
              : 'Select a client to assign this template'
          }}
        </div>

        <!-- Client Selector -->
        <div class="mb-6">
          <v-autocomplete
            v-model="selectedClient"
            :items="clientOptions"
            item-title="title"
            item-value="value"
            placeholder="Select client"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            :loading="clientStore.loading"
            hide-details="auto"
            clearable
            auto-select-first
          >
            <template #prepend-inner>
              <v-icon size="20" class="mr-2">mdi-magnify</v-icon>
            </template>
            <template #item="{ props: itemProps, item }">
              <v-list-item
                v-bind="itemProps"
                :title="item.title"
                :disabled="item.raw.disabled"
                :subtitle="item.raw.disabled ? 'Already assigned to another template' : undefined"
                :class="{ 'client-option-disabled': item.raw.disabled }"
              />
            </template>
          </v-autocomplete>
          <div v-if="assignError" class="assign-error mt-2">{{ assignError }}</div>
        </div>

        <!-- Newly Added Clients (if any) -->
        <div v-if="recentClients.length > 0" class="mb-6">
          <div class="text-subtitle-2 mb-3">Newly added clients</div>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="client in recentClients"
              :key="client._id"
              size="default"
              variant="outlined"
              class="client-chip"
              :class="{ 'client-chip-disabled': isClientAssigned(client) }"
              @click="selectRecentClient(client)"
            >
              <v-avatar start>
                <v-img v-if="client.profile?.profilePicture" :src="client.profile.profilePicture" />
                <span v-else class="text-caption">{{ getInitials(client.profile?.fullName) }}</span>
              </v-avatar>
              {{ client.profile?.fullName || 'Unnamed Client' }}
            </v-chip>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="d-flex gap-3 justify-end">
          <v-btn variant="text" color="grey-darken-2" size="large" rounded="lg" @click="handleSkip">
            Not Now
          </v-btn>
          <v-btn
            variant="flat"
            color="primary"
            size="large"
            rounded="lg"
            :disabled="!selectedClient"
            :loading="assigning"
            @click="handleAssign"
          >
            Assign
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useClientStore } from '@/stores/client.store'
import templateService from '@/services/templates.service'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  templateName: {
    type: String,
    default: 'Template',
  },
  templateId: {
    type: String,
    default: null,
  },
  assignedClientIds: {
    type: Array,
    default: () => [],
  },
  showCreationMessage: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'assigned', 'skip'])

const clientStore = useClientStore()
const selectedClient = ref(null)
const assigning = ref(false)
const assignError = ref('')

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const assignedClientIdSet = computed(() => {
  return new Set((props.assignedClientIds || []).map((id) => String(id)))
})

const clientOptions = computed(() => {
  return (clientStore.clients || []).map((client) => ({
    value: client._id,
    title: client.profile?.fullName || 'Unnamed Client',
    client: client,
    disabled: assignedClientIdSet.value.has(String(client._id)),
  }))
})

// Get recently added clients (last 3 clients)
const recentClients = computed(() => {
  const clients = clientStore.clients || []
  return clients
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
})

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function selectRecentClient(client) {
  if (!client?._id || isClientAssigned(client)) {
    return
  }
  selectedClient.value = client._id
}

function isClientAssigned(client) {
  if (!client?._id) return false
  return assignedClientIdSet.value.has(String(client._id))
}

async function handleAssign() {
  if (!selectedClient.value || !props.templateId) return
  if (assignedClientIdSet.value.has(String(selectedClient.value))) return

  assigning.value = true
  assignError.value = ''

  try {
    // Call API to assign template to client
    await templateService.assignClient(props.templateId, selectedClient.value)

    emit('assigned', selectedClient.value)
    internalValue.value = false
    selectedClient.value = null
  } catch (err) {
    assignError.value = err.response?.data?.message || 'Failed to assign template'
  } finally {
    assigning.value = false
  }
}

function handleSkip() {
  emit('skip')
  internalValue.value = false
  selectedClient.value = null
  assignError.value = ''
}

function handleClose() {
  handleSkip()
}

// Reset selection when dialog closes
watch(
  () => props.modelValue,
  async (newVal) => {
    if (newVal && (!clientStore.clients || clientStore.clients.length === 0)) {
      await clientStore.fetchAllClients({ limit: 1000 })
    }

    if (!newVal) {
      selectedClient.value = null
      assignError.value = ''
    }
  },
)

watch(
  () => selectedClient.value,
  (newValue) => {
    if (newValue && assignedClientIdSet.value.has(String(newValue))) {
      selectedClient.value = null
    }
  },
)
</script>

<style scoped>
.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.celebration-icon {
  font-size: 64px;
  line-height: 1;
}

.success-message {
  font-size: 16px;
  color: #333;
  line-height: 1.5;
}

.question-text {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.client-chip {
  cursor: pointer;
  transition: all 0.2s;
}

.client-chip:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

.client-chip-disabled {
  opacity: 0.55;
  filter: blur(1px);
  pointer-events: none;
}

.client-option-disabled {
  opacity: 0.6;
  filter: blur(1px);
}

.assign-error {
  color: #d32f2f;
  font-size: 12px;
}

.v-autocomplete :deep(.v-field) {
  border-radius: 12px;
}
</style>
