import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:4000/api',
})

export const createTemplate = (data) => API.post('/templates', data)

export const getTemplates = () => API.get('/templates')

export const deleteTemplate = (id) => API.delete(`/templates/${id}`)
