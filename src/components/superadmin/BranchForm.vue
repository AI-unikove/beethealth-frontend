<template>
  <div class="dialog-subtitle">
    Add a new branch to your dashboard and manage locations, teams, and clients all in one place.
  </div>
  <v-form class="dialog-form" @submit.prevent="submitBranch">
    <div class="form-field-block">
      <label class="field-label">Choose Clinic</label>
      <v-select
        v-model="branchForm.clinic"
        placeholder="Select"
        :items="clinicOptions"
        variant="outlined"
        hide-details
        class="soft-input"
      />
    </div>

    <div class="form-field-block">
      <label class="field-label">Branch Name</label>
      <v-text-field
        v-model="branchForm.branchName"
        placeholder="Name"
        variant="outlined"
        hide-details
        class="soft-input"
      />
    </div>

    <div class="form-field-block">
      <label class="field-label">Address</label>
      <v-text-field
        v-model="branchForm.address"
        placeholder="Address"
        variant="outlined"
        hide-details
        class="soft-input"
      />
    </div>

    <div class="form-field-block">
      <label class="field-label">Phone Number</label>
      <div class="phone-input-row">
        <div class="phone-code">+91</div>
        <v-text-field
          v-model="branchForm.phone"
          placeholder="Mobile number"
          variant="outlined"
          hide-details
          class="soft-input phone-input"
        />
      </div>
    </div>

    <div class="form-field-block">
      <label class="field-label">Email</label>
      <v-text-field
        v-model="branchForm.email"
        placeholder="hustonhealth@gmail.com"
        variant="outlined"
        hide-details
        class="soft-input"
      />
    </div>

    <v-btn type="submit" class="dialog-submit-btn" rounded="pill" variant="flat"
      >Create Branch</v-btn
    >
  </v-form>
</template>
<script setup></script>
<style>
.dialog-submit-btn {
  margin-top: 6px;
  min-height: 44px;
  border-radius: 999px;
  background: #f7dff1;
  color: #b13c92;
  text-transform: none;
  font-weight: 600;
  box-shadow: none;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-field-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-label {
  font-size: 14px;
  font-weight: 500;
}
.soft-input :deep(.v-field) {
  border-radius: 18px;
  background: #f8f8fb;
  box-shadow: none;
}

.soft-input :deep(.v-field__outline) {
  display: none;
}

.phone-input {
  flex: 1;
}
.dialog-subtitle {
  color: #8a919d;
  font-size: 13px;
  margin-bottom: 14px;
}
</style>
