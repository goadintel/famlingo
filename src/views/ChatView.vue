<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 pb-48">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Header -->
      <header class="bg-white rounded-t-2xl shadow-xl p-6">
        <BilingualText
          en="Chat"
          cn="聊天"
          class="text-3xl font-bold"
        />
      </header>

      <!-- Chat Mode Tabs -->
      <div class="bg-white flex border-t border-gray-100">
        <button
          v-for="mode in chatModes"
          :key="mode.id"
          @click="chatMode = mode.id"
          :class="[
            'flex-1 py-4 px-3 text-center border-b-4 transition-all',
            chatMode === mode.id ? 'border-purple-600' : 'border-transparent'
          ]"
        >
          <div class="text-3xl mb-1">{{ mode.icon }}</div>
          <div :class="['text-xs font-medium', chatMode === mode.id ? 'text-purple-600' : 'text-gray-500']">
            {{ mode.label }}
          </div>
        </button>
      </div>

      <!-- AI Practice Bot -->
      <div v-if="chatMode === 'ai'" class="bg-white rounded-b-2xl shadow-xl p-6 mb-4 min-h-[600px] flex flex-col">
        <div class="flex items-center gap-3 pb-4 border-b-2 border-gray-100 mb-4">
          <span class="text-4xl">🤖</span>
          <div class="flex-1">
            <div class="text-xl font-bold text-gray-800">AI Language Tutor</div>
            <div class="text-sm text-gray-500">Practice conversations • Get instant feedback</div>
          </div>
        </div>

        <!-- Conversation Starters -->
        <div v-if="aiMessages.length === 0" class="mb-6">
          <div class="text-xs text-gray-500 mb-3">Start a conversation / 开始对话:</div>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="starter in conversationStarters"
              :key="starter.id"
              @click="useStarter(starter.text)"
              class="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 hover:border-purple-400 hover:shadow-lg transition-all text-left"
            >
              <div class="text-3xl mb-2">{{ starter.icon }}</div>
              <div class="text-xs text-gray-700 leading-tight">{{ starter.text }}</div>
            </button>
          </div>
        </div>

        <!-- AI Chat Messages -->
        <div class="flex-1 overflow-y-auto mb-4 space-y-4" ref="aiMessagesContainer">
          <div
            v-for="message in aiMessages"
            :key="message.id"
            :class="['flex gap-3 animate-fadeIn', message.role === 'user' ? 'flex-row-reverse' : '']"
          >
            <div :class="['w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0',
                         message.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-purple-600 to-pink-500']">
              {{ message.role === 'user' ? '👤' : '🤖' }}
            </div>
            <div class="flex-1 flex flex-col gap-2">
              <!-- Message Text with Chunks -->
              <div :class="['px-4 py-3 rounded-2xl text-sm leading-relaxed',
                           message.role === 'user' ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white' : 'bg-purple-50 text-gray-800']">
                <span
                  v-for="(chunk, chunkIdx) in message.chunks"
                  :key="chunkIdx"
                  @click="playChunkAudio(chunk.text, message.id, chunkIdx)"
                  :class="['block px-2 py-1 my-1 rounded cursor-pointer transition-all border border-transparent hover:border-purple-300',
                           chunk.playing ? 'bg-yellow-200 border-yellow-400 font-medium animate-pulse' : '']"
                  :title="'Click to hear: ' + chunk.text"
                >{{ chunk.text }}</span>
              </div>

              <div v-if="message.translation" class="bg-yellow-50 border-l-4 border-yellow-400 px-3 py-2 rounded text-xs">
                <div class="font-semibold text-yellow-800 text-[10px]">译文:</div>
                <div class="text-gray-700">{{ message.translation }}</div>
              </div>

              <div v-if="message.pinyin" class="text-xs text-gray-500 italic px-1">{{ message.pinyin }}</div>

              <div v-if="message.feedback" class="bg-blue-50 border-l-4 border-blue-400 px-3 py-2 rounded text-xs flex gap-2">
                <span>💡</span>
                <span class="text-blue-900">{{ message.feedback }}</span>
              </div>

              <!-- Enhanced Tips Section -->
              <div v-if="message.tips" class="border-2 border-indigo-200 rounded-xl overflow-hidden bg-indigo-50">
                <button
                  @click="toggleTips(message.id)"
                  class="w-full flex items-center px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:bg-indigo-100 transition-colors"
                >
                  <span class="text-2xl mr-2">📚</span>
                  <span class="flex-1 text-left text-sm font-semibold text-indigo-700">Learning Tips / 学习提示</span>
                  <span class="text-indigo-600 font-bold">{{ message.tipsExpanded ? '▼' : '▶' }}</span>
                </button>

                <div v-if="message.tipsExpanded" class="p-4 bg-white animate-slideDown">
                  <!-- Grammar Tips -->
                  <div v-if="message.tips.grammar?.length" class="mb-4">
                    <div class="text-xs font-semibold text-indigo-700 mb-2 pb-2 border-b-2 border-indigo-100">📝 Grammar / 语法</div>
                    <div v-for="(tip, idx) in message.tips.grammar" :key="idx" class="flex gap-2 mb-2 pl-2">
                      <span class="text-indigo-500 text-lg">•</span>
                      <span class="text-xs text-gray-700 leading-relaxed">{{ tip }}</span>
                    </div>
                  </div>

                  <!-- Vocabulary Tips -->
                  <div v-if="message.tips.vocabulary?.length" class="mb-4">
                    <div class="text-xs font-semibold text-indigo-700 mb-2 pb-2 border-b-2 border-indigo-100">📖 Vocabulary / 词汇</div>
                    <div v-for="(tip, idx) in message.tips.vocabulary" :key="idx" class="flex gap-2 mb-2 pl-2">
                      <span class="text-indigo-500 text-lg">•</span>
                      <span class="text-xs text-gray-700 leading-relaxed">{{ tip }}</span>
                    </div>
                  </div>

                  <!-- Pronunciation Tips -->
                  <div v-if="message.tips.pronunciation?.length" class="mb-4">
                    <div class="text-xs font-semibold text-indigo-700 mb-2 pb-2 border-b-2 border-indigo-100">🗣️ Pronunciation / 发音</div>
                    <div v-for="(tip, idx) in message.tips.pronunciation" :key="idx" class="flex gap-2 mb-2 pl-2">
                      <span class="text-indigo-500 text-lg">•</span>
                      <span class="text-xs text-gray-700 leading-relaxed">{{ tip }}</span>
                    </div>
                  </div>

                  <!-- Culture Tips -->
                  <div v-if="message.tips.culture?.length">
                    <div class="text-xs font-semibold text-indigo-700 mb-2 pb-2 border-b-2 border-indigo-100">🌏 Culture / 文化</div>
                    <div v-for="(tip, idx) in message.tips.culture" :key="idx" class="flex gap-2 mb-2 pl-2">
                      <span class="text-indigo-500 text-lg">•</span>
                      <span class="text-xs text-gray-700 leading-relaxed">{{ tip }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-[10px] text-gray-400 text-right px-1">{{ message.time }}</div>
            </div>

            <!-- Action Buttons -->
            <div v-if="message.role === 'ai'" class="flex gap-2 items-start">
              <button
                @click="playMessageAudio(message.text, message.id)"
                class="bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 text-xs transition-all"
              >
                {{ playingAudioId === message.id ? '⏸️' : '🔊' }}
              </button>
              <button
                v-if="message.canSave"
                @click="saveMessageAsPhrase(message)"
                class="bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 text-xs transition-all"
              >
                💾
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Family Group Chat -->
      <div v-if="chatMode === 'family'" class="bg-white rounded-b-2xl shadow-xl p-6 mb-4 min-h-[600px] flex flex-col">
        <div class="flex items-center gap-3 pb-4 border-b-2 border-gray-100 mb-4">
          <span class="text-4xl">👨‍👩‍👧‍👦</span>
          <div class="flex-1">
            <div class="text-xl font-bold text-gray-800">{{ familyName }} Family</div>
            <div class="text-sm text-gray-500">{{ familyMembers.length }} members • Practice together</div>
          </div>
        </div>

        <!-- Family Chat Messages -->
        <div class="flex-1 overflow-y-auto mb-4 space-y-4" ref="familyMessagesContainer">
          <div
            v-for="message in familyMessages"
            :key="message.id"
            :class="['flex gap-3 animate-fadeIn', message.userId === currentUserId ? 'flex-row-reverse' : '']"
          >
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-xl flex-shrink-0">
              {{ message.userAvatar }}
            </div>
            <div class="flex-1 flex flex-col gap-2">
              <div class="text-xs font-semibold text-gray-500">{{ message.userName }}</div>
              <div class="px-4 py-3 rounded-2xl text-sm bg-gray-100 text-gray-800">
                {{ message.text }}
              </div>
              <div v-if="message.autoTranslate && message.translation" class="bg-yellow-50 border-l-4 border-yellow-400 px-3 py-2 rounded text-xs">
                <div class="font-semibold text-yellow-800 text-[10px]">🌐 Auto-translated:</div>
                <div class="text-gray-700">{{ message.translation }}</div>
              </div>
              <div class="text-[10px] text-gray-400 text-right">{{ message.time }}</div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="familyMessages.length === 0" class="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div class="text-7xl mb-4">💬</div>
          <div class="text-2xl font-semibold text-gray-800 mb-2">Start chatting with your family!</div>
          <div class="text-sm text-gray-500">Messages will appear here</div>
        </div>
      </div>

      <!-- Translator Helper -->
      <div v-if="chatMode === 'translator'" class="bg-white rounded-b-2xl shadow-xl p-6 mb-4 min-h-[600px] flex flex-col">
        <div class="flex items-center gap-3 pb-4 border-b-2 border-gray-100 mb-4">
          <span class="text-4xl">🌐</span>
          <div class="flex-1">
            <div class="text-xl font-bold text-gray-800">Smart Translator</div>
            <div class="text-sm text-gray-500">Instant translation • Context • Examples</div>
          </div>
        </div>

        <!-- Translation History -->
        <div class="flex-1 overflow-y-auto mb-4 space-y-4" ref="translationContainer">
          <div
            v-for="item in translationHistory"
            :key="item.id"
            class="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200 animate-fadeIn"
          >
            <div class="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
              <span class="text-lg">{{ item.fromLang === 'en' ? 'EN' : '中文' }}</span>
              <div class="text-sm text-gray-800">{{ item.original }}</div>
            </div>
            <div class="text-center text-2xl text-purple-600 py-2">→</div>
            <div class="bg-green-50 rounded-lg p-3 flex items-start gap-2">
              <span class="text-lg">{{ item.toLang === 'en' ? 'EN' : '中文' }}</span>
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-800">{{ item.translated }}</div>
                <div v-if="item.pinyin" class="text-xs text-gray-500 italic mt-1">{{ item.pinyin }}</div>
              </div>
            </div>
            <div v-if="item.context" class="bg-yellow-50 border-l-4 border-yellow-400 px-3 py-2 rounded mt-3 text-xs flex gap-2">
              <span>💡</span>
              <span class="text-yellow-900">{{ item.context }}</span>
            </div>
            <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
              <button
                @click="saveTranslationAsPhrase(item)"
                class="bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 text-xs transition-all"
              >
                💾 Save
              </button>
              <div class="text-[10px] text-gray-400">{{ item.time }}</div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="translationHistory.length === 0" class="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div class="text-7xl mb-4">🌐</div>
          <div class="text-2xl font-semibold text-gray-800 mb-2">Type anything to translate</div>
          <div class="text-sm text-gray-500">Get instant translations with context</div>
        </div>
      </div>
    </div>

    <!-- Input Container (Fixed at bottom) -->
    <div class="fixed bottom-0 left-0 right-0 bg-white shadow-2xl p-4 z-50">
      <div class="container mx-auto max-w-4xl">
        <!-- AI Mode Options -->
        <div v-if="chatMode === 'ai'" class="flex gap-2 mb-3">
          <button
            @click="aiPracticeMode = 'text'"
            :class="['flex-1 py-3 px-3 border-2 rounded-lg text-xs font-medium transition-all',
                     aiPracticeMode === 'text' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-500']"
          >
            ✍️ Text
          </button>
          <button
            @click="aiPracticeMode = 'voice'"
            :class="['flex-1 py-3 px-3 border-2 rounded-lg text-xs font-medium transition-all',
                     aiPracticeMode === 'voice' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-500']"
          >
            🎤 Voice
          </button>
        </div>

        <!-- Text Input -->
        <div class="flex gap-3 items-center">
          <input
            v-model="inputText"
            @keydown.enter="sendMessage"
            :placeholder="inputPlaceholder"
            class="flex-1 px-4 py-3 border-2 border-gray-300 rounded-3xl text-sm bg-gray-50 focus:border-purple-500 focus:outline-none"
          />
          <button
            @click="sendMessage"
            :disabled="!inputText && !isRecording"
            :class="['w-16 h-16 rounded-full text-2xl flex items-center justify-center transition-all shadow-lg',
                     !inputText && !isRecording ? 'bg-gray-300 text-gray-500' : 'bg-gradient-to-br from-purple-600 to-pink-500 text-white hover:scale-105']"
          >
            {{ sending ? '⏳' : '📤' }}
          </button>
        </div>

        <!-- Voice Recording (AI/Family modes) -->
        <div v-if="(chatMode === 'ai' && aiPracticeMode === 'voice') || chatMode === 'family'" class="mt-3">
          <button
            @mousedown="startRecording"
            @mouseup="stopRecording"
            @mouseleave="stopRecording"
            :class="['w-full py-4 px-4 rounded-3xl text-sm font-semibold border-2 transition-all',
                     isRecording ? 'bg-gradient-to-r from-red-600 to-red-500 text-white border-red-600 animate-pulse' : 'bg-gray-100 text-gray-700 border-gray-300']"
          >
            {{ isRecording ? `🔴 Recording... ${recordingDuration}s` : '🎤 Hold to Record' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useFamilyStore } from '../stores/family'
import BilingualText from '../components/BilingualText.vue'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const familyStore = useFamilyStore()

// Chat mode
const chatMode = ref('ai')
const chatModes = [
  { id: 'ai', icon: '🤖', label: 'AI Bot' },
  { id: 'family', icon: '👨‍👩‍👧‍👦', label: 'Family' },
  { id: 'translator', icon: '🌐', label: 'Translator' }
]

// AI Chat
const aiMessages = ref([])
const aiPracticeMode = ref('text')
const playingAudioId = ref(null)

const conversationStarters = [
  { id: 1, icon: '👋', text: '你好！我想练习说中文。\nNǐ hǎo! Wǒ xiǎng liànxí shuō zhōngwén.' },
  { id: 2, icon: '🍜', text: '我想点一碗牛肉面。\nWǒ xiǎng diǎn yī wǎn niúròu miàn.' },
  { id: 3, icon: '🚕', text: '请问去机场怎么走？\nQǐngwèn qù jīchǎng zěnme zǒu?' },
  { id: 4, icon: '🛒', text: '这个多少钱？\nZhège duōshao qián?' }
]

// Family Chat
const familyMessages = ref([])
const familyName = computed(() => familyStore.family?.name?.en || 'My')
const familyMembers = computed(() => familyStore.family?.users || [])
const currentUserId = computed(() => familyStore.currentUser?.id)
const lastMessageTimestamp = ref(0)
let familyPollInterval = null

// Translator
const translationHistory = ref([])

// Input
const inputText = ref('')
const sending = ref(false)
const isRecording = ref(false)
const recordingDuration = ref(0)
let recordingTimer = null
let mediaRecorder = null
let audioChunks = []

const aiMessagesContainer = ref(null)
const familyMessagesContainer = ref(null)
const translationContainer = ref(null)

const inputPlaceholder = computed(() => {
  if (chatMode.value === 'ai') {
    return aiPracticeMode.value === 'text' ? 'Type your message...' : 'Hold button to record...'
  } else if (chatMode.value === 'family') {
    return 'Message your family...'
  } else {
    return 'Type anything to translate...'
  }
})

onMounted(() => {
  loadChatHistory()
  if (chatMode.value === 'family') {
    startFamilyChatPolling()
  }
})

onUnmounted(() => {
  stopFamilyChatPolling()
})

function loadChatHistory() {
  const saved = localStorage.getItem('famlingo_ai_chat')
  if (saved) {
    aiMessages.value = JSON.parse(saved)
  }

  const savedTranslations = localStorage.getItem('famlingo_translations')
  if (savedTranslations) {
    translationHistory.value = JSON.parse(savedTranslations)
  }
}

function saveChatHistory() {
  localStorage.setItem('famlingo_ai_chat', JSON.stringify(aiMessages.value))
  localStorage.setItem('famlingo_translations', JSON.stringify(translationHistory.value))
}

// Text chunking for audio playback
function chunkText(text) {
  // Split on sentence boundaries and limit to 50 chars
  const sentences = text.match(/[^。！？.!?]+[。！？.!?]?/g) || [text]
  const chunks = []

  for (const sentence of sentences) {
    if (sentence.length <= 50) {
      chunks.push({ text: sentence.trim(), playing: false })
    } else {
      // Split long sentences by comma or space
      const parts = sentence.match(/.{1,50}(?:[，,\s]|$)/g) || [sentence]
      parts.forEach(part => {
        if (part.trim()) {
          chunks.push({ text: part.trim(), playing: false })
        }
      })
    }
  }

  return chunks.length > 0 ? chunks : [{ text, playing: false }]
}

async function sendMessage() {
  if (!inputText.value.trim() || sending.value) return

  const text = inputText.value.trim()
  inputText.value = ''
  sending.value = true

  try {
    if (chatMode.value === 'ai') {
      await sendAIMessage(text)
    } else if (chatMode.value === 'family') {
      await sendFamilyMessage(text)
    } else if (chatMode.value === 'translator') {
      await translateText(text)
    }
  } catch (error) {
    console.error('Send message error:', error)
    alert('Error sending message: ' + error.message)
  } finally {
    sending.value = false
  }
}

async function sendAIMessage(text) {
  const currentUser = familyStore.currentUser

  // Add user message
  const userMessage = {
    id: Date.now(),
    role: 'user',
    text,
    chunks: chunkText(text),
    time: formatTime(new Date()),
    canSave: false
  }
  aiMessages.value.push(userMessage)
  await scrollToBottom('ai')

  // Call AI API
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: text,
      conversationHistory: aiMessages.value.slice(-6).map(m => ({ role: m.role, content: m.text })),
      targetLanguage: currentUser?.targetLanguage || 'chinese',
      learningDirection: currentUser?.learningDirection || 'en-to-cn'
    })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'AI request failed')
  }

  // Add AI message
  const aiMessage = {
    id: Date.now() + 1,
    role: 'ai',
    text: data.reply,
    chunks: chunkText(data.reply),
    translation: data.translation,
    pinyin: data.pinyin,
    feedback: data.feedback,
    tips: data.tips,
    tipsExpanded: false,
    time: formatTime(new Date()),
    canSave: true
  }
  aiMessages.value.push(aiMessage)
  saveChatHistory()
  await scrollToBottom('ai')
}

