<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Header -->
      <header class="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div class="flex items-center justify-between">
          <BilingualText
            en="Settings"
            cn="设置"
            class="text-3xl font-bold"
          />
          <BilingualButton
            en="Back to Dashboard"
            cn="返回仪表盘"
            variant="outline"
            size="sm"
            @click="$router.push('/dashboard')"
          />
        </div>
      </header>

      <!-- Account Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div class="flex justify-between items-center mb-6">
          <BilingualText
            en="Account"
            cn="账户"
            class="text-2xl font-bold"
          />
          <span class="text-xs text-gray-400">v2.1</span>
        </div>

        <div class="space-y-6">
          <!-- Logged in status -->
          <div v-if="auth.isLoggedIn.value" class="bg-green-50 border-2 border-green-300 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-2xl">✅</span>
              <BilingualText
                en="Logged In"
                cn="已登录"
                class="font-bold text-green-700"
              />
            </div>
            <div class="text-sm text-gray-600">
              <div>Email: {{ auth.authEmail.value }}</div>
              <div v-if="familyStore.family?.name">Family: {{ familyStore.family.name.en }} / {{ familyStore.family.name.cn }}</div>
              <div>{{ familyStore.family?.users?.length || 0 }} family members</div>
            </div>
          </div>

          <div v-else class="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <span class="text-2xl">⚠️</span>
              <BilingualText
                en="Not Logged In"
                cn="未登录"
                class="font-bold text-yellow-700"
              />
            </div>
          </div>

          <!-- Logout Button -->
          <BilingualButton
            v-if="auth.isLoggedIn.value"
            en="Logout"
            cn="退出登录"
            variant="outline"
            size="lg"
            class="w-full text-red-600 border-red-300 hover:bg-red-50"
            @click="handleLogout"
          />

          <BilingualButton
            v-else
            en="Login"
            cn="登录"
            variant="primary"
            size="lg"
            class="w-full"
            @click="$router.push('/login')"
          />

          <!-- Info -->
          <div class="bg-blue-50 rounded-xl p-6">
            <BilingualText
              en="About Your Account"
              cn="关于您的账户"
              class="font-bold text-blue-700 mb-3"
            />
            <ul class="text-sm text-gray-700 space-y-2">
              <li>✅ Your data is securely stored on the FamLingo server / 您的数据安全存储在 FamLingo 服务器上</li>
              <li>✅ Custom phrases sync across all your devices / 自定义短语在所有设备间同步</li>
              <li>✅ Logging out will clear local data / 退出登录将清除本地数据</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- DeepSeek AI Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <BilingualText
          en="DeepSeek AI Settings"
          cn="DeepSeek AI 设置"
          class="text-2xl font-bold mb-6"
        />

        <div class="space-y-6">
          <!-- Status -->
          <div v-if="hasDeepSeekKey" class="bg-green-50 border-2 border-green-300 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-2xl">✅</span>
              <BilingualText
                en="DeepSeek AI Enabled"
                cn="DeepSeek AI 已启用"
                class="font-bold text-green-700"
              />
            </div>
            <div class="text-sm text-gray-600">
              <div>Features: Custom phrase translation, pronunciation scoring, AI validation</div>
              <div>功能：自定义短语翻译、发音评分、AI 验证</div>
            </div>
          </div>

          <div v-else class="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <span class="text-2xl">⚠️</span>
              <BilingualText
                en="DeepSeek AI Not Configured"
                cn="DeepSeek AI 未配置"
                class="font-bold text-yellow-700"
              />
            </div>
          </div>

          <!-- Configuration Form -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                DeepSeek API Key / DeepSeek API 密钥
              </label>
              <input
                v-model="deepseekApiKey"
                type="password"
                placeholder="sk-..."
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm"
              />
              <p class="text-xs text-gray-500 mt-1">
                Get your API key at: <a href="https://platform.deepseek.com" target="_blank" class="text-purple-600 hover:underline">platform.deepseek.com</a>
                <br>💰 Cost: ~$0.14 per 1M tokens (very affordable!) / 成本：约 ¥1 每百万 tokens（非常实惠！）
                <br>🇨🇳 Works in China without VPN / 中国大陆可直接访问，无需 VPN
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <BilingualButton
                en="Save API Key"
                cn="保存密钥"
                variant="primary"
                size="lg"
                class="flex-1"
                @click="saveDeepSeekKey"
              />
              <BilingualButton
                v-if="hasDeepSeekKey"
                en="Test AI"
                cn="测试 AI"
                variant="secondary"
                size="lg"
                class="flex-1"
                :disabled="testingAI"
                @click="testAI"
              />
            </div>

            <!-- Test Status -->
            <div v-if="testingAI" class="bg-blue-50 rounded-xl p-4 text-center">
              <div class="text-2xl mb-2">🤖</div>
              <BilingualText
                en="Testing AI connection..."
                cn="测试 AI 连接..."
                class="font-medium text-blue-700"
              />
            </div>

            <div v-if="testResult" class="bg-green-50 rounded-xl p-4">
              <div class="text-2xl mb-2">✅</div>
              <div class="font-medium text-green-700">
                AI test successful! / AI 测试成功！
              </div>
              <div class="text-sm text-gray-600 mt-2">
                {{ testResult }}
              </div>
            </div>

            <div v-if="testError" class="bg-red-50 rounded-xl p-4">
              <div class="text-2xl mb-2">❌</div>
              <div class="font-medium text-red-700">
                AI test failed / AI 测试失败
              </div>
              <div class="text-sm text-gray-600 mt-2">
                {{ testError }}
              </div>
            </div>
          </div>

          <!-- Features Info -->
          <div class="bg-purple-50 rounded-xl p-6">
            <BilingualText
              en="What You Can Do With AI"
              cn="AI 功能介绍"
              class="font-bold text-purple-700 mb-3"
            />
            <ul class="text-sm text-gray-700 space-y-2">
              <li>🌐 <strong>My Common Phrases</strong> - Create custom phrases with AI translation / 创建自定义短语并 AI 翻译</li>
              <li>🎤 <strong>Pronunciation Scoring</strong> - Get AI feedback on your pronunciation / 获取 AI 发音反馈</li>
              <li>✅ <strong>Translation Validation</strong> - AI checks your answers for accuracy / AI 检查您的答案准确性</li>
              <li>💡 <strong>Context & Alternatives</strong> - AI provides usage context and alternatives / AI 提供使用场景和替代说法</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Cache Management Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <BilingualText
          en="Cache & Storage Management"
          cn="缓存与存储管理"
          class="text-2xl font-bold mb-6"
        />

        <div class="space-y-6">
          <!-- Cache Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-purple-50 rounded-xl p-4 text-center">
              <div class="text-3xl font-bold text-purple-600">{{ translationCacheSize }}</div>
              <div class="text-xs text-gray-600 mt-1">Translation Cache / 翻译缓存</div>
              <div class="text-[10px] text-gray-500 mt-1">Max: 100 entries, 30 days</div>
            </div>
            <div class="bg-blue-50 rounded-xl p-4 text-center">
              <div class="text-3xl font-bold text-blue-600">{{ ttsCacheSize }}</div>
              <div class="text-xs text-gray-600 mt-1">Audio Cache / 音频缓存</div>
              <div class="text-[10px] text-gray-500 mt-1">Max: 50 entries, 7 days</div>
            </div>
            <div class="bg-green-50 rounded-xl p-4 text-center">
              <div class="text-3xl font-bold text-green-600">{{ chatHistorySize }}</div>
              <div class="text-xs text-gray-600 mt-1">Chat History / 聊天记录</div>
              <div class="text-[10px] text-gray-500 mt-1">Unlimited</div>
            </div>
          </div>

          <!-- Cache Actions -->
          <div class="space-y-3">
            <BilingualButton
              en="Clear Translation Cache"
              cn="清除翻译缓存"
              variant="outline"
              size="md"
              class="w-full"
              @click="clearTranslationCache"
            />
            <BilingualButton
              en="Clear Audio Cache"
              cn="清除音频缓存"
              variant="outline"
              size="md"
              class="w-full"
              @click="clearAudioCache"
            />
            <BilingualButton
              en="Clear Chat History"
              cn="清除聊天记录"
              variant="outline"
              size="md"
              class="w-full"
              @click="clearChatHistory"
            />
            <BilingualButton
              en="Clear All Data"
              cn="清除所有数据"
              variant="outline"
              size="md"
              class="w-full text-red-600 border-red-300 hover:bg-red-50"
              @click="clearAllData"
            />
          </div>

          <!-- Cache Info -->
          <div class="bg-blue-50 rounded-xl p-6">
            <BilingualText
              en="About Caching"
              cn="关于缓存"
              class="font-bold text-blue-700 mb-3"
            />
            <ul class="text-sm text-gray-700 space-y-2">
              <li>✅ Translations are cached for 30 days to reduce API costs / 翻译缓存 30 天以降低 API 成本</li>
              <li>✅ Audio files are cached for 7 days for faster playback / 音频缓存 7 天以加快播放速度</li>
              <li>✅ Cache is automatically cleaned when limits are reached / 缓存达到限制时自动清理</li>
              <li>✅ Clearing cache will NOT delete your custom phrases / 清除缓存不会删除您的自定义短语</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- GitHub Sync removed - backend server is now source of truth -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGitHubSync } from '../composables/useGitHubSync'
