// Vuetify 3 Plugin Configuration
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Custom theme configuration
const beetHealthTheme = {
  dark: false,
  colors: {
    primary: '#7C3AED', // Purple
    secondary: '#E9D5FF', // Light purple
    accent: '#8B5CF6',
    error: '#EF4444',
    info: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    background: '#FFFFFF',
    surface: '#FFFFFF',
  },
}

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'beetHealthTheme',
    themes: {
      beetHealthTheme,
    },
  },
})
