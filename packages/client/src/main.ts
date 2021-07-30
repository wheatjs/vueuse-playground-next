import 'vue-global-api'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

import routes from 'virtual:generated-pages'
import App from './App.vue'

import 'virtual:windi.css'
import './styles/main.css'
import './styles/tooltip.css'
import './styles/splitpanes.css'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// router.isReady().then(async() => {
//   const { registerSW } = await import('virtual:pwa-register')
//   registerSW({ immediate: true })
// })

createApp(App)
  .use(router)
  .use(createPinia())
  .mount('#app')
