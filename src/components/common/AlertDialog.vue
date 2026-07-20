<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>{{ title }}</span>
        <v-spacer />
        <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="text-body-2">{{ message }}</div>
      </v-card-text>

      <v-card-actions class="pb-6 px-6">
        <v-spacer />
        <v-btn color="primary" variant="flat" @click="$emit('update:modelValue', false)">
          {{ confirmText }}
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
    default: 'Validation',
  },
  message: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: 'OK',
  },
  maxWidth: {
    type: [String, Number],
    default: 440,
  },
  persistent: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['update:modelValue'])
</script>
