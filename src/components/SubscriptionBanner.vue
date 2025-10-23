<template>
  <div v-if="shouldShow" class="mb-6">
    <!-- Usage Warning Banner -->
    <div
      v-if="usagePercentage > 80 && subscription.tier === 'free'"
      class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4"
    >
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center">
            <span class="text-yellow-400 text-xl mr-2">⚠️</span>
            <h3 class="text-sm font-medium text-yellow-800">
              You've used {{ usageData.pronunciations }} of 100 pronunciations this month
            </h3>
          </div>
          <p class="mt-1 text-sm text-yellow-700">
            Upgrade to Premium for unlimited pronunciations!
          </p>
        </div>
        <button
          @click="showUpgradeModal = true"
          class="ml-3 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg hover:bg-yellow-500 font-medium"
        >
          Upgrade Now
        </button>
      </div>
    </div>

    <!-- Limit Reached Banner -->
    <div
      v-if="hasExceeded"
      class="bg-red-50 border-l-4 border-red-400 p-4 mb-4"
    >
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center">
            <span class="text-red-400 text-xl mr-2">🚫</span>
            <h3 class="text-sm font-medium text-red-800">
              Monthly limit reached
            </h3>
          </div>
          <p class="mt-1 text-sm text-red-700">
            You've reached your 100 pronunciations limit. Upgrade to continue learning!
          </p>
        </div>
        <button
          @click="showUpgradeModal = true"
          class="ml-3 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium"
        >
          Upgrade to Premium
        </button>
      </div>
    </div>

    <!-- Upgrade Modal -->
    <div
      v-if="showUpgradeModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showUpgradeModal = false"
    >
      <div class="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-3xl font-bold">Choose Your Plan</h2>
          <button @click="showUpgradeModal = false" class="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <!-- Free Tier -->
          <div class="border rounded-lg p-6 bg-gray-50">
            <div class="text-center mb-4">
              <h3 class="text-xl font-bold mb-2">Free</h3>
              <div class="text-3xl font-bold mb-1">$0</div>
              <div class="text-sm text-gray-600">per month</div>
            </div>
            <ul class="space-y-2 mb-6 text-sm">
              <li class="flex items-start">
                <span class="mr-2">✓</span>
                <span>100 pronunciations/month</span>
              </li>
              <li class="flex items-start">
                <span class="mr-2">✓</span>
                <span>Basic phrases</span>
              </li>
              <li class="flex items-start">
                <span class="mr-2">✓</span>
                <span>Single user</span>
              </li>
            </ul>
            <button
              disabled
              class="w-full bg-gray-300 text-gray-600 py-2 rounded-lg cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          <!-- Premium Tier -->
          <div class="border-2 border-blue-500 rounded-lg p-6 relative bg-blue-50">
            <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span class="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                POPULAR
              </span>
            </div>
            <div class="text-center mb-4">
              <h3 class="text-xl font-bold mb-2">Premium</h3>
              <div class="text-3xl font-bold mb-1">$2.99</div>
              <div class="text-sm text-gray-600">per month</div>
              <div class="text-xs text-gray-500">¥19.9/month</div>
            </div>
            <ul class="space-y-2 mb-6 text-sm">
              <li class="flex items-start">
                <span class="mr-2 text-blue-600">✓</span>
                <span><strong>Unlimited</strong> pronunciations</span>
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-blue-600">✓</span>
                <span>All phrases unlocked</span>
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-blue-600">✓</span>
                <span>Ad-free experience</span>
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-blue-600">✓</span>
                <span>Priority support</span>
              </li>
            </ul>
            <button
              @click="selectPlan('premium')"
              class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-medium"
            >
              Upgrade to Premium
            </button>
          </div>

          <!-- Family Plan -->
          <div class="border rounded-lg p-6 bg-purple-50">
            <div class="text-center mb-4">
              <h3 class="text-xl font-bold mb-2">Family</h3>
              <div class="text-3xl font-bold mb-1">$7.49</div>
              <div class="text-sm text-gray-600">per month</div>
              <div class="text-xs text-gray-500">¥49.9/month</div>
            </div>
            <ul class="space-y-2 mb-6 text-sm">
              <li class="flex items-start">
                <span class="mr-2 text-purple-600">✓</span>
                <span><strong>Everything in Premium</strong></span>
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-purple-600">✓</span>
                <span>Up to 10 family members</span>
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-purple-600">✓</span>
                <span>Shared dashboard</span>
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-purple-600">✓</span>
                <span>Family leaderboard</span>
              </li>
            </ul>
            <button
              @click="selectPlan('family')"
              class="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 font-medium"
            >
              Upgrade to Family
            </button>
          </div>
        </div>

        <div class="text-center text-sm text-gray-600">
          <p>💳 Payment integration coming soon! For now, this is a demo.</p>
          <p class="mt-2">All subscriptions include a 7-day free trial.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAdminStore } from '../stores/admin'
import { useFamilyStore } from '../stores/family'

const adminStore = useAdminStore()
const familyStore = useFamilyStore()

const showUpgradeModal = ref(false)

const familyId = computed(() => familyStore.family.id)

const subscription = computed(() => {
  return adminStore.getSubscription(familyId.value)
})

const usageData = computed(() => {
  return adminStore.getUsage(familyId.value)
})

const hasExceeded = computed(() => {
  return adminStore.hasExceededLimit(familyId.value)
})

const usagePercentage = computed(() => {
  if (subscription.value.tier !== 'free') return 0
  return (usageData.value.pronunciations / 100) * 100
})

const shouldShow = computed(() => {
  return usagePercentage.value > 80 || hasExceeded.value
})

const selectPlan = (tier) => {
  // In production, this would redirect to Stripe checkout
  alert(`Redirecting to payment for ${tier} plan...\n\nFor demo purposes, upgrading immediately!`)

  adminStore.updateSubscription(familyId.value, tier, {
    method: 'demo',
    demo: true
  })

  showUpgradeModal.value = false
}
</script>
