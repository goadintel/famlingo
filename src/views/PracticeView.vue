<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full">
      <!-- Subscription Banner -->
      <SubscriptionBanner />

      <!-- Header with Direction Toggle -->
      <div class="flex items-center justify-between mb-8">
        <BilingualButton
          en="Exit"
          cn="退出"
          variant="outline"
          size="sm"
          @click="exitPractice"
        />

        <!-- Direction Toggle -->
        <div class="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            @click="direction = 'cn-to-en'"
            :class="['px-4 py-2 rounded-md font-medium transition-all text-sm',
                     direction === 'cn-to-en' ? 'bg-white shadow text-purple-700' : 'text-gray-600']"
          >
            🇨🇳 → EN
          </button>
          <button
            @click="direction = 'en-to-cn'"
            :class="['px-4 py-2 rounded-md font-medium transition-all text-sm',
                     direction === 'en-to-cn' ? 'bg-white shadow text-purple-700' : 'text-gray-600']"
          >
            EN → 🇨🇳
          </button>
        </div>

        <div class="text-sm text-gray-600">
          {{ currentIndex + 1 }} / {{ practiceSet.length }}
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="w-full h-2 bg-gray-200 rounded-full mb-8">
        <div
          class="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>

      <!-- Practice Card -->
      <div v-if="currentPhrase" class="text-center mb-8">
        <!-- Question -->
        <div class="mb-8">
          <div class="text-sm text-gray-500 mb-4">
            {{ direction === 'cn-to-en' ? 'Translate to English / 翻译成英文' : 'Translate to Chinese / 翻译成中文' }}
          </div>
          <div class="flex items-center justify-center gap-4">
            <div class="text-5xl font-bold text-gray-800">
              {{ direction === 'cn-to-en' ? currentPhrase.cn : currentPhrase.en }}
            </div>
            <button
              @click="playPhrase"
              class="text-3xl hover:scale-110 transition-transform"
              title="Play audio / 播放音频"
            >
              🔊
            </button>
          </div>
          <div v-if="direction === 'cn-to-en'" class="text-2xl text-gray-500 mt-4">
            {{ currentPhrase.pinyin }}
          </div>
        </div>

        <!-- Practice Mode Toggle -->
        <div v-if="!showingAnswer" class="flex justify-center gap-2 mb-4">
          <button
            @click="practiceMode = 'text'"
            :class="['px-4 py-2 rounded-lg font-medium transition-all text-sm',
                     practiceMode === 'text' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600']"
          >
            ⌨️ Text
          </button>
          <button
            @click="practiceMode = 'voice'"
            :class="['px-4 py-2 rounded-lg font-medium transition-all text-sm',
                     practiceMode === 'voice' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600']"
          >
            🎤 Voice
          </button>
        </div>

        <!-- Answer Input or Feedback -->
        <div v-if="!showingAnswer" class="space-y-4">
          <!-- Text Mode -->
          <div v-if="practiceMode === 'text'" class="space-y-4">
            <input
              v-model="userAnswer"
              ref="inputRef"
              type="text"
              :placeholder="direction === 'cn-to-en' ? 'Type English translation...' : 'Type Chinese translation...'"
              class="w-full px-6 py-4 text-xl border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              @keyup.enter="checkAnswer"
            />
            <BilingualButton
              en="Check Answer"
              cn="检查答案"
              variant="primary"
              size="lg"
              class="w-full"
              @click="checkAnswer"
            />
          </div>

          <!-- Voice Mode -->
          <div v-else class="space-y-4">
            <!-- Recording Status -->
            <div class="text-center mb-4">
              <div v-if="pronunciationAPI.analyzing.value" class="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                <div class="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                🤖 Analyzing your pronunciation... {{voiceRecording.recordingDuration.value}}s recorded
              </div>
              <div v-else-if="voiceRecording.isRecording.value" class="flex items-center justify-center gap-2 text-red-600 font-semibold">
                <div class="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                Recording... {{voiceRecording.recordingDuration.value}}s
              </div>
              <div v-else-if="voiceRecording.hasRecording.value" class="text-green-600 font-semibold">
                ✅ Recording complete! {{voiceRecording.recordingDuration.value}}s
              </div>
              <div v-else class="text-gray-600">
                🎙️ Click to start recording
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="voiceRecording.error.value" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {{ voiceRecording.error.value }}
            </div>

            <!-- Record Button (Toggle) -->
            <button
              @click="handleRecordingToggle"
              :disabled="pronunciationAPI.analyzing.value"
              :class="['w-48 h-48 mx-auto rounded-full font-bold text-xl transition-all shadow-lg',
                       pronunciationAPI.analyzing.value
                         ? 'bg-blue-500 text-white cursor-wait animate-pulse'
                         : voiceRecording.isRecording.value
                         ? 'bg-red-500 text-white scale-110 shadow-2xl animate-pulse'
                         : voiceRecording.hasRecording.value
                         ? 'bg-green-500 text-white hover:scale-105'
                         : 'bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:scale-105']"
            >
              <div v-if="pronunciationAPI.analyzing.value">
                🤖<br>Analyzing...<br>
                <span class="text-sm">Please wait</span>
              </div>
              <div v-else-if="voiceRecording.isRecording.value">
                🔴<br>Click to Stop
              </div>
              <div v-else-if="voiceRecording.hasRecording.value">
                ✅<br>Recording Ready
              </div>
              <div v-else>
                🎙️<br>Click to Record
              </div>
            </button>

            <!-- Play Recording - Show AFTER analysis completes -->
            <button
              v-if="showingAnswer && userAnswer"
              @click="voiceRecording.playRecording()"
              class="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm px-4 py-2 border border-purple-300 rounded-lg hover:bg-purple-50"
            >
              ▶️ Play my recording / 播放录音
            </button>

            <!-- Analyzing Status Message -->
            <div v-if="pronunciationAPI.analyzing.value" class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-center justify-center gap-3">
                <div class="animate-spin text-2xl">🤖</div>
                <div class="text-blue-700 font-medium">
                  AI is analyzing your pronunciation...<br>
                  AI 正在分析您的发音...
                </div>
              </div>
            </div>
          </div>

          <button
            @click="showAnswer"
            class="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Show answer / 显示答案
          </button>
        </div>

        <!-- Answer Feedback -->
        <div v-else class="space-y-6">
          <!-- Correct Answer Display -->
          <div class="bg-gray-50 rounded-xl p-6">
            <div class="text-sm text-gray-600 mb-2">Correct Answer / 正确答案:</div>
            <div class="text-3xl font-bold text-gray-800">
              {{ direction === 'cn-to-en' ? currentPhrase.en : currentPhrase.cn }}
            </div>
            <!-- Show pinyin for EN → CN direction -->
            <div v-if="direction === 'en-to-cn'" class="text-xl text-gray-500 mt-3">
              {{ currentPhrase.pinyin }}
            </div>
          </div>

          <!-- User's Answer (if they typed something) -->
          <div v-if="userAnswer" class="bg-gray-50 rounded-xl p-6">
            <div class="text-sm text-gray-600 mb-2">Your Answer / 你的答案:</div>
            <div class="text-2xl font-bold" :class="isCorrect ? 'text-green-600' : 'text-orange-600'">
              {{ userAnswer }}
            </div>
          </div>

          <!-- Feedback -->
          <div :class="['rounded-xl p-6', isCorrect ? 'bg-green-50' : 'bg-blue-50']">
            <div class="text-6xl mb-2">{{ isCorrect ? '✅' : '📝' }}</div>
            <div class="text-xl font-bold" :class="isCorrect ? 'text-green-700' : 'text-blue-700'">
              {{ isCorrect ? 'Correct! / 正确！' : 'Keep learning! / 继续学习！' }}
            </div>
          </div>

          <!-- Context Info -->
          <div class="bg-purple-50 rounded-xl p-4 text-left">
            <div class="text-sm font-medium text-gray-700 mb-2">
              Context / 语境:
            </div>
            <div class="text-sm text-gray-600">
              {{ currentPhrase.context.en }}
            </div>
            <div class="text-sm text-gray-600">
              {{ currentPhrase.context.cn }}
            </div>
          </div>

          <!-- AI Scoring (if enabled) -->
          <div v-if="aiScoring" class="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <div class="text-3xl animate-pulse">🤖</div>
              <div>
                <BilingualText
                  en="AI is analyzing your answer..."
                  cn="AI 正在分析您的答案..."
                  class="font-medium text-blue-700"
                />
              </div>
            </div>
          </div>

          <div v-if="aiFeedback && aiScore !== null" class="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-300 rounded-xl p-6 text-left">
            <div class="flex items-center gap-3 mb-4">
              <div class="text-4xl">🤖</div>
              <div>
                <div class="font-bold text-purple-700 text-lg">AI Pronunciation Score / AI 发音评分</div>
                <div class="text-3xl font-bold text-purple-600 mt-1">{{ aiScore.toFixed(1) }} / 10</div>
              </div>
            </div>

            <!-- AI Feedback -->
            <div class="space-y-3">
              <div class="bg-white rounded-lg p-3">
                <div class="text-xs font-medium text-gray-600 mb-1">Feedback:</div>
                <div class="text-sm text-gray-800">{{ aiFeedback.feedback }}</div>
              </div>

              <div class="bg-white rounded-lg p-3">
                <div class="text-xs font-medium text-gray-600 mb-1">反馈:</div>
                <div class="text-sm text-gray-800">{{ aiFeedback.feedbackCN }}</div>
              </div>

              <!-- Good Points -->
              <div v-if="aiFeedback.goodPoints && aiFeedback.goodPoints.length > 0" class="bg-green-50 rounded-lg p-3">
                <div class="text-xs font-medium text-green-700 mb-2">✅ What you did well:</div>
                <ul class="text-sm text-gray-700 space-y-1">
                  <li v-for="(point, index) in aiFeedback.goodPoints" :key="index" class="flex items-start gap-2">
                    <span>•</span>
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </div>

              <!-- Improvements -->
              <div v-if="aiFeedback.improvements && aiFeedback.improvements.length > 0" class="bg-orange-50 rounded-lg p-3">
                <div class="text-xs font-medium text-orange-700 mb-2">💡 What to improve:</div>
                <ul class="text-sm text-gray-700 space-y-1">
                  <li v-for="(point, index) in aiFeedback.improvements" :key="index" class="flex items-start gap-2">
                    <span>•</span>
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </div>

              <!-- Tips -->
              <div v-if="aiFeedback.tips" class="bg-blue-50 rounded-lg p-3">
                <div class="text-xs font-medium text-blue-700 mb-1">💭 Tips:</div>
                <div class="text-sm text-gray-700">{{ aiFeedback.tips }}</div>
              </div>
            </div>
          </div>

          <!-- Next Button -->
          <BilingualButton
            en="Next Phrase"
            cn="下一个短语"
            variant="primary"
            size="lg"
            class="w-full"
            @click="nextPhrase"
          />
        </div>
      </div>

      <!-- Session Complete -->
      <div v-if="sessionComplete" class="text-center space-y-6">
        <div class="text-6xl mb-4">🎉</div>
        <BilingualText
          en="Session Complete!"
          cn="练习完成！"
          class="text-3xl font-bold"
        />

        <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6">
          <div class="grid grid-cols-3 gap-4">
            <div>
              <div class="text-3xl font-bold text-purple-600">{{ practiceSet.length }}</div>
              <div class="text-sm text-gray-600">Phrases / 短语</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-green-600">{{ sessionStats.correct }}</div>
              <div class="text-sm text-gray-600">Correct / 正确</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-orange-600">{{ sessionStats.accuracy }}%</div>
              <div class="text-sm text-gray-600">Accuracy / 准确率</div>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <BilingualButton
            en="Practice Again"
            cn="再练一次"
            variant="primary"
            size="lg"
            class="flex-1"
            @click="restartPractice"
          />
          <BilingualButton
            en="Dashboard"
            cn="仪表盘"
            variant="secondary"
            size="lg"
            class="flex-1"
            @click="$router.push('/dashboard')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePhrasesStore } from '../stores/phrases'
