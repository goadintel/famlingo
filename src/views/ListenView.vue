<template>
  <div class="listen-container">
    <!-- Header -->
    <div class="header">
      <h1 class="title">🎧 Listen Mode</h1>
      <p class="subtitle">Hands-free pronunciation practice</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Loading...</p>
    </div>

    <!-- Setup Panel (shown before starting) -->
    <div v-else-if="setupVisible" class="setup-panel">
      <!-- Category Selection -->
      <div class="setup-section">
        <h3 class="setup-label">Choose Category:</h3>
        <div class="category-scroll">
          <div
            :class="['category-option', { active: selectedCategory === null }]"
            @click="selectCategory(null)"
          >
            <span class="category-icon">🔀</span>
            <span class="category-name">All Categories</span>
            <span class="category-count">(Shuffle)</span>
          </div>
          <div
            v-for="category in categories"
            :key="category.id"
            :class="['category-option', { active: selectedCategory === category.id }]"
            @click="selectCategory(category.id)"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">({{ category.phraseCount }})</span>
          </div>
        </div>
      </div>

      <!-- Number of Phrases -->
      <div class="setup-section">
        <h3 class="setup-label">Number of Phrases:</h3>
        <div class="setup-options">
          <div
            v-for="count in [5, 10, 20, 0]"
            :key="count"
            :class="['setup-option', { active: maxPhrases === count }]"
            @click="maxPhrases = count"
          >
            <span>{{ count === 0 ? 'All' : count }}</span>
          </div>
        </div>
      </div>

      <!-- Loop Mode -->
      <div class="setup-section">
        <div class="loop-toggle" @click="loopMode = !loopMode">
          <span class="loop-label">🔁 Loop Mode (Auto-restart)</span>
          <div :class="['toggle', { active: loopMode }]">
            <div class="toggle-dot"></div>
          </div>
        </div>
        <div v-if="loopMode" class="loop-toggle sub-toggle" @click="shuffleEachLoop = !shuffleEachLoop">
          <span class="loop-label">🎲 Shuffle Each Loop (new phrases)</span>
          <div :class="['toggle', { active: shuffleEachLoop }]">
            <div class="toggle-dot"></div>
          </div>
        </div>
      </div>

      <!-- Playback Settings -->
      <div class="setup-section">
        <h3 class="setup-label">Playback Settings:</h3>

        <!-- Voice Selection -->
        <div class="setting-group">
          <label class="setting-sublabel">Voice:</label>
          <div class="setting-options">
            <div
              :class="['option', { active: voice === 'Cherry' }]"
              @click="voice = 'Cherry'"
            >
              <span>👩 Female</span>
            </div>
            <div
              :class="['option', { active: voice === 'Ethan' }]"
              @click="voice = 'Ethan'"
            >
              <span>👨 Male</span>
            </div>
          </div>
        </div>

        <!-- Repeat Count -->
        <div class="setting-group">
          <label class="setting-sublabel">Repeat Each Phrase:</label>
          <div class="setting-options">
            <div
              v-for="count in [1, 2, 3]"
              :key="count"
              :class="['option', { active: repeatCount === count }]"
              @click="repeatCount = count"
            >
              <span>{{ count }}x</span>
            </div>
          </div>
        </div>

        <!-- Pause Duration -->
        <div class="setting-group">
          <label class="setting-sublabel">Pause Duration:</label>
          <div class="setting-options">
            <div
              :class="['option', { active: pauseDuration === 1000 }]"
              @click="pauseDuration = 1000"
            >
              <span>Short</span>
            </div>
            <div
              :class="['option', { active: pauseDuration === 2000 }]"
              @click="pauseDuration = 2000"
            >
              <span>Medium</span>
            </div>
            <div
              :class="['option', { active: pauseDuration === 3000 }]"
              @click="pauseDuration = 3000"
            >
              <span>Long</span>
            </div>
          </div>
        </div>

        <!-- Playback Speed (Chinese only) -->
        <div class="setting-group">
          <label class="setting-sublabel">Chinese Speed:</label>
          <div class="setting-options">
            <div
              :class="['option', { active: playbackSpeed === 0.5 }]"
              @click="playbackSpeed = 0.5"
            >
              <span>Slow</span>
            </div>
            <div
              :class="['option', { active: playbackSpeed === 0.7 }]"
              @click="playbackSpeed = 0.7"
            >
              <span>Normal</span>
            </div>
            <div
              :class="['option', { active: playbackSpeed === 0.9 }]"
              @click="playbackSpeed = 0.9"
            >
              <span>Fast</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Start Button -->
      <button class="start-btn" @click="startSession">
        ▶️ Start Listening
      </button>
    </div>

    <!-- Main Content (while listening) -->
    <div v-else class="content">
      <!-- Current Phrase Display -->
      <div class="phrase-display">
        <div class="phrase-card">
          <p class="english">{{ currentPhrase?.en }}</p>
          <p class="chinese">{{ currentPhrase?.cn }}</p>
          <p class="pinyin">{{ currentPhrase?.pinyin }}</p>
          <p v-if="currentPhrase?.literalTranslation" class="literal">
            "{{ currentPhrase?.literalTranslation }}"
          </p>
        </div>

        <!-- Progress -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <p class="progress-text">{{ currentIndex + 1 }} / {{ totalPhrases }}</p>
      </div>

      <!-- Playback Controls -->
      <div class="controls">
        <button class="control-btn" @click="prevPhrase">
          <span class="icon">⏮️</span>
        </button>
        <button class="control-btn-large" @click="togglePlayback">
          <span class="icon-large">{{ isPlaying ? '⏸️' : '▶️' }}</span>
        </button>
        <button class="control-btn" @click="nextPhrase">
          <span class="icon">⏭️</span>
        </button>
      </div>

      <!-- Bottom Actions -->
      <div class="bottom-actions">
        <button class="try-it-btn" @click="tryItNow">
          🎤 Try It
        </button>
        <button class="settings-btn" @click="showSetup">
          ⚙️
        </button>
      </div>

      <!-- Wake Lock Status -->
      <div v-if="isPlaying" class="wake-lock-notice">
        🔒 Screen stays on
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '../stores/family'
import phrasesData from '../data/phrases.json'

