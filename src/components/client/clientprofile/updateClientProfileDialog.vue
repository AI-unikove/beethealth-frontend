<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1024"
    persistent
    scrollable
    content-class="client-profile-dialog"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 d-flex align-center justify-space-between">
        <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-0">Client Profile</h2>
        <div class="d-flex gap-2">
          <v-btn
            icon
            variant="text"
            size="small"
            class="closeBtn"
            aria-label="Close"
            @click="close"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      <!-- Edit form -->
      <v-card-text class="pa-6 pt-4 grey formUi lighten-4">
        <v-row>
          <!-- Personal Details (full width) -->
          <v-col cols="12">
            <v-sheet class="profile-dialog-card rounded-lg pa-4 mb-4">
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3">
                Personal Details
              </h3>
              <div class="grayBg">
                <v-text-field
                  v-model="form.profile.fullName"
                  label=" Full Name"
                  variant="outlined"
                  density="compact"
                  class="mb-4 profile-field"
                  hide-details
                  readonly
                />
                <v-text-field
                  v-model="form.profile.phone"
                  label="Mobile Number"
                  variant="outlined"
                  density="compact"
                  class="mb-4 profile-field mobile-phone-field"
                  type="number"
                  maxlength="20"
                  :rules="[mobileRule]"
                  readonly
                  hide-details
                />
                <!-- Address: main label on first row, sub-labels indented (match image) -->
                <div class="address-fields mb-4">
                  <div class="addressTitle">Address</div>
                  <div class="addressLeft">
                    <v-row dense class="address-row align-center">
                      <v-col cols="12" sm="4" class="d-flex align-center py-1">
                        <span class="address-label address-label-main">Address Line 1</span>
                      </v-col>
                      <v-col cols="12" sm="8" class="py-1">
                        <v-text-field
                          v-model="form.profile.addressLine1"
                          variant="outlined"
                          density="compact"
                          class="profile-field"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                    <v-row dense class="address-row align-center">
                      <v-col
                        cols="12"
                        sm="4"
                        class="d-flex align-center address-label-col-indent py-1"
                      >
                        <span class="address-label">Address Line 2</span>
                      </v-col>
                      <v-col cols="12" sm="8" class="py-1">
                        <v-text-field
                          v-model="form.profile.addressLine2"
                          variant="outlined"
                          density="compact"
                          class="profile-field"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                    <v-row dense class="address-row align-center">
                      <v-col
                        cols="12"
                        sm="4"
                        class="d-flex align-center address-label-col-indent py-1"
                      >
                        <span class="address-label">City/Town</span>
                      </v-col>
                      <v-col cols="12" sm="8" class="py-1">
                        <v-text-field
                          v-model="form.profile.cityTown"
                          variant="outlined"
                          density="compact"
                          class="profile-field"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                    <v-row dense class="address-row align-center">
                      <v-col
                        cols="12"
                        sm="4"
                        class="d-flex align-center address-label-col-indent py-1"
                      >
                        <span class="address-label">State/Region/Province</span>
                      </v-col>
                      <v-col cols="12" sm="8" class="py-1">
                        <v-text-field
                          v-model="form.profile.stateRegion"
                          variant="outlined"
                          density="compact"
                          class="profile-field"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                    <v-row dense class="address-row align-center">
                      <v-col
                        cols="12"
                        sm="4"
                        class="d-flex align-center address-label-col-indent py-1"
                      >
                        <span class="address-label">Zip/Postcode</span>
                      </v-col>
                      <v-col cols="12" sm="8" class="py-1">
                        <v-text-field
                          v-model="form.profile.zipPostcode"
                          variant="outlined"
                          density="compact"
                          class="profile-field"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                    <v-row dense class="address-row align-center">
                      <v-col
                        cols="12"
                        sm="4"
                        class="d-flex align-center address-label-col-indent py-1"
                      >
                        <span class="address-label">Country</span>
                      </v-col>
                      <v-col cols="12" sm="8" class="py-1">
                        <v-text-field
                          v-model="form.profile.country"
                          variant="outlined"
                          density="compact"
                          class="profile-field"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                  </div>
                </div>
                <v-text-field
                  v-model="form.profile.age"
                  label="Age"
                  variant="outlined"
                  density="compact"
                  type="number"
                  class="mb-4 profile-field"
                  hide-details
                />
                <v-text-field
                  v-model="form.profile.gender"
                  label="Gender"
                  variant="outlined"
                  density="compact"
                  class="mb-4 profile-field"
                  hide-details
                />
                <v-text-field
                  v-model="form.nutritionistName"
                  label="Nutritionist Name"
                  variant="outlined"
                  density="compact"
                  class="mb-4 profile-field"
                  hide-details
                />
                <v-text-field
                  v-model="form.profile.familyDoctor"
                  label="Family Doctor"
                  variant="outlined"
                  density="compact"
                  class="mb-4 profile-field"
                  hide-details
                />
                <v-text-field
                  v-model="form.profile.reference"
                  label="Reference"
                  variant="outlined"
                  density="compact"
                  class="profile-field"
                  hide-details
                />
              </div>
            </v-sheet>
          </v-col>

          <!-- Physical Measurements | Goals & Focus Areas (same row) -->
          <v-col cols="12" md="6">
            <v-sheet class="profile-dialog-card rounded-lg pa-4 mb-4">
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3">
                Physical Measurements
              </h3>
              <v-row dense class="physicalText">
                <v-col cols="6" class="d-flex">
                  <div class="grayBg flex-grow-1">
                    <v-text-field
                      :model-value="form.bodyMeasurements.fatpercent"
                      label="Body Fat (%)"
                      variant="outlined"
                      density="compact"
                      type="text"
                      inputmode="numeric"
                      maxlength="3"
                      hide-details
                      @update:model-value="
                        form.bodyMeasurements.fatpercent = physicalMeasurementInput(
                          $event,
                          'fatpercent',
                        )
                      "
                      class="mb-4 profile-field"
                    />
                    <v-text-field
                      :model-value="form.bodyMeasurements.waterPercent"
                      label="Body Water (%)"
                      variant="outlined"
                      density="compact"
                      type="text"
                      inputmode="numeric"
                      maxlength="3"
                      hide-details
                      @update:model-value="
                        form.bodyMeasurements.waterPercent = physicalMeasurementInput(
                          $event,
                          'waterPercent',
                        )
                      "
                      class="mb-4 profile-field"
                    />
                    <v-text-field
                      :model-value="form.bodyMeasurements.musclepercent"
                      label="Muscle Mass (%)"
                      variant="outlined"
                      density="compact"
                      type="text"
                      inputmode="numeric"
                      maxlength="3"
                      hide-details
                      @update:model-value="
                        form.bodyMeasurements.musclepercent = physicalMeasurementInput(
                          $event,
                          'musclepercent',
                        )
                      "
                      class="mb-4 profile-field"
                    />
                    <v-text-field
                      :model-value="form.bodyMeasurements.visceralfatPercentage"
                      label="Visceral Fat (%)"
                      variant="outlined"
                      density="compact"
                      type="text"
                      inputmode="numeric"
                      maxlength="3"
                      hide-details
                      @update:model-value="
                        form.bodyMeasurements.visceralfatPercentage = physicalMeasurementInput(
                          $event,
                          'visceralfatPercentage',
                        )
                      "
                      class="mb-4 profile-field"
                    />
                    <v-text-field
                      :model-value="form.bodyStatus.height"
                      label="Height (cm)"
                      variant="outlined"
                      density="compact"
                      type="text"
                      inputmode="numeric"
                      maxlength="3"
                      hide-details
                      @update:model-value="
                        form.bodyStatus.height = physicalMeasurementInput($event, 'height')
                      "
                      class="mb-4 profile-field"
                    />
                    <v-text-field
                      :model-value="form.bodyStatus.weight"
                      label="Weight (kg)"
                      variant="outlined"
                      density="compact"
                      type="text"
                      inputmode="numeric"
                      maxlength="3"
                      hide-details
                      @update:model-value="
                        form.bodyStatus.weight = physicalMeasurementInput($event, 'weight')
                      "
                      class="mb-4 profile-field"
                    />
                  </div>
                </v-col>
                <v-col cols="6" class="d-flex">
                  <div class="grayBg flex-grow-1">
                    <v-text-field
                      :model-value="form.bodyMeasurements.Chest"
                      label="Chest (cm)"
                      variant="outlined"
                      density="compact"
                      type="text"
                      inputmode="numeric"
                      maxlength="3"
                      hide-details
                      @update:model-value="
                        form.bodyMeasurements.Chest = physicalMeasurementInput($event, 'Chest')
                      "
                      class="mb-4 profile-field"
                    />
                    <v-text-field
                      :model-value="form.bodyMeasurements.abs"
                      label="Abs (cm)"
                      variant="outlined"
                      density="compact"
                      type="text"
                      inputmode="numeric"
                      maxlength="3"
                      hide-details
                      @update:model-value="
                        form.bodyMeasurements.abs = physicalMeasurementInput($event, 'abs')
                      "
                      class="mb-4 profile-field"
                    />
                    <v-text-field
                      :model-value="form.bodyMeasurements.Hips"
                      label="Hips (cm)"
                      variant="outlined"
                      density="compact"
                      type="text"
                      inputmode="numeric"
                      maxlength="3"
                      hide-details
                      @update:model-value="
                        form.bodyMeasurements.Hips = physicalMeasurementInput($event, 'Hips')
                      "
                      class="mb-4 profile-field"
                    />
                    <v-text-field
                      :model-value="form.bodyMeasurements.arms"
                      label="Arms (cm)"
                      variant="outlined"
                      density="compact"
                      type="text"
                      inputmode="numeric"
                      maxlength="3"
                      hide-details
                      @update:model-value="
                        form.bodyMeasurements.arms = physicalMeasurementInput($event, 'arms')
                      "
                      class="mb-4 profile-field"
                    />
                    <v-text-field
                      :model-value="form.bodyMeasurements.thighs"
                      label="Thighs (cm)"
                      variant="outlined"
                      density="compact"
                      type="text"
                      inputmode="numeric"
                      maxlength="3"
                      hide-details
                      @update:model-value="
                        form.bodyMeasurements.thighs = physicalMeasurementInput($event, 'thighs')
                      "
                      class="mb-4 profile-field"
                    />
                  </div>
                </v-col>
              </v-row>
            </v-sheet>
          </v-col>

          <!-- Goals & Focus Areas (same row as Physical Measurements) -->
          <v-col cols="12" md="6" class="fullGrayBg">
            <v-sheet class="profile-dialog-card rounded-lg pa-4 mb-4">
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3">
                Goals & Focus Areas
              </h3>
              <div class="grayBg">
                <v-textarea
                  v-model="form.goalsProfile.primaryGoal"
                  label="Primary Health Goal"
                  variant="outlined"
                  density="compact"
                  class="mb-4 profile-field"
                  hide-details
                />
                <v-text-field
                  v-model="form.goalsProfile.targetWeightKg"
                  label="Weight"
                  variant="outlined"
                  density="compact"
                  type="number"
                  class="mb-4 profile-field"
                  hide-details
                />
                <v-text-field
                  v-model="form.goalsProfile.targetCompletionInMonths"
                  label="Timeline"
                  variant="outlined"
                  density="compact"
                  type="number"
                  class="mb-4 profile-field"
                  hide-details
                />
                <v-textarea
                  v-model="form.profile.pastDietExperience"
                  label="Past Diet Experience"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  class="profile-field profile-field-multiline"
                  hide-details
                />
              </div>
            </v-sheet>
          </v-col>

          <!-- Health Background | Lifestyle & Preferences (same row) -->
          <v-col cols="12" md="6" class="fullGrayBg p-0">
            <div class="bgW">
              <v-sheet class="profile-dialog-card rounded-lg pa-4 mb-4">
                <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-2">
                  Health Background
                </h3>
                <div v-if="clientId" class="d-flex flex-wrap align-center gap-2 mb-3">
                  <v-btn
                    variant="outlined"
                    color="primary"
                    size="small"
                    prepend-icon="mdi-file-document-outline"
                    @click="openFolderDialog"
                  >
                    Medical records
                  </v-btn>
                </div>
                <div class="grayBg">
                  <MultiCombobox
                    v-model="form.medicalProfile.knownMedicalConditions"
                    class="mb-4"
                    label="Medical History"
                    :items="medicalHistoryOptions"
                    :base-items="MEDICAL_HISTORY_OPTIONS"
                    category="medicalHistory"
                    @option-added="(v) => addCustomOption('medicalHistory', v)"
                  />
                  <MultiCombobox
                    v-model="form.medicalProfile.currentHealthIssues"
                    class="mb-4"
                    label="Health History"
                    :items="healthHistoryOptions"
                    :base-items="HEALTH_HISTORY_OPTIONS"
                    category="healthHistory"
                    @option-added="(v) => addCustomOption('healthHistory', v)"
                  />
                  <v-textarea
                    v-model="form.medicalProfile.familyMedicalHistoryText"
                    label="Family Medical History"
                    variant="outlined"
                    density="compact"
                    rows="3"
                    class="mb-4 profile-field profile-field-multiline"
                    hide-details
                  />
                  <MultiCombobox
                    v-model="form.dietaryProfile.dietaryRestrictions"
                    class="mb-4"
                    label="Dietary Restrictions"
                    :items="dietaryRestrictionsOptions"
                    :base-items="DIETARY_RESTRICTIONS_OPTIONS"
                    category="dietaryRestrictions"
                    @option-added="(v) => addCustomOption('dietaryRestrictions', v)"
                  />
                  <MultiCombobox
                    v-model="form.medicalProfile.gutHealthIssues"
                    class="mb-4"
                    label="Digestive Concerns"
                    :items="gutHealthOptions"
                    :base-items="GUT_HEALTH_OPTIONS"
                    category="gutHealth"
                    @option-added="(v) => addCustomOption('gutHealth', v)"
                  />
                  <SingleCombobox
                    v-if="isFemale"
                    v-model="form.medicalProfile.periodRegularity"
                    label="Menstruation Regularity"
                    :items="periodRegularityOptions"
                    :base-items="PERIOD_REGULARITY_OPTIONS"
                    category="periodRegularity"
                    class="mb-4 profile-field"
                    @option-added="(v) => addCustomOption('periodRegularity', v)"
                  />
                  <v-textarea
                    v-model="form.medicalProfile.currentMedicationsText"
                    label="Medication & Supplements"
                    variant="outlined"
                    density="compact"
                    rows="3"
                    class="mb-4 profile-field profile-field-multiline"
                    hide-details
                  />
                </div>
              </v-sheet>
            </div>
          </v-col>

          <!-- Lifestyle & Preferences -->
          <v-col cols="12" md="6" class="p-0">
            <div class="bgW">
              <v-sheet class="profile-dialog-card rounded-lg pa-4 mb-4">
                <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3">
                  Lifestyle & Preferences
                </h3>
                <div class="grayBg">
                  <MultiCombobox
                    v-model="form.dietaryProfile.specialDiet"
                    class="mb-4"
                    label="Special Diet"
                    :items="specialDietOptions"
                    :base-items="DIETARY_PREFERENCES_OPTIONS"
                    category="dietaryPreferences"
                    @option-added="(v) => addCustomOption('dietaryPreferences', v)"
                  />

                  <SingleCombobox
                    v-model="form.lifestyleProfile.waterIntakeLitersPerDay"
                    label="Water Intake"
                    :items="hydrationOptions"
                    :base-items="HYDRATION_OPTIONS"
                    category="hydration"
                    class="mb-4 profile-field"
                    hide-details
                    @option-added="(v) => addCustomOption('hydration', v)"
                  />
                  <SingleCombobox
                    v-model="form.lifestyleProfile.sweetCravings"
                    label="Sweet Cravings"
                    :items="sweetCravingsOptions"
                    :base-items="SWEET_CRAVINGS_OPTIONS"
                    category="sweetCravings"
                    class="mb-4 profile-field"
                    hide-details
                    @option-added="(v) => addCustomOption('sweetCravings', v)"
                  />
                  <SingleCombobox
                    v-model="form.dietaryProfile.sweetCravingTime"
                    label="Sweet Cravings Time"
                    :items="sweetCravingTimeOptions"
                    :base-items="SWEET_CRAVING_TIME_OPTIONS"
                    category="sweetCravingTime"
                    class="mb-4 profile-field"
                    hide-details
                    @option-added="(v) => addCustomOption('sweetCravingTime', v)"
                  />
                  <MultiCombobox
                    v-model="form.dietaryProfile.sweetCravingList"
                    class="mb-4"
                    label="Type of Sweets"
                    :items="sweetCravingListOptions"
                    :base-items="SWEET_TYPE_OPTIONS"
                    category="sweetType"
                    @option-added="(v) => addCustomOption('sweetType', v)"
                  />
                  <SingleCombobox
                    v-model="form.lifestyleProfile.eatingOutFrequency"
                    label="Eating-Out Frequency"
                    :items="eatingOutFrequencyOptions"
                    :base-items="EATING_OUT_FREQUENCY_OPTIONS"
                    category="eatingOutFrequency"
                    class="mb-4 profile-field"
                    hide-details
                    @option-added="(v) => addCustomOption('eatingOutFrequency', v)"
                  />
                  <v-textarea
                    v-model="form.lifestyleProfile.spicesOilCookingPreferences"
                    label="Spices/Oil/Cooking Style"
                    variant="outlined"
                    density="compact"
                    rows="3"
                    class="mb-4 profile-field profile-field-multiline"
                    hide-details
                  />
                  <SingleCombobox
                    v-model="form.lifestyleProfile.activityFrequency"
                    label="Physical Activity"
                    :items="activityFrequencyOptions"
                    :base-items="ACTIVITY_FREQUENCY_OPTIONS"
                    category="activityFrequency"
                    class="mb-4 profile-field"
                    hide-details
                    @option-added="(v) => addCustomOption('activityFrequency', v)"
                  />
                  <v-text-field
                    v-model="form.lifestyleProfile.bedTime"
                    label="Bed Time"
                    variant="outlined"
                    density="compact"
                    type="text"
                    class="mb-4 profile-field"
                    hide-details
                  />
                  <v-text-field
                    v-model="form.lifestyleProfile.wakeUpTime"
                    label="Wake Up Time"
                    variant="outlined"
                    density="compact"
                    type="text"
                    class="mb-4 profile-field"
                    hide-details
                  />

                  <SingleCombobox
                    v-model="form.lifestyleProfile.alcoholFrequency"
                    label="Alcohol Frequency"
                    :items="alcoholFrequencyOptions"
                    :base-items="ALCOHOL_FREQUENCY_OPTIONS"
                    category="alcoholFrequency"
                    class="mb-4 profile-field"
                    hide-details
                    @option-added="(v) => addCustomOption('alcoholFrequency', v)"
                  />

                  <div class="stress-level-container profile-field mb-4 p-3">
                    <label class="v-label text-body-2 mb-5 pb-3 d-block font-weight-bold">
                      Stress Level
                      <span class="text-body-2 font-weight-normal">({{ stressLevelLabel }})</span>
                    </label>
                    <v-slider
                      :model-value="stressLevelNum"
                      :min="1"
                      :max="10"
                      :step="1"
                      show-ticks="always"
                      thumb-label="always"
                      tick-size="4"
                      density="compact"
                      @update:model-value="form.lifestyleProfile.stressLevel = $event"
                      hide-details
                    >
                      <template #thumb-label="{ modelValue: value }">
                        {{ value }}
                      </template>
                    </v-slider>
                  </div>
                </div>
              </v-sheet>
            </div>
          </v-col>

          <!-- Additional Remarks/Notes -->
          <v-col cols="12">
            <v-sheet class="profile-dialog-card rounded-lg pa-4">
              <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-3">
                Additional Remarks/Notes
              </h3>
              <div class="additional-notes-container">
                <v-textarea
                  v-model="form.goalsProfile.additionalNotes"
                  label=""
                  variant="solo"
                  density="compact"
                  rows="3"
                  class="profile-field profile-field-multiline additional-notes-field"
                  hide-details
                  flat
                />
              </div>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn class="save-btn" rounded="lg" @click="onSave">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <MedicalRecordFoldersDialog
    v-model="showMedicalRecordFoldersDialog"
    :folders="medicalRecordFolders"
    @select="handleFolderSelected"
  />

  <MedicalRecordsDialog
    v-if="clientId"
    v-model="showMedicalRecordsDialog"
    :client-id="clientId"
    :folder-name="selectedMedicalRecordFolder"
    :legacy-report-url="medicalReportUrl"
    @back="handleBackToFolders"
    @saved="emit('medical-records-updated')"
  />
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import MedicalRecordsDialog from './medicalReports/MedicalRecordsDialog.vue'
import MedicalRecordFoldersDialog from './medicalReports/MedicalRecordFoldersDialog.vue'
import {
  calculateAge,
  formatTimeWithAMPM,
  getDefaultClientProfileForm,
  getInitialLastValidPhysicalMeasurement,
  getStressLevelLabel,
  hoursToTimeStr,
  hydrationOptionToLiters,
  litersToHydrationOption,
  parseAddressLines,
  parseArray,
  processPhysicalMeasurementInput,
  toArrayText,
  validateMobile,
} from './client.helper'
import { useClientStore } from '@/stores/client.store'
import { addEnumOptions } from '@/services/enums.service'
import MultiCombobox from '@/components/common/multiCombobox.vue'
import SingleCombobox from '@/components/common/singleCombobox.vue'
import {
  ACTIVITY_FREQUENCY_OPTIONS,
  ALCOHOL_FREQUENCY_OPTIONS,
  DIETARY_PREFERENCES_OPTIONS,
  DIETARY_RESTRICTIONS_OPTIONS,
  EATING_OUT_FREQUENCY_OPTIONS,
  GUT_HEALTH_OPTIONS,
  HEALTH_HISTORY_OPTIONS,
  HYDRATION_OPTIONS,
  MEDICAL_HISTORY_OPTIONS,
  PERIOD_REGULARITY_OPTIONS,
  STRESS_LEVEL_OPTIONS,
  SWEET_CRAVINGS_OPTIONS,
  SWEET_CRAVING_TIME_OPTIONS,
  SWEET_TYPE_OPTIONS,
} from '@/components/common/DropDownItems'
import { fetchClientMedicalRecordFolders } from '@/services/medicalRecords.service'

