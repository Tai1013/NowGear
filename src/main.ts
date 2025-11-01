import { createApp } from 'vue'
import App from './App.vue'
import Router from './router'
import Pinia from './plugin/pinia'
import ElementPlus from './plugin/element-plus'

const app = createApp(App)
app.use(Pinia)
app.use(Router)
app.use(ElementPlus)
app.mount('#app')
