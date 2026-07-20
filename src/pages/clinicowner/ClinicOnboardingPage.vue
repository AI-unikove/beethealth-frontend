<template>
  <div class="onboarding-page">
    <!-- Steps 1 & 2: Split layout -->
    <template v-if="step === 1 || step === 2">
      <div class="split-layout">
        <!-- Left panel -->
        <div class="left-panel">
          <div class="brand-badge">
            <img src="@/assets/images/logo.png" alt="Beet.Health" class="badge-logo" />
            <span class="badge-text">Beet.Health</span>
          </div>
          <h1 class="left-heading">Everything you need<br />to guide every client</h1>
          <div class="dashboard-preview">
            <div class="preview-mockup">
              <div class="mockup-bar">
                <span class="mockup-dot" /><span class="mockup-dot" /><span class="mockup-dot" />
              </div>
              <div class="mockup-body">
                <div class="mockup-sidebar" />
                <div class="mockup-content">
                  <div class="mockup-row" />
                  <div class="mockup-row short" />
                  <div class="mockup-row" />
                  <div class="mockup-card-row">
                    <div class="mockup-card" />
                    <div class="mockup-card" />
                    <div class="mockup-card" />
                  </div>
                  <div class="mockup-chart-row">
                    <div class="mockup-chart" />
                    <div class="mockup-chart" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right panel -->
        <div class="right-panel">
          <!-- Step 1: Enter Mobile -->
          <div v-if="step === 1" class="form-card">
            <h2 class="card-title">Enter Clinic Mobile Number to Continue</h2>
            <p class="card-subtitle">
              Empower your clients to stay consistent while you manage everything from your
              dashboard.
            </p>
            <div class="phone-row">
              <div class="country-code">+91</div>
              <input
                v-model="mobileNumber"
                class="phone-input"
                type="tel"
                placeholder="Mobile number"
                maxlength="10"
                inputmode="numeric"
                @keyup.enter="requestOtp"
              />
            </div>
            <p v-if="phoneError" class="field-error">{{ phoneError }}</p>
            <p class="helper-text">You'll receive a verification code by text</p>
            <button class="primary-btn" :disabled="mobileLoading" @click="requestOtp">
              <span v-if="mobileLoading">Sending...</span>
              <span v-else>Get Code</span>
            </button>
            <p class="terms-text">
              By continuing, you agree to our
              <a href="#" class="terms-link">T&amp;C</a>
              and
              <a href="#" class="terms-link">privacy policy</a>
            </p>
          </div>

          <!-- Step 2: Verify OTP -->
          <div v-else-if="step === 2" class="form-card">
            <h2 class="card-title">Enter Verification Code</h2>
            <p class="card-subtitle">We've sent you a code on +91 {{ mobileNumber }}</p>
            <div class="otp-row">
              <input
                v-for="(_, i) in otpDigits"
                :key="i"
                :ref="(el) => (otpRefs[i] = el)"
                v-model="otpDigits[i]"
                class="otp-box"
                type="text"
                maxlength="1"
                inputmode="numeric"
                @input="onOtpInput(i, $event)"
                @keydown="onOtpKeydown(i, $event)"
                @paste.prevent="onOtpPaste($event)"
              />
            </div>
            <p v-if="otpError" class="field-error">{{ otpError }}</p>
            <p class="resend-text">
              <template v-if="resendCountdown > 0">
                <a href="#" class="resend-link" @click.prevent>Resend</a> code in
                {{ resendCountdown }}s
              </template>
              <button v-else class="resend-btn" @click="resendOtp">Resend code</button>
            </p>
            <button
              class="primary-btn"
              :disabled="otpDigits.join('').length < 6 || verifyLoading"
              @click="verifyOtp"
            >
              <span v-if="verifyLoading">Verifying...</span>
              <span v-else>Verify</span>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Step 3: Profile Details (full page) -->
    <div v-else-if="step === 3" class="profile-page">
      <div class="profile-topbar">
        <div class="profile-brand">
          <img src="@/assets/images/logo.png" alt="Beet.Health" class="brand-logo" />
          <span class="brand-name">Beet.Health</span>
        </div>
        <button class="close-btn" @click="$router.push('/clinic-owner/overview')">
          <v-icon size="14">mdi-close</v-icon>
        </button>
      </div>

      <div class="profile-form-wrap">
        <h2 class="profile-title">Lets fill out some details before we get in to your dashboard</h2>

        <div class="form-field-block">
          <label class="field-label">Name</label>
          <input v-model="profile.name" class="form-input" placeholder="Name" />
        </div>

        <div class="form-field-block">
          <label class="field-label">Phone Number</label>
          <div class="phone-row">
            <div class="country-code">+91</div>
            <input
              v-model="profile.phone"
              class="phone-input"
              type="tel"
              placeholder="Mobile number"
              maxlength="10"
              inputmode="numeric"
            />
          </div>
        </div>

        <div class="form-field-block">
          <label class="field-label">Email</label>
          <input
            v-model="profile.email"
            class="form-input"
            placeholder="hustonhealth@gmail.com"
            type="email"
          />
          <a href="#" class="verify-email-link">Verify email</a>
        </div>

        <div class="form-field-block">
          <label class="field-label">Bio</label>
          <div class="bio-wrap">
            <textarea
              v-model="profile.bio"
              class="bio-input"
              placeholder="Add bio here"
              maxlength="200"
              rows="3"
            />
            <span class="bio-counter">{{ profile.bio.length }}/200</span>
          </div>
        </div>

        <div class="form-field-block">
          <label class="field-label">Clients served so far</label>
          <div class="select-wrap">
            <select v-model="profile.specialisation" class="form-select">
              <option value="" disabled>Select your specialisation</option>
              <option value="weight-management">Weight Management</option>
              <option value="sports-nutrition">Sports Nutrition</option>
              <option value="clinical-nutrition">Clinical Nutrition</option>
              <option value="pediatric-nutrition">Pediatric Nutrition</option>
              <option value="diabetes-care">Diabetes Care</option>
              <option value="general-wellness">General Wellness</option>
            </select>
            <v-icon class="select-icon" size="16">mdi-chevron-down</v-icon>
          </div>
        </div>

        <button class="primary-btn" @click="submitProfile">Continue</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const step = ref(1)
