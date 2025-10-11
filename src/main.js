import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')

console.log('🚀 FamLingo (家语) v0.1.0 - Family Language Learning')
console.log('📚 Bilingual UI as Pedagogy - Every element teaches!')
console.log('👨‍👩‍👧‍👦 Multi-user family system - Up to 10 users')
console.log('🇨🇳🇺🇸 Bidirectional learning - CN→EN and EN→CN')
