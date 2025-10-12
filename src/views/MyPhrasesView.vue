<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Header -->
      <header class="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div class="flex items-center justify-between">
          <BilingualText
            en="My Common Phrases"
            cn="我的常用短语"
            class="text-3xl font-bold"
          />
          <BilingualButton
            en="Back"
            cn="返回"
            variant="outline"
            size="sm"
            @click="$router.push('/dashboard')"
          />
        </div>
      </header>

      <!-- AI Configuration Notice -->
      <div v-if="!hasApiKey" class="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-3xl">⚠️</span>
          <BilingualText
            en="DeepSeek AI Not Configured"
            cn="DeepSeek AI 未配置"
            class="font-bold text-yellow-700"
          />
        </div>
        <p class="text-sm text-gray-700 mb-4">
          Configure your DeepSeek API key in Settings to use AI translation /
          在设置中配置 DeepSeek API 密钥以使用 AI 翻译
        </p>
        <BilingualButton
          en="Go to Settings"
          cn="前往设置"
          variant="primary"
          size="sm"
          @click="$router.push('/settings')"
        />
      </div>

      <!-- Create New Phrase -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <BilingualText
          en="Create New Phrase"
          cn="创建新短语"
          class="text-2xl font-bold mb-6"
        />

        <div class="space-y-6">
          <!-- Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Enter your phrase / 输入您的短语
            </label>
            <textarea
              v-model="inputText"
              rows="3"
              placeholder="Type in English or Chinese... / 用英文或中文输入..."
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            ></textarea>
          </div>

          <!-- Direction -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Translation Direction / 翻译方向
            </label>
            <div class="flex gap-3">
              <button
                @click="direction = 'en-to-cn'"
                :class="['flex-1 py-3 rounded-lg border-2 font-medium transition-all',
                         direction === 'en-to-cn' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300']"
              >
                🇺🇸 → 🇨🇳
                <div class="text-sm">English to Chinese</div>
              </button>
              <button
                @click="direction = 'cn-to-en'"
                :class="['flex-1 py-3 rounded-lg border-2 font-medium transition-all',
                         direction === 'cn-to-en' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300']"
              >
                🇨🇳 → 🇺🇸
                <div class="text-sm">Chinese to English</div>
              </button>
            </div>
          </div>

          <!-- Translate Button -->
          <BilingualButton
            en="Translate with AI"
            cn="AI 翻译"
            variant="primary"
            size="lg"
            class="w-full"
            :disabled="!inputText.trim() || aiLoading || !hasApiKey"
            @click="translate"
          />

          <!-- Loading -->
          <div v-if="aiLoading" class="bg-blue-50 rounded-xl p-6 text-center">
            <div class="text-4xl mb-2">🤖</div>
            <BilingualText
              en="AI is translating..."
              cn="AI 正在翻译..."
              class="font-medium text-blue-700"
            />
          </div>

          <!-- Translation Result -->
          <div v-if="translation" class="space-y-4">
            <!-- Main Translation -->
            <div class="bg-green-50 border-2 border-green-300 rounded-xl p-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-2xl">✅</span>
                <BilingualText
                  en="Translation Result"
                  cn="翻译结果"
                  class="font-bold text-green-700"
                />
              </div>

              <div class="space-y-3">
                <div v-if="direction === 'en-to-cn'">
                  <div class="text-3xl font-bold text-gray-800 mb-2">{{ translation.chinese }}</div>
                  <div class="text-xl text-gray-600 mb-2">{{ translation.pinyin }}</div>
                  <div class="text-sm text-gray-500 italic">Literal: "{{ translation.literal }}"</div>
                </div>
                <div v-else>
                  <div class="text-3xl font-bold text-gray-800 mb-2">{{ translation.english }}</div>
                  <div v-if="translation.pinyin" class="text-xl text-gray-600 mb-2">{{ translation.pinyin }}</div>
                  <div class="text-sm text-gray-500 italic">Literal: "{{ translation.literal }}"</div>
                </div>

                <!-- Context -->
                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="text-sm font-medium text-gray-700 mb-2">Context / 语境:</div>
                  <div class="text-sm text-gray-600">
                    {{ translation.context }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ translation.contextCN }}
                  </div>
                  <div class="text-xs text-gray-500 mt-2">
                    Formality: {{ translation.formality }}
                  </div>
                </div>

                <!-- Alternatives -->
                <div v-if="translation.alternatives && translation.alternatives.length > 0" class="mt-4 pt-4 border-t border-gray-200">
                  <div class="text-sm font-medium text-gray-700 mb-2">Alternatives / 其他说法:</div>
                  <div class="space-y-2">
                    <div
                      v-for="(alt, index) in translation.alternatives"
                      :key="index"
                      class="bg-white rounded-lg p-3 border border-gray-200"
                    >
                      <div class="font-bold">{{ direction === 'en-to-cn' ? alt.chinese : alt.english }}</div>
                      <div v-if="alt.pinyin" class="text-sm text-gray-600">{{ alt.pinyin }}</div>
                      <div class="text-xs text-gray-500">{{ alt.note }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Save Button -->
              <div class="mt-6 flex gap-3">
                <BilingualButton
                  en="Save Phrase"
                  cn="保存短语"
                  variant="primary"
                  size="lg"
                  class="flex-1"
                  @click="savePhrase"
                />
                <BilingualButton
                  en="Try Again"
                  cn="重试"
                  variant="outline"
                  size="lg"
                  class="flex-1"
                  @click="resetForm"
                />
              </div>
            </div>
          </div>

          <!-- Error -->
          <div v-if="aiError" class="bg-red-50 rounded-xl p-4">
            <div class="text-2xl mb-2">❌</div>
            <div class="font-medium text-red-700 mb-2">Translation failed / 翻译失败</div>
            <div class="text-sm text-gray-600">{{ aiError }}</div>
          </div>
        </div>
      </div>

      <!-- My Saved Phrases -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <BilingualText
          en="My Saved Phrases"
          cn="我的保存短语"
          class="text-2xl font-bold mb-6"
        />

        <div v-if="customPhrases.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">📝</div>
          <BilingualText
            en="No custom phrases yet"
            cn="还没有自定义短语"
            class="text-xl text-gray-600"
          />
          <p class="text-sm text-gray-500 mt-2">
            Create your first phrase above! / 在上面创建您的第一个短语！
          </p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="phrase in customPhrases"
            :key="phrase.id"
            class="border-l-4 border-purple-500 bg-gray-50 rounded-r-lg p-4 hover:shadow-lg transition-all"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-1">
                  <div class="text-2xl font-bold text-gray-800">{{ phrase.cn }}</div>
                  <button
                    @click="phrasesStore.playAudio(phrase.cn, 'zh-CN')"
                    class="text-xl hover:scale-110 transition-transform"
                    title="Play audio / 播放音频"
                  >
                    🔊
                  </button>
                </div>
                <div class="text-sm text-gray-500">{{ phrase.pinyin }}</div>
                <div class="text-lg text-gray-700 mt-1">{{ phrase.en }}</div>
                <div class="text-xs text-gray-500 mt-2">
                  Added: {{ formatDate(phrase.created) }}
                </div>
              </div>
              <button
                @click="deletePhrase(phrase.id)"
                class="text-red-500 hover:text-red-700 ml-4"
                title="Delete / 删除"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDeepSeek } from '../composables/useDeepSeek'
