<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-text class="pa-6 text-center">
        <v-avatar :color="iconColor" size="56" class="mb-4">
          <v-icon size="30" color="white">{{ icon }}</v-icon>
        </v-avatar>
        <h3 class="text-h6 font-weight-bold mb-2">{{ title }}</h3>
        <p class="text-body-2 text-medium-emphasis mb-0">{{ message }}</p>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-0">
        <v-btn color="primary" block rounded="lg" @click="handleConfirm">
          {{ actionText }}
        </v-btn>
      </v-card-actions>
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
    default: 'Success',
  },
  message: {
    type: String,
    default: 'Operation completed successfully.',
  },
  actionText: {
    type: String,
    default: 'Continue',
  },
  icon: {
    type: String,
    default: 'mdi-check',
  },
  iconColor: {
    type: String,
    default: 'success',
  },
  maxWidth: {
    type: [String, Number],
    default: 440,
  },
  persistent: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

function handleConfirm() {
  emit('confirm')
}
</script>
