import api from '@/services/api.service'

const DEFAULT_FOLDER = 'Diagnostics'

const DEFAULT_FOLDERS = [
  'Diagnostics',
  'Health Summaries',
  'Insurance',
  'Lab Reports',
  'Prescriptions',
  'Vaccination Records',
  'Other',
]

function normalizeFolderStat(raw) {
  if (!raw || typeof raw !== 'object') {
    return null
  }
  const name = (raw.name || raw.folderName || '').trim() || DEFAULT_FOLDER
  const count = Number(raw.count || 0)
  return {
    name,
    count: Number.isFinite(count) && count >= 0 ? count : 0,
  }
}

export function normalizeMedicalRecord(raw) {
  if (!raw || typeof raw !== 'object') {
    return null
  }
  return {
    id: raw._id || raw.id,
    clientId: raw.clientId,
    fileName: raw.fileName || raw.name || 'Document',
    folderName: (raw.folderName || DEFAULT_FOLDER).trim() || DEFAULT_FOLDER,
    fileUrl: raw.fileUrl || raw.url || '',
    thumbnailUrl: raw.thumbnailUrl || raw.previewUrl || '',
    mimeType: raw.mimeType || raw.fileType || '',
    structuredReport: raw.structuredReport || null,
    createdAt: raw.createdAt,
    isLegacy: Boolean(raw.isLegacy),
  }
}

function unwrapList(payload) {
  if (Array.isArray(payload)) {
    return payload
  }
  const inner = payload?.data ?? payload?.records ?? payload?.items
  return Array.isArray(inner) ? inner : []
}

export async function fetchClientMedicalRecords(clientId) {
  const response = await api.get(`/clients/${clientId}/medical-records`)
  const list = unwrapList(response.data)
  return list.map(normalizeMedicalRecord).filter(Boolean)
}

export async function fetchClientMedicalRecordFolders(clientId) {
  const response = await api.get(`/clients/${clientId}/medical-records`)
  const stats = Array.isArray(response.data?.folderStats) ? response.data.folderStats : []
  const normalizedStats = stats.map(normalizeFolderStat).filter(Boolean)
  if (normalizedStats.length) {
    return normalizedStats
  }

  const fromApi = Array.isArray(response.data?.folders) ? response.data.folders : []
  const normalized = Array.from(
    new Set(fromApi.map((name) => (typeof name === 'string' ? name.trim() : '')).filter(Boolean)),
  )
  if (normalized.length) {
    return normalized.map((name) => ({ name, count: 0 }))
  }
  return DEFAULT_FOLDERS.map((name) => ({ name, count: 0 }))
}

export async function fetchClientMedicalRecordsByFolder(clientId, folderName) {
  const normalizedFolder = (folderName || '').trim()
  const params = normalizedFolder ? { folderName: normalizedFolder } : undefined
  const response = await api.get(`/clients/${clientId}/medical-records`, { params })
  const list = unwrapList(response.data)
  return list.map(normalizeMedicalRecord).filter(Boolean)
}

export async function uploadClientMedicalRecords(clientId, files, folderName = DEFAULT_FOLDER) {
  const formData = new FormData()
  formData.append('folderName', (folderName || DEFAULT_FOLDER).trim() || DEFAULT_FOLDER)
  for (const file of files) {
    formData.append('files', file)
  }
  const response = await api.post(`/clients/${clientId}/medical-records`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  const list = unwrapList(response.data)
  if (list.length) {
    return list.map(normalizeMedicalRecord).filter(Boolean)
  }
  return normalizeMedicalRecord(response.data) ? [normalizeMedicalRecord(response.data)] : []
}

export async function fetchMedicalRecordById(recordId) {
  const response = await api.get(`/medical-records/${recordId}`)
  const raw = response.data?.data ?? response.data
  return normalizeMedicalRecord(raw)
}
