<template>
  <v-container class="home-page px-5 py-4">
    <!-- Page Title -->
    <h2 class="page-title mb-4">Templates</h2>

    <!-- Loading State -->
    <LoadingState v-if="templatesStore.loading" message="Loading templates..." />

    <!-- Error State -->
    <ErrorAlert
      v-else-if="templatesStore.error"
      :message="templatesStore.error"
      show-retry
      @retry="loadTemplates"
    />

    <!-- Main Content -->
    <v-row v-else>
      <!-- LEFT SECTION - Templates Table -->
      <v-col cols="12" lg="8">
        <TemplateTable
          :templates="templatesStore.templates"
          :loading="templatesStore.loading"
          @row-click="handleRowClick"
          @refresh="loadTemplates"
          @edit="handleEdit"
          @delete="handleDelete"
          @assign-client="handleOpenAssignDialog"
        />
      </v-col>

      <!-- RIGHT SECTION - Sidebar Cards -->
      <v-col cols="12" lg="4">
        <!-- Top Performing Card -->
        <TopPerformingCard
          class="mb-4"
          icon="mdi-star"
          badge="Top-performing plan"
          title="Balanced Lifestyle Plan is performing exceptionally — 8 clients reached their goals this month."
          button-text="View plan"
          @view-plan="handleViewPlan"
        />

        <!-- AI Assistant Card -->
        <AIAssistantCard
          expand-text="Expand"
          title="What can I help with?"
          descriptions="I can help you create, review, and improve plans, analyze client progress, or answer questions — all through chat or voice."
          add-title="🆕 Create new template"
          show-attention-title="🚨 Show templates with alerts"
          suggest-plan-title="💡 Suggest plan for stagnant clients"
          @close="handleCloseAssistant"
          @add-handle="handleAdd"
          @show-attention="handleShowAttention"
          @suggest-plan="handleSuggestPlan"
          @send-message="handleSendMessage"
        />
      </v-col>
    </v-row>

    <AssignTemplateDialog
      v-model="showAssignDialog"
      :template-name="selectedTemplateName"
      :template-id="selectedTemplateId"
      :assigned-client-ids="assignedClientIds"
      :show-creation-message="false"
      @assigned="handleTemplateAssigned"
      @skip="handleAssignSkipped"
    />

    <!-- Footer -->
    <!-- <div class="footer text-center mt-5">
      Terms of Service | Privacy Policy | Disclosures
      <br />
      © 2025 40by60, Inc
    </div> -->
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTemplatesStore } from '@/stores/templates.store'
import { useClientStore } from '@/stores/client.store'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import TopPerformingCard from '@/components/common/TopPerformingCard.vue'
import AIAssistantCard from '@/components/common/AIAssistantCard.vue'
import TemplateTable from '@/components/template/TemplateTable.vue'
import AssignTemplateDialog from '@/components/template/AssignTemplateDialog.vue'

const templatesStore = useTemplatesStore()
const clientStore = useClientStore()
const router = useRouter()
const showAssignDialog = ref(false)
const selectedTemplateId = ref(null)
const selectedTemplateName = ref('Template')

const assignedClientIds = computed(() => {
  const ids = new Set()
  for (const template of templatesStore.templates || []) {
    for (const client of template.assignedTo || []) {
      if (client?._id || client?.id) {
        ids.add(client._id || client.id)
      }
    }
  }
  return Array.from(ids)
})

// Load templates on component mount
onMounted(() => {
  loadInitialData()
})

async function loadInitialData() {
  try {
    await Promise.all([loadTemplates(), clientStore.fetchAllClients({ limit: 1000 })])
  } catch (error) {
    console.error('Failed to load initial data:', error)
  }
}

// Function to load templates
async function loadTemplates() {
  try {
    await templatesStore.fetchAllTemplates()
  } catch (error) {
    console.error('Failed to load templates:', error)
  }
}

function handleOpenAssignDialog(item) {
  selectedTemplateId.value = item._id || item.id || null
  selectedTemplateName.value = item.templateName || 'Template'
  showAssignDialog.value = true
}

async function handleTemplateAssigned() {
  showAssignDialog.value = false
  await loadTemplates()
}

function handleAssignSkipped() {
  showAssignDialog.value = false
}

// Handle row click - navigate to template detail
function handleRowClick(item) {
  const templateId = item._id || item.id
  router.push(`/template/${templateId}`)
}

// Handle edit template
function handleEdit(item) {
  console.log('Edit template:', item)
  const templateId = item._id || item.id
  router.push(`/template/${templateId}/edit`)
}

// Handle delete template
function handleDelete(item) {
  console.log('Delete template:', item)
  // TODO: Implement delete functionality with confirmation dialog
}

// Right sidebar handlers
function handleViewPlan() {
  console.log('View plan clicked')
  // TODO: Navigate to plan details
}

function handleCloseAssistant() {
  console.log('Close assistant clicked')
  // TODO: Hide assistant card
}

function handleAdd() {
  router.push('/create-template')
}

function handleShowAttention() {
  console.log('Show clients needing attention')
  // TODO: Filter clients by attention status
}

function handleSuggestPlan() {
  console.log('Suggest plan for stagnant clients')
  // TODO: AI suggestion logic
}

function handleSendMessage(message) {
  console.log('Send message:', message)
  // TODO: Send message to AI assistant
}
</script>

<style scoped>
.page-title {
  font-size: 32px;
  font-weight: 700;
  padding: 0 15px;
}

.side-card {
  background: #fff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}

.action-btn {
  border-radius: 30px;
  text-transform: none;
  font-weight: 600;
}

.expand-text {
  font-size: 14px;
  font-weight: 600;
}

.card-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.footer {
  font-size: 14px;
  color: #777;
  margin-top: 40px;
}
</style>
