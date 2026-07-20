<template>
  <v-dialog v-model="dialog" max-width="500" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>Add Recipes for New Items</span>
        <v-spacer />
        <v-btn icon variant="text" size="small" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="py-4">
        <p class="text-body-2 mb-4">
          The following items don't have recipes saved. Create them now so they can be reused in
          future plans.
        </p>

        <div v-if="unmatched.length > 0" class="items-list">
          <div
            v-for="(item, idx) in unmatched"
            :key="idx"
            class="item-row d-flex align-center gap-3 mb-3"
          >
            <span class="flex-grow-1 font-weight-medium">{{ item.name }}</span>
            <v-btn variant="outlined" size="small" color="primary" @click="goToAddRecipePage(idx)">
              + Add recipe
            </v-btn>
          </div>
        </div>

        <div v-else class="text-center py-6">
          <v-icon size="48" color="success" class="mb-3">mdi-check-circle</v-icon>
          <p class="text-body-1 font-weight-medium mb-2">All recipes created!</p>
          <p class="text-body-2 text-grey">You can now save your template.</p>
        </div>
      </v-card-text>

      <v-card-actions class="pb-6 px-6">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" variant="flat" @click="finalizeSave"> Done </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  items: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'done', 'add-recipe'])

const dialog = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const unmatched = ref([])

function setUnmatched(itemsList) {
  const uniqueByName = new Map()

  for (const item of itemsList || []) {
    const itemName = (item?.name || '').trim()
    if (!itemName) continue

    const normalized = itemName.toLowerCase()
    if (!uniqueByName.has(normalized)) {
      uniqueByName.set(normalized, {
        ...item,
        name: itemName,
        creating: false,
      })
    }
  }

  unmatched.value = Array.from(uniqueByName.values())
}

function goToAddRecipePage(idx) {
  const name = unmatched.value[idx]?.name
  if (!name) return
  emit('add-recipe', { name })
}

function closeDialog() {
  unmatched.value = []
  dialog.value = false
}

function finalizeSave() {
  emit('done')
  closeDialog()
}

defineExpose({ setUnmatched, finalizeSave })
</script>

<style scoped>
.items-list {
  max-height: 300px;
  overflow-y: auto;
}

.item-row {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.item-row:last-child {
  border-bottom: none;
}
</style>
