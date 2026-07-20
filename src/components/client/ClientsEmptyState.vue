<template>
  <v-card elevation="2" rounded="lg">
    <v-card-text class="text-center pa-16">
      <v-icon 
        size="80" 
        color="grey-lighten-1" 
        class="mb-4"
      >
        {{ icon }}
      </v-icon>
      
      <h3 class="text-h5 font-weight-bold mb-2">
        {{ title }}
      </h3>
      
      <p class="text-body-1 text-medium-emphasis mb-6">
        {{ description }}
      </p>
      
      <v-btn
        v-if="showButton"
        color="primary"
        variant="outlined"
        size="large"
        :prepend-icon="buttonIcon"
        @click="$emit('action')"
      >
        {{ buttonText }}
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'mdi-account-group-outline'
  },
  title: {
    type: String,
    default: 'No clients yet'
  },
  description: {
    type: String,
    default: 'Get started by adding your first client'
  },
  showButton: {
    type: Boolean,
    default: true
  },
  buttonText: {
    type: String,
    default: 'Add Your First Client'
  },
  buttonIcon: {
    type: String,
    default: 'mdi-plus'
  }
})

defineEmits(['action'])
</script>

<style scoped>
/* Component-specific styles */
</style>