import { useFamilyStore } from '../stores/family'
import { useDeepSeek } from '../composables/useDeepSeek'
import { useVoiceRecording } from '../composables/useVoiceRecording'
import { usePronunciationAPI } from '../composables/usePronunciationAPI'
import BilingualText from '../components/BilingualText.vue'
import BilingualButton from '../components/BilingualButton.vue'
import SubscriptionBanner from '../components/SubscriptionBanner.vue'

const router = useRouter()
const phrasesStore = usePhrasesStore()
const familyStore = useFamilyStore()
const deepSeek = useDeepSeek()

// Voice recording and API
const voiceRecording = useVoiceRecording()
const pronunciationAPI = usePronunciationAPI()

// Practice state
const direction = ref('cn-to-en')
const practiceMode = ref('voice') // 'text' or 'voice'
const practiceSet = ref([])
const currentIndex = ref(0)
const userAnswer = ref('')
const showingAnswer = ref(false)
const isCorrect = ref(false)
const sessionComplete = ref(false)
const inputRef = ref(null)

// AI scoring state
const aiScoring = ref(false)
const aiScore = ref(null)
const aiFeedback = ref(null)

// Session stats
const sessionStats = ref({
  correct: 0,
  total: 0,
  accuracy: 0
})

const hasDeepSeekKey = computed(() => !!deepSeek.getApiKey())