const router = useRouter()
const familyStore = useFamilyStore()

// State
const phrases = ref([])
const allPhrases = ref([])
const currentIndex = ref(0)
const currentPhrase = computed(() => phrases.value[currentIndex.value])
const totalPhrases = computed(() => phrases.value.length)

// Playback state
const isPlaying = ref(false)
const isPaused = ref(false)
const progress = computed(() => totalPhrases.value > 0 ? ((currentIndex.value + 1) / totalPhrases.value) * 100 : 0)

// Settings
const repeatCount = ref(2)
const pauseDuration = ref(2000)
const voice = ref('Cherry') // Voice: Cherry (female) or Ethan (male) - server maps to OpenAI/Alibaba voices
const playbackSpeed = ref(0.7) // Chinese speech rate: 0.5 (slow), 0.7 (normal), 0.9 (fast)
const loopMode = ref(false)
const shuffleEachLoop = ref(true) // When looping, pick new random phrases each time
const maxPhrases = ref(20)
const selectedCategory = ref(null)
const recentlyPlayedIds = ref([]) // Track recently played to minimize repeats

// Categories
const categories = ref([])

// Loading states
const loading = ref(true)
const setupVisible = ref(true)

// Audio management
let audioContext = null
let currentAudio = null
let playbackTimeout = null
let wakeLock = null
let currentPlaybackId = 0 // Track which phrase playback is active

// Load categories
onMounted(() => {
  loadCategories()
  loading.value = false
  setupMediaSession()
})

// Cleanup on unmount
onUnmounted(() => {
  stopPlayback()
  releaseWakeLock()
})

// Setup Media Session API for background playback and lock screen controls
function setupMediaSession() {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'FamLingo Listen Mode',
      artist: 'Language Practice',
      album: 'FamLingo 家语'
    })

    navigator.mediaSession.setActionHandler('play', () => {
      if (!isPlaying.value) {
        resumeListening()
      }
    })

    navigator.mediaSession.setActionHandler('pause', () => {
      if (isPlaying.value) {
        pauseListening()
      }
    })

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      prevPhrase()
    })

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      nextPhrase()
    })

    console.log('✅ Media Session API configured for background playback')
  }
}

// Update media session with current phrase
function updateMediaSessionMetadata() {
  if ('mediaSession' in navigator && currentPhrase.value) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentPhrase.value.cn,
      artist: currentPhrase.value.en,
      album: 'FamLingo 家语'
    })
    navigator.mediaSession.playbackState = isPlaying.value ? 'playing' : 'paused'
  }
}

