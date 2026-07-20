<template>
  <!-- CBC-style report (four-column table + compact header) -->
  <div v-if="isCbcLayout" class="lab-report lab-report--cbc">
    <div class="lab-report__card rounded-lg pa-6">
      <div class="lab-report__meta lab-report__meta--two-col">
        <div class="meta-col">
          <div v-for="(row, i) in cbcLeftMeta" :key="'l' + i" class="meta-line">
            <span class="meta-line__label">{{ row.label }}</span>
            <span class="meta-line__value" :class="{ 'meta-line__value--bold': row.boldValue }">{{
              row.value
            }}</span>
          </div>
        </div>
        <div class="meta-col">
          <div v-for="(row, i) in cbcRightMeta" :key="'r' + i" class="meta-line">
            <span class="meta-line__label">{{ row.label }}</span>
            <span class="meta-line__value">{{ row.value }}</span>
          </div>
        </div>
      </div>

      <h2 class="lab-report__title-cbc">
        {{ cbcTitle }}
      </h2>

      <div class="cbc-table-wrap">
        <div class="cbc-table-head">
          <span>Test Name</span>
          <span class="text-center">Result</span>
          <span>Normal Range</span>
          <span>Units</span>
        </div>
        <div
          v-for="(row, ri) in cbcRows"
          :key="'t' + ri"
          class="cbc-table-row text-body-2"
          :class="{ 'cbc-table-row--abnormal': row.isAbnormal }"
        >
          <span class="cbc-test">{{ row.test }}</span>
          <span class="cbc-result text-center">{{ row.result }}</span>
          <span class="cbc-range text-medium-emphasis">{{ row.normalRange }}</span>
          <span class="cbc-units text-medium-emphasis">{{ row.units }}</span>
        </div>
      </div>

      <p
        v-if="report.digitalSignature"
        class="lab-report__signed text-caption text-medium-emphasis text-end mt-6 mb-0"
      >
        {{ report.digitalSignature }}
      </p>
      <p v-if="report.footerNote" class="text-caption text-medium-emphasis mt-4 mb-0">
        {{ report.footerNote }}
      </p>
    </div>
  </div>

  <!-- Legacy 3-column sections layout -->
  <div v-else class="lab-report lab-report--legacy">
    <header
      v-if="report.labHeader"
      class="lab-report__banner text-caption text-white px-4 py-2 rounded-t"
    >
      <div class="d-flex flex-wrap justify-space-between gap-2">
        <span>{{ report.labHeader.tagline || '' }}</span>
        <span>
          <template v-if="report.labHeader.phone">Phone: {{ report.labHeader.phone }}</template>
          <template v-if="report.labHeader.mobile">
            &nbsp;· Mobile: {{ report.labHeader.mobile }}
          </template>
        </span>
      </div>
    </header>

    <div class="lab-report__meta pa-4">
      <v-row dense>
        <v-col cols="12" md="6">
          <div v-for="(row, i) in legacyLeftMeta" :key="'l' + i" class="meta-row text-body-2">
            <span class="meta-label">{{ row.label }}</span>
            <span class="meta-value">{{ row.value }}</span>
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div v-for="(row, i) in legacyRightMeta" :key="'r' + i" class="meta-row text-body-2">
            <span class="meta-label">{{ row.label }}</span>
            <span class="meta-value">{{ row.value }}</span>
          </div>
        </v-col>
      </v-row>
    </div>

    <h2 class="text-h6 text-center font-weight-bold mb-4 px-4">
      {{ report.reportTitle || 'Lab report' }}
    </h2>

    <div class="lab-report__table px-4 pb-2">
      <div class="lab-grid text-caption font-weight-medium text-medium-emphasis mb-1">
        <span>TEST</span>
        <span class="text-center">RESULT</span>
        <span>REFERENCE RANGE</span>
      </div>
      <template v-for="(section, si) in report.sections || []" :key="'s' + si">
        <div v-if="section.title" class="section-title text-body-2 font-weight-bold mt-3 mb-1">
          {{ section.title }}
        </div>
        <div
          v-for="(row, ri) in section.rows || []"
          :key="'r' + si + '-' + ri"
          class="lab-grid lab-row text-body-2 py-1"
        >
          <span>{{ row.test }}</span>
          <span class="text-center" :class="{ 'font-weight-bold': row.isAbnormal }">
            {{ row.result }}{{ row.unit ? ` ${row.unit}` : '' }}
          </span>
          <span class="text-medium-emphasis">{{ row.referenceRange }}</span>
        </div>
      </template>
    </div>

    <p v-if="report.footerNote" class="text-caption text-medium-emphasis px-4 pt-2">
      {{ report.footerNote }}
    </p>
    <p v-if="report.endText" class="text-center text-caption text-medium-emphasis py-4">
      {{ report.endText }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  report: {
    type: Object,
    required: true,
  },
})

