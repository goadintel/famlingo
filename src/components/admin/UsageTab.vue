<template>
  <div class="space-y-6">
    <!-- Usage Summary -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold mb-6">Usage Analytics</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 bg-blue-50 rounded-lg">
          <div class="text-sm text-gray-600">Total Pronunciations</div>
          <div class="text-2xl font-bold text-blue-600">{{ totalPronunciations }}</div>
          <div class="text-xs text-gray-500">This month</div>
        </div>
        <div class="p-4 bg-green-50 rounded-lg">
          <div class="text-sm text-gray-600">Total Translations</div>
          <div class="text-2xl font-bold text-green-600">{{ totalTranslations }}</div>
          <div class="text-xs text-gray-500">This month</div>
        </div>
        <div class="p-4 bg-purple-50 rounded-lg">
          <div class="text-sm text-gray-600">Total Costs</div>
          <div class="text-2xl font-bold text-purple-600">${{ totalCosts.toFixed(2) }}</div>
          <div class="text-xs text-gray-500">This month</div>
        </div>
      </div>

      <!-- Top Users by Usage -->
      <div>
        <h3 class="font-bold mb-3">Top Users by Pronunciations</h3>
        <div class="space-y-2">
          <div
            v-for="family in topFamilies"
            :key="family.familyId"
            class="flex items-center justify-between p-3 bg-gray-50 rounded"
          >
            <div class="flex items-center gap-3">
              <div class="text-sm font-mono text-gray-600">{{ family.familyId.slice(0, 8) }}...</div>
              <div
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  getTierBadgeClass(family.tier)
                ]"
              >
                {{ family.tier.toUpperCase() }}
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-sm text-gray-600">
                {{ family.usage }} pronunciations
              </div>
              <div class="text-sm font-medium text-gray-800">
                ${{ (family.usage * 0.004).toFixed(2) }} cost
              </div>
            </div>
          </div>
          <div v-if="topFamilies.length === 0" class="text-center text-gray-500 py-4">
            No usage data yet
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Usage Table -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-xl font-bold mb-4">Detailed Usage</h3>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Family ID</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Tier</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-700">Pronunciations</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-700">Translations</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-700">TTS</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-700">Costs</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Last Used</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="item in usageDetails" :key="item.familyId">
              <td class="px-4 py-3 text-sm font-mono">{{ item.familyId.slice(0, 8) }}...</td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-1 rounded text-xs font-medium', getTierBadgeClass(item.tier)]">
                  {{ item.tier.toUpperCase() }}
                </span>
              </td>
              <td class="px-4 py-3 text-right text-sm">{{ item.usage.pronunciations }}</td>
              <td class="px-4 py-3 text-right text-sm">{{ item.usage.translations }}</td>
              <td class="px-4 py-3 text-right text-sm">{{ item.usage.tts }}</td>
              <td class="px-4 py-3 text-right text-sm font-medium">${{ item.usage.costs.toFixed(3) }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ item.usage.lastUsed ? formatDate(item.usage.lastUsed) : 'Never' }}
              </td>
            </tr>
            <tr v-if="usageDetails.length === 0">
              <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                No usage data yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAdminStore } from '../../stores/admin'

const adminStore = useAdminStore()

const currentMonth = new Date().toISOString().slice(0, 7)

const totalPronunciations = computed(() => {
  return Object.values(adminStore.usageData).reduce((sum, months) => {
    return sum + (months[currentMonth]?.pronunciations || 0)
  }, 0)
})

const totalTranslations = computed(() => {
  return Object.values(adminStore.usageData).reduce((sum, months) => {
    return sum + (months[currentMonth]?.translations || 0)
  }, 0)
})

const totalCosts = computed(() => {
  return Object.values(adminStore.usageData).reduce((sum, months) => {
    return sum + (months[currentMonth]?.costs || 0)
  }, 0)
})

const topFamilies = computed(() => {
  return Object.entries(adminStore.usageData)
    .map(([familyId, months]) => {
      const usage = months[currentMonth]?.pronunciations || 0
      const tier = adminStore.subscriptions[familyId]?.tier || 'free'
      return { familyId, usage, tier }
    })
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 10)
})

const usageDetails = computed(() => {
  return Object.entries(adminStore.usageData)
    .map(([familyId, months]) => {
      const usage = months[currentMonth] || {
        pronunciations: 0,
        translations: 0,
        tts: 0,
        costs: 0,
        lastUsed: null
      }
      const tier = adminStore.subscriptions[familyId]?.tier || 'free'
      return { familyId, usage, tier }
    })
    .sort((a, b) => b.usage.pronunciations - a.usage.pronunciations)
})

const getTierBadgeClass = (tier) => {
  const classes = {
    free: 'bg-gray-100 text-gray-800',
    premium: 'bg-blue-100 text-blue-800',
    family: 'bg-purple-100 text-purple-800'
  }
  return classes[tier] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
