<template>
  <div class="profile-card">
    <!-- Profile header -->
    <div class="profile-avatar">
      <figure :style="{ background: avatarBg }">
        <img :src="avatarUrl" alt="avatar" />
      </figure>
      <h2 class="profile-name">{{ capitalizeText(clientData.profile?.fullName) || 'N/A' }}</h2>
      <p class="profile-phone">{{ clientData.profile?.phone || 'N/A' }}</p>
      <div class="profile-address">
        <p v-for="(line, index) in addressLines" :key="index" class="address-line">
          {{ line }}
        </p>
      </div>
      <div class="action-buttons">
        <button class="button buttonBg"><b>Message</b></button>
        <button class="button" @click="handleAddUpdate"><b>Edit</b></button>
      </div>
    </div>

    <div class="grayBg">
      <!-- Personal Details card -->
      <div class="card personal-details-card">
        <h3 class="card-title personalTitle">Personal Details</h3>
        <div class="detail-row">
          <span>Gender</span>
          <span>{{ capitalizeText(clientData.profile?.gender) || 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <span>Age</span>
          <span>{{ age }}y</span>
        </div>
        <div class="detail-row">
          <span>Family Doctor</span>
          <span>{{ capitalizeText(clientData.profile?.familyDoctor) || '—' }}</span>
        </div>
        <div class="detail-row">
          <span>Reference</span>
          <span>{{ capitalizeText(clientData.profile?.reference) || '—' }}</span>
        </div>
      </div>

      <!-- Expansion sections (multiple can be open) -->
      <v-expansion-panels v-model="openPanels" class="profile-accordion" variant="default" multiple>
        <v-expansion-panel
          v-for="(section, index) in accordionSections"
          :key="section.id"
          :value="index"
          class="accordion-panel"
          rounded="lg"
          elevation="0"
          expand-icon="mdi-chevron-down"
          collapse-icon="mdi-chevron-down"
        >
          <v-expansion-panel-title class="accordion-title-slot">
            <span class="accordion-title-text">
              {{ section.title }}
            </span>
          </v-expansion-panel-title>
          <v-expansion-panel-text class="accordion-content-slot">
            <div class="accordion-rows">
              <template v-if="section.id === 'additional-notes'">
                <div class="notes-text-block">
                  {{ getSectionRows(section.id)[0]?.value || '' }}
                </div>
              </template>
              <template v-else>
                <div
                  v-for="(row, rowIndex) in getSectionRows(section.id)"
                  :key="rowIndex"
                  class="detail-row"
                >
                  <span class="detail-label">{{ row.label }}</span>
                  <span v-if="row.lines" class="detail-value detail-value-multiline">
                    <template v-for="(line, i) in row.lines" :key="i"
                      >{{ line }}<br v-if="i < row.lines.length - 1"
                    /></template>
                  </span>
                  <span v-else class="detail-value">{{ row.value }}</span>
                </div>
              </template>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
    <div class="update-metrics">
      <h3 class="update-metrics-title">View Medical Records</h3>
      <p class="update-metrics-desc">View client's past prescription and tests</p>
      <button type="button" class="button" @click="openFolderDialog"><b>View</b></button>
    </div>
  </div>

  <MedicalRecordFoldersDialog
    v-model="showMedicalRecordFoldersDialog"
    :folders="medicalRecordFolders"
    @select="handleFolderSelected"
  />

  <MedicalRecordsDialog
    v-model="showMedicalRecordsDialog"
    :client-id="clientId"
    :folder-name="selectedMedicalRecordFolder"
    :legacy-report-url="medicalReportUrl"
    @back="handleBackToFolders"
    @saved="$emit('medical-records-updated')"
  />
  <UpdateClientProfileDialog
    v-model="showUpdateClientDialog"
    :client-data="clientData"
    @save="$emit('save', $event)"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import UpdateClientProfileDialog from './updateClientProfileDialog.vue'
import MedicalRecordsDialog from './medicalReports/MedicalRecordsDialog.vue'
import MedicalRecordFoldersDialog from './medicalReports/MedicalRecordFoldersDialog.vue'
import {
  calculateAge,
  capitalizeText,
  formatHeightFeetInches,
  formatWithUnits,
} from './client.helper'
import { fetchClientMedicalRecordFolders } from '@/services/medicalRecords.service'
import { getClientAvatarSrc } from '@/utils/clientAvatar'
defineEmits(['save', 'medical-records-updated'])
const props = defineProps({
  clientData: {
    type: Object,
    required: true,
  },
})

const openPanels = ref([])
const showUpdateClientDialog = ref(false)
const showMedicalRecordsDialog = ref(false)
const showMedicalRecordFoldersDialog = ref(false)
const selectedMedicalRecordFolder = ref('Diagnostics')
const medicalRecordFolders = ref([
  { name: 'Diagnostics', count: 0 },
  { name: 'Health Summaries', count: 0 },
  { name: 'Insurance', count: 0 },
  { name: 'Lab Reports', count: 0 },
  { name: 'Prescriptions', count: 0 },
  { name: 'Vaccination Records', count: 0 },
  { name: 'Other', count: 0 },
])

const clientId = computed(() => {
  const c = props.clientData
  return String(c?._id || c?.id || '')
})

const medicalReportUrl = computed(() => props.clientData?.medicalProfile?.medicalReport || '')

async function openFolderDialog() {
  if (!clientId.value) {
    medicalRecordFolders.value = [
      { name: 'Diagnostics', count: 0 },
      { name: 'Health Summaries', count: 0 },
      { name: 'Insurance', count: 0 },
      { name: 'Lab Reports', count: 0 },
      { name: 'Prescriptions', count: 0 },
      { name: 'Vaccination Records', count: 0 },
      { name: 'Other', count: 0 },
    ]
    showMedicalRecordFoldersDialog.value = true
    return
  }
  try {
    const folders = await fetchClientMedicalRecordFolders(clientId.value)
    medicalRecordFolders.value = folders.length
      ? folders
      : [
          { name: 'Diagnostics', count: 0 },
          { name: 'Health Summaries', count: 0 },
          { name: 'Insurance', count: 0 },
          { name: 'Lab Reports', count: 0 },
          { name: 'Prescriptions', count: 0 },
          { name: 'Vaccination Records', count: 0 },
          { name: 'Other', count: 0 },
        ]
  } catch (err) {
    console.error(err)
    medicalRecordFolders.value = [
      { name: 'Diagnostics', count: 0 },
      { name: 'Health Summaries', count: 0 },
      { name: 'Insurance', count: 0 },
      { name: 'Lab Reports', count: 0 },
      { name: 'Prescriptions', count: 0 },
      { name: 'Vaccination Records', count: 0 },
      { name: 'Other', count: 0 },
    ]
  }
  showMedicalRecordFoldersDialog.value = true
}

function handleFolderSelected(folderName) {
  selectedMedicalRecordFolder.value = (folderName || '').trim() || 'Diagnostics'
  showMedicalRecordsDialog.value = true
}

function handleBackToFolders() {
  showMedicalRecordsDialog.value = false
  showMedicalRecordFoldersDialog.value = true
}

const accordionSections = [
  { id: 'goals-focus', title: 'Goals & Focus Areas' },
  { id: 'physical-measurements', title: 'Physical Measurements' },
  { id: 'health-background', title: 'Health Background' },
  { id: 'lifestyle-preferences', title: 'Lifestyle & Preferences' },
  { id: 'additional-notes', title: 'Additional Notes/Remarks' },
]

function toDisplayValue(val) {
  if (val == null || val === '') return '—'
  if (Array.isArray(val)) {
    return val.length ? val.map((item) => capitalizeText(String(item))).join(', ') : 'None'
  }
  return capitalizeText(String(val))
}
/* eslint-disable-next-line complexity */
function getSectionRows(sectionId) {
  const p = props.clientData?.profile || {}
  const bodyMeasurements = props.clientData?.bodyMeasurements || {}
  const dietaryProfile = props.clientData?.dietaryProfile || {}
  const goalsProfile = props.clientData?.goalsProfile || {}
  const lifestyleProfile = props.clientData?.lifestyleProfile || {}
  const medicalProfile = props.clientData?.medicalProfile || {}
  const fallback = '—'

  switch (sectionId) {
    case 'goals-focus': {
      const goalLabelByKey = {
        general_fitness: 'General Fitness',
        weight_loss: 'Weight Loss',
        weight_gain: 'Weight Gain',
        muscle_gain: 'Muscle Gain',
        maintenance: 'Maintenance',
        diabetes_care: 'Diabetes Care',
        heart_health: 'Heart Health',
        cholesterol_management: 'Cholesterol Management',
        blood_pressure_control: 'Blood Pressure Control',
        kidney_health: 'Kidney Health',
        thyroid_management: 'Thyroid Management',
        pcos_hormonal: 'PCOS / Hormonal Balance',
        gut_health: 'Gut Health',
        liver_health: 'Liver Health',
        food_allergies: 'Food Allergies',
        post_surgery_recovery: 'Post-Surgery Recovery',
        pregnancy_nutrition: 'Pregnancy Nutrition',
        postpartum_recovery: 'Postpartum Recovery',
        menopause_support: 'Menopause Support',
        improve_energy: 'Improve Energy Levels',
        better_sleep: 'Better Sleep',
        improve_eating_habits: 'Improve Eating Habits',
        stress_management: 'Stress Management',
        improve_digestion: 'Improve Digestion',
        clean_eating: 'Clean Eating',
        performance_nutrition: 'Performance Nutrition',
        strength_endurance: 'Strength & Endurance',
        sports_training: 'Sports Training',
        fat_loss_muscle_gain_recomp: 'Fat Loss + Muscle Gain (Recomposition)',
      }
      const goalKeys = Array.isArray(goalsProfile.goals) ? goalsProfile.goals : []
      const primaryGoalValue =
        goalsProfile.motivationForGoal ||
        (goalKeys.length > 0 ? goalKeys.map((k) => goalLabelByKey[k] || k).join(', ') : '') ||
        goalsProfile.primaryGoal ||
        ''

      return [
        { label: 'Primary Health Goal', value: toDisplayValue(primaryGoalValue) },
        {
          label: 'Target Weight(if applicable)',
          value:
            goalsProfile.targetWeightKg != null && goalsProfile.targetWeightKg !== ''
              ? `${goalsProfile.targetWeightKg}kgs`
              : fallback,
        },
        {
          label: 'Target Weight Timeline',
          value: formatWithUnits('Target Completion Period', goalsProfile.targetCompletionInMonths),
        },
        {
          label: 'Past Diet Experience',
          value: toDisplayValue(props.clientData.profile.pastDietExperience),
        },
      ]
    }
    case 'physical-measurements': {
      const bodyStatus = props.clientData?.bodyStatus || {}
      const height = bodyStatus.height ?? p.height
      const weight = bodyStatus.weight ?? p.weight
      return [
        {
          label: 'Height',
          value:
            height != null && height !== ''
              ? formatWithUnits('Height', height, '_')
              : formatWithUnits('Height', heightCalculated.value, '_'),
        },
        { label: 'Weight', value: weight != null && weight !== '' ? `${weight}kg` : fallback },
        { label: 'Body Fat', value: formatWithUnits('Body Fat', bodyMeasurements.fatpercent) },
        {
          label: 'Body Water',
          value: formatWithUnits('Body Water', bodyMeasurements.waterPercent),
        },
        {
          label: 'Muscle Mass',
          value: formatWithUnits('Muscle Mass', bodyMeasurements.musclepercent),
        },
        {
          label: 'Visceral Fat',
          value: formatWithUnits('Visceral Fat', bodyMeasurements.visceralfatPercentage),
        },
        { label: 'Chest', value: formatWithUnits('Chest', bodyMeasurements.Chest) },
        { label: 'Abs', value: formatWithUnits('Abs', bodyMeasurements.abs) },
        {
          label: 'Hips',
          value: formatWithUnits('Hips', bodyMeasurements.Hips ?? bodyMeasurements.hips),
        },
        { label: 'Arms', value: formatWithUnits('Arms', bodyMeasurements.arms) },
        { label: 'Thighs', value: formatWithUnits('Thighs', bodyMeasurements.thighs) },
      ]
    }
    case 'health-background':
      return [
        { label: 'Medical History', value: toDisplayValue(medicalProfile.knownMedicalConditions) },
        { label: 'Health History', value: toDisplayValue(medicalProfile.currentHealthIssues) },
        {
          label: 'Family Medical History',
          value: toDisplayValue(medicalProfile.familyMedicalHistory),
        },
        {
          label: 'Dietary Restrictions',
          value: toDisplayValue(dietaryProfile.dietaryRestrictions),
        },
        { label: 'Digestive Concerns', value: toDisplayValue(medicalProfile.gutHealthIssues) },
        {
          label: 'Menstruation Regularity',
          value: toDisplayValue(medicalProfile.periodRegularity),
        },
        {
          label: 'Medication & Supplements',
          value: toDisplayValue(medicalProfile.currentMedications),
        },
      ]
    case 'lifestyle-preferences': {
      const sweetCravingVal = dietaryProfile.sweetCraving
      const sweetCravingsDisplay =
        sweetCravingVal === true ||
        sweetCravingVal === 'true' ||
        String(sweetCravingVal).toLowerCase() === 'yes'
          ? 'Yes'
          : sweetCravingVal === false ||
              sweetCravingVal === 'false' ||
              String(sweetCravingVal).toLowerCase() === 'no'
            ? 'No'
            : fallback
      const hydrationVal = lifestyleProfile.waterIntakeLitersPerDay ?? ''
      const hydrationDisplay =
        hydrationVal !== '' && hydrationVal != null
          ? typeof hydrationVal === 'number'
            ? `${hydrationVal}L/day`
            : String(hydrationVal)
          : fallback
      return [
        { label: 'Special Diet', value: toDisplayValue(dietaryProfile.specialDiet) },
        { label: 'Water Intake', value: hydrationDisplay },
        { label: 'Sweet Cravings', value: sweetCravingsDisplay },
        { label: 'Sweet Cravings Time', value: toDisplayValue(dietaryProfile.sweetCravingTime) },
        { label: 'Type of Sweets', value: toDisplayValue(dietaryProfile.sweetCravingList) },
        {
          label: 'Eating-Out Frequency',
          value: toDisplayValue(lifestyleProfile.eatingOutFrequency),
        },
        {
          label: 'Spices/Oil/Cooking Preferences',
          value: toDisplayValue(dietaryProfile.cookingOilUsed),
        },
        { label: 'Physical Activity', value: toDisplayValue(lifestyleProfile.activityFrequency) },
        { label: 'Bed Time', value: toDisplayValue(lifestyleProfile.bedTime) },
        { label: 'Wakeup Time', value: toDisplayValue(lifestyleProfile.wakeUpTime) },
        { label: 'Alcohol Frequency', value: toDisplayValue(lifestyleProfile.alcoholFrequency) },
        { label: 'Stress Level', value: toDisplayValue(lifestyleProfile.stressLevel) },
      ]
    }
    case 'additional-notes': {
      const notes = p.notes || p.remarks || p.additionalNotes || goalsProfile.additionalNotes
      return [{ value: notes === fallback ? fallback : String(notes) }]
    }
    default:
      return []
  }
}

const avatarBg = computed(() => '#FFE7E0')

const avatarUrl = computed(() =>
  getClientAvatarSrc(props.clientData.profile?.gender, props.clientData.profile?.avatar),
)

const heightCalculated = computed(() => {
  const h = props.clientData?.bodyStatus?.height ?? props.clientData?.profile?.height
  return formatHeightFeetInches(h)
})

const age = computed(() => {
  return calculateAge(props.clientData.profile?.dob)
})

const addressLines = computed(() => {
  const address = props.clientData.profile?.address
  if (!address) return

  // Split by line breaks first
  let lines = address.split('\n').filter((line) => line.trim())

  // If no line breaks, try splitting by commas
  if (lines.length === 1) {
    lines = address
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part)
  }

  // Take up to 3 lines
  return lines.slice(0, 3).map((line) => capitalizeText(line))
})

const handleAddUpdate = () => {
  showUpdateClientDialog.value = true
}
</script>

<style scoped>
.profile-card {
  width: 100%;
}

.card {
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  border: 0;
}

/* Profile header */
.profile-avatar {
  text-align: center;
  margin-bottom: 20px;
}

.profile-avatar figure {
  width: 124px;
  height: 124px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar figure img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-name {
  margin: 10px 0 4px;
  font-size: 24px;
  font-weight: 700;
  color: #272727;
}

.profile-phone {
  color: #6d6d6d;
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
}

.profile-address {
  margin: 0 0 16px;
}
.profile-address p {
  color: #929292;
  font-size: 14px;
  max-width: 210px;
  margin: 0 auto 4px;
  word-break: break-all;
}

.address-line {
  color: #666;
  margin: 2px 0;
  font-size: 13px;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Personal Details card */
.personal-details-card {
  margin-bottom: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0;
  font-size: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.detail-row:last-child {
  border-bottom: none;
}

/* Additional Notes: full-width text area style, no right-side column */
.notes-text-block {
  width: 100%;
  min-height: 80px;
  padding: 12px 14px;
  font-size: 14px;
  color: #6d6d6d;
  line-height: 1.5;
  text-align: left;
  /* background: rgba(0, 0, 0, 0.04); */
  background: #ffecf3;
  border-radius: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Label: max 50% of row; wrap to next line at word boundaries, never break a word */
.detail-row span:first-child,
.detail-row .detail-label {
  max-width: 50%;
  font-weight: 500;
  color: #6d6d6d;
  text-align: left;
  letter-spacing: 0.1px;
  overflow-wrap: normal;
  word-break: normal;
  line-height: 1.4;
}

.detail-row span:last-child {
  color: #272727;
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
  overflow-wrap: break-word;
  word-wrap: break-word;
  max-width: 50%;
  line-height: 1.4;
  text-align: right;
  font-weight: 500;
}

/* Vuetify accordion */
.profile-accordion {
  --v-expansion-panel-title-min-height: 56px;
}

.profile-accordion :deep(.v-expansion-panel) {
  background: #fff;
  border-radius: 18px;
  margin-bottom: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.profile-accordion :deep(.v-expansion-panel:last-child) {
  margin-bottom: 0;
}

.accordion-title-slot {
  font-size: 14px;
  font-weight: 600;
  color: #272727;
}

.accordion-title-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.accordion-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2196f3;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

/* Expansion panel arrow (Vuetify icon) */
.profile-accordion :deep(.v-expansion-panel-title__icon) {
  color: #6d6d6d;
  transition: transform 0.25s ease;
}

.profile-accordion :deep(.v-expansion-panel--active .v-expansion-panel-title__icon) {
  transform: rotate(180deg);
}

.profile-accordion :deep(.v-expansion-panel-title) {
  border-bottom: none;
}

.accordion-content-slot {
  border-top: none;
}

.accordion-placeholder {
  padding-top: 4px;
  font-size: 13px;
  color: #6d6d6d;
}

/* Update Body Metrics */
.update-metrics {
  margin-top: 20px;
  padding: 20px 0 0;
}

.update-metrics-title {
  font-size: 16px;
  font-weight: 600;
  color: #272727;
  margin: 0 0 8px;
}

.update-metrics-desc {
  font-size: 14px;
  color: #6d6d6d;
  margin: 0 0 16px;
  line-height: 1.45;
}

.btn-add-update {
  width: 100%;
}
</style>
