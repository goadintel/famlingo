<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
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
          en="🎉 Phase Library Complete!"
          cn="🎉 短语库完成！"
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
            <div class="text-3xl font-bold text-orange-600">3</div>
            <BilingualText
              en="Learning Phases"
              cn="学习阶段"
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
            >
              <div class="flex items-center gap-3 mb-3">
                <span class="text-3xl">{{ category.icon }}</span>
                <div class="flex-1">
                  <div class="font-bold text-gray-800">{{ category.name.en }}</div>
                  <div class="text-sm text-gray-600">{{ category.name.cn }}</div>
                </div>
                <div class="text-sm font-bold text-purple-600">
                  {{ category.phraseCount }} phrases / 短语
                </div>
              </div>
              <div class="text-xs text-gray-500">
                Phase: {{ category.phase }} / 阶段：{{ category.phase }}
              </div>
            </div>
          </div>
        </div>

        <!-- Sample Phrases -->
        <div class="mt-8 space-y-4">
          <BilingualText
            en="Sample Phrases (First 5)"
            cn="示例短语（前5个）"
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
                  {{ phrase.categoryIcon }} {{ phrase.difficulty }}/5
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <BilingualButton
            en="Browse All Phrases"
            cn="浏览所有短语"
            variant="primary"
            size="lg"
            @click="browsePhrases"
          />
          <BilingualButton
            en="Start Practice"
            cn="开始练习"
            variant="secondary"
            size="lg"
            @click="startPractice"
          />
        </div>

        <!-- Info Box -->
        <div class="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 text-center">
          <p class="text-gray-700">
            <span class="font-bold">Next Steps / 下一步：</span><br>
            Multi-user system, Practice engine, Family dashboard<br>
            多用户系统、练习引擎、家庭仪表盘
          </p>
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
import { usePhrasesStore } from './stores/phrases'
import { useFamilyStore } from './stores/family'
import BilingualText from './components/BilingualText.vue'
import BilingualButton from './components/BilingualButton.vue'

// Initialize stores
const phrasesStore = usePhrasesStore()
const familyStore = useFamilyStore()

// Computed properties
const totalPhrases = computed(() => phrasesStore.totalPhrases)
const categories = computed(() => phrasesStore.categories)
const samplePhrases = computed(() => phrasesStore.allPhrases.slice(0, 5))

// Initialize on mount
onMounted(() => {
  phrasesStore.initialize()
  familyStore.loadFamilyFromStorage()
})

// Actions
function browsePhrases() {
  alert('Browse Phrases feature coming soon! / 浏览短语功能即将推出！')
}

function startPractice() {
  alert('Practice feature coming soon! / 练习功能即将推出！')
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Noto+Sans+SC:wght@400;700&display=swap');

* {
  font-family: 'Noto Sans', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>
