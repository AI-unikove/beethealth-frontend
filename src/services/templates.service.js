import api from './api.service'

const API_BASE = '/templates'

export const templateService = {
  createTemplate(templateData) {
    return api.post(API_BASE, { ...templateData, isDraft: false })
  },

  getAllTemplates() {
    return api.get(API_BASE)
  },

  getTemplateById(id) {
    return api.get(`${API_BASE}/${id}`)
  },

  updateTemplate(id, templateData) {
    return api.put(`${API_BASE}/${id}`, templateData)
  },

  deleteTemplate(id) {
    return api.delete(`${API_BASE}/${id}`)
  },

  saveAsDraft(templateData) {
    return api.post(API_BASE, { ...templateData, isDraft: true })
  },

  assignClient(templateId, clientId) {
    return api.post(`${API_BASE}/${templateId}/assign`, { clientId })
  },
}

export default templateService
