import { createRouter, createWebHistory } from 'vue-router'
import { useFamilyStore } from '../stores/family'

// Views
import HomeView from '../views/HomeView.vue'
import SetupView from '../views/SetupView.vue'
import DashboardView from '../views/DashboardView.vue'
import PracticeView from '../views/PracticeView.vue'
import BrowseView from '../views/BrowseView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/setup',
    name: 'setup',
    component: SetupView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresFamily: true }
  },
  {
    path: '/practice',
    name: 'practice',
    component: PracticeView,
    meta: { requiresFamily: true }
  },
  {
    path: '/browse',
    name: 'browse',
    component: BrowseView,
    meta: { requiresFamily: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { requiresFamily: true }
  }
]

const router = createRouter({
  history: createWebHistory('/famlingo/'), // Match vite base path
  routes
})

// Navigation guard - redirect to setup if family not initialized
router.beforeEach((to, from, next) => {
  const familyStore = useFamilyStore()

  if (to.meta.requiresFamily && !familyStore.isFamilyInitialized) {
    next('/setup')
  } else {
    next()
  }
})

export default router
