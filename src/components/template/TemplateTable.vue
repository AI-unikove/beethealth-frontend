<template>
  <div class="templateWrap">
    <CrudList
      :headers="headers"
      :items="paginatedItems"
      :items-length="filteredTemplates.length"
      :loading="loading"
      :page="page"
      :items-per-page="itemsPerPage"
      :sort-by="sortBy"
      add-button-text="Add Template"
      @update:page="page = $event"
      @update:items-per-page="itemsPerPage = $event"
      @update:sort-by="sortBy = $event"
      @row-click="handleRowClick"
      @refresh="handleRefresh"
    >
      <template #search>
        <div class="search-container">
          <input
            v-model="searchQuery"
            clearable
            type="text"
            class="search-box"
            placeholder="Search by template name or duration"
          />
        </div>
      </template>

      <template #toolbar-actions>
        <button class="icon-btn" @click="toggleFilters">
          <img src="@/assets/images/setting.svg" alt="Filters" />
        </button>
      </template>

      <template #filters>
        <TemplateFilters
          v-if="showFilters"
          v-model:durations="filterDurations"
          v-model:template-names="filterTemplateNames"
          :duration-options="durationOptions"
          :template-name-options="templateNameOptions"
        />
      </template>
      <template #add-action>
        <div class="template-add-wrapper" @mouseenter="openDropdown">
          <button class="button buttonBg"><b>Add Template</b></button>
          <div
            v-if="showDropdown"
            class="template-dropdown"
            @mouseenter="openDropdown"
            @mouseleave="closeDropdown"
          >
            <div class="dropdown-item" @click="goCreateTemplate">Create New Template</div>
            <div class="dropdown-item" @click="goUploadTemplate">Upload Template Document</div>
          </div>
        </div>
      </template>

      <template #[`item.name`]="{ item }">
        <div class="client-name">
          <span v-if="item.isDraft" class="draft-label">Draft</span>
          <span>{{ item.templateName || 'Untitled Template' }}</span>
        </div>
      </template>

      <template #[`item.plan`]="{ item }">
        {{ item.description || 'N/A' }}
      </template>

      <template #[`item.dietPlan`]="{ item }">
        {{ formatDuration(item.durationInDays) }}
      </template>

      <template #[`item.progress`]="{ item }">
        <div class="avatar-stack">
          <button
            v-for="(client, index) in item.assignedTo?.slice(0, 4)"
            :key="index"
            class="avatar-img"
            type="button"
            :title="getClientName(client)"
            @click.stop="goToClientProfile(client)"
          >
            <InitialsAvatar
              :name="getClientName(client)"
              :src="getClientPicture(client)"
              :size="34"
              :title="getClientName(client)"
            />
          </button>
          <div
            v-if="item.assignedTo?.length > 4"
            class="avatar-more"
            :title="getRemainingClientsNames(item.assignedTo)"
          >
            +{{ item.assignedTo.length - 4 }}
          </div>
          <div
            v-if="!item.assignedTo || item.assignedTo.length === 0"
            class="text-caption text-grey"
          >
            Not assigned
          </div>
          <button class="assign-plus" type="button" @click.stop="handleAssignClient(item)">
            +
          </button>
        </div>
      </template>
    </CrudList>
  </div>
</template>

<script setup>
import router from '@/router'
import CrudList from '@/components/common/CrudList.vue'
import InitialsAvatar from '@/components/common/InitialsAvatar.vue'
import TemplateFilters from '@/components/template/TemplateFilters.vue'
import { computed, ref } from 'vue'

const props = defineProps({
  templates: {
    type: Array,
    required: true,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['row-click', 'refresh', 'edit', 'delete', 'assign-client'])

const searchQuery = ref('')
const page = ref(1)
const itemsPerPage = ref(10)
const showDropdown = ref(false)
const showFilters = ref(false)
const filterDurations = ref([])
const filterTemplateNames = ref([])
const sortBy = ref([])

const headers = [
  { title: 'Template Name', key: 'name', sortable: true },
  { title: 'Target Group', key: 'plan', sortable: true },
  { title: 'Duration', key: 'dietPlan', sortable: true },
  { title: 'Assigned To', key: 'progress', sortable: false },
]

const durationOptions = computed(() => {
  const seen = new Set()
  for (const t of props.templates) {
    const d = formatDuration(t.durationInDays)
    seen.add(d)
  }
  return [...seen].sort()
})

const templateNameOptions = computed(() => {
  const seen = new Set()
  for (const t of props.templates) {
    const name = t.templateName || 'Untitled Template'
    seen.add(name)
  }
  return [...seen].sort()
})

const filteredTemplates = computed(() => {
  let result = props.templates

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((template) => {
      const name = (template.templateName || '').toLowerCase()
      const description = (template.description || '').toLowerCase()
      return name.includes(query) || description.includes(query)
    })
  }

  if (filterDurations.value.length > 0) {
    result = result.filter((template) =>
      filterDurations.value.includes(formatDuration(template.durationInDays)),
    )
  }

  if (filterTemplateNames.value.length > 0) {
    result = result.filter((template) =>
      filterTemplateNames.value.includes(template.templateName || 'Untitled Template'),
    )
  }

  if (sortBy.value.length > 0) {
    const { key, order } = sortBy.value[0]
    result = [...result].sort((a, b) => {
      let aVal, bVal
      if (key === 'name') {
        aVal = (a.templateName || '').toLowerCase()
        bVal = (b.templateName || '').toLowerCase()
      } else if (key === 'plan') {
        aVal = (a.description || '').toLowerCase()
        bVal = (b.description || '').toLowerCase()
      } else if (key === 'dietPlan') {
        aVal = formatDuration(a.durationInDays)
        bVal = formatDuration(b.durationInDays)
      } else {
        aVal = ''
        bVal = ''
      }
      if (aVal < bVal) return order === 'desc' ? 1 : -1
      if (aVal > bVal) return order === 'desc' ? -1 : 1
      return 0
    })
  }

  return result
})

const paginatedItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  return filteredTemplates.value.slice(start, start + itemsPerPage.value)
})

function formatDuration(days) {
  if (!days) return 'N/A'
  const weeks = Math.floor(days / 7)
  return weeks === 1 ? '1 week' : `${weeks} weeks`
}

function getClientName(client) {
  if (!client) return 'Unknown'

  // Client model has profile.fullName field
  const fullName = client.profile?.fullName || client.fullName || client.name || ''

  if (fullName && fullName.trim()) return fullName.trim()
  return 'Unknown Client'
}

function getClientPicture(client) {
  return client?.profile?.profilePicture || client?.profilePicture || ''
}

function getRemainingClientsNames(assignedClients) {
  if (!assignedClients || assignedClients.length <= 4) return ''

  const remaining = assignedClients.slice(4)
  const names = remaining.map((client) => getClientName(client))

  return names.join(', ')
}

function handleRowClick(item) {
  emit('row-click', item)
}

function goToClientProfile(client) {
  if (client && (client._id || client.id)) {
    const clientId = client._id || client.id
    router.push(`/client/${clientId}`)
  }
}

function handleRefresh() {
  emit('refresh')
}

function handleAssignClient(item) {
  emit('assign-client', item)
}

function openDropdown() {
  showDropdown.value = true
}

function closeDropdown() {
  showDropdown.value = false
}

function toggleFilters() {
  showFilters.value = !showFilters.value
}

function goCreateTemplate() {
  router.push('/create-template')
}

function goUploadTemplate() {
  console.log('upload clicked')
}
</script>