const props = defineProps({
  modelValue: Boolean,
  clientData: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'medical-records-updated'])
const clientStore = useClientStore()

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
const clientId = computed(() => props.clientData?._id || props.clientData?.id || '')
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

const form = reactive(getDefaultClientProfileForm())

/** Custom options added via combobox (persist in dropdown after deselect) */
const customOptions = ref({
  activityFrequency: [],
  alcoholFrequency: [],
  dietaryPreferences: [],
  dietaryRestrictions: [],
  eatingOutFrequency: [],
  gutHealth: [],
  healthHistory: [],
  hydration: [],
  medicalHistory: [],
  periodRegularity: [],
  stressLevel: [],
  sweetCravingTime: [],
  sweetCravings: [],
  sweetType: [],
})

function addCustomOption(category, value) {
  const v = value != null ? String(value).trim() : ''
  if (!v) return
  const list = customOptions.value[category] || []
  if (list.includes(v)) return
  customOptions.value = {
    ...customOptions.value,
    [category]: [...list, v],
  }
}

function mobileRule(value) {
  return validateMobile(value)
}

/** Backend enum category names (must match backend EnumOption.category) */
const ENUM_CATEGORIES = {
  activityFrequency: {
    getValues: (f) => toSingle(f.lifestyleProfile?.activityFrequency),
    base: ACTIVITY_FREQUENCY_OPTIONS,
  },
  alcoholFrequency: {
    getValues: (f) => toSingle(f.lifestyleProfile?.alcoholFrequency),
    base: ALCOHOL_FREQUENCY_OPTIONS,
  },
  dietaryPreferences: {
    getValues: (f) => toArray(f.dietaryProfile?.specialDiet),
    base: DIETARY_PREFERENCES_OPTIONS,
  },
  dietaryRestrictions: {
    getValues: (f) => toArray(f.dietaryProfile?.dietaryRestrictions),
    base: DIETARY_RESTRICTIONS_OPTIONS,
  },
  eatingOutFrequency: {
    getValues: (f) => toSingle(f.lifestyleProfile?.eatingOutFrequency),
    base: EATING_OUT_FREQUENCY_OPTIONS,
  },
  gutHealth: {
    getValues: (f) => toArray(f.medicalProfile?.gutHealthIssues),
    base: GUT_HEALTH_OPTIONS,
  },
  healthHistory: {
    getValues: (f) => toArray(f.medicalProfile?.currentHealthIssues),
    base: HEALTH_HISTORY_OPTIONS,
  },
  hydration: {
    getValues: (f) => toSingle(f.lifestyleProfile?.waterIntakeLitersPerDay),
    base: HYDRATION_OPTIONS,
  },
  medicalHistory: {
    getValues: (f) => toArray(f.medicalProfile?.knownMedicalConditions),
    base: MEDICAL_HISTORY_OPTIONS,
  },
  periodRegularity: {
    getValues: (f) => toSingle(f.medicalProfile?.periodRegularity),
    base: PERIOD_REGULARITY_OPTIONS,
  },
  stressLevel: {
    getValues: (f) =>
      toSingle(
        f.lifestyleProfile?.stressLevel != null ? String(f.lifestyleProfile.stressLevel) : '',
      ),
    base: STRESS_LEVEL_OPTIONS,
  },
  sweetCravingTime: {
    getValues: (f) => toSingle(f.dietaryProfile?.sweetCravingTime),
    base: SWEET_CRAVING_TIME_OPTIONS,
  },
  sweetCravings: {
    getValues: (f) => toSingle(f.lifestyleProfile?.sweetCravings),
    base: SWEET_CRAVINGS_OPTIONS,
  },
  sweetType: {
    getValues: (f) => toArray(f.dietaryProfile?.sweetCravingList),
    base: SWEET_TYPE_OPTIONS,
  },
}
function toSingle(v) {
  if (v == null || String(v).trim() === '') return []
  return [String(v).trim()]
}
function toArray(v) {
  if (!v) return []
  return Array.isArray(v)
    ? v
        .map((x) => (x != null && typeof x === 'object' && 'name' in x ? x.name : String(x)))
        .filter(Boolean)
    : toSingle(v)
}

