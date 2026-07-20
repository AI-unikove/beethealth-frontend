<template>
  <div elevation="0" class="overview-quick-card">
    <h2>{{ title }}</h2>

    <button
      v-for="action in actions"
      :key="action.key || action.label"
      class="overview-quick-btn"
      variant="outlined"
      @click="$emit('select', action)"
    >
      <span class="overview-quick-label">{{ action.label }}</span>
      <span class="overview-quick-icon" :class="action.iconClass">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <g clip-path="url(#clip0_1251_6506)">
            <path
              d="M10 2.5C14.125 2.5 17.5 5.875 17.5 10C17.5 14.125 14.125 17.5 10 17.5C5.875 17.5 2.5 14.125 2.5 10C2.5 5.875 5.875 2.5 10 2.5ZM10 1.25C5.1875 1.25 1.25 5.1875 1.25 10C1.25 14.8125 5.1875 18.75 10 18.75C14.8125 18.75 18.75 14.8125 18.75 10C18.75 5.1875 14.8125 1.25 10 1.25Z"
              fill="#665475"
            />
            <path
              d="M15 9.375H10.625V5H9.375V9.375H5V10.625H9.375V15H10.625V10.625H15V9.375Z"
              fill="#665475"
            />
          </g>
          <defs>
            <clipPath id="clip0_1251_6506">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Quick Access',
  },
  actions: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['select'])
</script>
