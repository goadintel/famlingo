import { defineStore } from 'pinia'
import { useFamilyStore } from './family'
import coursesData from '../data/courses.json'
import libraryData from '../data/library.json'
import courseCardsData from '../data/course-cards.json'
import studyNotesCardsData from '../data/study-notes-cards.json'

export const useCoursesStore = defineStore('courses', {
  state: () => ({
    levels: coursesData.levels || [],
    vocab: coursesData.vocab || [],
    libraryCategories: libraryData.categories || [],
    courseCards: { ...courseCardsData, ...studyNotesCardsData } || {}
  }),

  getters: {
    // Get a specific level by ID
    getLevelById: (state) => (levelId) => {
      return state.levels.find(l => l.id === levelId)
    },

    // Get a specific lesson by level and lesson ID
    getLessonById: (state) => (levelId, lessonId) => {
      const level = state.levels.find(l => l.id === levelId)
      if (!level) return null
      return level.lessons.find(ls => ls.id === lessonId)
    },

    // Get all lessons across all levels (flat list)
    allLessons: (state) => {
      return state.levels.flatMap(level =>
        (level.lessons || []).map(lesson => ({
          ...lesson,
          levelId: level.id,
          levelName: level.name
        }))
      )
    },

    // Get next/previous lesson navigation
    getAdjacentLessons: (state) => (levelId, lessonId) => {
      const level = state.levels.find(l => l.id === levelId)
      if (!level || !level.lessons) return { prev: null, next: null }

      const lessons = [...level.lessons].sort((a, b) => a.order - b.order)
      const idx = lessons.findIndex(ls => ls.id === lessonId)

      return {
        prev: idx > 0 ? lessons[idx - 1] : null,
        next: idx < lessons.length - 1 ? lessons[idx + 1] : null
      }
    },

    // Get library books by category
    getBooksByCategory: (state) => (categoryId) => {
      const category = state.libraryCategories.find(c => c.id === categoryId)
      return category ? category.books : []
    },

    // Get all library books (flat list)
    allBooks: (state) => {
      return state.libraryCategories.flatMap(cat =>
        (cat.books || []).map(book => ({
          ...book,
          categoryId: cat.id,
          categoryName: cat.name,
          categoryIcon: cat.icon
        }))
      )
    },

    // Calculate level completion percentage
    getLevelProgress: (state) => (levelId) => {
      const familyStore = useFamilyStore()
      const user = familyStore.currentUser
      if (!user || !user.courseProgress) return { completed: 0, total: 0, percent: 0 }

      const level = state.levels.find(l => l.id === levelId)
      if (!level || !level.lessons) return { completed: 0, total: 0, percent: 0 }

      const total = level.lessons.length
      const completed = level.lessons.filter(ls =>
        user.courseProgress[ls.id]?.completed
      ).length

      return {
        completed,
        total,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0
      }
    },

    // Get most recently accessed lesson for "Continue Learning"
    lastAccessedLesson: (state) => {
      const familyStore = useFamilyStore()
      const user = familyStore.currentUser
      if (!user || !user.courseProgress) return null

      let latest = null
      let latestDate = null

      for (const [lessonId, progress] of Object.entries(user.courseProgress)) {
        if (progress.lastAccessed && (!latestDate || progress.lastAccessed > latestDate)) {
          latestDate = progress.lastAccessed
          // Find which level this lesson belongs to
          for (const level of state.levels) {
            const lesson = (level.lessons || []).find(ls => ls.id === lessonId)
            if (lesson) {
              latest = { ...lesson, levelId: level.id, levelName: level.name, progress }
              break
            }
          }
        }
      }

      return latest
    },

    // Get learning cards for a specific lesson
    getCardsForLesson: (state) => (lessonId) => {
      return state.courseCards[lessonId] || null
    },

    // Get total card count for a lesson
    getCardCount: (state) => (lessonId) => {
      const cards = state.courseCards[lessonId]
      if (!cards) return 0
      return (cards.vocab?.length || 0) + (cards.sentences?.length || 0) + (cards.dialogue?.length || 0)
    }
  },

  actions: {
    // Construct full URL for a resource path
    getResourceUrl(relativePath) {
      const apiUrl = localStorage.getItem('famlingo_api_url') || 'https://famlingo-api.com'
      return `${apiUrl}/resources/${relativePath}`
    }
  }
})