import { useFamilyStore } from '../stores/family'
import { usePhrasesStore } from '../stores/phrases'
import BilingualText from '../components/BilingualText.vue'
import BilingualButton from '../components/BilingualButton.vue'

const deepSeek = useDeepSeek()
const familyStore = useFamilyStore()
const phrasesStore = usePhrasesStore()

// Form state
const inputText = ref('')
const direction = ref('en-to-cn')
const translation = ref(null)
const aiLoading = computed(() => deepSeek.loading.value)
const aiError = computed(() => deepSeek.error.value)
const hasApiKey = computed(() => !!deepSeek.getApiKey())

// Custom phrases (from store)
const customPhrases = computed(() => phrasesStore.customPhrases)

onMounted(() => {
  // Custom phrases are already loaded by the store
  const currentUser = familyStore.currentUser
  if (currentUser) {
    phrasesStore.loadCustomPhrases(currentUser.id)
  }
})

async function translate() {
  try {
    translation.value = await deepSeek.translatePhrase(inputText.value, direction.value)
  } catch (error) {
    console.error('Translation error:', error)
  }
}

function savePhrase() {
  if (!translation.value) return

  const currentUser = familyStore.currentUser
  if (!currentUser) return

  const newPhrase = {
    id: crypto.randomUUID(),
    cn: direction.value === 'en-to-cn' ? translation.value.chinese : inputText.value,
    pinyin: translation.value.pinyin || '',
    en: direction.value === 'en-to-cn' ? inputText.value : translation.value.english,
    difficulty: 2,
    phase: 'custom',
    category: 'custom',
    context: {
      en: translation.value.context || '',
      cn: translation.value.contextCN || ''
    },
    literalTranslation: translation.value.literal || '',
    created: new Date().toISOString(),
    custom: true
  }

  // Add to store (which handles localStorage)
  phrasesStore.addCustomPhrase(currentUser.id, newPhrase)

  alert('Phrase saved! It will appear in Browse and Practice. / 短语已保存！它将出现在浏览和练习中。')
  resetForm()
}

function deletePhrase(id) {
  if (confirm('Delete this phrase? / 删除这个短语？')) {
    const currentUser = familyStore.currentUser
    if (currentUser) {
      phrasesStore.removeCustomPhrase(currentUser.id, id)
    }
  }
}

function resetForm() {
  inputText.value = ''
  translation.value = null
}

function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString()
}
</script>