async function sendFamilyMessage(text) {
  const currentUser = familyStore.currentUser

  const response = await fetch(`${API_BASE_URL}/api/family/send-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyId: familyStore.family.id,
      userId: currentUser.id,
      userName: currentUser.name.en,
      userAvatar: currentUser.avatar,
      text
    })
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to send message')
  }

  // Add to local messages
  familyMessages.value.push(data.message)
  lastMessageTimestamp.value = data.message.timestamp
  await scrollToBottom('family')
}

async function translateText(text) {
  const currentUser = familyStore.currentUser
  const direction = currentUser?.learningDirection || 'en-to-cn'

  // Check cache first
  const cached = getTranslationFromCache(text, direction)
  if (cached) {
    translationHistory.value.unshift({
      ...cached,
      id: Date.now(),
      time: formatTime(new Date()) + ' ⚡'
    })
    saveChatHistory()
    await scrollToBottom('translator')
    return
  }

  const response = await fetch(`${API_BASE_URL}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, direction })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Translation failed')
  }

  const translation = {
    id: Date.now(),
    original: text,
    translated: direction === 'en-to-cn' ? data.chinese : data.english,
    pinyin: data.pinyin,
    context: data.context,
    fromLang: direction === 'en-to-cn' ? 'en' : 'cn',
    toLang: direction === 'en-to-cn' ? 'cn' : 'en',
    time: formatTime(new Date())
  }

  translationHistory.value.unshift(translation)
  saveTranslationToCache(text, direction, data)
  saveChatHistory()
  await scrollToBottom('translator')
}

