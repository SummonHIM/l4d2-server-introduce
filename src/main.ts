import { createApp } from 'vue'

import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'

import '@fontsource/anton'
import App from './App.vue'
import './assets/style/index.css'
import { zhCNPrime } from './locale'
import router from './router'
import { srcdsEnv } from './srcds'

const app = createApp(App)

const zombiePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fdf2f3',
      100: '#fbe5e7',
      200: '#f8d0d5',
      300: '#f2aab4',
      400: '#e97a8a',
      500: '#dc5164',
      600: '#c8102e',
      700: '#a80e28',
      800: '#8b1024',
      900: '#741022',
      950: '#40050d',
    },
    colorScheme: {
      dark: {
        surface: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0d0d0d',
        },
        success: {
          50: '#f4f8e8',
          100: '#e6f0cd',
          200: '#cfe0a0',
          300: '#b0cd6d',
          400: '#94b845',
          500: '#7a9c2f',
          600: '#5f7d24',
          700: '#4a611e',
          800: '#3d4f1c',
          900: '#34431c',
          950: '#19240a',
        },
      },
    },
  },
})

app.use(PrimeVue, {
  theme: {
    preset: zombiePreset,
    options: { darkModeSelector: '.dark' },
  },
  locale: zhCNPrime,
})
app.use(ToastService)
app.use(router)

document.documentElement.classList.add('dark')

document.title = `由 ${srcdsEnv.provider} 提供的 ${srcdsEnv.name} 服务器`

app.mount('#app')
