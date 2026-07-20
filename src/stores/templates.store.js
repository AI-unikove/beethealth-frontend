import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import templateService from '@/services/templates.service'

export const useTemplatesStore = defineStore('templates', () => {
  // State
  const templates = ref([])
  const currentTemplate = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const templatesCount = computed(() => templates.value.length)
  const hasTemplates = computed(() => templates.value.length > 0)

  // Actions
  async function fetchAllTemplates() {
    loading.value = true
    error.value = null

    try {
      const response = await templateService.getAllTemplates()
      templates.value = response.data || response
      return templates.value
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch templates'
      console.error('Error fetching templates:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTemplateById(templateId) {
    loading.value = true
    error.value = null

    try {
      const response = await templateService.getTemplateById(templateId)
      currentTemplate.value = response.data || response
      return currentTemplate.value
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch template'
      console.error('Error fetching template:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createTemplate(templateData) {
    loading.value = true
    error.value = null

    try {
      const response = await templateService.createTemplate(templateData)
      const newTemplate = response.data || response
      templates.value.unshift(newTemplate)
      return newTemplate
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to create template'
      console.error('Error creating template:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function saveAsDraft(templateData) {
    loading.value = true
    error.value = null

    try {
      const response = await templateService.saveAsDraft(templateData)
      const draft = response.data || response
      templates.value.unshift(draft)
      return draft
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to save draft'
      console.error('Error saving draft:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTemplate(templateId) {
    loading.value = true
    error.value = null

    try {
      await templateService.deleteTemplate(templateId)
      templates.value = templates.value.filter((t) => (t._id || t.id) !== templateId)
      if (
        currentTemplate.value &&
        (currentTemplate.value._id || currentTemplate.value.id) === templateId
      ) {
        currentTemplate.value = null
      }
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to delete template'
      console.error('Error deleting template:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTemplate(templateId, templateData) {
    loading.value = true
    error.value = null

    try {
      const response = await templateService.updateTemplate(templateId, templateData)
      const updatedTemplate = response.data || response

      // Update in templates list
      const index = templates.value.findIndex((t) => (t._id || t.id) === templateId)
      if (index !== -1) {
        templates.value[index] = updatedTemplate
      }

      // Update current template
      if (
        currentTemplate.value &&
        (currentTemplate.value._id || currentTemplate.value.id) === templateId
      ) {
        currentTemplate.value = updatedTemplate
      }

      return updatedTemplate
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to update template'
      console.error('Error updating template:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function resetCurrentTemplate() {
    currentTemplate.value = null
  }

  return {
    // State
    templates,
    currentTemplate,
    loading,
    error,

    // Computed
    templatesCount,
    hasTemplates,

    // Actions
    fetchAllTemplates,
    fetchTemplateById,
    createTemplate,
    saveAsDraft,
    updateTemplate,
    deleteTemplate,
    clearError,
    resetCurrentTemplate,
  }
})
