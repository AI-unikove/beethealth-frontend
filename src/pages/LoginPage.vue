<template>
  <div class="lp-root">
    <!-- ── LEFT: pink branding area ── -->
    <div class="lp-left">
      <div class="lp-badge">
        <span class="lp-badge-dot"></span>
        <span class="lp-badge-label">Beet.Health</span>
      </div>

      <h1 class="lp-headline">Everything you need<br />to guide every client</h1>

      <div class="lp-preview">
        <img
          src="@/assets/images/dashboard-preview.png"
          alt="Dashboard preview"
          class="lp-preview-img"
        />
      </div>
    </div>

    <!-- ── RIGHT: white area with floating card ── -->
    <div class="lp-right">
      <!-- Step 1: Phone number -->
      <div v-if="step === 1" class="lp-card">
        <h2 class="lp-card-title">Enter Clinic Mobile Number to Continue</h2>
        <p class="lp-card-desc">
          Empower your clients to stay consistent while you manage everything from your dashboard.
        </p>

        <v-form @submit.prevent="handleGetCode" ref="phoneFormRef">
          <div class="lp-phone-wrap">
            <span class="lp-phone-cc">+91</span>

            <input
              v-model="phone"
              placeholder="Mobile number"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              class="lp-phone-input"
            />
          </div>
          <p v-if="phoneError" class="lp-error-msg">{{ phoneError }}</p>
          <p class="lp-hint">You'll receive a verification code by text.</p>

          <button type="submit" class="button w-100 mt-8" :disabled="loading">
            <b><span v-if="loading" class="lp-btn-spinner"></span> <span v-else>Get Code</span></b>
          </button>

          <v-alert v-if="errorMessage" type="error" variant="tonal" density="compact" class="mt-3">
            {{ errorMessage }}
          </v-alert>

          <p class="lp-terms">
            By continuing, you agree to our
            <a href="#" class="lp-link">T&amp;C</a> and
            <a href="#" class="lp-link">privacy policy</a>.
          </p>
        </v-form>
      </div>

      <!-- Step 2: OTP verification -->
      <div v-else class="lp-card">
        <h2 class="lp-card-title">Enter Verification Code</h2>
        <p class="lp-card-desc">We've sent you a code on +91 {{ phone }}</p>

        <v-form @submit.prevent="handleLogin" ref="otpFormRef">
          <div class="lp-otp-row">
            <input
              v-for="(_, index) in otpDigits"
              :key="index"
              :ref="(el) => (otpInputRefs[index] = el)"
              v-model="otpDigits[index]"
              type="text"
              maxlength="1"
              inputmode="numeric"
              autocomplete="one-time-code"
              class="lp-otp-box"
              :class="{ 'lp-otp-filled': otpDigits[index] }"
              @input="onOtpInput(index, $event)"
              @keydown.backspace="onOtpBackspace(index)"
              @paste.prevent="onOtpPaste($event)"
            />
          </div>

          <p class="lp-resend">
            <a
              v-if="resendCountdown === 0"
              href="#"
              class="lp-link"
              @click.prevent="startResendTimer"
            >
              Resend code
            </a>
            <span v-else class="lp-resend-timer">Resend code in {{ resendCountdown }}s</span>
          </p>

          <button
            type="submit"
            class="lp-btn"
            :disabled="loading || otp.length < 6"
            :class="{ 'lp-btn-disabled': otp.length < 6 }"
          >
            <span v-if="loading" class="lp-btn-spinner"></span>
            <span v-else>Verify</span>
          </button>

          <v-alert v-if="errorMessage" type="error" variant="tonal" density="compact" class="mt-3">
            {{ errorMessage }}
          </v-alert>
        </v-form>

        <button class="lp-back-btn" @click="goBack">
          <v-icon size="15" class="mr-1">mdi-arrow-left</v-icon>Change number
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { getRememberMePreference } from '@/utils/authStorage'

const router = useRouter()
const authStore = useAuthStore()