/** If form (or client data) has dropdown values not in base options, add them via backend so they persist in enums. */
async function ensureEnumOptions(formOrClient) {
  const base = formOrClient || form
  const promises = []
  for (const [category, { getValues, base: baseOptions }] of Object.entries(ENUM_CATEGORIES)) {
    const values = getValues(base) || []
    const newOptions = values.filter((val) => val && !baseOptions.includes(val))
    if (newOptions.length > 0) {
      promises.push(addEnumOptions(category, newOptions).catch(() => {}))
    }
  }
  await Promise.all(promises)
}

/** Per-field state: show "Please enter less than 999" below field when user enters > 999 */
const physicalMeasurementExceeded = reactive({
  fatpercent: false,
  waterPercent: false,
  musclepercent: false,
  visceralfatPercentage: false,
  height: false,
  weight: false,
  Chest: false,
  abs: false,
  Hips: false,
  arms: false,
  thighs: false,
})

/** Last valid value per field – revert to this when user types > 999 so second attempt cannot keep invalid value */
const lastValidPhysicalMeasurement = reactive({
  fatpercent: '',
  waterPercent: '',
  musclepercent: '',
  visceralfatPercentage: '',
  height: '',
  weight: '',
  Chest: '',
  abs: '',
  Hips: '',
  arms: '',
  thighs: '',
})