const currentPhrase = computed(() => practiceSet.value[currentIndex.value] || null)
const progress = computed(() => ((currentIndex.value) / practiceSet.value.length) * 100)

onMounted(() => {
  initializePractice()
})

function initializePractice() {
  const currentUser = familyStore.currentUser

  // Load custom phrases for current user (if not already loaded)
  if (currentUser) {
    phrasesStore.loadCustomPhrases(currentUser.id)
    // Set direction based on user preference
    direction.value = currentUser.learningDirection
  }

  // Get all phrases (includes standard + custom from store)
  const allPhrases = phrasesStore.allPhrases

  // Get random 10 phrases for practice
  practiceSet.value = shuffleArray([...allPhrases]).slice(0, 10)
  currentIndex.value = 0
  sessionComplete.value = false
  sessionStats.value = { correct: 0, total: 0, accuracy: 0 }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

async function checkAnswer() {
  if (!userAnswer.value.trim()) return

  showingAnswer.value = true
  sessionStats.value.total++

  const correctAnswer = direction.value === 'cn-to-en' ? currentPhrase.value.en : currentPhrase.value.cn
  const userAnswerLower = userAnswer.value.toLowerCase().trim()
  const correctAnswerLower = correctAnswer.toLowerCase().trim()

  // Simple check - exact match or contains main words
  isCorrect.value = userAnswerLower === correctAnswerLower || correctAnswerLower.includes(userAnswerLower)

  if (isCorrect.value) {
    sessionStats.value.correct++
  }

  sessionStats.value.accuracy = Math.round((sessionStats.value.correct / sessionStats.value.total) * 100)

  // Optional AI pronunciation scoring (if API key is configured)
  if (hasDeepSeekKey.value && userAnswer.value.trim()) {
    aiScoring.value = true
    aiScore.value = null
    aiFeedback.value = null

    try {
      const phraseText = direction.value === 'cn-to-en' ? currentPhrase.value.cn : currentPhrase.value.en
      const scoring = await deepSeek.scorePronunciation(
        phraseText,
        userAnswer.value,
        correctAnswer
      )

      aiScore.value = scoring.score
      aiFeedback.value = scoring
    } catch (error) {
      console.error('AI scoring error:', error)
      // Fail silently - don't break the user experience
    } finally {
      aiScoring.value = false
    }
  }
}

function showAnswer() {
  showingAnswer.value = true
  isCorrect.value = false
  sessionStats.value.total++
  sessionStats.value.accuracy = Math.round((sessionStats.value.correct / sessionStats.value.total) * 100)
}

async function nextPhrase() {
  if (currentIndex.value < practiceSet.value.length - 1) {
    currentIndex.value++
    userAnswer.value = ''
    showingAnswer.value = false
    isCorrect.value = false

    // Reset AI state
    aiScore.value = null
    aiFeedback.value = null
    aiScoring.value = false

    // Reset voice recording state
    voiceRecording.resetRecording()

    // Focus input
    await nextTick()
    inputRef.value?.focus()
  } else {
    // Session complete
    sessionComplete.value = true

    // Update user stats
    const currentUser = familyStore.currentUser
    if (currentUser) {
      familyStore.updateUserStats(currentUser.id, {
        totalSessions: currentUser.stats.totalSessions + 1,
        totalPhrases: currentUser.stats.totalPhrases + sessionStats.value.total,
        accuracy: ((currentUser.stats.accuracy * currentUser.stats.totalSessions + sessionStats.value.accuracy / 100) / (currentUser.stats.totalSessions + 1))
      })
    }
  }
}

function restartPractice() {
  initializePractice()
}

function exitPractice() {
  if (confirm('Exit practice session? / 退出练习？')) {
    router.push('/dashboard')
  }
}

function playPhrase() {
  if (!currentPhrase.value) return

  const text = direction.value === 'cn-to-en' ? currentPhrase.value.cn : currentPhrase.value.en
  const language = direction.value === 'cn-to-en' ? 'zh-CN' : 'en-US'

  phrasesStore.playAudio(text, language)
}

// Voice recording functions (toggle-based)
async function handleRecordingToggle() {
  if (voiceRecording.isRecording.value) {
    // Stop recording
    voiceRecording.stopRecording()

    // Wait a moment for the recording to be processed
    await new Promise(resolve => setTimeout(resolve, 300))

    // Analyze pronunciation with backend API
    if (voiceRecording.hasRecording.value && voiceRecording.audioBlob.value) {
      await analyzeVoicePronunciation()
    }
  } else {
    // Start new recording
    voiceRecording.resetRecording()
    await voiceRecording.startRecording()
  }
}

async function analyzeVoicePronunciation() {
  try {
    showingAnswer.value = true
    sessionStats.value.total++

    const currentUser = familyStore.currentUser
    if (!currentUser) {
      throw new Error('No family member selected. Please go to the Dashboard and click on a family member to select them, then try again.')
    }

    // Use targetLanguage to determine what language to practice
    // This is independent of direction - user always practices their target language
    const targetLanguage = currentUser.targetLanguage || 'zh-CN'
    const isPracticingChinese = targetLanguage === 'zh-CN'

    // Create a modified phrase object with correct expected phrase
    const phraseForAnalysis = {
      ...currentPhrase.value,
      // Override with the language being practiced
      cn: isPracticingChinese ? currentPhrase.value.cn : null,
      en: !isPracticingChinese ? currentPhrase.value.en : null,
      pinyin: isPracticingChinese ? currentPhrase.value.pinyin : null
    }

    console.log(`🎤 Analyzing ${targetLanguage} pronunciation (direction: ${direction.value})`)

    // Call backend API for pronunciation analysis
    const result = await pronunciationAPI.analyzePronunciation(
      voiceRecording.audioBlob.value,
      phraseForAnalysis,
      'auto' // Let backend auto-detect best transcription service
    )

    // Set AI feedback
    aiScore.value = result.score
    aiFeedback.value = result

    // Set transcription as user answer
    userAnswer.value = result.transcription || ''

    // Check if correct (score >= 8 is considered correct)
    isCorrect.value = result.score >= 8.0

    if (isCorrect.value) {
      sessionStats.value.correct++
    }

    sessionStats.value.accuracy = Math.round((sessionStats.value.correct / sessionStats.value.total) * 100)

    console.log('✅ Voice pronunciation analyzed:', result)

  } catch (error) {
    console.error('❌ Voice pronunciation analysis failed:', error)

    // Show specific error message
    const errorMessage = error.message || 'Failed to analyze pronunciation. Please check that the backend API is running.'
    alert(errorMessage)

    // Reset to allow retry
    showingAnswer.value = false
    voiceRecording.resetRecording()
  }
}
</script>
