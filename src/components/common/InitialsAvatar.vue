<template>
  <div class="initials-avatar" :style="avatarStyle" :title="titleText">
    <img v-if="hasImage" :src="src" :alt="titleText" class="avatar-image" @error="onImageError" />
    <span v-else class="avatar-initials">{{ initials }}</span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  src: {
    type: String,
    default: '',
  },
  size: {
    type: Number,
    default: 34,
  },
  title: {
    type: String,
    default: '',
  },
})

const imageFailed = ref(false)

const hasImage = computed(() => Boolean(props.src) && !imageFailed.value)

const initials = computed(() => {
  const value = (props.name || '').trim()
  if (!value) return '?'

  const parts = value.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
})

const titleText = computed(() => props.title || props.name || 'Unknown Client')

const avatarStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))

function onImageError() {
  imageFailed.value = true
}

watch(
  () => props.src,
  () => {
    imageFailed.value = false
  },
)
</script>
