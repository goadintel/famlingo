<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full">
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
            🇨🇳 → 🇺🇸
          </button>
          <button
            @click="direction = 'en-to-cn'"
            :class="['px-4 py-2 rounded-md font-medium transition-all text-sm',
                     direction === 'en-to-cn' ? 'bg-white shadow text-purple-700' : 'text-gray-600']"
          >
            🇺🇸 → 🇨🇳
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
          <div class="text-5xl font-bold text-gray-800 mb-4">
            {{ direction === 'cn-to-en' ? currentPhrase.cn : currentPhrase.en }}
          </div>
          <div v-if="direction === 'cn-to-en'" class="text-2xl text-gray-500">
            {{ currentPhrase.pinyin }}
          </div>
        </div>

        <!-- Answer Input or Feedback -->
        <div v-if="!showingAnswer" class="space-y-4">
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
import BilingualText from '../components/BilingualText.vue'
import BilingualButton from '../components/BilingualButton.vue'

const router = useRouter()
const phrasesStore = usePhrasesStore()
const familyStore = useFamilyStore()

// Practice state
const direction = ref('cn-to-en')
const practiceSet = ref([])
const currentIndex = ref(0)
const userAnswer = ref('')
const showingAnswer = ref(false)
const isCorrect = ref(false)
const sessionComplete = ref(false)
const inputRef = ref(null)

// Session stats
const sessionStats = ref({
  correct: 0,
  total: 0,
  accuracy: 0
})

const currentPhrase = computed(() => practiceSet.value[currentIndex.value] || null)
const progress = computed(() => ((currentIndex.value) / practiceSet.value.length) * 100)

onMounted(() => {
  initializePractice()
})

function initializePractice() {
  // Get random 10 phrases for practice
  const allPhrases = phrasesStore.allPhrases
  practiceSet.value = shuffleArray([...allPhrases]).slice(0, 10)
  currentIndex.value = 0
  sessionComplete.value = false
  sessionStats.value = { correct: 0, total: 0, accuracy: 0 }

  // Set direction based on current user preference
  const currentUser = familyStore.currentUser
  if (currentUser) {
    direction.value = currentUser.learningDirection
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function checkAnswer() {
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
</script>
