<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    :scrollable="scrollable"
    :content-class="contentClass"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card :class="cardClass">
      <!-- Header: title + close -->
      <div
        v-if="title || $slots['header-left'] || showHeaderClose"
        class="d-flex justify-space-between align-center mb-2"
      >
        <h3 v-if="title" class="text-h6 font-weight-bold">{{ title }}</h3>
        <slot name="header-left" />
        <v-spacer />
        <button
          class="button closeBtn"
          v-if="showHeaderClose"
          icon
          variant="text"
          size="small"
          @click="close"
        >
          <b><v-icon>mdi-close</v-icon></b>
        </button>
        <span v-else class="closeBtn" @click="close">
          <img src="@/assets/images/close.svg" alt="Close" />
        </span>
      </div>

      <!-- Body: different content per usage -->
      <div class="crud-dialog-body">
        <slot />
      </div>

      <!-- Optional common footer: Delete/Cancel + Save -->
      <div v-if="showFooter" class="d-flex justify-end mt-6 pt-2">
        <v-btn
          v-if="showDelete"
          variant="text"
          color="error"
          class="mr-3"
          :loading="deleteLoading"
          @click="$emit('delete')"
        >
          {{ deleteLabel }}
        </v-btn>
        <v-btn
          color="deep-purple"
          rounded
          :loading="saveLoading"
          :disabled="saveDisabled"
          @click="$emit('save')"
        >
          {{ saveLabel }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  maxWidth: {
    type: [String, Number],
    default: '560',
  },
  persistent: {
    type: Boolean,
    default: true,
  },
  scrollable: {
    type: Boolean,
    default: false,
  },
  contentClass: {
    type: String,
    default: 'crud-dialog',
  },
  cardClass: {
    type: String,
    default: 'pa-6 rounded-xl',
  },
  showFooter: {
    type: Boolean,
    default: false,
  },
  saveLabel: {
    type: String,
    default: 'Save',
  },
  saveLoading: {
    type: Boolean,
    default: false,
  },
  saveDisabled: {
    type: Boolean,
    default: false,
  },
  showDelete: {
    type: Boolean,
    default: false,
  },
  deleteLabel: {
    type: String,
    default: 'Delete',
  },
  deleteLoading: {
    type: Boolean,
    default: false,
  },
  showHeaderClose: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'close', 'save', 'delete'])

function close() {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.closeBtn {
  cursor: pointer;
  display: inline-flex;
}
</style>
