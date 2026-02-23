// Device Persistence Composable
// Handles device registration and GitHub settings sync with backend

import { ref } from 'vue'

// Device ID key in localStorage
const DEVICE_ID_KEY = 'famlingo_device_id'

export function useDevicePersistence() {
  const loading = ref(false)
  const error = ref(null)

  // Get API URL from environment variable or localStorage or use default
  function getApiUrl() {
    return import.meta.env.VITE_API_URL || localStorage.getItem('famlingo_api_url') || 'http://localhost:3001'
  }

  // Generate a new device ID
  function generateDeviceId() {
    return crypto.randomUUID()
  }

  // Get or create device ID
  function getDeviceId() {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY)
    if (!deviceId) {
      deviceId = generateDeviceId()
      localStorage.setItem(DEVICE_ID_KEY, deviceId)
      console.log('🆔 Generated new device ID:', deviceId.substring(0, 8) + '...')
    }
    return deviceId
  }

  // Get device settings from backend
  async function getDeviceSettings() {
    loading.value = true
    error.value = null

    try {
      const deviceId = getDeviceId()
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/device/${deviceId}`)

      if (!response.ok) {
        throw new Error(`Failed to get device settings: ${response.status}`)
      }

      const data = await response.json()

      if (data.device) {
        console.log('📱 Device settings loaded from backend')
        return {
          githubToken: data.device.githubToken,
          githubOwner: data.device.githubOwner,
          githubRepo: data.device.githubRepo,
          githubFilePath: data.device.githubFilePath,
          familyId: data.device.familyId
        }
      }

      return null
    } catch (err) {
      console.warn('⚠️ Could not load device settings:', err.message)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  // Register device with backend (save settings)
  async function registerDevice(settings) {
    loading.value = true
    error.value = null

    try {
      const deviceId = getDeviceId()
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/device/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId,
          githubToken: settings.githubToken || settings.token,
          githubOwner: settings.githubOwner || settings.owner,
          githubRepo: settings.githubRepo || settings.repo,
          githubFilePath: settings.githubFilePath || settings.filePath,
          familyId: settings.familyId
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to register device: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Device registered with backend')
      return data.device
    } catch (err) {
      console.warn('⚠️ Could not register device:', err.message)
      error.value = err.message
      // Don't throw - app should still work if backend is down
      return null
    } finally {
      loading.value = false
    }
  }

  // Initialize device on app load
  // Returns GitHub settings if found in backend, null otherwise
  async function initializeDevice() {
    console.log('🔄 Initializing device persistence...')

    // First, check if we have local settings
    const localSettings = localStorage.getItem('famlingo_github_sync')

    // Try to get settings from backend
    const backendSettings = await getDeviceSettings()

    if (backendSettings && backendSettings.githubToken) {
      // Backend has settings - use them and update local storage
      const settings = {
        token: backendSettings.githubToken,
        owner: backendSettings.githubOwner,
        repo: backendSettings.githubRepo,
        filePath: backendSettings.githubFilePath || 'famlingo-family-data.json'
      }

      localStorage.setItem('famlingo_github_sync', JSON.stringify(settings))
      console.log('✅ Loaded GitHub settings from backend')

      return settings
    } else if (localSettings) {
      // Only have local settings - push to backend
      const settings = JSON.parse(localSettings)
      const familyData = localStorage.getItem('famlingo_family')
      const familyId = familyData ? JSON.parse(familyData).id : null

      await registerDevice({
        ...settings,
        familyId
      })

      console.log('✅ Pushed local settings to backend')
      return settings
    }

    // No settings anywhere
    console.log('📝 No GitHub settings found - setup required')
    return null
  }

  // Update device settings (call after user enters GitHub token)
  async function saveDeviceSettings(settings, familyId = null) {
    // Save locally first
    const localSettings = {
      token: settings.token || settings.githubToken,
      owner: settings.owner || settings.githubOwner,
      repo: settings.repo || settings.githubRepo,
      filePath: settings.filePath || settings.githubFilePath || 'famlingo-family-data.json'
    }
    localStorage.setItem('famlingo_github_sync', JSON.stringify(localSettings))

    // Then sync to backend
    await registerDevice({
      githubToken: localSettings.token,
      githubOwner: localSettings.owner,
      githubRepo: localSettings.repo,
      githubFilePath: localSettings.filePath,
      familyId
    })

    return localSettings
  }

  return {
    loading,
    error,
    getDeviceId,
    getDeviceSettings,
    registerDevice,
    initializeDevice,
    saveDeviceSettings
  }
}
