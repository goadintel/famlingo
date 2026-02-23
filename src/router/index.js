import { createRouter, createWebHistory } from 'vue-router'
import { useFamilyStore } from '../stores/family'
import { useAuth } from '../composables/useAuth'

// Views
import LoginView from '../views/LoginView.vue'
import SetupView from '../views/SetupView.vue'
import DashboardView from '../views/DashboardView.vue'
import PracticeView from '../views/PracticeView.vue'
import BrowseView from '../views/BrowseView.vue'
import SettingsView from '../views/SettingsView.vue'
import MyPhrasesView from '../views/MyPhrasesView.vue'
import ChatView from '../views/ChatView.vue'
import ListenView from '../views/ListenView.vue'
import CoursesView from '../views/CoursesView.vue'
import LessonView from '../views/LessonView.vue'
import LibraryView from '../views/LibraryView.vue'
import AdminView from '../views/AdminView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/setup',
    name: 'setup',
    component: SetupView,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, requiresFamily: true }
  },
  {
    path: '/practice',
    name: 'practice',
    component: PracticeView,
    meta: { requiresAuth: true, requiresFamily: true }
  },
  {
    path: '/browse',
    name: 'browse',
    component: BrowseView,
    meta: { requiresAuth: true, requiresFamily: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { requiresAuth: true, requiresFamily: true }
  },
  {
    path: '/my-phrases',
    name: 'my-phrases',
    component: MyPhrasesView,
    meta: { requiresAuth: true, requiresFamily: true }
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatView,
    meta: { requiresAuth: true, requiresFamily: true }
  },
  {
    path: '/listen',
    name: 'listen',
    component: ListenView,
    meta: { requiresAuth: true, requiresFamily: true }
  },
  {
    path: '/courses',
    name: 'courses',
    component: CoursesView,
    meta: { requiresAuth: true, requiresFamily: true }
  },
  {
    path: '/courses/:levelId/:lessonId',
    name: 'lesson',
    component: LessonView,
    meta: { requiresAuth: true, requiresFamily: true }
  },
  {
    path: '/library',
    name: 'library',
    component: LibraryView,
    meta: { requiresAuth: true, requiresFamily: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView
    // No requiresAuth - admin access is separate
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const auth = useAuth()
  const familyStore = useFamilyStore()

  // Check auth first
  if (to.meta.requiresAuth && !auth.isLoggedIn.value) {
    next('/login')
    return
  }

  // Then check family
  if (to.meta.requiresFamily && !familyStore.isFamilyInitialized) {
    next('/setup')
    return
  }

  next()
})

export default router