/** Wrapper: process input via helper and update local exceeded/lastValid state; return value for form. */
function physicalMeasurementInput(val, exceededKey) {
  const result = processPhysicalMeasurementInput(val, lastValidPhysicalMeasurement[exceededKey])
  physicalMeasurementExceeded[exceededKey] = result.exceeded
  lastValidPhysicalMeasurement[exceededKey] = result.newLastValid
  return result.value
}

const medicalHistoryOptions = computed(() => {
  const custom = customOptions.value.medicalHistory || []
  return [...MEDICAL_HISTORY_OPTIONS, ...custom]
})

const healthHistoryOptions = computed(() => {
  const custom = customOptions.value.healthHistory || []
  return [...HEALTH_HISTORY_OPTIONS, ...custom]
})

const gutHealthOptions = computed(() => {
  const custom = customOptions.value.gutHealth || []
  return [...GUT_HEALTH_OPTIONS, ...custom]
})

const stressLevelNum = computed(() => {
  const v = form.lifestyleProfile.stressLevel
  if (v === '' || v == null) return 1
  const n = Number(v)
  return Number.isNaN(n) ? 1 : Math.min(10, Math.max(1, n))
})

const stressLevelLabel = computed(() => getStressLevelLabel(stressLevelNum.value))

const isFemale = computed(() => {
  const gender = form.profile.gender || ''
  return String(gender).toLowerCase() === 'female'
})

