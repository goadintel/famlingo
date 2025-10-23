<template>
  <div class="space-y-6">
    <!-- Data Management -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold mb-6">Data Management</h2>

      <div class="space-y-4">
        <!-- Export Data -->
        <div class="p-4 border rounded-lg">
          <h3 class="font-bold mb-2">Export Admin Data</h3>
          <p class="text-sm text-gray-600 mb-3">
            Download all subscriptions and usage data as JSON backup
          </p>
          <button
            @click="exportData"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            📥 Export Data
          </button>
        </div>

        <!-- Import Data -->
        <div class="p-4 border rounded-lg">
          <h3 class="font-bold mb-2">Import Admin Data</h3>
          <p class="text-sm text-gray-600 mb-3">
            Restore admin data from a backup file
          </p>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            @change="importData"
            class="hidden"
          />
          <button
            @click="$refs.fileInput.click()"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            📤 Import Data
          </button>
        </div>

        <!-- Clear Data -->
        <div class="p-4 border border-red-200 rounded-lg bg-red-50">
          <h3 class="font-bold mb-2 text-red-800">Clear All Data</h3>
          <p class="text-sm text-red-600 mb-3">
            ⚠️ Warning: This will delete all subscriptions and usage data. This cannot be undone!
          </p>
          <button
            @click="clearAllData"
            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            🗑️ Clear All Data
          </button>
        </div>
      </div>
    </div>

    <!-- Tier Configuration -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold mb-6">Subscription Tiers</h2>

      <div class="space-y-4">
        <div
          v-for="(limits, tier) in TIER_LIMITS"
          :key="tier"
          class="p-4 border rounded-lg"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="font-bold text-lg capitalize">{{ tier }} Tier</h3>
              <div class="text-sm text-gray-600">
                ${{ limits.price || 0 }}/month
                <span v-if="limits.priceYuan"> (¥{{ limits.priceYuan }})</span>
              </div>
            </div>
            <div
              :class="[
                'px-3 py-1 rounded font-medium text-sm',
                tier === 'free' ? 'bg-gray-100 text-gray-800' : '',
                tier === 'premium' ? 'bg-blue-100 text-blue-800' : '',
                tier === 'family' ? 'bg-purple-100 text-purple-800' : ''
              ]"
            >
              {{ tier.toUpperCase() }}
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Pronunciations per month:</span>
              <span class="font-medium">
                {{ limits.pronunciationsPerMonth === Infinity ? 'Unlimited' : limits.pronunciationsPerMonth }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Max users:</span>
              <span class="font-medium">{{ limits.maxUsers }}</span>
            </div>
          </div>

          <div class="mt-3 pt-3 border-t">
            <div class="text-xs text-gray-600 mb-1">Features:</div>
            <ul class="text-xs text-gray-600 space-y-1">
              <li v-for="feature in limits.features" :key="feature">• {{ feature }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- System Stats -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold mb-6">System Statistics</h2>

      <div class="grid grid-cols-2 gap-4">
        <div class="p-4 bg-gray-50 rounded">
          <div class="text-sm text-gray-600">Total Subscriptions</div>
          <div class="text-2xl font-bold">{{ Object.keys(adminStore.subscriptions).length }}</div>
        </div>
        <div class="p-4 bg-gray-50 rounded">
          <div class="text-sm text-gray-600">Total Usage Records</div>
          <div class="text-2xl font-bold">{{ Object.keys(adminStore.usageData).length }}</div>
        </div>
        <div class="p-4 bg-gray-50 rounded">
          <div class="text-sm text-gray-600">Active Subscriptions</div>
          <div class="text-2xl font-bold text-green-600">{{ activeCount }}</div>
        </div>
        <div class="p-4 bg-gray-50 rounded">
          <div class="text-sm text-gray-600">Cancelled Subscriptions</div>
          <div class="text-2xl font-bold text-red-600">{{ cancelledCount }}</div>
        </div>
      </div>
    </div>

    <!-- Admin Password -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold mb-6">Security</h2>

      <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 class="font-bold mb-2 text-yellow-800">⚠️ Change Admin Password</h3>
        <p class="text-sm text-yellow-700 mb-4">
          For production, implement proper JWT authentication on the backend.
          Current password is stored in the admin store.
        </p>
        <div class="flex gap-2">
          <input
            v-model="newPassword"
            type="password"
            placeholder="New password"
            class="flex-1 px-3 py-2 border rounded"
          />
          <button
            @click="changePassword"
            class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAdminStore, TIER_LIMITS } from '../../stores/admin'

const adminStore = useAdminStore()

const newPassword = ref('')

const activeCount = computed(() => {
  return Object.values(adminStore.subscriptions).filter(s => s.status === 'active').length
})

const cancelledCount = computed(() => {
  return Object.values(adminStore.subscriptions).filter(s => s.status === 'cancelled').length
})

const exportData = () => {
  const data = adminStore.exportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `famlingo-admin-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  alert('Data exported successfully!')
}

const importData = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      adminStore.importData(data)
      alert('Data imported successfully!')
      event.target.value = ''
    } catch (error) {
      alert('Error importing data: ' + error.message)
    }
  }
  reader.readAsText(file)
}

const clearAllData = () => {
  const confirmation = prompt('Type "DELETE" to confirm clearing all data:')
  if (confirmation === 'DELETE') {
    localStorage.removeItem('famlingo_admin_subscriptions')
    localStorage.removeItem('famlingo_admin_usage')
    adminStore.subscriptions = {}
    adminStore.usageData = {}
    adminStore.updateAnalytics()
    alert('All data cleared!')
  }
}

const changePassword = () => {
  if (newPassword.value.length < 8) {
    alert('Password must be at least 8 characters')
    return
  }

  // In production, this should be handled by backend
  alert('⚠️ Password change is not implemented. Edit /src/stores/admin.js directly.')
  console.log('New password would be:', newPassword.value)
  newPassword.value = ''
}
</script>
