import { defineStore } from 'pinia'

export const useFamilyStore = defineStore('family', {
  state: () => ({
    family: {
      id: null,
      name: { en: '', cn: '' },
      created: null,
      users: []
    },
    currentUserId: null,
    maxUsers: 10
  }),

  getters: {
    // Get current active user
    currentUser: (state) => {
      if (!state.currentUserId) return null
      return state.family.users.find(u => u.id === state.currentUserId)
    },

    // Check if family is full
    isFamilyFull: (state) => state.family.users.length >= state.maxUsers,

    // Get all users sorted by streak (for leaderboard)
    usersByStreak: (state) => {
      return [...state.family.users].sort((a, b) =>
        b.stats.currentStreak - a.stats.currentStreak
      )
    },

    // Get all users sorted by accuracy (for leaderboard)
    usersByAccuracy: (state) => {
      return [...state.family.users].sort((a, b) =>
        b.stats.accuracy - a.stats.accuracy
      )
    },

    // Get family total stats
    familyStats: (state) => {
      const totalSessions = state.family.users.reduce((sum, u) => sum + u.stats.totalSessions, 0)
      const totalPhrases = state.family.users.reduce((sum, u) => sum + u.stats.totalPhrases, 0)
      const avgAccuracy = state.family.users.length > 0
        ? state.family.users.reduce((sum, u) => sum + u.stats.accuracy, 0) / state.family.users.length
        : 0
      const activeUsers = state.family.users.filter(u => u.stats.currentStreak > 0).length

      return {
        totalSessions,
        totalPhrases,
        avgAccuracy,
        activeUsers,
        totalUsers: state.family.users.length
      }
    },

    // Check if family is initialized
    isFamilyInitialized: (state) => state.family.id !== null
  },

  actions: {
    // Initialize family (first time setup)
    initializeFamily(familyNameEn, familyNameCn) {
      this.family = {
        id: crypto.randomUUID(),
        name: { en: familyNameEn, cn: familyNameCn },
        created: new Date().toISOString(),
        users: []
      }
      this.saveFamilyToStorage()
      console.log('👨‍👩‍👧‍👦 Family initialized:', this.family.name)
    },

    // Add new user to family
    addUser({ nameEn, nameCn, avatar, ageGroup, learningDirection, targetLanguage, level = 'beginner' }) {
      if (this.isFamilyFull) {
        throw new Error(`Maximum ${this.maxUsers} users allowed per family`)
      }

      // Default learningDirection based on common pattern
      const direction = learningDirection || 'cn-to-en'

      // Auto-set targetLanguage based on learningDirection if not provided
      // cn-to-en = Native English learning Chinese → target is Chinese
      // en-to-cn = Native Chinese learning English → target is English
      const target = targetLanguage || (direction === 'cn-to-en' ? 'zh-CN' : 'en-US')

      const newUser = {
        id: crypto.randomUUID(),
        name: { en: nameEn, cn: nameCn },
        avatar: avatar || '👤',
        ageGroup: ageGroup || 'adult', // child, teen, adult
        learningDirection: direction, // cn-to-en or en-to-cn (for text mode)
        targetLanguage: target, // zh-CN or en-US (for voice mode - what language to practice)
        level: level, // beginner, intermediate, advanced
        created: new Date().toISOString(),
        stats: {
          totalSessions: 0,
          totalPhrases: 0,
          currentStreak: 0,
          longestStreak: 0,
          accuracy: 0,
          lastPractice: null
        },
        progress: {} // { phraseId: { interval, easeFactor, dueDate, correctCount, incorrectCount } }
      }

      this.family.users.push(newUser)
      this.saveFamilyToStorage()
      console.log(`✅ User added: ${newUser.name.en} (${newUser.name.cn})`)
      return newUser.id
    },

    // Switch current user
    switchUser(userId) {
      const user = this.family.users.find(u => u.id === userId)
      if (!user) {
        throw new Error('User not found')
      }
      this.currentUserId = userId
      localStorage.setItem('famlingo_current_user', userId)
      console.log(`👤 Switched to user: ${user.name.en} (${user.name.cn})`)
    },

    // Update user stats (called after practice session)
    updateUserStats(userId, stats) {
      const user = this.family.users.find(u => u.id === userId)
      if (!user) return

      user.stats = {
        ...user.stats,
        ...stats,
        lastPractice: new Date().toISOString()
      }

      // Update streak
      this.updateStreak(userId)
      this.saveFamilyToStorage()
    },

    // Update streak based on last practice date
    updateStreak(userId) {
      const user = this.family.users.find(u => u.id === userId)
      if (!user || !user.stats.lastPractice) return

      const lastPractice = new Date(user.stats.lastPractice)
      const today = new Date()
      const daysDiff = Math.floor((today - lastPractice) / (1000 * 60 * 60 * 24))

      if (daysDiff === 0) {
        // Same day - no change
        return
      } else if (daysDiff === 1) {
        // Practiced yesterday - increment streak
        user.stats.currentStreak++
        if (user.stats.currentStreak > user.stats.longestStreak) {
          user.stats.longestStreak = user.stats.currentStreak
        }
      } else {
        // Missed a day - reset streak
        user.stats.currentStreak = 1
      }

      this.saveFamilyToStorage()
    },

    // Update user's phrase progress (spaced repetition data)
    updatePhraseProgress(userId, phraseId, progressData) {
      const user = this.family.users.find(u => u.id === userId)
      if (!user) return

      user.progress[phraseId] = {
        ...user.progress[phraseId],
        ...progressData
      }

      this.saveFamilyToStorage()
    },

    // Delete user from family
    deleteUser(userId) {
      const index = this.family.users.findIndex(u => u.id === userId)
      if (index === -1) return

      const user = this.family.users[index]
      this.family.users.splice(index, 1)

      // If deleted user was current user, switch to first available
      if (this.currentUserId === userId) {
        this.currentUserId = this.family.users.length > 0 ? this.family.users[0].id : null
        localStorage.setItem('famlingo_current_user', this.currentUserId || '')
      }

      this.saveFamilyToStorage()
      console.log(`❌ User deleted: ${user.name.en}`)
    },

    // Save family data to localStorage
    saveFamilyToStorage() {
      localStorage.setItem('famlingo_family', JSON.stringify(this.family))
    },

    // Load family data from localStorage
    loadFamilyFromStorage() {
      const saved = localStorage.getItem('famlingo_family')
      if (saved) {
        this.family = JSON.parse(saved)

        // Migration: Add targetLanguage to existing users who don't have it
        this.family.users.forEach(user => {
          if (!user.targetLanguage) {
            // Auto-set based on learningDirection
            user.targetLanguage = user.learningDirection === 'cn-to-en' ? 'zh-CN' : 'en-US'
            console.log(`🔄 Migrated user ${user.name.en}: targetLanguage = ${user.targetLanguage}`)
          }
        })

        this.saveFamilyToStorage() // Save migrated data
        console.log('📂 Family data loaded from storage')
      }

      const savedUserId = localStorage.getItem('famlingo_current_user')
      if (savedUserId && this.family.users.some(u => u.id === savedUserId)) {
        this.currentUserId = savedUserId
        console.log('👤 Current user restored')
      }
    },

    // Reset all family data (for testing)
    resetFamily() {
      this.family = {
        id: null,
        name: { en: '', cn: '' },
        created: null,
        users: []
      }
      this.currentUserId = null
      localStorage.removeItem('famlingo_family')
      localStorage.removeItem('famlingo_current_user')
      console.log('🔄 Family data reset')
    }
  }
})
