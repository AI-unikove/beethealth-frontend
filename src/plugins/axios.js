import axios from 'axios'
import { getActivePinia } from 'pinia'
import { useSnackbarStore } from '@/stores/snackbar.store'

export function configureAxios() {
  axios.interceptors.response.use(
    (res) => res,
    (err) => {
      const pinia = getActivePinia()
      if (pinia) {
        try {
          const snackbarStore = useSnackbarStore(pinia)
          const msg =
            err.response?.data?.error ??
            err.response?.data?.message ??
            err.message ??
            'Something went wrong.'
          snackbarStore.showError(msg)
        } catch {
          // store not ready, skip snackbar
        }
      }
      return Promise.reject(err)
    },
  )
}
