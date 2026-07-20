<template>
  <v-app>
    <app-navbar />
    <v-main>
      <router-view />
      <app-footer />
    </v-main>
  </v-app>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<style scoped>
/* Add any layout-specific styles here */
</style>
