import { defineStore } from 'pinia'
import phrasesData from '../data/phrases.json'

export const usePhrasesStore = defineStore('phrases', {
  state: () => ({
    phrases: phrasesData.categories,
    customPhrases: [], // Custom phrases added by users
    phases: phrasesData.phases,
    version: phrasesData.version,
    lastUpdated: phrasesData.lastUpdated,
    totalPhrases: phrasesData.totalPhrases
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
    initialize(currentUserId = null) {
      console.log(`📚 Phrase library loaded: ${this.totalPhrases} phrases`)
      console.log(`📖 Categories: ${this.phrases.length}`)
      console.log(`🎯 Phases: ${Object.keys(this.phases).length}`)

      // Load custom phrases for current user
      if (currentUserId) {
        this.loadCustomPhrases(currentUserId)
      }
    },

    // Load custom phrases from localStorage for specific user
    loadCustomPhrases(userId) {
      const saved = localStorage.getItem(`famlingo_custom_phrases_${userId}`)
      if (saved) {
        this.customPhrases = JSON.parse(saved)
        console.log(`⭐ Loaded ${this.customPhrases.length} custom phrases for user ${userId}`)
      } else {
        this.customPhrases = []
      }
    },

    // Add a custom phrase (and save to localStorage)
    addCustomPhrase(userId, phrase) {
      this.customPhrases.unshift(phrase)
      this.saveCustomPhrases(userId)
      console.log('⭐ Custom phrase added:', phrase.en, '/', phrase.cn)
    },

    // Remove a custom phrase
    removeCustomPhrase(userId, phraseId) {
      this.customPhrases = this.customPhrases.filter(p => p.id !== phraseId)
      this.saveCustomPhrases(userId)
      console.log('🗑️ Custom phrase removed:', phraseId)
    },

    // Save custom phrases to localStorage
    saveCustomPhrases(userId) {
      localStorage.setItem(`famlingo_custom_phrases_${userId}`, JSON.stringify(this.customPhrases))
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