// ── shared state ──────────────────────────────────────────────
const phone = ref('')
const rememberMe = ref(getRememberMePreference())
const loading = ref(false)
const errorMessage = ref('')
const step = ref(1)
const phoneError = ref('')

// ── OTP state ─────────────────────────────────────────────────
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputRefs = ref([])
const otp = computed(() => otpDigits.value.join(''))

// ── resend timer ──────────────────────────────────────────────
const resendCountdown = ref(30)
let resendTimer = null

function startResendTimer() {
  resendCountdown.value = 30
  clearInterval(resendTimer)
  resendTimer = setInterval(() => {
    resendCountdown.value -= 1
    if (resendCountdown.value <= 0) clearInterval(resendTimer)
  }, 1000)
}

onUnmounted(() => clearInterval(resendTimer))

// ── validation ────────────────────────────────────────────────
// ── step 1: get code ──────────────────────────────────────────
const handleGetCode = () => {
  phoneError.value = ''
  const digits = String(phone.value || '').replace(/\D/g, '')
  if (!phone.value) {
    phoneError.value = 'Mobile number is required'
    return
  }
  if (digits.length < 10) {
    phoneError.value = 'Mobile number must be at least 10 digits'
    return
  }
  errorMessage.value = ''
  step.value = 2
  startResendTimer()
  nextTick(() => otpInputRefs.value[0]?.focus())
}

const goBack = () => {
  step.value = 1
  otpDigits.value = ['', '', '', '', '', '']
  errorMessage.value = ''
  clearInterval(resendTimer)
}

// ── step 2: OTP box helpers ───────────────────────────────────
const onOtpInput = (index, event) => {
  const val = event.target.value.replace(/\D/g, '')
  otpDigits.value[index] = val ? val[val.length - 1] : ''
  if (otpDigits.value[index] && index < 5) {
    nextTick(() => otpInputRefs.value[index + 1]?.focus())
  }
}

const onOtpBackspace = (index) => {
  if (!otpDigits.value[index] && index > 0) {
    otpDigits.value[index - 1] = ''
    nextTick(() => otpInputRefs.value[index - 1]?.focus())
  }
}

const onOtpPaste = (event) => {
  const pasted = (event.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '')
  pasted
    .split('')
    .slice(0, 6)
    .forEach((ch, i) => {
      otpDigits.value[i] = ch
    })
  const nextEmpty = otpDigits.value.findIndex((d) => !d)
  const focusIdx = nextEmpty === -1 ? 5 : nextEmpty
  nextTick(() => otpInputRefs.value[focusIdx]?.focus())
}

// ── step 2: verify / login ────────────────────────────────────
const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    await authStore.login({
      phone: phone.value,
      otp: otp.value,
      rememberMe: rememberMe.value,
    })
    router.push('/')
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || 'Unable to login. Please check mobile number and OTP.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ─── ROOT: full viewport, side by side ─────────────────────── */
.lp-root {
  display: flex;
  min-height: 100vh;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* ─── LEFT PANEL ────────────────────────────────────────────── */
.lp-left {
  width: 40%;
  flex-shrink: 0;
  background: linear-gradient(166deg, var(--pink-700, #ffdff9) 31.81%, #fff 92.88%), #d9d9d9;
  display: flex;
  flex-direction: column;
  padding: 36px 0px 100px 40px;
  position: relative;
  overflow: hidden;
}

/* badge */
.lp-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #ffffff;
  border-radius: 999px;
  padding: 5px 14px 5px 8px;
  width: fit-content;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
}

.lp-badge-dot {
  width: 9px;
  height: 9px;
  background: #d94f8a;
  border-radius: 50%;
  flex-shrink: 0;
}

.lp-badge-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #111827;
  letter-spacing: 0.01em;
  line-height: 1;
}

/* headline */
.lp-headline {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.28;
  margin-top: 24px;
  margin-bottom: 0;
}

/* dashboard screenshot */
.lp-preview {
  width: 100%;
  height: 75vh;
  text-align: right;
}

.lp-preview-img {
  height: 100%;
  border-radius: 12px 12px 0 0;
  display: block;
  margin-left: auto;
}

/* ─── RIGHT PANEL ───────────────────────────────────────────── */
.lp-right {
  flex: 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
}

/* ─── CARD ──────────────────────────────────────────────────── */
.lp-card {
  width: 100%;
  max-width: 600px;
  background: #ffffff;
  border-radius: 18px;
  padding: 36px 32px 32px;
  box-shadow: 0 4px 36px rgba(0, 0, 0, 0.09);
}

.lp-card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
  margin: 0 0 8px;
}