function loadCategories() {
  categories.value = phrasesData.categories.map(cat => ({
    id: cat.id,
    name: cat.name.en,
    nameCn: cat.name.cn,
    icon: cat.icon,
    phraseCount: cat.phrases.length
  }))
}

function selectCategory(categoryId) {
  selectedCategory.value = categoryId
}

async function startSession() {
  loadPhrases(selectedCategory.value)
  setupVisible.value = false
  // Auto-start playback after a brief delay
  setTimeout(() => {
    startListening()
  }, 500)
}

function loadPhrases(category, isReshuffle = false) {
  let loadedPhrases = []

  // Filter by category if specified
  phrasesData.categories.forEach(cat => {
    if (!category || cat.id === category) {
      cat.phrases.forEach(phrase => {
        loadedPhrases.push({
          ...phrase,
          categoryId: cat.id,
          categoryName: cat.name.en,
          categoryIcon: cat.icon
        })
      })
    }
  })

  // Store all available phrases
  if (!isReshuffle) {
    allPhrases.value = [...loadedPhrases]
  }

  // If reshuffling with minimal overlap, prioritize phrases not recently played
  if (isReshuffle && shuffleEachLoop.value && recentlyPlayedIds.value.length > 0) {
    // Separate into not-recently-played and recently-played
    const notRecent = loadedPhrases.filter(p => !recentlyPlayedIds.value.includes(p.id))
    const recent = loadedPhrases.filter(p => recentlyPlayedIds.value.includes(p.id))

    // Shuffle both groups
    const shuffledNotRecent = shuffleArray(notRecent)
    const shuffledRecent = shuffleArray(recent)

    // Prioritize not-recently-played, then fill with recent if needed
    loadedPhrases = [...shuffledNotRecent, ...shuffledRecent]
  } else {
    // Regular shuffle
    loadedPhrases = shuffleArray(loadedPhrases)
  }

  // Limit phrases based on maxPhrases setting
  if (maxPhrases.value > 0) {
    loadedPhrases = loadedPhrases.slice(0, maxPhrases.value)
  }

  // Track these as recently played (keep last 2-3 batches worth)
  const newIds = loadedPhrases.map(p => p.id)
  recentlyPlayedIds.value = [...newIds, ...recentlyPlayedIds.value].slice(0, maxPhrases.value * 3)

  phrases.value = loadedPhrases
  currentIndex.value = 0
}

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

async function startListening() {
  if (phrases.value.length === 0) return

  isPlaying.value = true
  isPaused.value = false

  // Request wake lock to keep screen on
  await requestWakeLock()

  await playCurrentPhrase()
}

function pauseListening() {
  isPlaying.value = false
  isPaused.value = true
  stopPlayback()
  releaseWakeLock()
}

async function resumeListening() {
  isPlaying.value = true
  isPaused.value = false
  await requestWakeLock()
  playCurrentPhrase()
}

function stopPlayback() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  if (playbackTimeout) {
    clearTimeout(playbackTimeout)
    playbackTimeout = null
  }
}

async function playCurrentPhrase() {
  if (!currentPhrase.value || !isPlaying.value) return

  // Update lock screen / notification with current phrase
  updateMediaSessionMetadata()

  // Increment playback ID to track this specific playback session
  currentPlaybackId++
  const myPlaybackId = currentPlaybackId

  try {
    // Play English first
    await playText(currentPhrase.value.en, 'en-US')
    if (myPlaybackId !== currentPlaybackId) return // User skipped, abort

    await sleep(1000)
    if (myPlaybackId !== currentPlaybackId) return

    // Play Chinese (repeat based on settings)
    // Speed progression: first at normal, then progressively slower for learning
    const baseSpeed = playbackSpeed.value
    for (let i = 0; i < repeatCount.value; i++) {
      if (!isPlaying.value || myPlaybackId !== currentPlaybackId) break

      // Calculate speed for this repetition: first=fast, last=slow
      // e.g., 3 repeats with baseSpeed 0.7: [0.9, 0.7, 0.5]
      let repSpeed = baseSpeed
      if (repeatCount.value > 1) {
        const speedRange = 0.4 // Range from fastest to slowest
        const step = speedRange / (repeatCount.value - 1)
        repSpeed = baseSpeed + 0.2 - (i * step) // Start 0.2 faster, end 0.2 slower
        repSpeed = Math.max(0.4, Math.min(1.0, repSpeed)) // Clamp to valid range
      }

      await playTextWithAPI(currentPhrase.value.cn, 'zh-CN', repSpeed)
      if (myPlaybackId !== currentPlaybackId) return
      if (i < repeatCount.value - 1) {
        await sleep(pauseDuration.value)
        if (myPlaybackId !== currentPlaybackId) return
      }
    }

    // Pause before next phrase
    await sleep(pauseDuration.value)
    if (myPlaybackId !== currentPlaybackId) return

    // Auto-advance to next phrase
    if (isPlaying.value && myPlaybackId === currentPlaybackId) {
      nextPhrase()
    }
  } catch (error) {
    console.error('Playback error:', error)
  }
}

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://famlingo-api.com'

