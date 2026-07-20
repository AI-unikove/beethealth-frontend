<template>
  <div class="d-block mb-6 gap-4">
    <div class="breadcrumbWrap">
      <router-link to="/recipes">Recipes</router-link>
      <v-icon size="small" color="grey-darken-1">mdi-chevron-right</v-icon>
      <span>Create New Recipe</span>
    </div>
    <div class="commanHead d-flex flex-wrap align-center justify-space-between">
      <h1 class="page-title">Create New Recipe</h1>
      <div class="d-flex gap-3 flex-wrap">
        <v-btn
          variant="outlined"
          color="grey-darken-2"
          rounded="lg"
          class="text-capitalize"
          :disabled="loading"
          @click="$emit('delete')"
        >
          Cancel
        </v-btn>
        <v-btn
          variant="outlined"
          color="primary"
          rounded="lg"
          class="text-capitalize"
          :disabled="saveDisabled || loading"
          :loading="loading"
          @click="$emit('save-draft')"
        >
          Save as draft
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          class="text-capitalize"
          :disabled="saveDisabled || loading"
          :loading="loading"
          @click="$emit('save')"
        >
          Save Recipe
        </v-btn>
      </div>
    </div>
    <!-- AI Assistance Card -->
    <v-card class="pa-4 mb-5 mt-5 rounded-lg useAiBox">
      <div class="useAiBoxContent">
        <h4>Use AI Assistance</h4>
        <p>You can use our AI voice to fill in the details and create your diet plan faster.</p>
        <v-btn color="white" rounded class="text-capitalize"> Talk to Beet AI </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: false },
  saveDisabled: { type: Boolean, default: true },
})
defineEmits(['delete', 'save-draft', 'save'])
</script>

<style scoped>
.breadcrumbWrap {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}
.breadcrumbWrap a {
  color: #666;
  text-decoration: none;
}
.breadcrumbWrap a:hover {
  text-decoration: underline;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #272727;
  margin: 0;
  padding: 0 15px;
}
.commanHead {
  gap: 16px;
}
</style>