import { useDeepSeek } from '../composables/useDeepSeek'
import { useAuth } from '../composables/useAuth'
import { useFamilyStore } from '../stores/family'
import BilingualText from '../components/BilingualText.vue'
import BilingualButton from '../components/BilingualButton.vue'

const router = useRouter()
const auth = useAuth()
const familyStore = useFamilyStore()

const {
  syncing,
  lastSync,
  syncError,
  getGitHubSettings,
  saveGitHubSettings,
  manualSync
} = useGitHubSync()

const deepSeek = useDeepSeek()

// DeepSeek form fields
const deepseekApiKey = ref('')
const hasDeepSeekKey = ref(false)
const testingAI = ref(false)
const testResult = ref(null)
const testError = ref(null)

// Cache management
const translationCacheSize = ref(0)
const ttsCacheSize = ref(0)
const chatHistorySize = ref(0)

// Form fields
const token = ref('')
const owner = ref('goadintel')
const repo = ref('famlingo')
const filePath = ref('famlingo-family-data.json')

// Status
const githubSettings = ref(null)
const lastSyncTime = ref(null)
const syncResult = ref(null)
const syncErrorMsg = ref(null)

onMounted(() => {
  loadSettings()
  loadDeepSeekSettings()
  updateCacheStats()
})

function loadSettings() {
  githubSettings.value = getGitHubSettings()
  if (githubSettings.value) {
    token.value = '••••••••' // Don't show actual token
    owner.value = githubSettings.value.owner
    repo.value = githubSettings.value.repo
    filePath.value = githubSettings.value.filePath
  }

  const saved = localStorage.getItem('famlingo_last_sync')
  if (saved) {
    lastSyncTime.value = saved
  }
}