const mobileNumber = ref('')
const mobileLoading = ref(false)
const phoneError = ref('')

const otpDigits = ref(['', '', '', '', '', ''])
const otpRefs = ref([])
const otpError = ref('')
const verifyLoading = ref(false)
const resendCountdown = ref(59)
let countdownTimer = null

const profile = ref({
  name: '',
  phone: '',
  email: '',
  bio: '',
  specialisation: '',
})

// ---------- Step 1 ----------
function requestOtp() {
  phoneError.value = ''
  if (!/^\d{10}$/.test(mobileNumber.value)) {
    phoneError.value = 'Please enter a valid 10-digit mobile number.'
    return
  }
  mobileLoading.value = true
  // Simulate API call
  setTimeout(() => {
    mobileLoading.value = false
    step.value = 2
    startResendCountdown()
  }, 800)
}

// ---------- Step 2 ----------
function startResendCountdown() {
  resendCountdown.value = 59
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    if (resendCountdown.value > 0) {
      resendCountdown.value--
    } else {
      clearInterval(countdownTimer)
    }
  }, 1000)
}

function resendOtp() {
  otpDigits.value = ['', '', '', '', '', '']
  otpError.value = ''
  startResendCountdown()
}

function onOtpInput(index, event) {
  const val = event.target.value.replace(/\D/g, '')
  otpDigits.value[index] = val ? val[0] : ''
  if (val && index < 5) {
    otpRefs.value[index + 1]?.focus()
  }
}