/** CBC layout when explicit tests[] or variant flag */
const isCbcLayout = computed(() => {
  const r = props.report
  if (r.tableFormat === 'cbc' || r.variant === 'cbc') {
    return true
  }
  return Array.isArray(r.tests) && r.tests.length > 0
})

const pi = computed(() => props.report.patientInfo || {})

const cbcTitle = computed(() => {
  return props.report.reportTitle || 'COMPLETE BLOOD COUNT'
})

const cbcLeftMeta = computed(() => {
  const p = pi.value
  return [
    {
      label: 'Name:',
      value: p.patientName ?? p.name ?? '—',
      boldValue: true,
    },
    { label: 'Date:', value: p.date ?? '—', boldValue: false },
    {
      label: 'Doctor:',
      value: p.doctor ?? p.refBy ?? '—',
      boldValue: false,
    },
  ]
})

const cbcRightMeta = computed(() => {
  const p = pi.value
  return [
    { label: 'Patient ID:', value: p.patientId ?? p.labNo ?? '—' },
    { label: 'Age:', value: p.age ?? '—' },
    { label: 'Sex:', value: p.sex ?? '—' },
    { label: 'Test id:', value: p.testId ?? '—' },
  ]
})

const cbcRows = computed(() => {
  const tests = props.report.tests || []
  return tests.map((row) => ({
    test: row.test ?? row.testName ?? '—',
    result: row.result ?? row.value ?? '—',
    normalRange: row.normalRange ?? row.referenceRange ?? '—',
    units: row.units ?? row.unit ?? '—',
    isAbnormal: Boolean(row.isAbnormal),
  }))
})

const legacyLeftMeta = computed(() => {
  const p = pi.value
  return [
    { label: 'LAB NO.', value: p.labNo ?? '—' },
    { label: 'PATIENT NAME', value: p.patientName ?? '—' },
    { label: 'REF. BY DR.', value: p.refBy ?? '—' },
    { label: 'SAMPLE COLL. AT', value: p.sampleAt ?? '—' },
  ]
})

const legacyRightMeta = computed(() => {
  const p = pi.value
  return [
    { label: 'DATE', value: p.date ?? '—' },
    { label: 'SEX', value: p.sex ?? '—' },
    { label: 'AGE', value: p.age ?? '—' },
  ]
})
</script>

<style scoped>
.lab-report {
  background: #fff;
  color: #1a1a1a;
  max-width: 640px;
  margin: 0 auto;
}

.lab-report--cbc .lab-report__card {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.lab-report__meta--two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 32px;
  margin-bottom: 20px;
}

@media (max-width: 600px) {
  .lab-report__meta--two-col {
    grid-template-columns: 1fr;
  }
}

.meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-bottom: 10px;
  font-size: 0.875rem;
  line-height: 1.4;
}

.meta-line__label {
  color: #616161;
  min-width: 72px;
}

.meta-line__value {
  color: #212121;
  font-weight: 500;
}

.meta-line__value--bold {
  font-weight: 700;
}

.lab-report__title-cbc {
  text-align: center;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #00897b;
  margin: 8px 0 20px;
  text-transform: uppercase;
}

.cbc-table-wrap {
  width: 100%;
}

.cbc-table-head {
  display: grid;
  grid-template-columns: 1.4fr 0.85fr 1.3fr 1fr;
  gap: 8px;
  padding: 10px 0 8px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #424242;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.cbc-table-row {
  display: grid;
  grid-template-columns: 1.4fr 0.85fr 1.3fr 1fr;
  gap: 8px;
  padding: 10px 0;
  align-items: start;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.cbc-table-row--abnormal .cbc-test,
.cbc-table-row--abnormal .cbc-result {
  color: #d84315;
  font-weight: 700;
}

.cbc-test {
  word-break: break-word;
}

.lab-report__signed {
  color: #757575;
}

/* Legacy */
.lab-report__banner {
  background: #8b1538;
}

.meta-row {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.meta-label {
  min-width: 140px;
  font-weight: 600;
  color: #424242;
}

.meta-value {
  flex: 1;
}

.lab-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: 8px;
  align-items: start;
}

.lab-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.section-title {
  color: #212121;
}
</style>
