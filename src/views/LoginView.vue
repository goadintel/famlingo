<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">FamLingo</h1>
        <h2 class="text-2xl font-bold text-gray-700">家语</h2>
        <p class="text-gray-500 mt-2">Family Language Learning</p>
      </div>

      <!-- Tab Toggle -->
      <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          @click="mode = 'login'"
          :class="['flex-1 py-2 rounded-md font-medium transition-all',
                   mode === 'login' ? 'bg-white shadow text-purple-600' : 'text-gray-500']"
        >
          Login / 登录
        </button>
        <button
          @click="mode = 'register'"
          :class="['flex-1 py-2 rounded-md font-medium transition-all',
                   mode === 'register' ? 'bg-white shadow text-purple-600' : 'text-gray-500']"
        >
          Register / 注册
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email / 邮箱
          </label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="your@email.com"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Password / 密码
          </label>
          <input
            v-model="password"
            type="password"
            required
            :placeholder="mode === 'register' ? 'At least 6 characters' : 'Enter password'"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div v-if="mode === 'register'">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password / 确认密码
          </label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Confirm your password"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          />
        </div>

        <!-- Remember me -->
        <div class="flex items-center">
          <input
            v-model="rememberMe"
            type="checkbox"
            id="rememberMe"
            class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label for="rememberMe" class="ml-2 text-sm text-gray-600">
            Remember me / 记住我
          </label>
        </div>

        <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-300 transition-all"
        >
          {{ loading ? 'Please wait...' : (mode === 'login' ? 'Login / 登录' : 'Register / 注册') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useFamilyStore } from '../stores/family'

const router = useRouter()
const auth = useAuth()
const familyStore = useFamilyStore()

const REMEMBERED_EMAIL_KEY = 'famlingo_remembered_email'

const mode = ref('login')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const rememberMe = ref(true)
const loading = ref(false)
const error = ref(null)

// Check if already logged in, and pre-fill remembered email
onMounted(() => {
  // If already logged in with valid token, redirect to dashboard
  if (auth.isLoggedIn.value) {
    router.push('/dashboard')
    return
  }

  // Pre-fill remembered email
  const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY)
  if (rememberedEmail) {
    email.value = rememberedEmail
  }
})

async function handleSubmit() {
  error.value = null
  loading.value = true

  try {
    if (mode.value === 'register') {
      if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match / 密码不匹配'
        return
      }
      if (password.value.length < 6) {
        error.value = 'Password must be at least 6 characters / 密码至少6个字符'
        return
      }

      await auth.register(email.value, password.value)

      // Remember email if checked
      if (rememberMe.value) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email.value)
      }

      // New user - go to setup
      router.push('/setup')
    } else {
      const result = await auth.login(email.value, password.value)

      // Remember email if checked
      if (rememberMe.value) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email.value)
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      }

      if (result.family) {
        // Load family into store
        familyStore.family = result.family
        familyStore.saveFamilyToStorage()

        // Set current user if there are members
        if (result.family.users?.length > 0) {
          familyStore.switchUser(result.family.users[0].id)
        }

        router.push('/dashboard')
      } else {
        // No family yet - go to setup
        router.push('/setup')
      }
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