function loadDeepSeekSettings() {
  const apiKey = deepSeek.getApiKey()
  if (apiKey) {
    deepseekApiKey.value = '••••••••' // Don't show actual API key
    hasDeepSeekKey.value = true
  }
}

function saveDeepSeekKey() {
  if (!deepseekApiKey.value || deepseekApiKey.value === '••••••••') {
    // Keep existing key if not changed
    if (!hasDeepSeekKey.value) {
      alert('Please enter a DeepSeek API key / 请输入 DeepSeek API 密钥')
      return
    }
  } else {
    deepSeek.saveApiKey(deepseekApiKey.value)
    hasDeepSeekKey.value = true
  }

  alert('DeepSeek API key saved! / DeepSeek API 密钥已保存！')
  testResult.value = null
  testError.value = null
}

async function testAI() {
  testingAI.value = true
  testResult.value = null
  testError.value = null

  try {
    // Simple test: translate "Hello" to Chinese
    const result = await deepSeek.translatePhrase('Hello', 'en-to-cn')
    testResult.value = `Translation test successful: ${result.chinese} (${result.pinyin})`
  } catch (error) {
    testError.value = error.message
  } finally {
    testingAI.value = false
  }
}

function saveSettings() {
  if (!token.value || token.value === '••••••••') {
    // Keep existing token if not changed
    if (!githubSettings.value) {
      alert('Please enter a GitHub token / 请输入 GitHub 令牌')
      return
    }
    token.value = githubSettings.value.token
  }

  if (!owner.value || !repo.value) {
    alert('Please fill all fields / 请填写所有字段')
    return
  }

  saveGitHubSettings(token.value, owner.value, repo.value, filePath.value)
  githubSettings.value = getGitHubSettings()
  alert('Settings saved! / 设置已保存！')
}

