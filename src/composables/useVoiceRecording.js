// Voice Recording Composable using Web Audio API
// Works in all modern browsers (Chrome, Firefox, Safari, Edge)

import { ref } from 'vue'

export function useVoiceRecording() {
  const isRecording = ref(false)
  const hasRecording = ref(false)
  const recordingDuration = ref(0)
  const audioBlob = ref(null)
  const audioUrl = ref(null)
  const error = ref(null)

  let mediaRecorder = null
  let audioChunks = []
  let stream = null
  let recordingTimer = null

  /**
   * Start recording audio from microphone
   */
  async function startRecording() {
    try {
      error.value = null
      audioChunks = []

      // Request microphone access
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create MediaRecorder
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      })

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = () => {
        // Create blob from chunks
        const blob = new Blob(audioChunks, { type: 'audio/webm' })
        audioBlob.value = blob
        audioUrl.value = URL.createObjectURL(blob)
        hasRecording.value = true

        // Stop timer
        if (recordingTimer) {
          clearInterval(recordingTimer)
          recordingTimer = null
        }

        // Stop all tracks
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }

        console.log('🎤 Recording stopped, blob size:', blob.size)
      }

      // Start recording
      mediaRecorder.start()
      isRecording.value = true
      recordingDuration.value = 0

      // Start timer
      recordingTimer = setInterval(() => {
        recordingDuration.value++
      }, 1000)

      console.log('🎤 Recording started')

    } catch (err) {
      console.error('❌ Recording error:', err)
      error.value = err.message
      isRecording.value = false

      if (err.name === 'NotAllowedError') {
        error.value = 'Microphone permission denied. Please allow microphone access.'
      } else if (err.name === 'NotFoundError') {
        error.value = 'No microphone found. Please connect a microphone.'
      }
    }
  }

  /**
   * Stop recording
   */
  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      isRecording.value = false
      console.log('⏹️ Stopping recording...')
    }
  }

  /**
   * Play the recorded audio
   */
  function playRecording() {
    if (audioUrl.value) {
      const audio = new Audio(audioUrl.value)
      audio.play()
    }
  }

  /**
   * Reset recording state
   */
  function resetRecording() {
    hasRecording.value = false
    audioBlob.value = null
    if (audioUrl.value) {
      URL.revokeObjectURL(audioUrl.value)
      audioUrl.value = null
    }
    recordingDuration.value = 0
    error.value = null
  }

  /**
   * Upload recorded audio to server
   * @param {string} apiUrl - Backend API URL
   * @returns {Promise<Object>} - Server response with audio URL
   */
  async function uploadRecording(apiUrl) {
    if (!audioBlob.value) {
      throw new Error('No recording to upload')
    }

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob.value, 'recording.webm')

      const response = await fetch(`${apiUrl}/api/upload-audio`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      const data = await response.json()
      console.log('📤 Audio uploaded:', data)

      return data

    } catch (error) {
      console.error('❌ Upload error:', error)
      throw error
    }
  }

  /**
   * Check if browser supports audio recording
   */
  function isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }

  return {
    // State
    isRecording,
    hasRecording,
    recordingDuration,
    audioBlob,
    audioUrl,
    error,

    // Methods
    startRecording,
    stopRecording,
    playRecording,
    resetRecording,
    uploadRecording,
    isSupported
  }
}