// Translation cache
function getTranslationFromCache(text, direction) {
  const cacheKey = `translation_${direction}_${text.toLowerCase()}`
  const cached = localStorage.getItem(cacheKey)

  if (!cached) return null

  const { data, timestamp } = JSON.parse(cached)
  const age = Date.now() - timestamp
  const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days

  if (age > maxAge) {
    localStorage.removeItem(cacheKey)
    return null
  }

  return data
}

function saveTranslationToCache(text, direction, translationData) {
  const cacheKey = `translation_${direction}_${text.toLowerCase()}`
  localStorage.setItem(cacheKey, JSON.stringify({
    data: translationData,
    timestamp: Date.now()
  }))
}

// Family chat polling
function startFamilyChatPolling() {
  familyPollInterval = setInterval(async () => {
    if (chatMode.value === 'family') {
      await pollFamilyMessages()
    }
  }, 3000)
}

function stopFamilyChatPolling() {
  if (familyPollInterval) {
    clearInterval(familyPollInterval)
    familyPollInterval = null
  }
}

async function pollFamilyMessages() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/family/messages/${familyStore.family.id}?since=${lastMessageTimestamp.value}`
    )
    const data = await response.json()

    if (data.success && data.hasNew) {
      // Filter out own messages
      const newMessages = data.messages.filter(msg => msg.userId !== currentUserId.value)

      if (newMessages.length > 0) {
        familyMessages.value.push(...newMessages)
        lastMessageTimestamp.value = data.lastUpdated
        await scrollToBottom('family')
      }
    }
  } catch (error) {
    console.error('Poll family messages error:', error)
  }
}

// Audio playback
async function playMessageAudio(text, messageId) {
  if (playingAudioId.value === messageId) {
    // Stop playing
    playingAudioId.value = null
    return
  }

  try {
    playingAudioId.value = messageId
    await playAudio(text)
  } catch (error) {
    console.error('Audio playback error:', error)
  } finally {
    playingAudioId.value = null
  }
}

async function playChunkAudio(text, messageId, chunkIdx) {
  try {
    // Mark chunk as playing
    const message = aiMessages.value.find(m => m.id === messageId)
    if (message?.chunks) {
      message.chunks = message.chunks.map((c, idx) => ({
        ...c,
        playing: idx === chunkIdx
      }))
    }

    await playAudio(text)

    // Mark chunk as not playing
    if (message?.chunks) {
      message.chunks = message.chunks.map(c => ({ ...c, playing: false }))
    }
  } catch (error) {
    console.error('Chunk audio error:', error)
  }
}

async function playAudio(text) {
  const response = await fetch(`${API_BASE_URL}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })

  if (!response.ok) {
    throw new Error('TTS request failed')
  }

  const audioBlob = await response.blob()
  const audioUrl = URL.createObjectURL(audioBlob)
  const audio = new Audio(audioUrl)

  return new Promise((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl)
      resolve()
    }
    audio.onerror = reject
    audio.play()
  })
}

