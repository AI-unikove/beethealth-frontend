import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

/**
 * Upload file through backend to GCS
 * @param {File} file - File object to upload
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axios.post(`${API_URL}/recipes/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  const { publicUrl } = response.data?.data || {}

  if (!publicUrl) {
    throw new Error('Backend did not return publicUrl')
  }

  return publicUrl
}
