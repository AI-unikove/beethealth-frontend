<template>
  <v-container class="home-page px-5 py-4">
    <h2 class="page-title mb-4">Recipes</h2>

    <v-row>
      <v-col cols="12" lg="8">
        <RecipeTable />
      </v-col>

      <v-col cols="12" lg="4">
        <TopPerformingCard
          class="mb-4"
          icon="mdi-star"
          badge="Top-performing plan"
          title="Balanced Lifestyle Plan is performing exceptionally — 8 clients reached their goals this month."
          button-text="View plan"
        />

        <AIAssistantCard
          expand-text="Expand"
          title="What can I help with?"
          descriptions="I can help you create, review, and improve plans, analyze client progress, or answer questions — all through chat or voice."
          add-title="🆕 Add new recipe"
          show-attention-title="🚨 Show allergy-prone recipes"
          suggest-plan-title="💡 Suggest recipes for less active clients"
          @add-handle="goToAddRecipe"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import TopPerformingCard from '@/components/common/TopPerformingCard.vue'
import AIAssistantCard from '@/components/common/AIAssistantCard.vue'
import RecipeTable from '@/components/recipe/RecipeTable.vue'

const router = useRouter()

function goToAddRecipe() {
  router.push({ name: 'add-recipe' })
}
</script>

<style scoped>
.page-title {
  font-size: 32px;
  font-weight: 700;
  padding: 0 15px;
}
</style>
