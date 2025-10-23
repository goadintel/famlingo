import { useAdminStore } from '../stores/admin'
import { useFamilyStore } from '../stores/family'

/**
 * Composable for tracking usage and enforcing subscription limits
 */
export function useUsageTracking() {
  const adminStore = useAdminStore()
  const familyStore = useFamilyStore()

  /**
   * Check if user can make a pronunciation request
   * @returns {Object} { allowed: boolean, remaining: number, tier: string, message: string }
   */
  const checkPronunciationLimit = () => {
    const familyId = familyStore.family.id

    if (!familyId) {
      return {
        allowed: false,
        remaining: 0,
        tier: 'free',
        message: 'Please set up your family first'
      }
    }

    const subscription = adminStore.getSubscription(familyId)
    const remaining = adminStore.getRemainingPronunciations(familyId)
    const hasExceeded = adminStore.hasExceededLimit(familyId)

    if (hasExceeded) {
      return {
        allowed: false,
        remaining: 0,
        tier: subscription.tier,
        message: `You've reached your monthly limit. Upgrade to Premium for unlimited pronunciations!`
      }
    }

    return {
      allowed: true,
      remaining,
      tier: subscription.tier,
      message: remaining === Infinity
        ? 'Unlimited pronunciations available'
        : `${remaining} pronunciations remaining this month`
    }
  }

  /**
   * Track a pronunciation API call
   * @param {number} cost - Estimated cost (default $0.004)
   */
  const trackPronunciation = (cost = 0.004) => {
    const familyId = familyStore.family.id
    if (familyId) {
      adminStore.trackPronunciation(familyId, cost)
      console.log('📊 Tracked pronunciation usage for family:', familyId)
    }
  }

  /**
   * Track a translation API call
   * @param {number} cost - Estimated cost (default $0.001)
   */
  const trackTranslation = (cost = 0.001) => {
    const familyId = familyStore.family.id
    if (familyId) {
      adminStore.trackTranslation(familyId, cost)
      console.log('📊 Tracked translation usage for family:', familyId)
    }
  }

  /**
   * Track a TTS API call
   * @param {number} cost - Estimated cost (default $0.0005)
   */
  const trackTTS = (cost = 0.0005) => {
    const familyId = familyStore.family.id
    if (familyId) {
      adminStore.trackTTS(familyId, cost)
      console.log('📊 Tracked TTS usage for family:', familyId)
    }
  }

  /**
   * Get usage stats for current family
   * @returns {Object} Usage stats
   */
  const getCurrentUsage = () => {
    const familyId = familyStore.family.id
    if (!familyId) return null

    const subscription = adminStore.getSubscription(familyId)
    const usage = adminStore.getUsage(familyId)
    const remaining = adminStore.getRemainingPronunciations(familyId)

    return {
      subscription,
      usage,
      remaining,
      isUnlimited: remaining === Infinity
    }
  }

  /**
   * Show upgrade prompt if user is on free tier
   * @returns {boolean} Whether upgrade prompt should be shown
   */
  const shouldShowUpgradePrompt = () => {
    const familyId = familyStore.family.id
    if (!familyId) return false

    const subscription = adminStore.getSubscription(familyId)
    const usage = adminStore.getUsage(familyId)

    // Show prompt if free tier and used > 80% of limit
    if (subscription.tier === 'free') {
      const usagePercentage = (usage.pronunciations / 100) * 100
      return usagePercentage > 80
    }

    return false
  }

  return {
    checkPronunciationLimit,
    trackPronunciation,
    trackTranslation,
    trackTTS,
    getCurrentUsage,
    shouldShowUpgradePrompt
  }
}
