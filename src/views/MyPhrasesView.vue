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
                EN → 🇨🇳
                <div class="text-sm">English to Chinese</div>
              </button>
              <button
                @click="direction = 'cn-to-en'"
                :class="['flex-1 py-3 rounded-lg border-2 font-medium transition-all',
                         direction === 'cn-to-en' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300']"
              >
                🇨🇳 → EN
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

              <!-- Category Selection (Multi-select) -->
              <div class="mt-6 pt-6 border-t border-gray-200">
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Select Categories (Multi-select) / 选择分类（可多选）
                </label>
                <div class="text-xs text-gray-500 mb-3">
                  ✓ "Common Phrases" is always included / "常用短语"始终包含
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                  <button
                    v-for="category in categories"
                    :key="category.id"
                    @click="toggleCategory(category.id)"
                    :class="['p-3 rounded-lg border-2 text-sm font-medium transition-all text-left',
                             selectedCategories.includes(category.id)
                               ? 'border-purple-600 bg-purple-50 text-purple-700'
                               : 'border-gray-200 hover:border-purple-300']"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-lg">{{ selectedCategories.includes(category.id) ? '✓' : '' }}</span>
                      <span class="text-lg">{{ category.icon }}</span>
                      <span class="text-xs">{{ category.display }}</span>
                    </div>
                  </button>
                </div>
                <button
                  @click="showCreateCategory = true"
                  class="w-full p-3 rounded-lg border-2 border-dashed border-gray-300 text-sm font-medium text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-all"
                >
                  ➕ Create New Category / 创建新分类
                </button>
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
                <div class="flex flex-wrap gap-1 mt-2">
                  <span
                    v-for="catId in (phrase.categories || [phrase.category])"
                    :key="catId"
                    class="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                  >
                    {{ categories.find(c => c.id === catId)?.icon }} {{ categories.find(c => c.id === catId)?.display?.split(' / ')[0] || catId }}
                  </span>
                </div>
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

    <!-- Create Category Modal -->
    <div v-if="showCreateCategory" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h3 class="text-2xl font-bold mb-4">Create New Category / 创建新分类</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Category Name (English)
            </label>
            <input
              v-model="newCategoryNameEn"
              type="text"
              placeholder="e.g., Travel Phrases"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Category Name (Chinese)
            </label>
            <input
              v-model="newCategoryNameCn"
              type="text"
              placeholder="例如：旅行短语"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Icon (Emoji)
            </label>
            <input
              v-model="newCategoryIcon"
              type="text"
              placeholder="✈️"
              maxlength="2"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-2xl"
            />
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="createCategory"
            class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
          >
            Create / 创建
          </button>
          <button
            @click="cancelCreateCategory"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
          >
            Cancel / 取消
          </button>
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

// Category selection (multi-select)
const categories = ref([
  { id: 'common_phrases', icon: '⭐', display: 'Common Phrases / 常用短语' },
  { id: 'greetings', icon: '👋', display: 'Greetings / 问候与基础' },
  { id: 'numbers_time', icon: '🕐', display: 'Numbers & Time / 数字与时间' },
  { id: 'family_social', icon: '👨‍👩‍👧‍👦', display: 'Family & Social / 家庭与社交' },
  { id: 'food_dining', icon: '🍜', display: 'Food & Dining / 美食与用餐' },
  { id: 'getting_around', icon: '🚶', display: 'Getting Around / 出行导航' },
  { id: 'shopping', icon: '🛍️', display: 'Shopping / 购物' },
  { id: 'emotions', icon: '😊', display: 'Emotions / 情感与感受' },
  { id: 'emergency', icon: '🆘', display: 'Emergency / 紧急情况与健康' },
  { id: 'work_school', icon: '💼', display: 'Work & School / 工作与学习' }
])
const selectedCategories = ref(['common_phrases']) // Always include Common Phrases
const aiLoading = computed(() => deepSeek.loading.value)
const aiError = computed(() => deepSeek.error.value)
const hasApiKey = computed(() => !!deepSeek.getApiKey())

// Create category modal
const showCreateCategory = ref(false)
const newCategoryNameEn = ref('')
const newCategoryNameCn = ref('')
const newCategoryIcon = ref('')

// Custom phrases (from store)
const customPhrases = computed(() => phrasesStore.customPhrases)

onMounted(() => {
  // Load custom categories from localStorage
  const savedCategories = localStorage.getItem('famlingo_custom_categories')
  if (savedCategories) {
    categories.value = JSON.parse(savedCategories)
  }

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

function toggleCategory(categoryId) {
  // Always keep 'common_phrases' selected
  if (categoryId === 'common_phrases') return

  const index = selectedCategories.value.indexOf(categoryId)
  if (index === -1) {
    selectedCategories.value.push(categoryId)
  } else {
    selectedCategories.value.splice(index, 1)
  }
}

function createCategory() {
  if (!newCategoryNameEn.value || !newCategoryNameCn.value || !newCategoryIcon.value) {
    alert('Please fill in all fields / 请填写所有字段')
    return
  }

  const newCategory = {
    id: `custom_${Date.now()}`,
    icon: newCategoryIcon.value,
    display: `${newCategoryNameEn.value} / ${newCategoryNameCn.value}`
  }

  categories.value.push(newCategory)
  selectedCategories.value.push(newCategory.id)

  // Save to localStorage
  localStorage.setItem('famlingo_custom_categories', JSON.stringify(categories.value))

  cancelCreateCategory()
  alert('Category created! / 分类已创建！')
}

function cancelCreateCategory() {
  showCreateCategory.value = false
  newCategoryNameEn.value = ''
  newCategoryNameCn.value = ''
  newCategoryIcon.value = ''
}

function savePhrase() {
  if (!translation.value) return

  const currentUser = familyStore.currentUser
  if (!currentUser) return

  // Ensure common_phrases is always included
  const categoriesToSave = [...new Set(['common_phrases', ...selectedCategories.value])]

  const newPhrase = {
    id: crypto.randomUUID(),
    cn: direction.value === 'en-to-cn' ? translation.value.chinese : inputText.value,
    pinyin: translation.value.pinyin || '',
    en: direction.value === 'en-to-cn' ? inputText.value : translation.value.english,
    difficulty: 2,
    phase: 'custom',
    categories: categoriesToSave, // Changed from single category to array
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

  const categoryCount = categoriesToSave.length
  alert(`Phrase saved to ${categoryCount} ${categoryCount === 1 ? 'category' : 'categories'}! / 短语已保存到 ${categoryCount} 个分类！`)
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
  selectedCategories.value = ['common_phrases'] // Reset to default
}

function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString()
}
</script>
