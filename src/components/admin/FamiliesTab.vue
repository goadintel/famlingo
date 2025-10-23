<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-2xl font-bold mb-6">Family Management</h2>

    <!-- Search and Filter -->
    <div class="mb-6 flex gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by Family ID..."
        class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select v-model="filterTier" class="px-4 py-2 border rounded-lg">
        <option value="all">All Tiers</option>
        <option value="free">Free</option>
        <option value="premium">Premium</option>
        <option value="family">Family</option>
      </select>
    </div>

    <!-- Families Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Family ID</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Tier</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            <th class="px-4 py-3 text-right text-sm font-medium text-gray-700">Usage (Month)</th>
            <th class="px-4 py-3 text-right text-sm font-medium text-gray-700">Limit</th>
            <th class="px-4 py-3 text-right text-sm font-medium text-gray-700">Remaining</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="family in filteredFamilies" :key="family.id">
            <td class="px-4 py-3 text-sm font-mono">{{ family.id.slice(0, 12) }}...</td>
            <td class="px-4 py-3">
              <span :class="['px-2 py-1 rounded text-xs font-medium', getTierBadgeClass(family.tier)]">
                {{ family.tier.toUpperCase() }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  family.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ family.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-right text-sm">{{ family.usage }}</td>
            <td class="px-4 py-3 text-right text-sm">
              {{ family.limit === Infinity ? '∞' : family.limit }}
            </td>
            <td class="px-4 py-3 text-right text-sm">
              <span :class="getRemainingClass(family.remaining, family.limit)">
                {{ family.remaining === Infinity ? '∞' : family.remaining }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm space-x-2">
              <button
                @click="upgradeTier(family.id, 'premium')"
                class="text-blue-600 hover:text-blue-800 font-medium"
              >
                Upgrade
              </button>
              <button
                @click="viewDetails(family.id)"
                class="text-green-600 hover:text-green-800 font-medium"
              >
                Details
              </button>
            </td>
          </tr>
          <tr v-if="filteredFamilies.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-gray-500">
              No families found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Family Details Modal -->
    <div
      v-if="selectedFamily"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="selectedFamily = null"
    >
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Family Details</h3>
          <button @click="selectedFamily = null" class="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <div class="text-sm text-gray-600">Family ID</div>
            <div class="font-mono text-sm">{{ selectedFamily.id }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Subscription Tier</div>
            <div class="font-medium">{{ selectedFamily.tier.toUpperCase() }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Monthly Usage</div>
            <div class="font-medium">{{ selectedFamily.usage }} pronunciations</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Estimated Cost</div>
            <div class="font-medium">${{ (selectedFamily.usage * 0.004).toFixed(2) }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Monthly Revenue</div>
            <div class="font-medium text-green-600">
              ${{ selectedFamily.tier === 'free' ? '0.00' : selectedFamily.tier === 'premium' ? '2.99' : '7.49' }}
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Profit Margin</div>
            <div :class="['font-medium', selectedFamily.profit > 0 ? 'text-green-600' : 'text-red-600']">
              ${{ selectedFamily.profit.toFixed(2) }} / month
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="selectedFamily = null"
            class="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            @click="exportFamilyData"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Export Data
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

const searchQuery = ref('')
const filterTier = ref('all')
const selectedFamily = ref(null)

const currentMonth = new Date().toISOString().slice(0, 7)

const filteredFamilies = computed(() => {
  const families = Object.keys(adminStore.subscriptions).map(familyId => {
    const subscription = adminStore.subscriptions[familyId]
    const usage = adminStore.usageData[familyId]?.[currentMonth]?.pronunciations || 0
    const limit = TIER_LIMITS[subscription.tier].pronunciationsPerMonth
    const remaining = limit === Infinity ? Infinity : Math.max(0, limit - usage)

    const revenue = subscription.tier === 'free' ? 0 : subscription.tier === 'premium' ? 2.99 : 7.49
    const cost = usage * 0.004
    const profit = revenue - cost

    return {
      id: familyId,
      tier: subscription.tier,
      status: subscription.status,
      usage,
      limit,
      remaining,
      profit
    }
  })

  let filtered = families

  if (filterTier.value !== 'all') {
    filtered = filtered.filter(f => f.tier === filterTier.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(f => f.id.toLowerCase().includes(query))
  }

  return filtered
})

const getTierBadgeClass = (tier) => {
  const classes = {
    free: 'bg-gray-100 text-gray-800',
    premium: 'bg-blue-100 text-blue-800',
    family: 'bg-purple-100 text-purple-800'
  }
  return classes[tier] || 'bg-gray-100 text-gray-800'
}

const getRemainingClass = (remaining, limit) => {
  if (limit === Infinity) return 'text-green-600 font-medium'

  const percentage = (remaining / limit) * 100
  if (percentage > 50) return 'text-green-600 font-medium'
  if (percentage > 20) return 'text-yellow-600 font-medium'
  return 'text-red-600 font-medium'
}

const upgradeTier = (familyId, newTier) => {
  if (confirm(`Upgrade family to ${newTier}?`)) {
    adminStore.updateSubscription(familyId, newTier)
  }
}

const viewDetails = (familyId) => {
  const family = filteredFamilies.value.find(f => f.id === familyId)
  selectedFamily.value = family
}

const exportFamilyData = () => {
  const data = JSON.stringify(selectedFamily.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `family-${selectedFamily.value.id.slice(0, 8)}.json`
  a.click()
}
</script>
