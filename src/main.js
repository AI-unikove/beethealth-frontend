import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router/index.js'
import vuetify from './plugins/vuetify'
import { useAuthStore } from '@/stores/auth.store'
import { configureAxios } from './plugins/axios'
import './assets/main.css'
import './assets/styles/common.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

configureAxios()
const authStore = useAuthStore(pinia)
await authStore.hydrate()

app.mount('#app')
