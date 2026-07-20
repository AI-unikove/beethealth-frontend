<!-- eslint-disable vue/no-mutating-props -->
<template>
  <v-sheet class="rounded-lg pa-4 mb-4">
    <div class="ingredients-header mb-3">
      <div class="d-flex align-center flex-wrap gap-1">
        <h4 class="ingredients-title mb-0">Ingredients</h4>
      </div>
    </div>

    <v-row v-if="form.ingredients?.length" dense class="ingredients-grid">
      <v-col cols="12" md="6">
        <div
          v-for="ing in ingredientsLeftColumn"
          :key="'l-' + ing._idx"
          class="ingredient-row d-flex gap-2 align-center mb-3"
        >
          <v-text-field
            v-model="form.ingredients[ing._idx].name"
            placeholder="e.g. Chicken Breast"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="white"
            class="ingredient-name flex-grow-1"
          />
          <v-text-field
            v-model="form.ingredients[ing._idx].quantity"
            placeholder="e.g. 250g"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="white"
            class="ingredient-qty"
          />
          <v-btn
            icon
            variant="text"
            size="small"
            color="grey"
            @click="$emit('remove-ingredient', ing._idx)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-col>
      <v-col cols="12" md="6">
        <div
          v-for="ing in ingredientsRightColumn"
          :key="'r-' + ing._idx"
          class="ingredient-row d-flex gap-2 align-center mb-3"
        >
          <v-text-field
            v-model="form.ingredients[ing._idx].name"
            placeholder="e.g. Chicken Breast"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="white"
            class="ingredient-name flex-grow-1"
          />
          <v-text-field
            v-model="form.ingredients[ing._idx].quantity"
            placeholder="e.g. 250g"
            variant="outlined"
            density="compact"
            hide-details
            rounded="lg"
            bg-color="white"
            class="ingredient-qty"
          />
          <v-btn
            icon
            variant="text"
            size="small"
            color="grey"
            @click="$emit('remove-ingredient', ing._idx)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <v-btn
      variant="outlined"
      color="grey-darken-1"
      rounded="lg"
      class="text-capitalize add-ingredient-btn mt-2"
      @click="$emit('add-ingredient')"
    >
      Add Ingredient
    </v-btn>
  </v-sheet>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  form: { type: Object, required: true },
})
defineEmits(['add-ingredient', 'remove-ingredient'])

const ingredientsList = computed(() => (props.form.ingredients || []).map((_, i) => ({ _idx: i })))
const half = computed(() => Math.ceil(ingredientsList.value.length / 2))
const ingredientsLeftColumn = computed(() => ingredientsList.value.slice(0, half.value))
const ingredientsRightColumn = computed(() => ingredientsList.value.slice(half.value))
</script>

<style scoped>
.ingredients-title {
  font-size: 1rem;
  font-weight: 700;
  color: #272727;
}

.ingredient-name {
  min-width: 0;
}
.ingredient-qty {
  max-width: 120px;
  min-width: 80px;
}
.add-ingredient-btn {
  background: #f0f0f0 !important;
  border: 1px solid #e0e0e0;
  color: #424242;
}
</style>
