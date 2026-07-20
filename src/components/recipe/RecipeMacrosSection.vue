<!-- eslint-disable vue/no-mutating-props -->
<template>
  <v-sheet class="rounded-lg pa-4 mb-4">
    <label class="text-subtitle-1 font-weight-medium d-block mb-3">Macros Values</label>
    <v-row dense>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="form.calories"
          label="Calories (kcal)"
          placeholder="e.g. 250"
          :suffix="caloriesSuffix"
          variant="outlined"
          density="comfortable"
          hide-details
          rounded="lg"
          bg-color="white"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="form.protein"
          label="Protein"
          placeholder="e.g. 30g"
          :suffix="proteinSuffix"
          variant="outlined"
          density="comfortable"
          hide-details
          rounded="lg"
          bg-color="white"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="form.carbohydrates"
          label="Carbohydrates"
          placeholder="e.g. 0g"
          :suffix="carbohydratesSuffix"
          variant="outlined"
          density="comfortable"
          hide-details
          rounded="lg"
          bg-color="white"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="form.fats"
          label="Fats"
          placeholder="e.g. 12g"
          :suffix="fatsSuffix"
          variant="outlined"
          density="comfortable"
          hide-details
          rounded="lg"
          bg-color="white"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="form.fiber"
          label="Fiber"
          placeholder="e.g. 5g"
          :suffix="fiberSuffix"
          variant="outlined"
          density="comfortable"
          hide-details
          rounded="lg"
          bg-color="white"
        />
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup>
import { computed } from 'vue'
import { macroCaloriesSuffix, macroGramSuffix } from '@/utils/recipeMacroUnits'

const props = defineProps({
  form: { type: Object, required: true },
})

const caloriesSuffix = computed(() => macroCaloriesSuffix(props.form.calories))
const proteinSuffix = computed(() => macroGramSuffix(props.form.protein))
const carbohydratesSuffix = computed(() => macroGramSuffix(props.form.carbohydrates))
const fatsSuffix = computed(() => macroGramSuffix(props.form.fats))
const fiberSuffix = computed(() => macroGramSuffix(props.form.fiber))
</script>