async function playText(text, lang) {
  if (!isPlaying.value) return

  console.log('🔊 playText called:', { text, lang, voice: voice.value })

  // Use API for all TTS:
  // - English: OpenAI TTS (native quality)
  // - Chinese: Alibaba TTS (proper tones)
  const speed = lang === 'en-US' ? 1.0 : playbackSpeed.value
  return playTextWithAPI(text, lang, speed)
}

// Play text via API (server routes to OpenAI for English, Alibaba for Chinese)
async function playTextWithAPI(text, lang, speed) {
  if (!isPlaying.value) return

  try {
    // Use backend TTS API - Alibaba Cloud Qwen3-TTS for Chinese
    const requestBody = {
      text,
      voice: voice.value, // 'Cherry' (female) or 'Ethan' (male)
      language: lang,
      speed: speed
    }
    console.log('📤 TTS Request:', requestBody, `(speed: ${speed.toFixed(2)})`)

    const response = await fetch(`${API_BASE_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error('TTS API failed: ' + response.status)
    }

    // API returns JSON with audioUrl
    const data = await response.json()
    console.log('📥 TTS Response:', data)
    const audioUrl = `${API_BASE_URL}${data.audioUrl}`
    console.log('🎵 Playing audio from:', audioUrl)

    return new Promise((resolve) => {
      if (!isPlaying.value) {
        resolve()
        return
      }

      // Stop any existing audio first
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.src = ''
        currentAudio = null
      }

      const audio = new Audio()
      currentAudio = audio
      let hasStartedPlaying = false
      let resolved = false

      const safeResolve = () => {
        if (!resolved) {
          resolved = true
          resolve()
        }
      }

      audio.onended = () => {
        console.log('✅ Audio ended')
        safeResolve()
      }
      audio.onerror = (e) => {
        // Only log error if we haven't started playing (ignore spurious errors)
        if (!hasStartedPlaying) {
          console.warn('⚠️ Audio error event (may recover):', e.type)
        }
        // Don't resolve here - wait for canplaythrough or a real failure
      }
      audio.oncanplaythrough = () => {
        if (hasStartedPlaying) return // Already playing
        hasStartedPlaying = true
        console.log('▶️ Audio ready, playing...')
        audio.play().catch((e) => {
          console.error('❌ Audio play() failed:', e)
          safeResolve()
        })
      }

      // Fallback timeout in case audio never loads
      setTimeout(() => {
        if (!hasStartedPlaying && !resolved) {
          console.error('❌ Audio load timeout')
          safeResolve()
        }
      }, 10000)

      // Set source after attaching handlers
      audio.src = audioUrl
      audio.load()
    })
  } catch (error) {
    console.error('❌ TTS API error (skipping phrase):', error)
    // Don't fallback to browser TTS - just skip to avoid wrong voice
    return
  }
}

// Cache for selected English voice
let cachedEnglishVoice = null
let cachedVoiceGender = null
let voicesLoaded = false

// Preload voices on page load
function preloadVoices() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      voicesLoaded = true
      console.log('📢 Voices preloaded:', voices.length, 'voices available')
      resolve(voices)
    } else {
      // Wait for voices to load
      window.speechSynthesis.onvoiceschanged = () => {
        const loadedVoices = window.speechSynthesis.getVoices()
        voicesLoaded = true
        console.log('📢 Voices loaded:', loadedVoices.length, 'voices available')
        resolve(loadedVoices)
      }
      // Fallback timeout
      setTimeout(() => {
        if (!voicesLoaded) {
          console.warn('⚠️ Voice loading timeout')
          resolve([])
        }
      }, 2000)
    }
  })
}

// Call preload on startup
preloadVoices()

// Use device's native speech synthesis for English (sounds more natural)
async function playWithDeviceSpeech(text, lang) {
  if (!isPlaying.value) return

  console.log('🗣️ Using device speech for:', text)

  // Ensure voices are loaded
  if (!voicesLoaded) {
    await preloadVoices()
  }

  return new Promise((resolve) => {
    if (!isPlaying.value) {
      resolve()
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9 // Slightly slower for clarity

    const wantMale = voice.value === 'Ethan'

    // Use cached voice if gender matches
    if (cachedEnglishVoice && cachedVoiceGender === wantMale) {
      utterance.voice = cachedEnglishVoice
    } else {
      // Find and cache appropriate voice
      const voices = window.speechSynthesis.getVoices()

      // Log all available English voices for debugging
      const englishVoices = voices.filter(v => v.lang.startsWith('en'))
      console.log('📢 Available English voices:', englishVoices.map(v => `${v.name} (${v.lang})`))

      if (englishVoices.length > 0) {
        let selectedVoice = null

        // Look for voice with matching gender indicator
        for (const v of englishVoices) {
          const nameLower = v.name.toLowerCase()
          // Check for explicit gender or common name patterns
          const isMaleVoice = nameLower.includes('male') && !nameLower.includes('female') ||
            /\b(david|daniel|james|john|tom|alex|mark|guy|aaron|gordon|rishi|oliver|george|fred|lee|evan)\b/.test(nameLower)
          const isFemaleVoice = nameLower.includes('female') ||
            /\b(samantha|karen|victoria|susan|kate|fiona|moira|tessa|allison|ava|zoe|nicky|siri|ellen|emily)\b/.test(nameLower)

          if (wantMale && isMaleVoice) {
            selectedVoice = v
            break
          } else if (!wantMale && isFemaleVoice) {
            selectedVoice = v
            break
          }
        }

        // Fallback to first English voice
        cachedEnglishVoice = selectedVoice || englishVoices[0]
        cachedVoiceGender = wantMale
        utterance.voice = cachedEnglishVoice
        console.log('🎤 Selected voice:', cachedEnglishVoice?.name, wantMale ? '(wanted male)' : '(wanted female)')
      }
    }

    utterance.onend = () => {
      console.log('✅ Device speech ended')
      resolve()
    }
    utterance.onerror = (e) => {
      console.error('❌ Device speech error:', e)
      resolve()
    }

    window.speechSynthesis.speak(utterance)
  })
}

function sleep(ms) {
  return new Promise(resolve => {
    playbackTimeout = setTimeout(resolve, ms)
  })
}

function togglePlayback() {
  if (isPlaying.value) {
    pauseListening()
  } else if (isPaused.value) {
    resumeListening()
  } else {
    startListening()
  }
}

function prevPhrase() {
  stopPlayback()
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    // Loop to end
    currentIndex.value = phrases.value.length - 1
  }
  if (isPlaying.value) {
    playCurrentPhrase()
  }
}

function nextPhrase() {
  stopPlayback()
  if (currentIndex.value < phrases.value.length - 1) {
    currentIndex.value++
    if (isPlaying.value) {
      playCurrentPhrase()
    }
  } else {
    // Reached end
    if (loopMode.value) {
      // Reshuffle if enabled, otherwise just restart
      if (shuffleEachLoop.value) {
        console.log('🔄 Loop complete - reshuffling with new phrases')
        loadPhrases(selectedCategory.value, true) // true = reshuffle mode
      } else {
        currentIndex.value = 0
      }
      if (isPlaying.value) {
        playCurrentPhrase()
      }
    } else {
      isPlaying.value = false
      isPaused.value = false
    }
  }
}

function tryItNow() {
  // Navigate to practice page with current phrase
  router.push({
    name: 'practice',
    query: { phraseId: currentPhrase.value.id }
  })
}

function showSetup() {
  stopPlayback()
  isPlaying.value = false
  isPaused.value = false
  setupVisible.value = true
  releaseWakeLock()
}

// Wake Lock API to keep screen on during playback
async function requestWakeLock() {
  try {
    // Check if Wake Lock API is supported
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen')
      console.log('✅ Wake Lock acquired - screen will stay on')

      // Handle wake lock release (e.g., when screen locks anyway)
      wakeLock.addEventListener('release', () => {
        console.log('⚠️ Wake Lock released')
      })
    } else {
      console.warn('⚠️ Wake Lock API not supported on this device')
    }
  } catch (err) {
    console.error('❌ Failed to acquire Wake Lock:', err)
  }
}

function releaseWakeLock() {
  if (wakeLock !== null) {
    wakeLock.release()
      .then(() => {
        wakeLock = null
        console.log('🔓 Wake Lock released manually')
      })
      .catch((err) => {
        console.error('❌ Failed to release Wake Lock:', err)
      })
  }
}
</script>

<style scoped>
.listen-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 1.8em;
  margin-bottom: 4px;
  color: #4CAF50;
}

.subtitle {
  color: #666;
  font-size: 0.85em;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}

/* Setup Panel */
.setup-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.setup-section {
  margin-bottom: 25px;
}

.setup-label {
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 12px;
  display: block;
  color: #333;
}

.category-scroll {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px;
}

.category-option {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 6px;
}

.category-option:hover {
  background: #f5f5f5;
}

.category-option.active {
  background: #4CAF50;
  color: white;
}

.category-icon {
  font-size: 1.5em;
  margin-right: 10px;
}

.category-name {
  flex: 1;
  font-weight: 500;
}

.category-count {
  font-size: 0.85em;
  opacity: 0.7;
}

.setup-options {
  display: flex;
  gap: 10px;
}

.setup-option {
  flex: 1;
  padding: 12px;
  text-align: center;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.setup-option:hover {
  border-color: #4CAF50;
}

.setup-option.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.loop-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
}

.loop-toggle.sub-toggle {
  margin-top: 8px;
  margin-left: 16px;
  background: #eef5ee;
  font-size: 0.9em;
}

.loop-label {
  font-weight: 500;
}

.toggle {
  width: 50px;
  height: 26px;
  background: #ccc;
  border-radius: 13px;
  position: relative;
  transition: background 0.3s;
}

.toggle.active {
  background: #4CAF50;
}

.toggle-dot {
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 11px;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

.toggle.active .toggle-dot {
  transform: translateX(24px);
}

.setting-group {
  margin-bottom: 15px;
}

.setting-sublabel {
  display: block;
  font-size: 0.9em;
  color: #666;
  margin-bottom: 8px;
}

.setting-options {
  display: flex;
  gap: 8px;
}

.option {
  flex: 1;
  padding: 10px;
  text-align: center;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9em;
}

.option:hover {
  border-color: #4CAF50;
}

.option.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.start-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.start-btn:hover {
  transform: translateY(-2px);
}

/* Listening Content - fits on one screen */
.content {
  height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.phrase-display {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.phrase-card {
  text-align: center;
}

.english {
  font-size: 1.4em;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.chinese {
  font-size: 2.2em;
  font-weight: 700;
  color: #4CAF50;
  margin-bottom: 4px;
}

.pinyin {
  font-size: 1.1em;
  color: #666;
  font-style: italic;
}

.literal {
  font-size: 0.9em;
  color: #888;
  font-style: italic;
  margin-top: 6px;
}

.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 12px;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s;
}

.progress-text {
  text-align: center;
  color: #666;
  font-size: 0.8em;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.control-btn, .control-btn-large {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn {
  width: 56px;
  height: 56px;
}

.control-btn-large {
  width: 72px;
  height: 72px;
}

.control-btn:hover, .control-btn-large:hover {
  transform: scale(1.05);
  border-color: #4CAF50;
}

.icon {
  font-size: 1.3em;
}

.icon-large {
  font-size: 2em;
}

.bottom-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.try-it-btn {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.try-it-btn:hover {
  transform: translateY(-2px);
}

.settings-btn {
  width: 48px;
  padding: 12px;
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1.2em;
  cursor: pointer;
  transition: all 0.2s;
}

.settings-btn:hover {
  border-color: #4CAF50;
}

.wake-lock-notice {
  text-align: center;
  padding: 6px;
  background: #E8F5E9;
  border-radius: 6px;
  font-size: 0.75em;
  color: #2E7D32;
  flex-shrink: 0;
}
</style>
