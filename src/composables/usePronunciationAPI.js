// Pronunciation API Composable
// Connects to the backend API for voice analysis

import { ref } from 'vue'

export function usePronunciationAPI() {
  const analyzing = ref(false)
  const error = ref(null)

  // Get API URL from localStorage or use default
  function getApiUrl() {
    return localStorage.getItem('famlingo_api_url') || 'http://localhost:3000'
  }

  // Set API URL
  function setApiUrl(url) {
    localStorage.setItem('famlingo_api_url', url)
  }

  /**
   * Upload audio file and get pronunciation analysis
   * @param {Blob} audioBlob - Recorded audio blob
   * @param {Object} phrase - Phrase being practiced
   * @param {string} region - Region hint ('china', 'international', 'auto')
   * @returns {Promise<Object>} - AI pronunciation feedback
   */
  async function analyzePronunciation(audioBlob, phrase, region = 'auto') {
    analyzing.value = true
    error.value = null

    try {
      const apiUrl = getApiUrl()

      // Step 1: Upload audio file
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      console.log('📤 Uploading audio...')
      const uploadResponse = await fetch(`${apiUrl}/api/upload-audio`, {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`)
      }

      const uploadData = await uploadResponse.json()
      console.log('✅ Audio uploaded:', uploadData)

      // Step 2: Analyze pronunciation
      // Use the provided phrase (which has been filtered by targetLanguage in PracticeView)
      const language = phrase.cn ? 'zh-CN' : 'en-US'
      const expectedPhrase = phrase.cn || phrase.en

      console.log(`🤖 Analyzing ${language} pronunciation...`)
      const analysisResponse = await fetch(`${apiUrl}/api/pronunciation/analyze-pronunciation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audioUrl: uploadData.url,
          expectedPhrase: expectedPhrase,
          expectedPinyin: phrase.pinyin || '',
          expectedEnglish: phrase.en || '',
          language: language,
          region: region
        })
      })

      if (!analysisResponse.ok) {
        throw new Error(`Analysis failed: ${analysisResponse.status}`)
      }

      const analysisData = await analysisResponse.json()
      console.log('✅ Analysis complete:', analysisData)

      return {
        transcription: analysisData.transcription,
        score: analysisData.score,
        feedback: analysisData.feedback?.en || 'Good attempt!',
        feedbackCN: analysisData.feedback?.cn || '做得不错！',
        goodPoints: analysisData.strengths || [],
        improvements: analysisData.improvements || [],
        timestamp: analysisData.timestamp
      }

    } catch (err) {
      console.error('❌ Pronunciation analysis error:', err)
      error.value = err.message
      throw err

    } finally {
      analyzing.value = false
    }
  }

  /**
   * Test API connection
   */
  async function testConnection() {
    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/health`)

      if (!response.ok) {
        throw new Error(`API unavailable: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ API connection successful:', data)
      return true

    } catch (err) {
      console.error('❌ API connection failed:', err)
      return false
    }
  }

  return {
    // State
    analyzing,
    error,

    // Methods
    analyzePronunciation,
    testConnection,
    getApiUrl,
    setApiUrl
  }
}
