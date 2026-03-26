
import { createApp } from 'vue'
import { Quasar } from 'quasar'
import App from './App.vue'
import './assets/app.css'

createApp(App)
  .use(Quasar, {})
  .mount('#q-app')
