<template>
  <div class="clientLandingPage">
    <div class="add-client-page__topbar">
      <v-spacer />
      <v-btn icon variant="text" size="small" aria-label="Close" @click="handleClose">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-row no-gutters class="add-client-page__main fill-height">
      <v-col
        cols="12"
        md="5"
        class="left-panel d-none d-md-flex align-center justify-center pa-6 fill-height"
      >
        <v-card class="promo-card" rounded="xl" elevation="2">
          <v-card-text class="pa-6">
            <v-chip size="small" color="primary" variant="flat" class="mb-4">Beet AI</v-chip>
            <h2 class="text-h5 font-weight-bold mb-4 text-grey-darken-3">
              Everything you need to guide every client
            </h2>
            <v-sheet class="dashboard-mock rounded-lg pa-4" color="grey-lighten-4">
              <div class="text-body-2 font-weight-medium text-grey-darken-2 mb-2">
                Good morning Joseph!
              </div>
              <v-alert density="compact" variant="tonal" color="warning" class="mb-3">
                <span class="text-body-2"
                  >Needs Attention: Rohit's calorie intake has been 30% above target for 3
                  days.</span
                >
                <div class="d-flex gap-2 mt-2">
                  <v-btn size="x-small" variant="text">Ignore</v-btn>
                  <v-btn size="x-small" variant="tonal" color="primary">Message</v-btn>
                </div>
              </v-alert>
              <v-sheet class="d-flex align-center gap-2 pa-2 rounded mb-3" color="white">
                <v-avatar size="36" color="primary">
                  <span class="text-white text-caption">RM</span>
                </v-avatar>
                <div>
                  <span class="text-body-2 font-weight-medium">Rahul Malhotra</span>
                  <span class="text-caption text-medium-emphasis d-block">2,650 / 2,000 kcal</span>
                </div>
              </v-sheet>
              <div class="text-caption text-medium-emphasis mb-1">Meal Compliance</div>
              <v-progress-linear model-value="78" color="primary" height="8" rounded class="mb-3" />
              <div class="text-caption text-medium-emphasis">Client Performance overview</div>
              <v-chip-group class="mt-1">
                <v-chip size="x-small" variant="flat">All</v-chip>
                <v-chip size="x-small" variant="tonal">On track</v-chip>
                <v-chip size="x-small" variant="tonal">Moderate</v-chip>
                <v-chip size="x-small" variant="tonal">Critical</v-chip>
              </v-chip-group>
            </v-sheet>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right panel: Onboarding content -->
      <v-col
        cols="12"
        md="7"
        class="right-panel d-flex align-center justify-center fill-height pa-4 pa-md-6"
      >
        <v-sheet class="pa-8" max-width="560" width="100%">
          <!-- Header: icon + title + avatar -->
          <div class="d-flex align-center gap-3 mb-4">
            <v-icon size="32" color="primary">mdi-party-popper</v-icon>
            <h1 class="text-h4 font-weight-bold text-grey-darken-3 flex-grow-1 mb-0">
              Lets start with the basics
            </h1>
          </div>

          <p class="mb-5">Congratulations on taking the first step!</p>
          <p>
            Here, you'll add your client's details, from basic info to their goals and nutrition
            plan.
          </p>
          <p class="mb-5">
            You can either upload a physical form for AI extraction or create one digitally —
            everything stays editable anytime.
          </p>

          <!-- Subheading with overlapping avatars -->
          <div class="d-flex align-center">
            <p class="mb-0">Your client onboarding — these key steps for a complete profile:</p>
          </div>

          <v-list class="onboarding-steps-list bg-transparent mb-6" density="compact">
            <v-list-item class="px-0">
              <template #prepend>
                <span class="step-num">1.</span>
              </template>
              <v-list-item-title>Client Basics</v-list-item-title>
            </v-list-item>
            <v-list-item class="px-0">
              <template #prepend>
                <span class="step-num">2.</span>
              </template>
              <v-list-item-title>Diet & Preferences</v-list-item-title>
            </v-list-item>
            <v-list-item class="px-0">
              <template #prepend>
                <span class="step-num">3.</span>
              </template>
              <v-list-item-title>Lifestyle & Activity</v-list-item-title>
            </v-list-item>
            <v-list-item class="px-0">
              <template #prepend>
                <span class="step-num">4.</span>
              </template>
              <v-list-item-title>Medical Background</v-list-item-title>
            </v-list-item>
            <v-list-item class="px-0">
              <template #prepend>
                <span class="step-num">5.</span>
              </template>
              <v-list-item-title>Body Measurements</v-list-item-title>
            </v-list-item>
            <v-list-item class="px-0">
              <template #prepend>
                <span class="step-num">6.</span>
              </template>
              <v-list-item-title>Goals & Motivation</v-list-item-title>
            </v-list-item>
          </v-list>

          <input
            type="file"
            ref="fileInput"
            @change="handleFileSelect"
            accept=".pdf"
            style="display: none"
          />

          <v-card v-if="selectedFile" variant="outlined" class="mb-4">
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-file-pdf-box</v-icon>
                <div class="flex-grow-1">
                  <div class="text-body-2 font-weight-medium">{{ selectedFile.name }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatFileSize(selectedFile.size) }}
                  </div>
                </div>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  @click="removeFile"
                  :disabled="isProcessing"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>

              <div v-if="isProcessing" class="mt-3">
                <v-progress-linear
                  :model-value="uploadProgress"
                  color="primary"
                  height="6"
                  rounded
                  class="mb-2"
                />
                <div class="text-caption text-medium-emphasis text-center">
                  {{ progressMessage }}
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            closable
            @click:close="error = null"
            class="mb-4"
          >
            {{ error }}
          </v-alert>

          <!-- Action buttons -->
          <div class="d-flex flex-column flex-sm-row gap-3 action-buttons">
            <v-btn
              color="primary"
              size="large"
              rounded="lg"
              @click="triggerFileInput"
              :loading="isProcessing"
              :disabled="isProcessing"
            >
              <v-icon start>mdi-upload</v-icon>
              {{ selectedFile ? 'Select different PDF' : 'Upload physical form' }}
            </v-btn>
            <v-btn
              variant="tonal"
              color="primary"
              size="large"
              rounded="lg"
              @click="handleCreateDigitalForm"
              :disabled="isProcessing"
            >
              Create digital form
            </v-btn>
          </div>

          <!-- Footer -->
          <v-divider class="my-6" />
          <div class="d-flex justify-space-between align-center flex-wrap gap-2">
            <span class="text-caption text-medium-emphasis">
              <a href="#" class="text-medium-emphasis text-decoration-none">Terms of Service</a>
              <a href="#" class="text-medium-emphasis text-decoration-none mx-1">Privacy Policy</a>
              <a href="#" class="text-medium-emphasis text-decoration-none">Disclosures</a>
            </span>
            <span class="text-caption text-medium-emphasis">© 2025 40By60, Inc</span>
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <UpdateClientProfileDialog
      v-model="showUpdateDialog"
      :client-data="ocrClientData"
      :raw-extracted-data="rawExtractedData"
      @save="handleClientDataUpdate"
      @close="handleDialogClose"
      @update:model-value="showUpdateDialog = $event"
    />

    <SuccessDialog
      v-model="showSuccessDialog"
      title="Success"
      message="The client created successfully."
      action-text="Go to Clients"
      @confirm="goToClientsFromSuccessModal"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UpdateClientProfileDialog from './../components/client/clientprofile/updateClientProfileDialog.vue'
