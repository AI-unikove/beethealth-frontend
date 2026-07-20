<script setup>
import { onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useEnumsStore } from '@/stores/enums.store'
import { useSnackbarStore } from '@/stores/snackbar.store'
import { useAuthStore } from '@/stores/auth.store'

const enumsStore = useEnumsStore()
const snackbarStore = useSnackbarStore()
const authStore = useAuthStore()
const route = useRoute()
const { message, show, color, timeout } = storeToRefs(snackbarStore)

const snackbarModel = computed({
  get: () => show.value,
  set: (v) => {
    if (!v) snackbarStore.close()
  },
})

const shouldLoadEnums = computed(
  () => authStore.isAuthenticated && route.meta?.requiresAuth !== false,
)

async function loadEnumsIfNeeded() {
  if (!shouldLoadEnums.value || enumsStore.loading) {
    return
  }

  if (Object.keys(enumsStore.enums || {}).length > 0) {
    return
  }

  try {
    await enumsStore.fetchAllEnums()
  } catch {
    // Ignore here to avoid uncaught promise noise on auth expiry/public routes.
  }
}

onMounted(() => {
  loadEnumsIfNeeded()
})

watch(
  () => [authStore.isAuthenticated, route.fullPath],
  () => {
    loadEnumsIfNeeded()
  },
)
</script>

<template>
  <router-view />
  <v-snackbar
    v-model="snackbarModel"
    :color="color"
    :timeout="timeout"
    location="bottom"
    variant="flat"
  >
    {{ message }}
    <template #actions>
      <v-btn
        icon
        variant="text"
        size="small"
        aria-label="Close"
        class="snackbar-close-btn"
        @click="snackbarStore.close()"
      >
        <v-icon size="small">mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
/* Snackbar close: visible X icon, no solid pill */
.v-snackbar .snackbar-close-btn {
  background: transparent !important;
  min-width: unset;
}
.v-snackbar .snackbar-close-btn .v-icon {
  color: rgba(255, 255, 255, 0.95);
}
.v-snackbar .snackbar-close-btn:hover .v-icon {
  color: #fff;
}
</style>
