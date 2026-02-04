// Authentication Composable
// Handles email/password auth with backend

import { ref, computed } from 'vue'

const AUTH_TOKEN_KEY = 'famlingo_auth_token'
const AUTH_EMAIL_KEY = 'famlingo_auth_email'
const AUTH_ACCOUNT_KEY = 'famlingo_account_id'

// Shared state
const authToken = ref(localStorage.getItem(AUTH_TOKEN_KEY) || null)
const authEmail = ref(localStorage.getItem(AUTH_EMAIL_KEY) || null)
const accountId = ref(localStorage.getItem(AUTH_ACCOUNT_KEY) || null)

export function useAuth() {
  const loading = ref(false)
  const error = ref(null)

  // Get API URL
  function getApiUrl() {
    return import.meta.env.VITE_API_URL || localStorage.getItem('famlingo_api_url') || 'http://localhost:3001'
  }

  // Check if logged in
  const isLoggedIn = computed(() => !!authToken.value)

  // Get auth headers
  function getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(authToken.value ? { 'Authorization': `Bearer ${authToken.value}` } : {})
    }
  }

  // Register new account
  async function register(email, password) {
    loading.value = true
    error.value = null

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Save auth data
      authToken.value = data.token
      authEmail.value = data.email
      accountId.value = data.accountId

      localStorage.setItem(AUTH_TOKEN_KEY, data.token)
      localStorage.setItem(AUTH_EMAIL_KEY, data.email)
      localStorage.setItem(AUTH_ACCOUNT_KEY, data.accountId)

      console.log('✅ Registered:', data.email)

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Login
  async function login(email, password) {
    loading.value = true
    error.value = null

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Save auth data
      authToken.value = data.token
      authEmail.value = data.email
      accountId.value = data.accountId

      localStorage.setItem(AUTH_TOKEN_KEY, data.token)
      localStorage.setItem(AUTH_EMAIL_KEY, data.email)
      localStorage.setItem(AUTH_ACCOUNT_KEY, data.accountId)

      console.log('✅ Logged in:', data.email)

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Logout
  function logout() {
    authToken.value = null
    authEmail.value = null
    accountId.value = null

    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_EMAIL_KEY)
    localStorage.removeItem(AUTH_ACCOUNT_KEY)

    // Clear family data too
    localStorage.removeItem('famlingo_family')
    localStorage.removeItem('famlingo_current_user')

    console.log('👋 Logged out')
  }

  // Get current user data (verify token)
  async function getCurrentUser() {
    if (!authToken.value) return null

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        if (response.status === 401) {
          logout()
          return null
        }
        throw new Error('Failed to get user data')
      }

      return await response.json()
    } catch (err) {
      console.warn('⚠️ Could not verify token:', err.message)
      return null
    }
  }

  // Create/update family
  async function saveFamily(nameEn, nameCn) {
    if (!authToken.value) throw new Error('Not logged in')

    const apiUrl = getApiUrl()
    const response = await fetch(`${apiUrl}/api/auth/family`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ nameEn, nameCn })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save family')
    }

    return data.family
  }

  // Get family data
  async function getFamily() {
    if (!authToken.value) return null

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/auth/family`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.family
    } catch (err) {
      console.warn('⚠️ Could not get family:', err.message)
      return null
    }
  }

  // Add family member
  async function addMember(memberData) {
    if (!authToken.value) throw new Error('Not logged in')

    const apiUrl = getApiUrl()
    const response = await fetch(`${apiUrl}/api/auth/members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(memberData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to add member')
    }

    return data.member
  }

  // Update family member
  async function updateMember(memberId, memberData) {
    if (!authToken.value) throw new Error('Not logged in')

    const apiUrl = getApiUrl()
    const response = await fetch(`${apiUrl}/api/auth/members/${memberId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(memberData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update member')
    }

    return data.member
  }

  // Delete family member
  async function deleteMember(memberId) {
    if (!authToken.value) throw new Error('Not logged in')

    const apiUrl = getApiUrl()
    const response = await fetch(`${apiUrl}/api/auth/members/${memberId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete member')
    }

    return true
  }

  // Get phrases for a member
  async function getPhrases(memberId) {
    if (!authToken.value) return []

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/auth/phrases/${memberId}`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) return []

      const data = await response.json()
      return data.phrases || []
    } catch (err) {
      console.warn('⚠️ Could not get phrases:', err.message)
      return []
    }
  }

  // Add phrase for a member
  async function addPhrase(memberId, phrase) {
    if (!authToken.value) throw new Error('Not logged in')

    const apiUrl = getApiUrl()
    const response = await fetch(`${apiUrl}/api/auth/phrases`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ memberId, phrase })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to add phrase')
    }

    return data.phrase
  }

  // Delete phrase
  async function deletePhrase(phraseId) {
    if (!authToken.value) throw new Error('Not logged in')

    const apiUrl = getApiUrl()
    const response = await fetch(`${apiUrl}/api/auth/phrases/${phraseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete phrase')
    }

    return true
  }

  return {
    // State
    loading,
    error,
    authToken,
    authEmail,
    accountId,
    isLoggedIn,

    // Auth methods
    register,
    login,
    logout,
    getCurrentUser,
    getAuthHeaders,

    // Family methods
    saveFamily,
    getFamily,
    addMember,
    updateMember,
    deleteMember,

    // Phrase methods
    getPhrases,
    addPhrase,
    deletePhrase
  }
}
