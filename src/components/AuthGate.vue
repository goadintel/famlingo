<template>
  <div v-if="!isAuthenticated" class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <h1 class="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        FamLingo 家语
      </h1>
      <p class="text-center text-gray-600 mb-6">
        Family Language Learning
      </p>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Access Code / 访问码
          </label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter access code"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            autofocus
          />
        </div>

        <button
          type="submit"
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          Enter / 进入
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        This app is currently in private beta.<br>
        此应用目前处于私人测试阶段。
      </p>
    </div>
  </div>

  <slot v-else></slot>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isAuthenticated = ref(false)
const password = ref('')
const error = ref('')

// Simple password - you can change this
const ACCESS_CODE = 'famlingo2024'

onMounted(() => {
  // Check if already authenticated
  const auth = localStorage.getItem('famlingo_auth')
  if (auth === ACCESS_CODE) {
    isAuthenticated.value = true
  }
})

function handleLogin() {
  error.value = ''

  if (password.value === ACCESS_CODE) {
    localStorage.setItem('famlingo_auth', ACCESS_CODE)
    isAuthenticated.value = true
  } else {
    error.value = 'Incorrect access code / 访问码错误'
    password.value = ''
  }
}
</script>