async function syncNow() {
  syncResult.value = null
  syncErrorMsg.value = null

  try {
    const result = await manualSync()
    syncResult.value = result
    lastSyncTime.value = new Date().toISOString()
  } catch (error) {
    syncErrorMsg.value = error.message
  }
}

function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleString()
}

// Cache management functions
function updateCacheStats() {
  // Count translation cache entries
  let translationCount = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('translation_')) {
      translationCount++
    }
  }
  translationCacheSize.value = translationCount

  // Count TTS cache entries
  let ttsCount = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('tts_')) {
      ttsCount++
    }
  }
  ttsCacheSize.value = ttsCount

  // Count chat history entries
  const aiChat = localStorage.getItem('famlingo_ai_chat')
  const translations = localStorage.getItem('famlingo_translations')
  chatHistorySize.value = (aiChat ? JSON.parse(aiChat).length : 0) + (translations ? JSON.parse(translations).length : 0)
}

function clearTranslationCache() {
  if (!confirm('Clear all translation cache? This will NOT delete your custom phrases.\n清除所有翻译缓存？这不会删除您的自定义短语。')) {
    return
  }

  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('translation_')) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key))
  updateCacheStats()
  alert(`Cleared ${keysToRemove.length} translation cache entries / 已清除 ${keysToRemove.length} 条翻译缓存`)
}

function clearAudioCache() {
  if (!confirm('Clear all audio cache?\n清除所有音频缓存？')) {
    return
  }

  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('tts_')) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key))
  updateCacheStats()
  alert(`Cleared ${keysToRemove.length} audio cache entries / 已清除 ${keysToRemove.length} 条音频缓存`)
}

function clearChatHistory() {
  if (!confirm('Clear all chat history? This cannot be undone.\n清除所有聊天记录？此操作无法撤消。')) {
    return
  }

  localStorage.removeItem('famlingo_ai_chat')
  localStorage.removeItem('famlingo_translations')
  updateCacheStats()
  alert('Chat history cleared / 聊天记录已清除')
}

function clearAllData() {
  if (!confirm('⚠️ WARNING: Clear ALL data including cache, chat history, and settings? Custom phrases will NOT be deleted.\n\n⚠️ 警告：清除所有数据，包括缓存、聊天记录和设置？自定义短语不会被删除。')) {
    return
  }

  // Clear all cache and chat data, but preserve family data and custom phrases
  const keysToKeep = new Set()
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('famlingo_family') || key?.startsWith('famlingo_user_') || key?.includes('custom_phrases')) {
      keysToKeep.add(key)
    }
  }

  const allKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    allKeys.push(localStorage.key(i))
  }

  let clearedCount = 0
  allKeys.forEach(key => {
    if (!keysToKeep.has(key)) {
      localStorage.removeItem(key)
      clearedCount++
    }
  })

  updateCacheStats()
  alert(`Cleared ${clearedCount} items. Family data and custom phrases preserved.\n已清除 ${clearedCount} 项。家庭数据和自定义短语已保留。`)
}

// Logout - clears all local data and redirects to login
function handleLogout() {
  if (!confirm('Logout and clear all local data? You will need to login again to access your family data.\n\n退出登录并清除所有本地数据？您需要重新登录才能访问家庭数据。')) {
    return
  }

  // Clear auth token
  auth.logout()

  // Clear family store
  familyStore.family = null
  familyStore.currentUserId = null

  // Clear ALL localStorage (fresh start)
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('famlingo_')) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key))

  // Also clear GitHub settings so old data doesn't come back
  localStorage.removeItem('github_token')
  localStorage.removeItem('github_owner')
  localStorage.removeItem('github_repo')
  localStorage.removeItem('github_file_path')

  console.log('🚪 Logged out and cleared all local data')

  // Redirect to login
  router.push('/login')
}
</script>