const dietaryRestrictionsOptions = computed(() => {
  const custom = customOptions.value.dietaryRestrictions || []
  return [...DIETARY_RESTRICTIONS_OPTIONS, ...custom]
})

const specialDietOptions = computed(() => {
  const custom = customOptions.value.dietaryPreferences || []
  return [...DIETARY_PREFERENCES_OPTIONS, ...custom]
})

const sweetCravingListOptions = computed(() => {
  const custom = customOptions.value.sweetType || []
  return [...SWEET_TYPE_OPTIONS, ...custom]
})

const periodRegularityOptions = computed(() => [
  ...PERIOD_REGULARITY_OPTIONS,
  ...(customOptions.value.periodRegularity || []),
])
const hydrationOptions = computed(() => [
  ...HYDRATION_OPTIONS,
  ...(customOptions.value.hydration || []),
])
const sweetCravingsOptions = computed(() => [
  ...SWEET_CRAVINGS_OPTIONS,
  ...(customOptions.value.sweetCravings || []),
])
const sweetCravingTimeOptions = computed(() => [
  ...SWEET_CRAVING_TIME_OPTIONS,
  ...(customOptions.value.sweetCravingTime || []),
])
const eatingOutFrequencyOptions = computed(() => [
  ...EATING_OUT_FREQUENCY_OPTIONS,
  ...(customOptions.value.eatingOutFrequency || []),
])
const activityFrequencyOptions = computed(() => [
  ...ACTIVITY_FREQUENCY_OPTIONS,
  ...(customOptions.value.activityFrequency || []),
])
const alcoholFrequencyOptions = computed(() => [
  ...ALCOHOL_FREQUENCY_OPTIONS,
  ...(customOptions.value.alcoholFrequency || []),
])

