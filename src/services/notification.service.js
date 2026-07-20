import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

export const fetchNotifications = async (accessToken, params = {}) => {
  const response = await axios.get(`${API_URL}/notifications`, {
    headers: authHeaders(accessToken),
    params,
  })
  return response.data
}

export const markNotificationRead = async (accessToken, notificationId) => {
  const response = await axios.patch(
    `${API_URL}/notifications/${notificationId}/read`,
    {},
    { headers: authHeaders(accessToken) },
  )
  return response.data
}

export const markAllNotificationsRead = async (accessToken) => {
  const response = await axios.patch(
    `${API_URL}/notifications/read-all`,
    {},
    { headers: authHeaders(accessToken) },
  )
  return response.data
}

export const sendClientNotification = async (accessToken, payload) => {
  const response = await axios.post(`${API_URL}/notifications/send`, payload, {
    headers: authHeaders(accessToken),
  })
  return response.data
}
