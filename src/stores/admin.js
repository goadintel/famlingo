import { defineStore } from 'pinia'

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  FAMILY: 'family'
}

// Tier limits and pricing
export const TIER_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    pronunciationsPerMonth: 100,
    maxUsers: 1,
    price: 0,
    features: ['Basic phrases', 'Limited pronunciations', 'Single user']
  },
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    pronunciationsPerMonth: Infinity,
    maxUsers: 1,
    price: 2.99,
    priceYuan: 19.9,
    features: ['Unlimited pronunciations', 'All phrases', 'Ad-free', 'Priority support']
  },
  [SUBSCRIPTION_TIERS.FAMILY]: {
    pronunciationsPerMonth: Infinity,
    maxUsers: 10,
    price: 7.49,
    priceYuan: 49.9,
    features: ['Everything in Premium', 'Up to 10 family members', 'Shared dashboard', 'Priority support']
  }
}

export const useAdminStore = defineStore('admin', {
  state: () => ({
    // Admin authentication
    isAdminAuthenticated: false,
    adminPassword: null, // In production, use proper auth backend

    // User subscription data (keyed by family ID)
    subscriptions: {},

    // Usage tracking (keyed by family ID)
    usageData: {},

    // Global analytics
    analytics: {
      totalFamilies: 0,
      totalUsers: 0,
      totalPronunciations: 0,
      revenueThisMonth: 0,
      activeSubscriptions: {
        free: 0,
        premium: 0,
        family: 0
      }
    }
  }),

  getters: {
    // Get subscription for a family
    getSubscription: (state) => (familyId) => {
      return state.subscriptions[familyId] || {
        tier: SUBSCRIPTION_TIERS.FREE,
        startDate: new Date().toISOString(),
        renewalDate: null,
        status: 'active',
        paymentMethod: null
      }
    },

    // Get usage data for a family
    getUsage: (state) => (familyId) => {
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      return state.usageData[familyId]?.[currentMonth] || {
        pronunciations: 0,
        translations: 0,
        tts: 0,
        lastUsed: null
      }
    },

    // Check if user has exceeded limits
    hasExceededLimit: (state) => (familyId) => {
      const subscription = state.subscriptions[familyId] || { tier: SUBSCRIPTION_TIERS.FREE }
      const usage = state.getUsage(familyId)
      const limits = TIER_LIMITS[subscription.tier]

      return usage.pronunciations >= limits.pronunciationsPerMonth
    },

    // Get remaining pronunciations
    getRemainingPronunciations: (state) => (familyId) => {
      const subscription = state.subscriptions[familyId] || { tier: SUBSCRIPTION_TIERS.FREE }
      const usage = state.getUsage(familyId)
      const limits = TIER_LIMITS[subscription.tier]

      if (limits.pronunciationsPerMonth === Infinity) {
        return Infinity
      }

      return Math.max(0, limits.pronunciationsPerMonth - usage.pronunciations)
    },

    // Get all families sorted by usage
    familiesByUsage: (state) => {
      return Object.entries(state.usageData)
        .map(([familyId, months]) => {
          const currentMonth = new Date().toISOString().slice(0, 7)
          const usage = months[currentMonth] || { pronunciations: 0 }
          return { familyId, usage: usage.pronunciations }
        })
        .sort((a, b) => b.usage - a.usage)
    },

    // Get revenue metrics
    revenueMetrics: (state) => {
      const premiumCount = state.analytics.activeSubscriptions.premium
      const familyCount = state.analytics.activeSubscriptions.family

      const monthlyRevenue =
        (premiumCount * TIER_LIMITS[SUBSCRIPTION_TIERS.PREMIUM].price) +
        (familyCount * TIER_LIMITS[SUBSCRIPTION_TIERS.FAMILY].price)

      const yearlyRevenue = monthlyRevenue * 12

      return {
        monthly: monthlyRevenue.toFixed(2),
        yearly: yearlyRevenue.toFixed(2),
        currency: 'USD'
      }
    }
  },

  actions: {
    // Admin login (simple version - use JWT in production)
    adminLogin(password) {
      // In production, validate against backend
      const correctPassword = 'famlingo-admin-2025' // Change this!

      if (password === correctPassword) {
        this.isAdminAuthenticated = true
        this.adminPassword = password
        sessionStorage.setItem('famlingo_admin_auth', 'true')
        console.log('✅ Admin authenticated')
        return true
      }

      console.log('❌ Invalid admin password')
      return false
    },

    // Admin logout
    adminLogout() {
      this.isAdminAuthenticated = false
      this.adminPassword = null
      sessionStorage.removeItem('famlingo_admin_auth')
      console.log('🔒 Admin logged out')
    },

    // Restore admin session
    restoreAdminSession() {
      const saved = sessionStorage.getItem('famlingo_admin_auth')
      if (saved === 'true') {
        this.isAdminAuthenticated = true
        console.log('🔓 Admin session restored')
      }
    },

    // Create or update subscription
    updateSubscription(familyId, tier, paymentData = {}) {
      const now = new Date()
      const renewalDate = new Date(now.setMonth(now.getMonth() + 1))

      this.subscriptions[familyId] = {
        tier,
        startDate: this.subscriptions[familyId]?.startDate || new Date().toISOString(),
        renewalDate: renewalDate.toISOString(),
        status: 'active',
        paymentMethod: paymentData.method || 'stripe',
        lastPayment: new Date().toISOString(),
        amount: TIER_LIMITS[tier].price
      }

      this.saveSubscriptionsToStorage()
      this.updateAnalytics()
      console.log(`💳 Subscription updated: ${familyId} → ${tier}`)
    },

    // Cancel subscription
    cancelSubscription(familyId) {
      if (this.subscriptions[familyId]) {
        this.subscriptions[familyId].status = 'cancelled'
        this.subscriptions[familyId].cancelledDate = new Date().toISOString()
        this.saveSubscriptionsToStorage()
        this.updateAnalytics()
        console.log(`❌ Subscription cancelled: ${familyId}`)
      }
    },

    // Track pronunciation usage
    trackPronunciation(familyId, cost = 0.004) {
      const currentMonth = new Date().toISOString().slice(0, 7)

      if (!this.usageData[familyId]) {
        this.usageData[familyId] = {}
      }

      if (!this.usageData[familyId][currentMonth]) {
        this.usageData[familyId][currentMonth] = {
          pronunciations: 0,
          translations: 0,
          tts: 0,
          costs: 0,
          lastUsed: null
        }
      }

      this.usageData[familyId][currentMonth].pronunciations++
      this.usageData[familyId][currentMonth].costs += cost
      this.usageData[familyId][currentMonth].lastUsed = new Date().toISOString()

      this.saveUsageToStorage()
      this.updateAnalytics()
    },

    // Track translation usage
    trackTranslation(familyId, cost = 0.001) {
      const currentMonth = new Date().toISOString().slice(0, 7)

      if (!this.usageData[familyId]) {
        this.usageData[familyId] = {}
      }

      if (!this.usageData[familyId][currentMonth]) {
        this.usageData[familyId][currentMonth] = {
          pronunciations: 0,
          translations: 0,
          tts: 0,
          costs: 0,
          lastUsed: null
        }
      }

      this.usageData[familyId][currentMonth].translations++
      this.usageData[familyId][currentMonth].costs += cost
      this.usageData[familyId][currentMonth].lastUsed = new Date().toISOString()

      this.saveUsageToStorage()
    },

    // Track TTS usage
    trackTTS(familyId, cost = 0.0005) {
      const currentMonth = new Date().toISOString().slice(0, 7)

      if (!this.usageData[familyId]) {
        this.usageData[familyId] = {}
      }

      if (!this.usageData[familyId][currentMonth]) {
        this.usageData[familyId][currentMonth] = {
          pronunciations: 0,
          translations: 0,
          tts: 0,
          costs: 0,
          lastUsed: null
        }
      }

      this.usageData[familyId][currentMonth].tts++
      this.usageData[familyId][currentMonth].costs += cost
      this.usageData[familyId][currentMonth].lastUsed = new Date().toISOString()

      this.saveUsageToStorage()
    },

    // Update global analytics
    updateAnalytics() {
      this.analytics.totalFamilies = Object.keys(this.subscriptions).length

      this.analytics.activeSubscriptions = {
        free: 0,
        premium: 0,
        family: 0
      }

      Object.values(this.subscriptions).forEach(sub => {
        if (sub.status === 'active') {
          this.analytics.activeSubscriptions[sub.tier]++
        }
      })

      // Calculate total pronunciations this month
      const currentMonth = new Date().toISOString().slice(0, 7)
      this.analytics.totalPronunciations = Object.values(this.usageData)
        .reduce((sum, months) => {
          return sum + (months[currentMonth]?.pronunciations || 0)
        }, 0)
    },

    // Save to localStorage
    saveSubscriptionsToStorage() {
      localStorage.setItem('famlingo_admin_subscriptions', JSON.stringify(this.subscriptions))
    },

    saveUsageToStorage() {
      localStorage.setItem('famlingo_admin_usage', JSON.stringify(this.usageData))
    },

    // Load from localStorage
    loadFromStorage() {
      const subscriptions = localStorage.getItem('famlingo_admin_subscriptions')
      if (subscriptions) {
        this.subscriptions = JSON.parse(subscriptions)
      }

      const usage = localStorage.getItem('famlingo_admin_usage')
      if (usage) {
        this.usageData = JSON.parse(usage)
      }

      this.updateAnalytics()
      console.log('📊 Admin data loaded from storage')
    },

    // Reset month usage (call on 1st of month)
    resetMonthlyUsage() {
      const currentMonth = new Date().toISOString().slice(0, 7)
      console.log(`🔄 Resetting usage for month: ${currentMonth}`)

      // Usage data is keyed by month, so no need to reset
      // Just keep historical data
    },

    // Export data for backup
    exportData() {
      return {
        subscriptions: this.subscriptions,
        usageData: this.usageData,
        analytics: this.analytics,
        exportDate: new Date().toISOString()
      }
    },

    // Import data from backup
    importData(data) {
      if (data.subscriptions) this.subscriptions = data.subscriptions
      if (data.usageData) this.usageData = data.usageData

      this.saveSubscriptionsToStorage()
      this.saveUsageToStorage()
      this.updateAnalytics()

      console.log('📥 Admin data imported')
    }
  }
})
