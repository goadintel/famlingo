<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Header -->
      <header class="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <BilingualText
            en="Browse Phrases"
            cn="浏览短语"
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

        <!-- Category Filter -->
        <div class="flex flex-wrap gap-3">
          <button
            @click="selectedCategory = null"
            :class="['px-4 py-2 rounded-lg font-medium transition-all',
                     selectedCategory === null ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
          >
            <BilingualText en="All" cn="全部" orientation="inline" class="text-sm" />
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            @click="selectedCategory = category.id"
            :class="['px-4 py-2 rounded-lg font-medium transition-all',
                     selectedCategory === category.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
          >
            <span class="mr-2">{{ category.icon }}</span>
            <span class="text-sm">{{ category.name?.en || 'Category' }} / {{ category.name?.cn || '类别' }}</span>
          </button>
        </div>
      </header>

      <!-- Phrases List -->
      <div class="bg-white rounded-2xl shadow-xl p-6">
        <div class="text-center mb-6">
          <div class="text-sm text-gray-600">
            Showing {{ filteredPhrases.length }} phrases / 显示 {{ filteredPhrases.length }} 个短语
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="phrase in filteredPhrases"
            :key="phrase.id"
            class="border-l-4 border-purple-500 bg-gray-50 rounded-r-lg p-6 hover:shadow-lg transition-all cursor-pointer"
            @click="selectPhrase(phrase)"
          >
            <!-- Chinese with Audio -->
            <div class="flex items-center gap-3 mb-2">
              <div class="text-3xl font-bold text-gray-800">
                {{ phrase.cn }}
              </div>
              <button
                @click.stop="playAudio(phrase.cn, 'zh-CN')"
                class="text-2xl hover:scale-110 transition-transform"
                title="Play Chinese / 播放中文"
              >
                🔊
              </button>
            </div>

            <!-- Pinyin -->
            <div class="text-lg text-gray-500 mb-3">
              {{ phrase.pinyin }}
            </div>

            <!-- English -->
            <div class="text-xl text-gray-700 mb-4">
              {{ phrase.en }}
            </div>

            <!-- Meta Info -->
            <div class="flex items-center justify-between text-sm">
              <div class="text-gray-500">
                {{ phrase.categoryIcon }} {{ phrase.categoryName?.en || '' }}
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                  {{ phrase.phase }}
                </span>
                <span class="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded">
                  Level {{ phrase.difficulty }}
                </span>
              </div>
            </div>

            <!-- Context (optional, shown on hover/click) -->
            <div v-if="selectedPhraseId === phrase.id && phrase.context" class="mt-4 pt-4 border-t border-gray-200">
              <div class="text-sm text-gray-600 mb-2">
                <strong>Context / 语境:</strong>
              </div>
              <div class="text-sm text-gray-700 mb-2">
                🇬🇧 {{ phrase.context.en }}
              </div>
              <div class="text-sm text-gray-700 mb-2">
                🇨🇳 {{ phrase.context.cn }}
              </div>
              <div v-if="phrase.literalTranslation" class="text-xs text-gray-500 italic">
                Literal: "{{ phrase.literalTranslation }}"
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredPhrases.length === 0" class="text-center py-12">
          <div class="text-4xl mb-4">📚</div>
          <BilingualText
            en="No phrases found"
            cn="未找到短语"
            class="text-xl text-gray-600"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePhrasesStore } from '../stores/phrases'
import BilingualText from '../components/BilingualText.vue'
import BilingualButton from '../components/BilingualButton.vue'

const route = useRoute()
const phrasesStore = usePhrasesStore()

const selectedCategory = ref(null)
const selectedPhraseId = ref(null)

const categories = computed(() => phrasesStore.categories)
const filteredPhrases = computed(() => {
  if (selectedCategory.value === null) {
    return phrasesStore.allPhrases
  }
  return phrasesStore.getPhrasesByCategory(selectedCategory.value)
})

onMounted(() => {
  // Check if category is in query params
  if (route.query.category) {
    selectedCategory.value = route.query.category
  }
})

function selectPhrase(phrase) {
  selectedPhraseId.value = selectedPhraseId.value === phrase.id ? null : phrase.id
}

function playAudio(text, language = 'zh-CN') {
  phrasesStore.playAudio(text, language)
}
</script>
