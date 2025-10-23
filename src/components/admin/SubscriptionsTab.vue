<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-2xl font-bold mb-6">Active Subscriptions</h2>

    <!-- Add Test Subscription -->
    <div class="mb-6 p-4 bg-blue-50 rounded-lg">
      <h3 class="font-bold mb-2">Add Test Subscription</h3>
      <div class="flex gap-4">
        <input
          v-model="newFamilyId"
          placeholder="Family ID"
          class="flex-1 px-3 py-2 border rounded"
        />
        <select v-model="newTier" class="px-3 py-2 border rounded">
          <option value="free">Free</option>
          <option value="premium">Premium</option>
          <option value="family">Family</option>
        </select>
        <button
          @click="addSubscription"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>
    </div>

    <!-- Subscriptions Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Family ID</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Tier</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Start Date</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Renewal</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="(sub, familyId) in adminStore.subscriptions" :key="familyId">
            <td class="px-4 py-3 text-sm font-mono">{{ familyId.slice(0, 8) }}...</td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  sub.tier === 'free' ? 'bg-gray-100 text-gray-800' : '',
                  sub.tier === 'premium' ? 'bg-blue-100 text-blue-800' : '',
                  sub.tier === 'family' ? 'bg-purple-100 text-purple-800' : ''
                ]"
              >
                {{ sub.tier.toUpperCase() }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ sub.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">
              {{ formatDate(sub.startDate) }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">
              {{ sub.renewalDate ? formatDate(sub.renewalDate) : 'N/A' }}
            </td>
            <td class="px-4 py-3 text-sm font-medium">
              ${{ sub.amount || 0 }}/mo
            </td>
            <td class="px-4 py-3 text-sm">
              <button
                v-if="sub.status === 'active'"
                @click="cancelSub(familyId)"
                class="text-red-600 hover:text-red-800 font-medium"
              >
                Cancel
              </button>
              <button
                v-else
                @click="reactivateSub(familyId)"
                class="text-green-600 hover:text-green-800 font-medium"
              >
                Reactivate
              </button>
            </td>
          </tr>
          <tr v-if="Object.keys(adminStore.subscriptions).length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-gray-500">
              No subscriptions yet. Add a test subscription above.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAdminStore } from '../../stores/admin'

const adminStore = useAdminStore()

const newFamilyId = ref('')
const newTier = ref('free')

const addSubscription = () => {
  if (!newFamilyId.value) {
    newFamilyId.value = crypto.randomUUID()
  }

  adminStore.updateSubscription(newFamilyId.value, newTier.value)
  newFamilyId.value = ''
  newTier.value = 'free'
}

const cancelSub = (familyId) => {
  if (confirm('Cancel this subscription?')) {
    adminStore.cancelSubscription(familyId)
  }
}

const reactivateSub = (familyId) => {
  const sub = adminStore.subscriptions[familyId]
  adminStore.updateSubscription(familyId, sub.tier)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>
