import { defineStore } from 'pinia'
import phrasesData from '../data/phrases.json'
import { useAuth } from '../composables/useAuth'

export const usePhrasesStore = defineStore('phrases', {
  state: () => ({
    phrases: phrasesData.categories,
    customPhrases: [], // Custom phrases added by users
    phases: phrasesData.phases,
    version: phrasesData.version,
    lastUpdated: phrasesData.lastUpdated,
    totalPhrases: phrasesData.totalPhrases,
    currentMemberId: null // Track current member for backend sync
  }),

  getters: {
    // Get all phrases as flat array (including custom phrases)
    allPhrases: (state) => {
      const all = []

      // Add standard phrases
      state.phrases.forEach(category => {
        category.phrases.forEach(phrase => {
          all.push({
            ...phrase,
            categoryId: category.id,
            categoryName: category.name,
            categoryIcon: category.icon
          })
        })
      })

      // Add custom phrases
      state.customPhrases.forEach(phrase => {
        all.push({
          ...phrase,
          categoryId: 'custom',
          categoryName: { en: 'Common Phrases', cn: '常用短语' },
          categoryIcon: '⭐'
        })
      })

      return all
    },

    // Get phrases by category ID
    getPhrasesByCategory: (state) => (categoryId) => {
      if (categoryId === 'custom') {
        return state.customPhrases.map(phrase => ({
          ...phrase,
          categoryId: 'custom',
          categoryName: { en: 'Common Phrases', cn: '常用短语' },
          categoryIcon: '⭐'
        }))
      }
      const category = state.phrases.find(c => c.id === categoryId)
      if (!category) return []

      return category.phrases.map(phrase => ({
        ...phrase,
        categoryId: category.id,
        categoryName: category.name,
        categoryIcon: category.icon
      }))
    },

    // Get phrases by phase
    getPhrasesByPhase: (state) => (phase) => {
      const all = []
      state.phrases.forEach(category => {
        if (category.phase === phase) {
          category.phrases.forEach(phrase => {
            all.push({
              ...phrase,
              categoryId: category.id,
              categoryName: category.name,
              categoryIcon: category.icon
            })
          })
        }
      })
      return all
    },

    // Get single phrase by ID
    getPhraseById: (state) => (phraseId) => {
      // Check custom phrases first
      const customPhrase = state.customPhrases.find(p => p.id === phraseId)
      if (customPhrase) {
        return {
          ...customPhrase,
          categoryId: 'custom',
          categoryName: { en: 'Common Phrases', cn: '常用短语' },
          categoryIcon: '⭐'
        }
      }

      // Then check standard phrases
      for (const category of state.phrases) {
        const phrase = category.phrases.find(p => p.id === phraseId)
        if (phrase) {
          return {
            ...phrase,
            categoryId: category.id,
            categoryName: category.name,
            categoryIcon: category.icon
          }
        }
      }
      return null
    },

    // Get phrases by difficulty level
    getPhrasesByDifficulty: (state) => (difficulty) => {
      const all = []
      state.phrases.forEach(category => {
        category.phrases.forEach(phrase => {
          if (phrase.difficulty === difficulty) {
            all.push({
              ...phrase,
              categoryId: category.id,
              categoryName: category.name,
              categoryIcon: category.icon
            })
          }
        })
      })
      return all
    },

    // Get all categories (including custom if exists)
    categories: (state) => {
      const cats = state.phrases.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        phase: c.phase,
        phraseCount: c.phrases.length
      }))

      // Add custom category if there are custom phrases
      if (state.customPhrases.length > 0) {
        cats.unshift({
          id: 'custom',
          name: { en: 'Common Phrases', cn: '常用短语' },
          icon: '⭐',
          phase: 'custom',
          phraseCount: state.customPhrases.length
        })
      }

      return cats
    }
  },

  actions: {
    // Initialize phrase library and load custom phrases
    async initialize(memberId = null) {
      console.log(`📚 Phrase library loaded: ${this.totalPhrases} phrases`)
      console.log(`📖 Categories: ${this.phrases.length}`)
      console.log(`🎯 Phases: ${Object.keys(this.phases).length}`)

      this.currentMemberId = memberId

      // Load custom phrases for current member
      if (memberId) {
        await this.loadCustomPhrases(memberId)
      }
    },

    // Load custom phrases from backend
    async loadCustomPhrases(memberId) {
      // First load from localStorage (for immediate display)
      const saved = localStorage.getItem(`famlingo_custom_phrases_${memberId}`)
      const localPhrases = saved ? JSON.parse(saved) : []
      this.customPhrases = localPhrases

      if (localPhrases.length > 0) {
        console.log(`⭐ Loaded ${localPhrases.length} custom phrases from local storage`)
      }

      // Then load from backend
      try {
        const auth = useAuth()
        if (!auth.isLoggedIn.value) {
          console.log('⏭️ Not logged in, skipping backend sync')
          return
        }

        const backendPhrases = await auth.getPhrases(memberId)

        if (backendPhrases.length > 0) {
          // Backend is source of truth
          this.customPhrases = backendPhrases
          // Update local cache
          this.saveCustomPhrasesLocally(memberId)
          console.log(`⭐ Loaded ${backendPhrases.length} custom phrases from backend`)
        } else if (localPhrases.length > 0) {
          // We have local phrases but none on backend - sync them up
          console.log(`🔄 Syncing ${localPhrases.length} local phrases to backend`)
          for (const phrase of localPhrases) {
            try {
              await auth.addPhrase(memberId, phrase)
            } catch (err) {
              console.warn('⚠️ Could not sync phrase:', err.message)
            }
          }
        }
      } catch (err) {
        console.warn('⚠️ Could not load phrases from backend:', err.message)
        // Continue with local phrases only
      }
    },

    // Add a custom phrase (save to backend + localStorage)
    async addCustomPhrase(memberId, phrase) {
      // Add to local state immediately
      this.customPhrases.unshift(phrase)
      this.saveCustomPhrasesLocally(memberId)
      console.log('⭐ Custom phrase added:', phrase.en, '/', phrase.cn)

      // Sync to backend
      try {
        const auth = useAuth()
        if (auth.isLoggedIn.value) {
          await auth.addPhrase(memberId, phrase)
          console.log('✅ Phrase synced to backend')
        }
      } catch (err) {
        console.warn('⚠️ Could not sync phrase to backend:', err.message)
        // Phrase is still saved locally
      }
    },

    // Remove a custom phrase
    async removeCustomPhrase(memberId, phraseId) {
      this.customPhrases = this.customPhrases.filter(p => p.id !== phraseId)
      this.saveCustomPhrasesLocally(memberId)
      console.log('🗑️ Custom phrase removed:', phraseId)

      // Sync to backend
      try {
        const auth = useAuth()
        if (auth.isLoggedIn.value) {
          await auth.deletePhrase(phraseId)
          console.log('✅ Phrase deleted from backend')
        }
      } catch (err) {
        console.warn('⚠️ Could not delete phrase from backend:', err.message)
      }
    },

    // Save custom phrases to localStorage (local cache)
    saveCustomPhrasesLocally(memberId) {
      localStorage.setItem(`famlingo_custom_phrases_${memberId}`, JSON.stringify(this.customPhrases))
    },

    // Play audio for a phrase (text-to-speech)
    playAudio(text, language = 'zh-CN') {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = language // 'zh-CN' for Chinese, 'en-US' for English
        utterance.rate = 0.8 // Slightly slower for learning
        window.speechSynthesis.speak(utterance)
        console.log(`🔊 Playing audio: ${text}`)
      } else {
        console.warn('⚠️ Speech synthesis not supported in this browser')
      }
    }
  }
})