.lp-card-desc {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.55;
  margin: 0 0 24px;
}

/* ─── PHONE INPUT ───────────────────────────────────────────── */
.lp-phone-wrap {
  display: flex;
  align-items: center;
  height: 50px;

  border-radius: 10px;
  padding: 0 14px;

  transition: border-color 0.18s;
}

.lp-phone-wrap:focus-within {
  border-color: #d94f8a;
  background: #fff;
}

.lp-phone-cc {
  font-size: 24px;
  font-weight: 500;
  color: #272727;
  background: #f8f8f8;
  white-space: nowrap;
  border-radius: 16px;
  padding: 11px 16px;
  margin-right: 8px;
}

.lp-phone-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 24px;
  border-radius: 16px;
  padding: 11px 16px;
  color: #929292;
  background: transparent;
  min-width: 0;
  background: #f8f8f8;
}

.lp-phone-input::placeholder {
  color: #9ca3af;
}

.lp-error-msg {
  font-size: 0.75rem;
  color: #ef4444;
  margin: 5px 0 0;
}

.lp-hint {
  font-size: 0.8125rem;
  color: #9ca3af;
  margin: 10px 0 0;
}

/* ─── BUTTON ────────────────────────────────────────────────── */
.lp-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  margin-top: 20px;
  border: none;
  border-radius: 10px;
  background: #e8a4c4;
  color: #ffffff;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
  letter-spacing: 0;
}

.lp-btn:hover:not(:disabled) {
  background: #d94f8a;
}

.lp-btn:disabled,
.lp-btn.lp-btn-disabled {
  background: #f2d0e3;
  color: #c7a0b8;
  cursor: not-allowed;
}

.lp-btn-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: lp-spin 0.7s linear infinite;
}

@keyframes lp-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ─── TERMS ─────────────────────────────────────────────────── */
.lp-terms {
  font-size: 0.78rem;
  color: #9ca3af;
  text-align: center;
  margin-top: 18px;
}

.lp-link {
  color: #d94f8a;
  text-decoration: none;
}

.lp-link:hover {
  text-decoration: underline;
}

/* ─── OTP BOXES ─────────────────────────────────────────────── */
.lp-otp-row {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.lp-otp-box {
  flex: 1;
  height: 54px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  text-align: center;
  font-size: 1.375rem;
  font-weight: 600;
  color: #111827;
  background: #f9fafb;
  outline: none;
  min-width: 0;
  transition:
    border-color 0.18s,
    background 0.18s;
  caret-color: #d94f8a;
}

.lp-otp-box:focus {
  border-color: #d94f8a;
  background: #fff;
}

.lp-otp-box.lp-otp-filled {
  border-color: #d94f8a;
  background: #fff;
}

/* ─── RESEND ────────────────────────────────────────────────── */
.lp-resend {
  font-size: 0.8125rem;
  margin: 12px 0 0;
}

.lp-resend-timer {
  color: #9ca3af;
}

/* ─── BACK BUTTON ───────────────────────────────────────────── */
.lp-back-btn {
  display: inline-flex;
  align-items: center;
  margin-top: 16px;
  font-size: 0.8125rem;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  gap: 2px;
}

.lp-back-btn:hover {
  color: #d94f8a;
}

/* ─── RESPONSIVE ────────────────────────────────────────────── */
@media (max-width: 768px) {
  .lp-left {
    display: none;
  }

  .lp-right {
    padding: 32px 20px;
  }
}
</style>