/* eslint-disable-next-line complexity */
function populateForm() {
  const d = props.clientData || {}
  Object.keys(physicalMeasurementExceeded).forEach((k) => {
    physicalMeasurementExceeded[k] = false
  })
  Object.assign(lastValidPhysicalMeasurement, getInitialLastValidPhysicalMeasurement(d))
  const p = d.profile || {}
  const b = d.bodyMeasurements || {}
  const bodyStatus = d.bodyStatus || {}
  const dietary = d.dietaryProfile || {}
  const m = d.medicalProfile || {}
  const l = d.lifestyleProfile || {}
  const g = d.goalsProfile || {}

  const ageFromDob =
    p.dob != null && p.dob !== ''
      ? calculateAge(p.dob)
      : p.age != null && p.age !== ''
        ? String(p.age)
        : ''
  const addressParts = parseAddressLines(p.address ?? '')
  form.profile = {
    fullName: p.fullName ?? '',
    email: p.email ?? '',
    age: ageFromDob !== '' ? String(ageFromDob) : '',
    phone: p.phone ?? '',
    address: p.address ?? '',
    addressLine1: addressParts[0] ?? '',
    addressLine2: addressParts[1] ?? '',
    cityTown: addressParts[2] ?? '',
    stateRegion: addressParts[3] ?? '',
    zipPostcode: addressParts[4] ?? '',
    country: addressParts[5] ?? '',
    gender: p.gender ?? '',
    familyDoctor: p.familyDoctor ?? '',
    pastDietExperience: p.pastDietExperience ?? '',
    reference: p.reference ?? '',
  }
  form.bodyStatus = {
    height: bodyStatus.height ?? p.height ?? '',
    weight: bodyStatus.weight ?? p.weight ?? '',
  }
  form.nutritionistName = d.nutritionistName ?? ''
  form.bodyMeasurements = {
    fatpercent: b.fatpercent ?? '',
    waterPercent: b.waterPercent ?? '',
    musclepercent: b.musclepercent ?? '',
    Chest: b.Chest ?? '',
    abs: b.abs ?? '',
    Hips: b.Hips ?? b.hips ?? '',
    arms: b.arms ?? '',
    thighs: b.thighs ?? '',
    neck: b.neck ?? '',
    visceralfatPercentage: b.visceralfatPercentage ?? '',
  }
  const dietaryRestrictionsArr = Array.isArray(dietary.dietaryRestrictions)
    ? (dietary.dietaryRestrictions ?? []).map((v) =>
        typeof v === 'object' && v && 'name' in v ? v.name : String(v),
      )
    : parseArray(toArrayText(dietary.dietaryRestrictions ?? m.allergies ?? []))
  const specialDietArr = Array.isArray(dietary.specialDiet)
    ? (dietary.specialDiet ?? []).map((v) =>
        typeof v === 'object' && v && 'name' in v ? v.name : String(v),
      )
    : parseArray(dietary.specialDiet ?? '')
  let sweetCravingListArr = Array.isArray(dietary.sweetCravingList)
    ? (dietary.sweetCravingList ?? []).map((v) =>
        typeof v === 'object' && v && 'name' in v ? v.name : String(v),
      )
    : parseArray(dietary.sweetCravingList ?? '')
  sweetCravingListArr = sweetCravingListArr.flatMap((s) => {
    if (s == null || String(s).trim() === '') return []
    const str = String(s).trim()
    return str.includes(',') ? parseArray(str) : [str]
  })
  form.dietaryProfile = {
    dietaryRestrictions: dietaryRestrictionsArr,
    dietaryRestrictionsText: toArrayText(dietary.dietaryRestrictions ?? m.allergies),
    specialDiet: specialDietArr,
    sweetCravingTime: dietary.sweetCravingTime ?? '',
    sweetCravingList: sweetCravingListArr,
  }
  const knownArr = Array.isArray(m.knownMedicalConditions)
    ? m.knownMedicalConditions.map((v) =>
        typeof v === 'object' && v && 'name' in v ? v.name : String(v),
      )
    : parseArray(toArrayText(m.knownMedicalConditions || []))
  const healthIssuesArr = Array.isArray(m.currentHealthIssues)
    ? m.currentHealthIssues.map((v) =>
        typeof v === 'object' && v && 'name' in v ? v.name : String(v),
      )
    : parseArray(toArrayText(m.currentHealthIssues || []))
  const gutIssuesArr = Array.isArray(m.gutHealthIssues)
    ? m.gutHealthIssues.map((v) => (typeof v === 'object' && v && 'name' in v ? v.name : String(v)))
    : parseArray(toArrayText(m.gutHealthIssues || []))
  form.medicalProfile = {
    knownMedicalConditions: knownArr,
    knownMedicalConditionsText: toArrayText(m.knownMedicalConditions),
    currentHealthIssues: healthIssuesArr,
    currentHealthIssuesText: toArrayText(m.currentHealthIssues),
    currentMedicationsText: toArrayText(m.currentMedications),
    familyMedicalHistoryText: toArrayText(m.familyMedicalHistory),
    gutHealthIssues: gutIssuesArr,
    gutHealthIssuesText: toArrayText(m.gutHealthIssues),
    periodRegularity: m.periodRegularity ?? '',
  }
  const rawHydration =
    dietary.waterIntakeLitersPerDay ?? l.waterIntakeLitersPerDay ?? l.hydration ?? ''
  const hydrationOption = litersToHydrationOption(rawHydration, HYDRATION_OPTIONS)
  const rawBedTime =
    typeof l.bedTime === 'number'
      ? hoursToTimeStr(l.bedTime)
      : (l.bedTime ?? l.sleepPatterns?.bedTime ?? '')
  const rawWakeUpTime =
    typeof l.wakeUpTime === 'number'
      ? hoursToTimeStr(l.wakeUpTime)
      : (l.wakeUpTime ?? l.sleepPatterns?.wakeUpTime ?? '')

  form.lifestyleProfile = {
    activityFrequency: l.activityFrequency ?? '',
    activityType: l.activityType ?? '',
    waterIntakeLitersPerDay: hydrationOption,
    alcoholFrequency: l.alcoholFrequency ?? '',
    sleepPattern: l.sleepPattern ?? '',
    bedTime: formatTimeWithAMPM(rawBedTime, true),
    wakeUpTime: formatTimeWithAMPM(rawWakeUpTime, false),
    stressLevel: l.stressLevel ?? '',
    sweetCravings:
      dietary.sweetCraving === true ||
      dietary.sweetCraving === 'true' ||
      String(dietary.sweetCraving || '').toLowerCase() === 'yes'
        ? 'Yes'
        : dietary.sweetCraving === false ||
            dietary.sweetCraving === 'false' ||
            String(dietary.sweetCraving || '').toLowerCase() === 'no'
          ? 'No'
          : '',
    spicesOilCookingPreferences: toArrayText(dietary.cookingOilUsed),
    eatingOutFrequency: l.eatingOutFrequency ?? '',
  }
  form.goalsProfile = {
    primaryGoal: g.motivationForGoal || g.primaryGoal || '',
    motivationForGoal: g.motivationForGoal ?? '',
    targetWeightKg: g.targetWeightKg ?? '',
    targetCompletionInMonths: g.targetCompletionInMonths ?? '',
    additionalNotes: g.additionalNotes ?? '',
  }
  const nextCustom = { ...customOptions.value }
  for (const [category, { getValues, base: baseOpts }] of Object.entries(ENUM_CATEGORIES)) {
    const values = getValues(form) || []
    const list = nextCustom[category] || []
    const next = [...list]
    for (const val of values) {
      const s = val != null ? String(val).trim() : ''
      if (s && !baseOpts.includes(s) && !next.includes(s)) next.push(s)
    }
    nextCustom[category] = next
  }
  customOptions.value = nextCustom
  ensureEnumOptions(form).catch(() => {})
}

