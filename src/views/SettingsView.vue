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

      <!-- GitHub Sync Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <BilingualText
          en="GitHub Sync Settings"
          cn="GitHub 同步设置"
          class="text-2xl font-bold mb-6"
        />

        <div class="space-y-6">
          <!-- Status -->
          <div v-if="githubSettings" class="bg-green-50 border-2 border-green-300 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-2xl">✅</span>
              <BilingualText
                en="GitHub Sync Enabled"
                cn="GitHub 同步已启用"
                class="font-bold text-green-700"
              />
            </div>
            <div class="text-sm text-gray-600">
              <div>Repository: {{ githubSettings.owner }}/{{ githubSettings.repo }}</div>
              <div>File: {{ githubSettings.filePath }}</div>
              <div v-if="lastSyncTime">Last sync: {{ formatDate(lastSyncTime) }}</div>
            </div>
          </div>

          <div v-else class="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <span class="text-2xl">⚠️</span>
              <BilingualText
                en="GitHub Sync Not Configured"
                cn="GitHub 同步未配置"
                class="font-bold text-yellow-700"
              />
            </div>
          </div>

          <!-- Configuration Form -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                GitHub Personal Access Token / GitHub 个人访问令牌
              </label>
              <input
                v-model="token"
                type="password"
                placeholder="ghp_..."
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm"
              />
              <p class="text-xs text-gray-500 mt-1">
                Create token at: <a href="https://github.com/settings/tokens" target="_blank" class="text-purple-600 hover:underline">github.com/settings/tokens</a>
                <br>Required scopes: <code class="bg-gray-100 px-1 rounded">repo</code>
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Owner / 所有者
                </label>
                <input
                  v-model="owner"
                  type="text"
                  placeholder="goadintel"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Repository / 仓库
                </label>
                <input
                  v-model="repo"
                  type="text"
                  placeholder="famlingo"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                File Path / 文件路径
              </label>
              <input
                v-model="filePath"
                type="text"
                placeholder="famlingo-family-data.json"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <BilingualButton
                en="Save Settings"
                cn="保存设置"
                variant="primary"
                size="lg"
                class="flex-1"
                @click="saveSettings"
              />
              <BilingualButton
                v-if="githubSettings"
                en="Sync Now"
                cn="立即同步"
                variant="secondary"
                size="lg"
                class="flex-1"
                :disabled="syncing"
                @click="syncNow"
              />
            </div>

            <!-- Sync Status -->
            <div v-if="syncing" class="bg-blue-50 rounded-xl p-4 text-center">
              <div class="text-2xl mb-2">🔄</div>
              <BilingualText
                en="Syncing..."
                cn="同步中..."
                class="font-medium text-blue-700"
              />
            </div>

            <div v-if="syncResult" class="bg-green-50 rounded-xl p-4">
              <div class="text-2xl mb-2">✅</div>
              <div class="font-medium text-green-700">
                Sync successful! / 同步成功！
              </div>
              <div class="text-sm text-gray-600 mt-2">
                {{ syncResult.userCount }} users synced / {{ syncResult.userCount }} 个用户已同步
              </div>
            </div>

            <div v-if="syncErrorMsg" class="bg-red-50 rounded-xl p-4">
              <div class="text-2xl mb-2">❌</div>
              <div class="font-medium text-red-700">
                Sync failed / 同步失败
              </div>
              <div class="text-sm text-gray-600 mt-2">
                {{ syncErrorMsg }}
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div class="bg-purple-50 rounded-xl p-6">
            <BilingualText
              en="How GitHub Sync Works"
              cn="GitHub 同步的工作原理"
              class="font-bold text-purple-700 mb-3"
            />
            <ul class="text-sm text-gray-700 space-y-2">
              <li>✅ Data syncs automatically on app load / 应用加载时自动同步数据</li>
              <li>✅ All family members' progress syncs / 所有家庭成员的进度都会同步</li>
              <li>✅ Works across all devices / 在所有设备上都能使用</li>
              <li>✅ Your data stays in your GitHub repo / 您的数据保留在您的 GitHub 仓库中</li>
              <li>✅ Private and secure / 私密且安全</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useGitHubSync } from '../composables/useGitHubSync'
import { useDeepSeek } from '../composables/useDeepSeek'
import BilingualText from '../components/BilingualText.vue'
import BilingualButton from '../components/BilingualButton.vue'

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
</script>