function onOtpKeydown(index, event) {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpRefs.value[index - 1]?.focus()
  }
}

function onOtpPaste(event) {
  const text = (event.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '')
  text
    .split('')
    .slice(0, 6)
    .forEach((char, i) => {
      otpDigits.value[i] = char
    })
  otpRefs.value[Math.min(text.length, 5)]?.focus()
}

function verifyOtp() {
  otpError.value = ''
  const code = otpDigits.value.join('')
  if (code.length < 6) {
    otpError.value = 'Please enter the 6-digit code.'
    return
  }
  verifyLoading.value = true
  // Simulate API call
  setTimeout(() => {
    verifyLoading.value = false
    clearInterval(countdownTimer)
    step.value = 3
  }, 800)
}

// ---------- Step 3 ----------
function submitProfile() {
  router.push('/clinic-owner/overview')
}

onMounted(() => {})
onBeforeUnmount(() => clearInterval(countdownTimer))
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.onboarding-page {
  min-height: 100vh;
  background: #fff;
}

/* ─── Split layout (Steps 1 & 2) ─── */
.split-layout {
  display: flex;
  min-height: 100vh;
}

/* Left panel */
.left-panel {
  width: 40%;
  min-height: 100vh;
  background: linear-gradient(160deg, #f9d8f0 0%, #f3b8e8 50%, #eeaadf 100%);
  display: flex;
  flex-direction: column;
  padding: 40px 36px;
  position: relative;
  overflow: hidden;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border-radius: 20px;
  padding: 6px 14px;
  width: fit-content;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(180, 60, 150, 0.1);
}

.badge-logo {
  height: 20px;
  width: 20px;
  object-fit: contain;
}

.badge-text {
  font-size: 13px;
  font-weight: 700;
  color: #1f2430;
}

.left-heading {
  font-size: 26px;
  font-weight: 800;
  color: #2d1a40;
  line-height: 1.35;
  margin: 0 0 32px;
}

/* Dashboard mockup */
.dashboard-preview {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.preview-mockup {
  width: 100%;
  max-width: 320px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(100, 20, 100, 0.18);
  transform: perspective(800px) rotateY(-4deg) rotateX(3deg);
}

.mockup-bar {
  background: #f5f5f8;
  padding: 8px 12px;
  display: flex;
  gap: 5px;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.mockup-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ddd;
}

.mockup-body {
  display: flex;
  height: 180px;
}

.mockup-sidebar {
  width: 44px;
  background: #f8f4fc;
  border-right: 1px solid #f0e8f8;
  flex-shrink: 0;
}

.mockup-content {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mockup-row {
  height: 8px;
  background: #f0eaf6;
  border-radius: 4px;
  width: 90%;
}

.mockup-row.short {
  width: 55%;
}

.mockup-card-row {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.mockup-card {
  flex: 1;
  height: 28px;
  background: #f5eefb;
  border-radius: 6px;
  border: 1px solid #e8daf5;
}

.mockup-chart-row {
  display: flex;
  gap: 6px;
  flex: 1;
  margin-top: 2px;
}

.mockup-chart {
  flex: 1;
  background: #fdf0fa;
  border-radius: 8px;
  border: 1px solid #f0def5;
}

/* Right panel */
.right-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 40px 32px;
}

/* Form card */
.form-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 20px;
  padding: 36px 32px;
  box-shadow: 0 4px 32px rgba(180, 60, 150, 0.07);
  border: 1px solid #f0eaf6;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2430;
  margin: 0 0 10px;
  line-height: 1.35;
}

.card-subtitle {
  font-size: 13px;
  color: #8e93a0;
  margin: 0 0 22px;
  line-height: 1.6;
}

/* Phone input */
.phone-row {
  display: flex;
  align-items: stretch;
  border: 1px solid #e4e6f0;
  border-radius: 28px;
  overflow: hidden;
  background: #f8f8fb;
  margin-bottom: 8px;
}

.country-code {
  padding: 13px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #3a4252;
  background: #f0eaf6;
  border-right: 1px solid #e4e6f0;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.phone-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 13px 16px;
  font-size: 14px;
  color: #3a4252;
  background: transparent;
}

.phone-input::placeholder {
  color: #b8bfc9;
}

.helper-text {
  font-size: 12px;
  color: #adb5c4;
  margin: 0 0 20px 4px;
}

.field-error {
  color: #e53935;
  font-size: 12px;
  margin: 0 0 10px 4px;
}

/* Primary button */
.primary-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 28px;
  background: linear-gradient(135deg, #f2b3dc, #d05fa8);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  margin-bottom: 16px;
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.terms-text {
  text-align: center;
  font-size: 12px;
  color: #b0b7c3;
  margin: 0;
}

.terms-link {
  color: #b13c92;
  text-decoration: none;
}

/* OTP */
.otp-row {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  margin-bottom: 14px;
}

.otp-box {
  width: 50px;
  height: 56px;
  border: 1.5px solid #e4e6f0;
  border-radius: 12px;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: #2d3440;
  background: #f5f6fa;
  outline: none;
  transition:
    border-color 0.15s,
    background 0.15s;
}

.otp-box:focus {
  border-color: #c44d9b;
  background: #fff;
}

.resend-text {
  font-size: 13px;
  color: #8e93a0;
  margin: 0 0 20px 2px;
}

.resend-link {
  color: #3a4252;
  text-decoration: underline;
  cursor: default;
}

.resend-btn {
  border: none;
  background: none;
  color: #b13c92;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

/* ─── Step 3: Profile page ─── */
.profile-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.profile-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  border-bottom: 1px solid #f2f3f7;
}

.profile-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-logo {
  height: 28px;
  object-fit: contain;
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  color: #2d7a4a;
}

.close-btn {
  width: 30px;
  height: 30px;
  border: 1.5px solid #e8daf5;
  border-radius: 50%;
  background: #fdf4fb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  transition: background 0.15s;
}

.close-btn:hover {
  background: #f5eefb;
}

.profile-form-wrap {
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.profile-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2430;
  line-height: 1.4;
  margin: 0 0 4px;
}

.form-field-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #555c68;
}

.form-input {
  border: none;
  border-radius: 28px;
  padding: 13px 18px;
  font-size: 14px;
  color: #3a4252;
  background: #f4f5f8;
  outline: none;
  width: 100%;
}

.form-input::placeholder {
  color: #b8bfc9;
}

.verify-email-link {
  font-size: 13px;
  color: #3a4252;
  text-decoration: underline;
  cursor: pointer;
}

.bio-wrap {
  position: relative;
}

.bio-input {
  width: 100%;
  border: none;
  border-radius: 16px;
  padding: 13px 18px 28px;
  font-size: 14px;
  color: #3a4252;
  background: #f4f5f8;
  outline: none;
  resize: none;
  font-family: inherit;
}

.bio-input::placeholder {
  color: #b8bfc9;
}

.bio-counter {
  position: absolute;
  bottom: 10px;
  right: 14px;
  font-size: 11px;
  color: #b0b7c3;
}

.select-wrap {
  position: relative;
}

.form-select {
  width: 100%;
  border: none;
  border-radius: 28px;
  padding: 13px 36px 13px 18px;
  font-size: 14px;
  color: #3a4252;
  background: #f4f5f8;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.select-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

/* Responsive */
@media (max-width: 768px) {
  .split-layout {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    min-height: 220px;
    padding: 28px 24px;
  }

  .dashboard-preview {
    display: none;
  }

  .right-panel {
    padding: 24px 16px;
  }

  .form-card {
    padding: 28px 20px;
  }

  .otp-box {
    width: 40px;
    height: 48px;
    font-size: 18px;
  }
}
</style>