import SuccessDialog from '@/components/common/SuccessDialog.vue'
import { useClientStore } from '@/stores/client.store'
const clientStore = useClientStore()

const router = useRouter()

const showUpdateDialog = ref(false)
const ocrClientData = ref({})
const rawExtractedData = ref(null)
const fileInput = ref(null)
const selectedFile = ref(null)
const isProcessing = ref(false)
const uploadProgress = ref(0)
const progressMessage = ref('')
const error = ref(null)
const showSuccessDialog = ref(false)

function triggerFileInput() {
  fileInput.value.click()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file && file.type === 'application/pdf') {
    selectedFile.value = file
    error.value = null

    uploadAndProcess()
  } else {
    error.value = 'Please select a valid PDF file'
  }
}

function removeFile() {
  selectedFile.value = null
  ocrClientData.value = {}
  rawExtractedData.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// eslint-disable-next-line complexity -- legacy OCR transform, refactor in separate task
function transformOCRDataToClientData(ocrData) {
  if (!ocrData || !ocrData.structuredData) {
    return {
      profile: {},
      bodyStatus: {},
      bodyMeasurements: {},
      dietaryProfile: {},
      medicalProfile: {},
      lifestyleProfile: {},
      goalsProfile: {},
    }
  }

  const data = ocrData.structuredData

  const unmappedFields = []
  const addToNotes = (key, value) => {
    if (value && value !== '') {
      unmappedFields.push(`${key}: ${value}`)
    }
  }

  // ===== PROFILE SECTION =====
  const profile = {
    fullName: data.profile?.fullName || data.profile?.name || '',
    age: data.profile?.age || '',
    phone: data.profile?.phone || data.profile?.mobile || data.profile?.mobileNo || '',
    address: data.profile?.address || '',
    gender: data.profile?.gender || '',
    email: data.profile?.email || '',
    familyDoctor: data.profile?.familyDoctor || '',
    pastDietExperience: data.profile?.pastDietExperience || '',
  }

  // ===== BODY STATUS =====
  const bodyStatus = {
    height: data.profile?.height || '',
    weight: data.profile?.weight || '',
  }

  // ===== BODY MEASUREMENTS =====
  const bodyMeasurements = {
    fatpercent: data.bodyMeasurements?.fatpercent || '',
    waterPercent: data.bodyMeasurements?.waterPercent || '',
    musclepercent: data.bodyMeasurements?.musclepercent || '',
    Chest: data.bodyMeasurements?.Chest || '',
    abs: data.bodyMeasurements?.abs || '',
    Hips: data.bodyMeasurements?.Hips || '',
    arms: data.bodyMeasurements?.arms || '',
    thighs: data.bodyMeasurements?.thighs || '',
    neck: data.bodyMeasurements?.neck || '',
    visceralfatPercentage: data.bodyMeasurements?.visceralfatPercentage || '',
  }

  // ===== MEDICAL PROFILE =====
  // Parse medical conditions from various sources
  let knownMedicalConditions = []
  let currentHealthIssues = []
  const allergies = []
  let gutHealthIssues = []

  // Extract from medicalProfile if available
  if (data.medicalProfile) {
    knownMedicalConditions = data.medicalProfile.knownMedicalConditions || []
    currentHealthIssues = data.medicalProfile.currentHealthIssues || []
    gutHealthIssues = data.medicalProfile.gutHealthIssues || []
  }

  // Parse from raw text if needed
  const rawText = ocrData.extractedText || ''

  // Extract Fatigue (seen in your screenshot)
  if (rawText.includes('Fatigue') && !currentHealthIssues.includes('Fatigue')) {
    currentHealthIssues.push('Fatigue')
  }

  // Extract Lactose Intolerance
  if (rawText.includes('Lactose Intolerance') && !allergies.includes('Lactose Intolerance')) {
    allergies.push('Lactose Intolerance')
  }

  // Extract Digestive Concerns
  if (rawText.includes('Digestive Concern') && !gutHealthIssues.includes('Digestive Concern')) {
    gutHealthIssues.push('Digestive Concern')
  }

  // Extract Vegetarian
  if (rawText.includes('Vegetarian')) {
    addToNotes('Dietary Preference', 'Vegetarian')
  }

  // Extract Sleep pattern
  const sleepMatch = rawText.match(/Sleep patterns?[:\s-]*([^.\n]+)/i)
  if (sleepMatch) {
    addToNotes('Sleep Pattern', sleepMatch[1].trim())
  }

  // Extract Cooking preferences
  const cookingMatch = rawText.match(/(?:Spices|Oil|Cooking)[:\s-]*([^.\n]+)/i)
  if (cookingMatch) {
    addToNotes('Cooking Preferences', cookingMatch[1].trim())
  }

  // Extract Stress Level
  const stressMatch = rawText.match(/Stress Level[:\s-]*(\d+)/i)
  const stressLevel = stressMatch ? stressMatch[1] : data.lifestyleProfile?.stressLevel || ''

  const medicalProfile = {
    knownMedicalConditions,
    knownMedicalConditionsText: knownMedicalConditions.join(', '),
    currentHealthIssues,
    currentHealthIssuesText: currentHealthIssues.join(', '),
    currentMedicationsText: data.medicalProfile?.currentMedicationsText || '',
    familyMedicalHistoryText: data.medicalProfile?.familyMedicalHistoryText || '',
    gutHealthIssues,
    gutHealthIssuesText: gutHealthIssues.join(', '),
    periodRegularity: data.medicalProfile?.periodRegularity || '',
    // Add allergies here
    allergiesText: allergies.join(', '),
  }

  // ===== DIETARY PROFILE =====
  const dietaryProfile = {
    dietaryRestrictions: allergies,
    dietaryRestrictionsText: allergies.join(', '),
    specialDiet: data.dietaryProfile?.specialDiet || '',
    waterIntakeLitersPerDay: data.lifestyleProfile?.waterIntakeLitersPerDay || '',
    sweetCraving: data.lifestyleProfile?.sweetCravings || '',
    cookingOilUsed: data.lifestyleProfile?.spicesOilCookingPreferences || '',
  }

  // ===== LIFESTYLE PROFILE =====
  const lifestyleProfile = {
    activityFrequency: data.lifestyleProfile?.activityFrequency || '',
    activityType: data.lifestyleProfile?.activityType || '',
    waterIntakeLitersPerDay: data.lifestyleProfile?.waterIntakeLitersPerDay || '',
    alcoholFrequency: data.lifestyleProfile?.alcoholFrequency || '',
    sleepPattern: data.lifestyleProfile?.sleepPattern || '',
    bedTime: data.lifestyleProfile?.bedTime || '',
    wakeUpTime: data.lifestyleProfile?.wakeUpTime || '',
    stressLevel: stressLevel,
    sweetCravings: data.lifestyleProfile?.sweetCravings || '',
    spicesOilCookingPreferences: data.lifestyleProfile?.spicesOilCookingPreferences || '',
    eatingOutFrequency: data.lifestyleProfile?.eatingOutFrequency || '',
  }

  // ===== GOALS PROFILE =====
  const goalsProfile = {
    primaryGoal: data.goalsProfile?.primaryGoal || '',
    motivationForGoal: data.goalsProfile?.motivationForGoal || '',
    targetWeightKg: data.goalsProfile?.targetWeightKg || '',
    targetCompletionInMonths: data.goalsProfile?.targetCompletionInMonths || '',
    // This is where we put ALL unmapped data
    additionalNotes: unmappedFields.join('\n'),
  }

  // Also add raw text preview if there's a lot of unmapped data
  if (unmappedFields.length === 0 && rawText) {
    // If no specific fields were mapped, show a preview of the raw text
    goalsProfile.additionalNotes = `Extracted text preview:\n${rawText.substring(0, 500)}...`
  }

  const transformed = {
    profile,
    bodyStatus,
    bodyMeasurements,
    dietaryProfile,
    medicalProfile,
    lifestyleProfile,
    goalsProfile,
  }

  return transformed
}

async function uploadAndProcess() {
  const fileToProcess = selectedFile.value

  if (!fileToProcess) {
    error.value = 'Please select a PDF file first'
    return
  }

  isProcessing.value = true
  uploadProgress.value = 0
  progressMessage.value = 'Uploading PDF...'
  error.value = null

  const formData = new FormData()
  formData.append('pdfFile', fileToProcess)
  formData.append('documentType', 'medical')

  try {
    const response = await clientStore.processingPDF(formData)

    if (response.data.success) {
      rawExtractedData.value = response.data.data
      ocrClientData.value = transformOCRDataToClientData(response.data.data)

      //ocrClientData.value = response.data.data.structuredData || {}

      showUpdateDialog.value = true

      if (fileInput.value) {
        fileInput.value.value = ''
      }

      showUpdateDialog.value = true
    } else {
      throw new Error(response.data.error || 'Processing failed')
    }
  } catch (err) {
    error.value = err
  } finally {
    isProcessing.value = false
    uploadProgress.value = 0
    progressMessage.value = ''
    if (fileToProcess === selectedFile.value) {
      selectedFile.value = null
    }
  }
}

function handleClientDataUpdate(updatedClientData) {
  emit('client-data-ready', {
    updatedData: updatedClientData,
    originalExtractedData: rawExtractedData.value,
  })

  showUpdateDialog.value = false

  ocrClientData.value = {}
  rawExtractedData.value = null
  selectedFile.value = null
  showSuccessDialog.value = true
}

function goToClientsFromSuccessModal() {
  showSuccessDialog.value = false
  router.push('/clients')
}

function handleDialogClose() {
  showUpdateDialog.value = false
  ocrClientData.value = {}
  rawExtractedData.value = null
}

function handleClose() {
  ocrClientData.value = {}
  rawExtractedData.value = null
  selectedFile.value = null
  router.push('/clients')
}

function handleCreateDigitalForm() {
  router.push('/onboarding')
}

const emit = defineEmits(['client-data-ready'])
</script>
