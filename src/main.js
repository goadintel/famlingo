import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { useFamilyStore } from './stores/family'
import { usePhrasesStore } from './stores/phrases'
import { useAuth } from './composables/useAuth'

console.log('🚀 FamLingo (家语) v0.1.0 - Family Language Learning')
console.log('📚 Bilingual UI as Pedagogy - Every element teaches!')
console.log('👨‍👩‍👧‍👦 Multi-user family system - Up to 10 users')
console.log('🇨🇳 CN ⟷ EN Bidirectional learning')

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Initialize app - load family from localStorage for immediate display
async function initializeApp() {
  const familyStore = useFamilyStore()
  const phrasesStore = usePhrasesStore()
  const auth = useAuth()

  // Load family from localStorage first for immediate display
  familyStore.loadFamilyFromStorage()
  console.log('💾 Family loaded from localStorage')

  // If logged in, try to sync with backend
  if (auth.isLoggedIn.value) {
    console.log('🔐 User logged in, checking backend...')
    try {
      const userData = await auth.getCurrentUser()
      if (userData?.family) {
        // Update local store with backend data
        familyStore.family = userData.family
        familyStore.saveFamilyToStorage()

        // Set current user if we have one stored
        if (!familyStore.currentUserId && userData.family.users?.length > 0) {
          familyStore.switchUser(userData.family.users[0].id)
        }

        console.log('✅ Family synced from backend')
      }
    } catch (err) {
      console.warn('⚠️ Could not sync with backend:', err.message)
    }
  }

  // Initialize phrases store with current member
  if (familyStore.currentUserId) {
    await phrasesStore.initialize(familyStore.currentUserId)
  }

  console.log('👥 Family initialized:', familyStore.isFamilyInitialized)
}

// Start initialization (non-blocking)
initializeApp().catch(err => {
  console.warn('⚠️ App initialization warning:', err.message)
})

app.use(router)
app.mount('#app')
