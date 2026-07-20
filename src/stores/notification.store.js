import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import { onMessage } from 'firebase/messaging'
// import { messaging } from '@/config/firebase'
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  sendClientNotification,
} from '@/services/notification.service'
import { useAuthStore } from '@/stores/auth.store'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  // const fcmListenerAttached = ref(false)

  const sortedNotifications = computed(() =>
    [...notifications.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  )

  async function loadNotifications() {
    const authStore = useAuthStore()
    if (!authStore.accessToken) return

    loading.value = true
    try {
      const data = await fetchNotifications(authStore.accessToken)
      notifications.value = data.notifications || []
      unreadCount.value = data.unreadCount || 0
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      loading.value = false
    }
  }

  async function readNotification(id) {
    const authStore = useAuthStore()
    if (!authStore.accessToken) return

    try {
      await markNotificationRead(authStore.accessToken, id)
      const found = notifications.value.find((n) => n._id === id)
      if (found && !found.isRead) {
        found.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  async function readAll() {
    const authStore = useAuthStore()
    if (!authStore.accessToken) return

    try {
      await markAllNotificationsRead(authStore.accessToken)
      notifications.value.forEach((n) => (n.isRead = true))
      unreadCount.value = 0
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  async function sendToClient(recipientId, title, body, type = 'general') {
    const authStore = useAuthStore()
    if (!authStore.accessToken) return
    return sendClientNotification(authStore.accessToken, { recipientId, title, body, type })
  }

  // function attachFcmListener() {
  //   if (fcmListenerAttached.value) return
  //   try {
  //     onMessage(messaging, (payload) => {
  //       const { title, body } = payload.notification || {}
  //       notifications.value.unshift({
  //         _id: String(Date.now()),
  //         title: title || '',
  //         body: body || '',
  //         isRead: false,
  //         createdAt: new Date().toISOString(),
  //         type: 'general',
  //         data: payload.data || {},
  //       })
  //       unreadCount.value += 1
  //     })
  //     fcmListenerAttached.value = true
  //   } catch (err) {
  //     console.error('FCM listener error:', err)
  //   }
  // }

  return {
    notifications,
    unreadCount,
    loading,
    sortedNotifications,
    loadNotifications,
    readNotification,
    readAll,
    sendToClient,
    // attachFcmListener,
  }
})