watch(
  () => props.clientData,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      populateForm()
    }
  },
  { immediate: true, deep: true },
)

/* eslint-disable-next-line complexity */
function buildPayload() {
  const profile = { ...form.profile }
  const ageNum = profile.age != null && profile.age !== '' ? Number(profile.age) : NaN
  if (!Number.isNaN(ageNum) && ageNum >= 0) {
    const birthYear = new Date().getFullYear() - Math.floor(ageNum)
    profile.dob = `${birthYear}-01-01`
  }
  delete profile.age
  profile.address = [
    profile.addressLine1,
    profile.addressLine2,
    profile.cityTown,
    profile.stateRegion,
    profile.zipPostcode,
    profile.country,
  ]
    .filter((s) => s != null && String(s).trim() !== '')
    .join('\n')
  delete profile.addressLine1
  delete profile.addressLine2
  delete profile.cityTown
  delete profile.stateRegion
  delete profile.zipPostcode
  delete profile.country
  const updatedFields = {
    profile,
    nutritionistName: form.nutritionistName,
    bodyStatus: {
      height: form.bodyStatus.height !== '' ? Number(form.bodyStatus.height) : null,
      weight: form.bodyStatus.weight !== '' ? Number(form.bodyStatus.weight) : null,
    },
    bodyMeasurements: {
      fatpercent:
        form.bodyMeasurements.fatpercent !== '' ? Number(form.bodyMeasurements.fatpercent) : null,
      waterPercent:
        form.bodyMeasurements.waterPercent !== ''
          ? Number(form.bodyMeasurements.waterPercent)
          : null,
      musclepercent:
        form.bodyMeasurements.musclepercent !== ''
          ? Number(form.bodyMeasurements.musclepercent)
          : null,
      Chest: form.bodyMeasurements.Chest !== '' ? Number(form.bodyMeasurements.Chest) : null,
      abs: form.bodyMeasurements.abs !== '' ? Number(form.bodyMeasurements.abs) : null,
      Hips: form.bodyMeasurements.Hips !== '' ? Number(form.bodyMeasurements.Hips) : null,
      arms: form.bodyMeasurements.arms !== '' ? Number(form.bodyMeasurements.arms) : null,
      thighs: form.bodyMeasurements.thighs !== '' ? Number(form.bodyMeasurements.thighs) : null,
      neck: form.bodyMeasurements.neck !== '' ? Number(form.bodyMeasurements.neck) : null,
      visceralfatPercentage:
        form.bodyMeasurements.visceralfatPercentage !== ''
          ? Number(form.bodyMeasurements.visceralfatPercentage)
          : null,
    },
    dietaryProfile: (() => {
      const { waterIntakeLitersPerDay: _drop, ...restDietary } =
        props.clientData?.dietaryProfile || {}
      return {
        ...restDietary,
        dietaryRestrictions: Array.isArray(form.dietaryProfile.dietaryRestrictions)
          ? form.dietaryProfile.dietaryRestrictions
          : parseArray(form.dietaryProfile.dietaryRestrictionsText),
        sweetCraving:
          form.lifestyleProfile.sweetCravings !== '' &&
          (form.lifestyleProfile.sweetCravings === 'Yes' ||
            String(form.lifestyleProfile.sweetCravings).toLowerCase() === 'yes'),
        sweetCravingTime: form.dietaryProfile.sweetCravingTime || '',
        sweetCravingList: Array.isArray(form.dietaryProfile.sweetCravingList)
          ? form.dietaryProfile.sweetCravingList
          : parseArray(form.dietaryProfile.sweetCravingList),
        cookingOilUsed: parseArray(form.lifestyleProfile.spicesOilCookingPreferences),
        specialDiet: Array.isArray(form.dietaryProfile.specialDiet)
          ? form.dietaryProfile.specialDiet
          : parseArray(form.dietaryProfile.specialDiet),
      }
    })(),
    medicalProfile: {
      knownMedicalConditions: Array.isArray(form.medicalProfile.knownMedicalConditions)
        ? form.medicalProfile.knownMedicalConditions
        : parseArray(form.medicalProfile.knownMedicalConditionsText),
      currentHealthIssues: Array.isArray(form.medicalProfile.currentHealthIssues)
        ? form.medicalProfile.currentHealthIssues
        : parseArray(form.medicalProfile.currentHealthIssuesText),
      currentMedications: parseArray(form.medicalProfile.currentMedicationsText),
      familyMedicalHistory: parseArray(form.medicalProfile.familyMedicalHistoryText),
      medicalReport: props.clientData?.medicalProfile?.medicalReport ?? '',
      gutHealthIssues: Array.isArray(form.medicalProfile.gutHealthIssues)
        ? form.medicalProfile.gutHealthIssues
        : parseArray(form.medicalProfile.gutHealthIssuesText),
      periodRegularity: form.medicalProfile.periodRegularity || '',
    },
    lifestyleProfile: {
      activityFrequency: form.lifestyleProfile.activityFrequency || '',
      activityType: form.lifestyleProfile.activityType || '',
      alcoholFrequency: form.lifestyleProfile.alcoholFrequency || '',
      sleepPattern: form.lifestyleProfile.sleepPattern || '',
      bedTime: form.lifestyleProfile.bedTime || '',
      wakeUpTime: form.lifestyleProfile.wakeUpTime || '',
      waterIntakeLitersPerDay: hydrationOptionToLiters(
        form.lifestyleProfile.waterIntakeLitersPerDay,
      ),
      stressLevel:
        form.lifestyleProfile.stressLevel !== '' && form.lifestyleProfile.stressLevel != null
          ? Number(form.lifestyleProfile.stressLevel)
          : '',
      eatingOutFrequency: form.lifestyleProfile.eatingOutFrequency || '',
    },
    goalsProfile: {
      primaryGoal: (form.goalsProfile.primaryGoal || '').split(',')[0].trim() || '',
      motivationForGoal: form.goalsProfile.primaryGoal || '',
      goals: props.clientData?.goalsProfile?.goals || [],
      targetWeightKg:
        form.goalsProfile.targetWeightKg !== '' ? Number(form.goalsProfile.targetWeightKg) : null,
      targetCompletionInMonths:
        form.goalsProfile.targetCompletionInMonths !== ''
          ? Number(form.goalsProfile.targetCompletionInMonths)
          : null,
      additionalNotes: form.goalsProfile.additionalNotes || '',
    },
  }
  return { ...props.clientData, ...updatedFields }
}

