<template>
  <footer class="app-footer text-center" :class="{ 'app-footer--compact': compact }">
    <div v-if="showLinks" class="app-footer__links">
      <a href="/terms" class="app-footer__link">Terms of Service</a>
      <span class="app-footer__sep">|</span>
      <a href="/privacy" class="app-footer__link">Privacy Policy</a>
      <span class="app-footer__sep">|</span>
      <a href="/disclosures" class="app-footer__link">Disclosures</a>
    </div>
    <div class="app-footer__copy">© 2025 40By60, Inc</div>
  </footer>
</template>

<script setup>
defineProps({
  showLinks: { type: Boolean, default: true },
  compact: { type: Boolean, default: false },
})
</script>

<style scoped>
.app-footer {
  font-size: 14px;
  color: #777;
  margin-top: 40px;
  padding-bottom: 20px;
}

.app-footer--compact {
  margin-top: 16px;
  padding: 12px 0;
  font-size: 12px;
  border-top: 1px solid #eee;
}

.app-footer__links {
  margin-bottom: 4px;
}

.app-footer__link {
  color: #777;
  text-decoration: none;
}

.app-footer__link:hover {
  color: #333;
  text-decoration: underline;
}

.app-footer__sep {
  margin: 0 6px;
  color: #999;
}

.app-footer__copy {
  color: #777;
}
</style>
