<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-5xl font-bold text-white mb-2">
          FamLingo
        </h1>
        <h2 class="text-3xl font-bold text-white/90">
          家语
        </h2>
        <p class="text-white/80 mt-4">
          Family Language Learning / 全家一起学语言
        </p>
        <p class="text-white/70 text-sm mt-2">
          v0.1.0 • {{ totalPhrases }} phrases loaded / 已加载{{ totalPhrases }}个短语
        </p>
      </header>

      <!-- Main Content -->
      <main class="bg-white rounded-2xl shadow-2xl p-8">
        <BilingualText
          en="🎉 Ready to Learn!"
          cn="🎉 准备学习！"
          class="text-3xl font-bold text-center mb-6"
        />

        <!-- Stats Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-purple-600">{{ totalPhrases }}</div>
            <BilingualText
              en="Total Phrases"
              cn="总短语数"
              orientation="vertical"
              class="text-sm mt-2"
            />
          </div>
          <div class="bg-gradient-to-br from-pink-100 to-orange-100 rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-pink-600">{{ categories.length }}</div>
            <BilingualText
              en="Categories"
              cn="类别"
              orientation="vertical"
              class="text-sm mt-2"
            />
          </div>
          <div class="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl p-4 text-center">
            <div class="text-3xl font-bold text-orange-600">{{ familyUsers }}</div>
            <BilingualText
              en="Family Members"
              cn="家庭成员"
              orientation="vertical"
              class="text-sm mt-2"
            />
          </div>
        </div>

        <!-- Categories Preview -->
        <div class="space-y-6">
          <BilingualText
            en="Phrase Categories"
            cn="短语类别"
            class="text-2xl font-bold text-center"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="category in categories"
              :key="category.id"
              class="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer"
              @click="goToBrowse(category.id)"
            >
              <div class="flex items-center gap-3 mb-3">
                <span class="text-3xl">{{ category.icon }}</span>
                <div class="flex-1">
                  <div class="font-bold text-gray-800">{{ category.name.en }}</div>
                  <div class="text-sm text-gray-600">{{ category.name.cn }}</div>
                </div>
                <div class="text-sm font-bold text-purple-600">
                  {{ category.phraseCount }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sample Phrases -->
        <div class="mt-8 space-y-4">
          <BilingualText
            en="Sample Phrases"
            cn="示例短语"
            class="text-xl font-bold text-center"
          />

          <div class="space-y-3">
            <div
              v-for="phrase in samplePhrases"
              :key="phrase.id"
              class="border-l-4 border-purple-500 bg-gray-50 rounded-r-lg p-4"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="text-2xl font-bold text-gray-800">{{ phrase.cn }}</div>
                  <div class="text-sm text-gray-500">{{ phrase.pinyin }}</div>
                  <div class="text-lg text-gray-700 mt-1">{{ phrase.en }}</div>
                </div>
                <div class="text-xs text-gray-400">
                  {{ phrase.categoryIcon }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <BilingualButton
            v-if="!isFamilyInitialized"
            en="Setup Family"
            cn="设置家庭"
            variant="primary"
            size="lg"
            @click="goToSetup"
          />
          <BilingualButton
            v-else
            en="Go to Dashboard"
            cn="前往仪表盘"
            variant="primary"
            size="lg"
            @click="goToDashboard"
          />
          <BilingualButton
            en="Browse Phrases"
            cn="浏览短语"
            variant="secondary"
            size="lg"
            @click="goToBrowse()"
          />
        </div>
      </main>

      <!-- Footer -->
      <footer class="text-center mt-8 text-white/70 text-sm">
        <p>Building the 0.1% that wins in China! / 打造在中国市场成功的0.1%！</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePhrasesStore } from '../stores/phrases'
import { useFamilyStore } from '../stores/family'
import { useGitHubSync } from '../composables/useGitHubSync'
import BilingualText from '../components/BilingualText.vue'
import BilingualButton from '../components/BilingualButton.vue'

const router = useRouter()
const phrasesStore = usePhrasesStore()
const familyStore = useFamilyStore()
const { autoSyncOnLoad } = useGitHubSync()

const totalPhrases = computed(() => phrasesStore.totalPhrases)
const categories = computed(() => phrasesStore.categories)
const samplePhrases = computed(() => phrasesStore.allPhrases.slice(0, 5))
const isFamilyInitialized = computed(() => familyStore.isFamilyInitialized)
const familyUsers = computed(() => familyStore.family.users.length)

onMounted(async () => {
  phrasesStore.initialize()
  familyStore.loadFamilyFromStorage()

  // Auto-sync from GitHub on load (if configured)
  await autoSyncOnLoad()
})

function goToSetup() {
  router.push('/setup')
}

function goToDashboard() {
  router.push('/dashboard')
}

function goToBrowse(categoryId = null) {
  if (categoryId) {
    router.push({ name: 'browse', query: { category: categoryId } })
  } else {
    router.push('/browse')
  }
}
</script>
