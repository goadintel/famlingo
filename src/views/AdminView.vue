<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Admin Login -->
    <div v-if="!adminStore.isAdminAuthenticated" class="flex items-center justify-center min-h-screen">
      <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 class="text-2xl font-bold mb-6 text-center">🔐 Admin Login</h1>
        <form @submit.prevent="handleLogin">
          <input
            v-model="password"
            type="password"
            placeholder="Admin Password"
            class="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autofocus
          />
          <button
            type="submit"
            class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>
          <p v-if="loginError" class="text-red-500 text-sm mt-2">Invalid password</p>
        </form>
      </div>
    </div>

    <!-- Admin Dashboard -->
    <div v-else class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">FamLingo Admin Dashboard</h1>
          <p class="text-gray-600">Manage users, subscriptions, and analytics</p>
        </div>
        <button
          @click="adminStore.adminLogout"
          class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-gray-500 text-sm mb-1">Total Families</div>
          <div class="text-3xl font-bold text-blue-600">{{ adminStore.analytics.totalFamilies }}</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-gray-500 text-sm mb-1">Total Pronunciations</div>
          <div class="text-3xl font-bold text-green-600">{{ adminStore.analytics.totalPronunciations }}</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-gray-500 text-sm mb-1">Monthly Revenue</div>
          <div class="text-3xl font-bold text-purple-600">${{ adminStore.revenueMetrics.monthly }}</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-gray-500 text-sm mb-1">Yearly Projection</div>
          <div class="text-3xl font-bold text-indigo-600">${{ adminStore.revenueMetrics.yearly }}</div>
        </div>
      </div>

      <!-- Subscription Breakdown -->
      <div class="bg-white p-6 rounded-lg shadow mb-8">
        <h2 class="text-xl font-bold mb-4">Subscription Breakdown</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="border-l-4 border-gray-400 pl-4">
            <div class="text-gray-500 text-sm">Free Tier</div>
            <div class="text-2xl font-bold">{{ adminStore.analytics.activeSubscriptions.free }}</div>
            <div class="text-sm text-gray-600">$0/month each</div>
          </div>
          <div class="border-l-4 border-blue-500 pl-4">
            <div class="text-gray-500 text-sm">Premium Tier</div>
            <div class="text-2xl font-bold text-blue-600">{{ adminStore.analytics.activeSubscriptions.premium }}</div>
            <div class="text-sm text-gray-600">$2.99/month each</div>
          </div>
          <div class="border-l-4 border-purple-500 pl-4">
            <div class="text-gray-500 text-sm">Family Plan</div>
            <div class="text-2xl font-bold text-purple-600">{{ adminStore.analytics.activeSubscriptions.family }}</div>
            <div class="text-sm text-gray-600">$7.49/month each</div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="mb-6">
        <div class="flex space-x-4 border-b">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            :class="[
              'px-4 py-2 font-medium transition',
              currentTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div v-if="currentTab === 'subscriptions'">
        <SubscriptionsTab />
      </div>

      <div v-if="currentTab === 'usage'">
        <UsageTab />
      </div>

      <div v-if="currentTab === 'families'">
        <FamiliesTab />
      </div>

      <div v-if="currentTab === 'settings'">
        <SettingsTab />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '../stores/admin'
import SubscriptionsTab from '../components/admin/SubscriptionsTab.vue'
import UsageTab from '../components/admin/UsageTab.vue'
import FamiliesTab from '../components/admin/FamiliesTab.vue'
import SettingsTab from '../components/admin/SettingsTab.vue'

const adminStore = useAdminStore()

const password = ref('')
const loginError = ref(false)
const currentTab = ref('subscriptions')

const tabs = [
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'usage', label: 'Usage Analytics' },
  { id: 'families', label: 'Families' },
  { id: 'settings', label: 'Settings' }
]

const handleLogin = () => {
  const success = adminStore.adminLogin(password.value)
  if (success) {
    loginError.value = false
    password.value = ''
  } else {
    loginError.value = true
  }
}

onMounted(() => {
  adminStore.restoreAdminSession()
  adminStore.loadFromStorage()
})
</script>
