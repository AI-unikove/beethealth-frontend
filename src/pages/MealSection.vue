<template>
  <div class="meal-row">
    <!-- Meal Type -->
    <div class="meal-type">
      {{ meal.mealType }}
    </div>

    <!-- Recipe Dropdown -->
    <div class="meal-field">
      <select v-model="localMeal.recipe" class="input">
        <option value="">Select Food Item</option>
        <option v-for="recipe in recipes" :key="recipe._id" :value="recipe._id">
          {{ recipe.recipeName }}
        </option>
      </select>
    </div>

    <!-- Quantity -->
    <div class="meal-field">
      <input v-model="localMeal.quantity" type="text" placeholder="Quantity" class="input" />
    </div>

    <!-- Notes -->
    <div class="meal-field">
      <input v-model="localMeal.notes" type="text" placeholder="Notes" class="input" />
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'MealSection',
  emits: ['update:meal'],
  props: {
    meal: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      recipes: [],
      localMeal: {
        mealType: '',
        recipe: '',
        quantity: '',
        notes: '',
      },
    }
  },
  async mounted() {
    await this.fetchRecipes()
    this.syncLocalMeal(this.meal)
  },
  watch: {
    meal: {
      deep: true,
      immediate: true,
      handler(newMeal) {
        this.syncLocalMeal(newMeal)
      },
    },
    localMeal: {
      deep: true,
      handler(updatedMeal) {
        this.$emit('update:meal', { ...updatedMeal })
      },
    },
  },
  methods: {
    syncLocalMeal(sourceMeal) {
      const meal = sourceMeal || {}
      this.localMeal = {
        ...meal,
        recipe:
          meal.recipe && typeof meal.recipe === 'object' ? meal.recipe._id : meal.recipe || '',
      }
    },
    async fetchRecipes() {
      try {
        const res = await axios.get('/api/recipes')
        this.recipes = res.data
      } catch (error) {
        console.error('Failed to fetch recipes', error)
      }
    },
  },
}
</script>

<style scoped>
.meal-row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.meal-type {
  width: 140px;
  font-weight: 500;
}

.meal-field {
  flex: 1;
}

.input {
  width: 100%;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
</style>