// Voice recording
async function startRecording() {
  if (isRecording.value) return

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      await handleRecordedAudio(audioBlob)
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.start()
    isRecording.value = true
    recordingDuration.value = 0

    recordingTimer = setInterval(() => {
      recordingDuration.value++
    }, 1000)
  } catch (error) {
    console.error('Recording error:', error)
    alert('Could not access microphone')
  }
}

function stopRecording() {
  if (!isRecording.value) return

  mediaRecorder?.stop()
  isRecording.value = false

  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }
}

async function handleRecordedAudio(audioBlob) {
  // TODO: Send to Whisper API for transcription
  // For now, just alert
  alert('Voice recording not yet implemented. Please use text input.')
}

// Helper functions
function useStarter(text) {
  inputText.value = text
  sendMessage()
}

function toggleTips(messageId) {
  const message = aiMessages.value.find(m => m.id === messageId)
  if (message) {
    message.tipsExpanded = !message.tipsExpanded
  }
}

function saveMessageAsPhrase(message) {
  // TODO: Implement save to custom phrases
  alert('Save phrase feature coming soon!')
}

function saveTranslationAsPhrase(item) {
  // TODO: Implement save to custom phrases
  alert('Save phrase feature coming soon!')
}

async function scrollToBottom(mode) {
  await nextTick()
  let container
  if (mode === 'ai') container = aiMessagesContainer.value
  else if (mode === 'family') container = familyMessagesContainer.value
  else container = translationContainer.value

  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease;
}

.animate-slideDown {
  animation: slideDown 0.3s ease;
}
</style>
