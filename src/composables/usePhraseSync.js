// Phrase Sync Composable
// Handles syncing custom phrases with backend

import { ref } from 'vue'

export function usePhraseSync() {
  const syncing = ref(false)
  const error = ref(null)

  // Get API URL from environment variable or localStorage or use default
  function getApiUrl() {
    return import.meta.env.VITE_API_URL || localStorage.getItem('famlingo_api_url') || 'http://localhost:3001'
  }

  // Load phrases from backend for a user
  async function loadPhrasesFromBackend(userId) {
    if (!userId) {
      console.warn('⚠️ Cannot load phrases: no userId')
      return []
    }

    syncing.value = true
    error.value = null

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/phrases/${userId}`)

      if (!response.ok) {
        throw new Error(`Failed to load phrases: ${response.status}`)
      }

      const data = await response.json()
      console.log(`📥 Loaded ${data.count} phrases from backend`)
      return data.phrases || []
    } catch (err) {
      console.warn('⚠️ Could not load phrases from backend:', err.message)
      error.value = err.message
      return []
    } finally {
      syncing.value = false
    }
  }

  // Sync all phrases to backend (full sync)
  async function syncPhrasesToBackend(userId, familyId, phrases) {
    if (!userId || !familyId) {
      console.warn('⚠️ Cannot sync phrases: missing userId or familyId')
      return false
    }

    syncing.value = true
    error.value = null

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/phrases/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          familyId,
          phrases
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to sync phrases: ${response.status}`)
      }

      const data = await response.json()
      console.log(`🔄 Synced ${data.synced} phrases to backend`)
      return true
    } catch (err) {
      console.warn('⚠️ Could not sync phrases to backend:', err.message)
      error.value = err.message
      return false
    } finally {
      syncing.value = false
    }
  }

  // Add a single phrase to backend
  async function addPhraseToBackend(userId, familyId, phrase) {
    if (!userId || !familyId || !phrase) {
      console.warn('⚠️ Cannot add phrase: missing required data')
      return false
    }

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/phrases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          familyId,
          phrase
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to add phrase: ${response.status}`)
      }

      console.log(`➕ Added phrase to backend: ${phrase.en || phrase.cn}`)
      return true
    } catch (err) {
      console.warn('⚠️ Could not add phrase to backend:', err.message)
      // Queue for later sync
      queuePhraseForSync(userId, familyId, phrase)
      return false
    }
  }

  // Delete a phrase from backend
  async function deletePhraseFromBackend(phraseId) {
    if (!phraseId) {
      console.warn('⚠️ Cannot delete phrase: no phraseId')
      return false
    }

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/phrases/${phraseId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete phrase: ${response.status}`)
      }

      console.log(`🗑️ Deleted phrase from backend: ${phraseId}`)
      return true
    } catch (err) {
      console.warn('⚠️ Could not delete phrase from backend:', err.message)
      return false
    }
  }

  // Queue phrase for sync when offline
  function queuePhraseForSync(userId, familyId, phrase) {
    const key = 'famlingo_phrase_sync_queue'
    const queue = JSON.parse(localStorage.getItem(key) || '[]')
    queue.push({ userId, familyId, phrase, timestamp: Date.now() })
    localStorage.setItem(key, JSON.stringify(queue))
    console.log('📝 Queued phrase for later sync')
  }

  // Process queued phrases when back online
  async function processQueuedPhrases() {
    const key = 'famlingo_phrase_sync_queue'
    const queue = JSON.parse(localStorage.getItem(key) || '[]')

    if (queue.length === 0) return

    console.log(`🔄 Processing ${queue.length} queued phrases...`)

    const failed = []
    for (const item of queue) {
      const success = await addPhraseToBackend(item.userId, item.familyId, item.phrase)
      if (!success) {
        failed.push(item)
      }
    }

    localStorage.setItem(key, JSON.stringify(failed))

    if (failed.length > 0) {
      console.warn(`⚠️ ${failed.length} phrases still queued`)
    } else {
      console.log('✅ All queued phrases synced')
    }
  }

  // Merge backend phrases with local phrases
  function mergePhraseLists(localPhrases, backendPhrases) {
    const merged = [...backendPhrases]
    const backendIds = new Set(backendPhrases.map(p => p.id))

    // Add any local phrases not in backend
    for (const localPhrase of localPhrases) {
      if (!backendIds.has(localPhrase.id)) {
        merged.push(localPhrase)
      }
    }

    return merged
  }

  return {
    syncing,
    error,
    loadPhrasesFromBackend,
    syncPhrasesToBackend,
    addPhraseToBackend,
    deletePhraseFromBackend,
    processQueuedPhrases,
    mergePhraseLists
  }
}
