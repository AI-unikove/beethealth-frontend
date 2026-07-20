<template>
  <CrudDialog
    :model-value="modelValue"
    title="Delete Recipe"
    max-width="480"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <p class="delete-text mb-6">
      Are you sure you want to <span class="text-red">delete</span> the recipe for
      <strong>{{ recipeName }}</strong
      >? This action can't be undone.
    </p>
    <div class="d-flex justify-end mt-2">
      <v-btn variant="text" class="mr-3" color="red" @click="confirmDelete">Delete Recipe</v-btn>
    </div>
  </CrudDialog>
</template>

<script setup>
import { computed } from 'vue'
import CrudDialog from '@/components/common/CrudDialog.vue'
import { useRecipesStore } from '@/stores/recipes.store'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  recipe: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'deleted'])

const recipesStore = useRecipesStore()

const recipeName = computed(() => props.recipe?.name ?? props.recipe?.recipeName ?? 'this recipe')

function close() {
  emit('update:modelValue', false)
}

async function confirmDelete() {
  const id = props.recipe?._id ?? props.recipe?.id
  if (!id) return
  try {
    await recipesStore.removeRecipe(id)
    recipesStore.closeDialog('view')
    close()
    emit('deleted')
  } catch {
    // error already set in store
  }
}
</script>