function close() {
  emit('update:modelValue', false)
}

async function onSave() {
  if (validateMobile(form.profile.phone) !== true) return
  try {
    await ensureEnumOptions(form)
    const payload = buildPayload()
    const updatedClient = await clientStore.addAndUpdateClient(payload)
    emit('save', updatedClient)
    close()
  } catch {
    // Snackbar shows via axios interceptor
  }
}
</script>

<style scoped>
.client-profile-dialog :deep(.v-overlay__content) {
  max-height: 90vh;
}

.profile-dialog-card {
  background: #fff !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.client-profile-dialog :deep(.profile-field .v-field) {
  background: rgba(0, 0, 0, 0.04) !important;
  border: none !important;
  border-radius: 8px;
  box-shadow: none !important;
}

.client-profile-dialog :deep(.profile-field .v-field:hover) {
  background: rgba(0, 0, 0, 0.06) !important;
}

.client-profile-dialog :deep(.profile-field .v-field.v-field--focused),
.client-profile-dialog :deep(.profile-field .v-field.v-field--active) {
  background: rgba(0, 0, 0, 0.05) !important;
  box-shadow: none !important;
  border: none !important;
}

.client-profile-dialog :deep(.profile-field .v-field .v-label) {
  font-weight: 700;
  color: #272727;
}

.client-profile-dialog :deep(.profile-field .v-field__input) {
  color: #272727;
  text-align: left;
}

.client-profile-dialog :deep(.profile-field.profile-field-multiline .v-field__input) {
  min-height: 2.5em;
  align-items: flex-start;
}

/* Stress level: same look as other profile fields (.v-field) */
.client-profile-dialog :deep(.stress-level-container.profile-field) {
  background: #fff !important;
  border: none !important;
  border-radius: 8px;
  box-shadow: none !important;
  padding: 10px 14px 6px;
}

.client-profile-dialog :deep(.stress-level-container.profile-field:hover) {
  background: #fff !important;
}

.client-profile-dialog :deep(.stress-level-container.profile-field .v-label) {
  font-weight: 700;
  color: #272727;
}

.edit-btn {
  border-color: #ffd4cc !important;
  color: #c45a4a !important;
}

.save-btn {
  background-color: #81c784 !important;
  color: #fff !important;
}

.text-grey-darken-3 {
  color: #272727;
}

.additional-notes-container {
  background: transparent;
  border-radius: 8px;
}

.client-profile-dialog :deep(.additional-notes-field .v-field) {
  background: #fce4ec !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 8px;
}

.client-profile-dialog :deep(.additional-notes-field .v-field__input) {
  color: #5a5a5a !important;
  font-size: 14px;
  line-height: 1.5;
  background: #fce4ec !important;
}

.client-profile-dialog :deep(.additional-notes-field .v-field:hover),
.client-profile-dialog :deep(.additional-notes-field .v-field.v-field--focused),
.client-profile-dialog :deep(.additional-notes-field .v-field.v-field--active) {
  background: #fce4ec !important;
}

.address-fields .address-label {
  font-size: 14px;
  color: #272727;
}

.address-fields .address-label-col-indent {
  padding-left: 24px !important;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
