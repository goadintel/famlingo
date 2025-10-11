import { defineStore } from 'pinia'
import phrasesData from '../data/phrases.json'

export const usePhrasesStore = defineStore('phrases', {
  state: () => ({
    phrases: phrasesData.categories,
    phases: phrasesData.phases,
    version: phrasesData.version,
    lastUpdated: phrasesData.lastUpdated,
    totalPhrases: phrasesData.totalPhrases
  }),

  getters: {
    // Get all phrases as flat array
    allPhrases: (state) => {
      const all = []
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
      return all
    },

    // Get phrases by category ID
    getPhrasesByCategory: (state) => (categoryId) => {
      const category = state.phrases.find(c => c.id === categoryId)
      return category ? category.phrases : []
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

    // Get all categories
    categories: (state) => state.phrases.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      phase: c.phase,
      phraseCount: c.phrases.length
    }))
  },

  actions: {
    // Initialize phrase library (future: load from IndexedDB or API)
    initialize() {
      console.log(`📚 Phrase library loaded: ${this.totalPhrases} phrases`)
      console.log(`📖 Categories: ${this.phrases.length}`)
      console.log(`🎯 Phases: ${Object.keys(this.phases).length}`)
    }
  }
})
