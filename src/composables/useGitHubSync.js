// GitHub Sync Composable - Like Monster Fitness pattern
// Syncs family data across devices via GitHub

import { ref } from 'vue'
import { useFamilyStore } from '../stores/family'

export function useGitHubSync() {
  const familyStore = useFamilyStore()

  const syncing = ref(false)
  const lastSync = ref(null)
  const syncError = ref(null)

  // Unicode-safe base64 encoding (handles Chinese characters)
  function unicodeToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)))
  }

  // Unicode-safe base64 decoding
  function base64ToUnicode(str) {
    return decodeURIComponent(escape(atob(str)))
  }

  // Get GitHub settings from localStorage
  function getGitHubSettings() {
    const saved = localStorage.getItem('famlingo_github_sync')
    return saved ? JSON.parse(saved) : null
  }

  // Save GitHub settings
  function saveGitHubSettings(token, owner, repo, filePath = 'famlingo-family-data.json') {
    const settings = { token, owner, repo, filePath }
    localStorage.setItem('famlingo_github_sync', JSON.stringify(settings))
    return settings
  }

  // Fetch data from GitHub
  async function fetchFromGitHub() {
    const settings = getGitHubSettings()
    if (!settings) {
      throw new Error('GitHub sync not configured')
    }

    const { token, owner, repo, filePath } = settings
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📝 No remote data found (first sync)')
          return null
        }
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()
      const content = JSON.parse(base64ToUnicode(data.content))

      console.log('📥 Fetched from GitHub:', content)
      return { content, sha: data.sha }
    } catch (error) {
      console.error('❌ Fetch error:', error)
      throw error
    }
  }

  // Push data to GitHub
  async function pushToGitHub(data, message = 'Update family data', retryCount = 0) {
    const settings = getGitHubSettings()
    if (!settings) {
      throw new Error('GitHub sync not configured')
    }

    const { token, owner, repo, filePath } = settings
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`
    const MAX_RETRIES = 3

    try {
      // Get current file SHA (needed for update)
      let sha = null
      try {
        const existing = await fetchFromGitHub()
        if (existing) {
          sha = existing.sha
        }
      } catch (e) {
        // File doesn't exist yet, that's ok
      }

      // Prepare data
      const dataToSync = {
        version: "1.0",
        appVersion: "0.1.0",
        lastSync: new Date().toISOString(),
        family: data.family,
        users: data.family.users
      }

      // Encode content (Unicode-safe for Chinese characters)
      const content = unicodeToBase64(JSON.stringify(dataToSync, null, 2))

      // Push to GitHub
      const body = {
        message: `${message}\n\n🤖 FamLingo Auto-Sync`,
        content: content,
        branch: 'main'
      }

      if (sha) {
        body.sha = sha // Include SHA for update
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        // Handle 409 Conflict - file was updated since we fetched the SHA
        if (response.status === 409 && retryCount < MAX_RETRIES) {
          console.log(`⚠️ Conflict detected, retrying (${retryCount + 1}/${MAX_RETRIES})...`)
          // Wait a bit before retrying to avoid race conditions
          await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)))
          return pushToGitHub(data, message, retryCount + 1)
        }

        const error = await response.json()
        throw new Error(`GitHub API error: ${response.status} - ${error.message}`)
      }

      const result = await response.json()
      console.log('📤 Pushed to GitHub:', result.content.sha)
      return result
    } catch (error) {
      console.error('❌ Push error:', error)
      throw error
    }
  }

  // Sync: Fetch from GitHub, merge with local, push back
  async function syncWithGitHub() {
    syncing.value = true
    syncError.value = null

    try {
      console.log('🔄 Starting GitHub sync...')

      // Fetch remote data
      const remote = await fetchFromGitHub()

      // Get local data
      const localFamily = familyStore.family

      // Merge logic
      let mergedFamily = { ...localFamily }

      if (remote && remote.content) {
        console.log('🔀 Merging remote and local data...')

        // Merge users (combine both, dedupe by ID)
        const remoteUsers = remote.content.users || []
        const localUsers = localFamily.users || []

        const allUsers = [...remoteUsers]
        localUsers.forEach(localUser => {
          const exists = allUsers.find(u => u.id === localUser.id)
          if (!exists) {
            allUsers.push(localUser)
          } else {
            // Merge user data (take local if more recent)
            const remoteUser = allUsers.find(u => u.id === localUser.id)
            if (localUser.stats.lastPractice > remoteUser.stats.lastPractice) {
              Object.assign(remoteUser, localUser)
            }
          }
        })

        mergedFamily.users = allUsers

        // Use remote family name if local not set
        if (!localFamily.id && remote.content.family) {
          mergedFamily = remote.content.family
          mergedFamily.users = allUsers
        }

        console.log(`✅ Merged: ${remoteUsers.length} remote + ${localUsers.length} local = ${allUsers.length} total users`)
      }

      // Update local store
      familyStore.family = mergedFamily
      familyStore.saveFamilyToStorage()

      // Push merged data back to GitHub
      await pushToGitHub({ family: mergedFamily }, 'Sync family data')

      lastSync.value = new Date().toISOString()
      localStorage.setItem('famlingo_last_sync', lastSync.value)

      console.log('✅ Sync complete!')
      return { success: true, userCount: mergedFamily.users.length }

    } catch (error) {
      syncError.value = error.message
      console.error('❌ Sync failed:', error)
      throw error
    } finally {
      syncing.value = false
    }
  }

  // Auto-sync on app load
  async function autoSyncOnLoad() {
    const settings = getGitHubSettings()
    if (!settings) {
      console.log('⏭️ GitHub sync not configured, skipping')
      return
    }

    try {
      await syncWithGitHub()
    } catch (error) {
      console.warn('⚠️ Auto-sync failed:', error.message)
      // Don't throw - app should still work offline
    }
  }

  // Manual sync button
  async function manualSync() {
    return await syncWithGitHub()
  }

  return {
    syncing,
    lastSync,
    syncError,
    getGitHubSettings,
    saveGitHubSettings,
    fetchFromGitHub,
    pushToGitHub,
    syncWithGitHub,
    autoSyncOnLoad,
    manualSync
  }
}
