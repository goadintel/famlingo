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
      </div>

      <!-- Playback Settings -->
      <div class="setup-section">
        <h3 class="setup-label">Playback Settings:</h3>

        <!-- Voice Selection -->
        <div class="setting-group">
          <label class="setting-sublabel">Voice:</label>
          <div class="setting-options">
            <div
              :class="['option', { active: voice === 'alloy' }]"
              @click="voice = 'alloy'"
            >
              <span>👩 Female</span>
            </div>
            <div
              :class="['option', { active: voice === 'echo' }]"
              @click="voice = 'echo'"
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
        </div>

        <!-- Progress -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <p class="progress-text">Phrase {{ currentIndex + 1 }} of {{ totalPhrases }}</p>
      </div>

      <!-- Playback Controls -->
      <div class="controls">
        <!-- Previous -->
        <button class="control-btn" @click="prevPhrase">
          <span class="icon">⏮️</span>
          <span class="label">Prev</span>
        </button>

        <!-- Play/Pause -->
        <button class="control-btn-large" @click="togglePlayback">
          <span class="icon-large">{{ isPlaying ? '⏸️' : '▶️' }}</span>
        </button>

        <!-- Next -->
        <button class="control-btn" @click="nextPhrase">
          <span class="icon">⏭️</span>
          <span class="label">Next</span>
        </button>
      </div>

      <!-- Try It Button -->
      <div class="try-it-section">
        <button class="try-it-btn" @click="tryItNow">
          🎤 Try It Now
        </button>
        <p class="try-it-hint">Record yourself and get AI feedback</p>
      </div>

      <!-- Change Setup Button -->
      <div class="change-setup" @click="showSetup">
        <span>🔄 Change Settings</span>
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
const voice = ref('alloy') // OpenAI TTS voices: alloy (female), echo (male)
const loopMode = ref(false)
const maxPhrases = ref(20)
const selectedCategory = ref(null)

// Categories
const categories = ref([])

// Loading states
const loading = ref(true)
const setupVisible = ref(true)

// Audio management
let audioContext = null
let currentAudio = null
let playbackTimeout = null

// Load categories
onMounted(() => {
  loadCategories()
  loading.value = false
})

// Cleanup on unmount
onUnmounted(() => {
  stopPlayback()
})

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

function loadPhrases(category) {
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

  // Shuffle for variety
  loadedPhrases = shuffleArray(loadedPhrases)

  // Limit phrases based on maxPhrases setting
  if (maxPhrases.value > 0) {
    loadedPhrases = loadedPhrases.slice(0, maxPhrases.value)
  }

  phrases.value = loadedPhrases
  allPhrases.value = [...loadedPhrases]
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
  await playCurrentPhrase()
}

function pauseListening() {
  isPlaying.value = false
  isPaused.value = true
  stopPlayback()
}

function resumeListening() {
  isPlaying.value = true
  isPaused.value = false
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

  try {
    // Play English first
    await playText(currentPhrase.value.en, 'en-US')
    await sleep(1000)

    // Play Chinese (repeat based on settings)
    for (let i = 0; i < repeatCount.value; i++) {
      if (!isPlaying.value) break
      await playText(currentPhrase.value.cn, 'zh-CN')
      if (i < repeatCount.value - 1) {
        await sleep(pauseDuration.value)
      }
    }

    // Pause before next phrase
    await sleep(pauseDuration.value)

    // Auto-advance to next phrase
    if (isPlaying.value) {
      nextPhrase()
    }
  } catch (error) {
    console.error('Playback error:', error)
  }
}

async function playText(text, lang) {
  return new Promise((resolve, reject) => {
    if (!isPlaying.value) {
      resolve()
      return
    }

    // Use Web Speech API for TTS
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.voice = getVoice(lang)

    utterance.onend = () => resolve()
    utterance.onerror = (error) => {
      console.error('Speech error:', error)
      resolve() // Continue even if there's an error
    }

    window.speechSynthesis.speak(utterance)
  })
}

function getVoice(lang) {
  const voices = window.speechSynthesis.getVoices()
  // Try to find a voice matching the language
  const matchingVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]))
  return matchingVoice || voices[0]
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
      currentIndex.value = 0
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
}
</script>

<style scoped>
.listen-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 2em;
  margin-bottom: 5px;
  color: #4CAF50;
}

.subtitle {
  color: #666;
  font-size: 0.9em;
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

/* Listening Content */
.content {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.phrase-display {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.phrase-card {
  text-align: center;
  margin-bottom: 20px;
}

.english {
  font-size: 1.8em;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.chinese {
  font-size: 2.5em;
  font-weight: 700;
  color: #4CAF50;
  margin-bottom: 5px;
}

.pinyin {
  font-size: 1.2em;
  color: #666;
  font-style: italic;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s;
}

.progress-text {
  text-align: center;
  color: #666;
  font-size: 0.9em;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.control-btn, .control-btn-large {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.control-btn {
  width: 70px;
  height: 70px;
}

.control-btn-large {
  width: 90px;
  height: 90px;
}

.control-btn:hover, .control-btn-large:hover {
  transform: scale(1.05);
  border-color: #4CAF50;
}

.icon {
  font-size: 1.5em;
}

.icon-large {
  font-size: 2.5em;
}

.label {
  font-size: 0.7em;
  color: #666;
  margin-top: 2px;
}

.try-it-section {
  text-align: center;
  margin-bottom: 20px;
}

.try-it-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  margin-bottom: 8px;
}

.try-it-btn:hover {
  transform: translateY(-2px);
}

.try-it-hint {
  font-size: 0.85em;
  color: #666;
}

.change-setup {
  text-align: center;
  padding: 12px;
  color: #2196F3;
  cursor: pointer;
  font-weight: 500;
}

.change-setup:hover {
  text-decoration: underline;
}
</style>
