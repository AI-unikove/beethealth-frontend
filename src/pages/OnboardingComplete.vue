<template>
  <div class="success-container">
    <div class="success-card">
      <div class="success-icon">
        <v-icon size="100" color="success">mdi-check-circle</v-icon>
      </div>
      
      <h1 class="success-title">Thank You! 🎉</h1>
      
      <p class="success-message">
        Your onboarding is complete.
      </p>
      
      <p class="success-submessage">
        Your nutritionist will review your information and contact you soon to create a personalized diet plan.
      </p>

      <div class="success-details" v-if="responseId">
        <p class="response-id">
          <v-icon size="16" class="mr-1">mdi-identifier</v-icon>
          Response ID: <code>{{ responseId }}</code>
        </p>
      </div>

      <div class="success-actions">
        <v-btn
          color="primary"
          size="large"
          variant="flat"
          @click="goHome"
          prepend-icon="mdi-home"
        >
          Go to Home
        </v-btn>
      </div>

      <div class="success-footer">
        <p class="footer-text">
          If you have any questions, please contact your nutritionist.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const responseId = computed(() => route.query.responseId)

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.success-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.success-card {
  background: white;
  padding: 60px 40px;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon {
  margin-bottom: 24px;
  animation: scaleIn 0.5s ease-out 0.2s both;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.success-title {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 16px;
}

.success-message {
  font-size: 20px;
  color: #5a6c7d;
  margin-bottom: 12px;
  font-weight: 500;
}

.success-submessage {
  font-size: 16px;
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 32px;
}

.success-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 32px;
}

.response-id {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.response-id code {
  background: white;
  padding: 4px 12px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  margin-left: 8px;
  color: #667eea;
  font-weight: 600;
}

.success-actions {
  margin-bottom: 32px;
}

.success-actions .v-btn {
  text-transform: none;
  letter-spacing: 0.5px;
  font-weight: 600;
  padding: 24px 48px;
}

.success-footer {
  border-top: 1px solid #e9ecef;
  padding-top: 24px;
}

.footer-text {
  font-size: 14px;
  color: #95a5a6;
  margin: 0;
}

/* Responsive */
@media (max-width: 600px) {
  .success-card {
    padding: 40px 24px;
  }

  .success-title {
    font-size: 28px;
  }

  .success-message {
    font-size: 18px;
  }

  .success-submessage {
    font-size: 14px;
  }

  .success-actions .v-btn {
    padding: 20px 32px;
    width: 100%;
  }
}
</style>
