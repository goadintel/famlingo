<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Header -->
      <header class="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div class="flex items-center justify-between mb-2">
          <BilingualButton
            en="Back to Courses"
            cn="返回课程"
            variant="outline"
            size="sm"
            @click="$router.push('/courses')"
          />
          <div v-if="levelName" class="text-sm text-gray-500">
            {{ levelName.en }} / {{ levelName.cn }}
          </div>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">{{ lessonTitle }}</h1>

        <!-- Tab Navigation -->
        <div v-if="hasCards" class="flex gap-1 mt-4 bg-gray-100 rounded-lg p-1">
          <button
            v-if="audioUrl"
            @click="activeTab = 'listen'"
            :class="['flex-1 px-4 py-2 rounded-md font-medium transition-all text-sm',
                     activeTab === 'listen' ? 'bg-white shadow text-purple-700' : 'text-gray-600 hover:text-gray-800']"
          >
            Listen / 听课
          </button>
          <button
            @click="activeTab = 'cards'"
            :class="['flex-1 px-4 py-2 rounded-md font-medium transition-all text-sm',
                     activeTab === 'cards' ? 'bg-white shadow text-purple-700' : 'text-gray-600 hover:text-gray-800']"
          >
            Cards / 卡片
            <span class="ml-1 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">{{ totalCardCount }}</span>
          </button>
          <button
            @click="activeTab = 'practice'"
            :class="['flex-1 px-4 py-2 rounded-md font-medium transition-all text-sm',
                     activeTab === 'practice' ? 'bg-white shadow text-purple-700' : 'text-gray-600 hover:text-gray-800']"
          >
            Practice / 练习
          </button>
        </div>
      </header>

      <!-- ═══ LISTEN TAB ═══ -->
      <div v-if="activeTab === 'listen'">
        <!-- Audio Player -->
        <div v-if="audioUrl" class="mb-8">
          <AudioPlayer
            :src="audioUrl"
            :title="lessonTitle"
            :subtitle="levelName?.en || ''"
            :initialPosition="savedPosition"
            @timeUpdate="onTimeUpdate"
            @ended="onEnded"
            @play="onPlay"
            @pause="onPause"
          />
        </div>

        <!-- Lesson Actions -->
        <div class="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                :class="isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'"
              >
                <span v-if="isCompleted">&#10003;</span>
                <span v-else>&#9675;</span>
              </div>
              <div>
                <div class="font-medium text-gray-800">
                  {{ isCompleted ? 'Completed / 已完成' : 'Mark as Complete / 标记为已完成' }}
                </div>
                <div v-if="isCompleted && completedAt" class="text-xs text-gray-500">
                  {{ new Date(completedAt).toLocaleDateString() }}
                </div>
              </div>
            </div>

            <button
              @click="toggleComplete"
              :class="['px-4 py-2 rounded-lg font-medium transition-all',
                       isCompleted
                         ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                         : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg']"
            >
              {{ isCompleted ? 'Undo / 撤销' : 'Complete / 完成' }}
            </button>
          </div>
        </div>

        <!-- PDF Materials -->
        <div v-if="levelMaterials.length > 0" class="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 class="font-bold text-gray-800 text-lg mb-4">
            Lesson Materials / 课程材料
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              v-for="material in levelMaterials"
              :key="material.id"
              :href="getResourceUrl(material.path)"
              target="_blank"
              class="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-md transition-all"
            >
              <div class="text-2xl flex-shrink-0">
                <span v-if="material.type === 'hanzi'">&#23383;</span>
                <span v-else-if="material.type === 'script'">&#128196;</span>
                <span v-else>&#128213;</span>
              </div>
              <div class="min-w-0">
                <div class="font-medium text-gray-700">{{ material.title }}</div>
                <div class="text-xs text-gray-400">{{ getTypeLabel(material.type) }} - Opens in new tab</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- ═══ CARDS TAB ═══ -->
      <div v-if="activeTab === 'cards' && hasCards">
        <!-- Category Filter -->
        <div class="flex gap-2 mb-6 flex-wrap">
          <button
            v-for="cat in cardCategories"
            :key="cat.key"
            @click="cardFilter = cat.key"
            :class="['px-4 py-2 rounded-lg font-medium transition-all text-sm',
                     cardFilter === cat.key ? 'bg-white shadow text-purple-700' : 'bg-white/30 text-white hover:bg-white/50']"
          >
            {{ cat.label }}
            <span class="ml-1 text-xs opacity-70">({{ cat.count }})</span>
          </button>
        </div>

        <!-- Flashcard -->
        <div v-if="filteredCards.length > 0" class="bg-white rounded-2xl shadow-xl p-8 mb-6 min-h-[280px] flex flex-col items-center justify-center cursor-pointer select-none"
             @click="cardFlipped = !cardFlipped">
          <!-- Card Front: Pinyin (forces reading/sounding out) -->
          <div v-if="!cardFlipped" class="text-center w-full">
            <div class="text-xs text-gray-400 uppercase tracking-wide mb-4">
              {{ getCardTypeLabel(currentCard) }} - Tap to reveal
            </div>
            <div class="flex items-center justify-center gap-3 mb-2">
              <div class="text-3xl md:text-4xl font-bold text-purple-700">
                {{ currentCard.pinyin }}
              </div>
              <button
                @click.stop="playCardAudio"
                class="text-2xl hover:scale-110 transition-transform text-purple-400 hover:text-purple-600"
                title="Listen / 听"
              >
                &#128264;
              </button>
            </div>
            <div class="text-sm text-gray-400 mt-4">
              {{ cardIndex + 1 }} / {{ filteredCards.length }}
            </div>
          </div>

          <!-- Card Back: Characters + English -->
          <div v-else class="text-center w-full">
            <div class="text-xs text-gray-400 uppercase tracking-wide mb-2">
              {{ getCardTypeLabel(currentCard) }}
            </div>
            <div class="flex items-center justify-center gap-3 mb-3">
              <div class="text-3xl md:text-4xl font-bold text-gray-800">
                {{ currentCard.cn }}
              </div>
              <button
                @click.stop="playCardAudio"
                class="text-2xl hover:scale-110 transition-transform text-gray-400 hover:text-purple-600"
                title="Listen / 听"
              >
                &#128264;
              </button>
            </div>
            <div class="text-xl text-purple-600 mb-3">
              {{ currentCard.pinyin }}
            </div>
            <div class="text-lg text-gray-600">
              {{ currentCard.en }}
            </div>
            <div v-if="currentCard.pos" class="text-xs text-gray-400 mt-2 italic">
              {{ currentCard.pos }}
            </div>
            <div class="text-sm text-gray-400 mt-4">
              {{ cardIndex + 1 }} / {{ filteredCards.length }}
            </div>

            <!-- Save to My Phrases -->
            <button
              v-if="!isCardSaved(currentCard)"
              @click.stop="saveCardToMyPhrases(currentCard)"
              class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all"
            >
              &#11088; Save to My Phrases / 保存到我的短语
            </button>
            <div v-else class="mt-4 text-sm text-green-600 font-medium">
              &#10003; Saved / 已保存
            </div>
          </div>
        </div>

        <!-- Card Navigation -->
        <div class="flex items-center justify-between gap-4 mb-6">
          <button
            @click="prevCard"
            :disabled="cardIndex === 0"
            class="flex-1 py-3 bg-white rounded-xl shadow-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-xl text-gray-700"
          >
            &#9664; Previous / 上一个
          </button>

          <button
            @click="playCardAudio"
            class="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:shadow-xl hover:scale-105 transition-all"
            title="Listen / 听"
          >
            &#128264;
          </button>

          <button
            @click="nextCard"
            :disabled="cardIndex >= filteredCards.length - 1"
            class="flex-1 py-3 bg-white rounded-xl shadow-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-xl text-gray-700"
          >
            Next / 下一个 &#9654;
          </button>
        </div>

        <!-- Shuffle Button -->
        <div class="text-center">
          <button
            @click="shuffleCards"
            class="text-sm text-white/80 hover:text-white underline"
          >
            Shuffle cards / 打乱卡片
          </button>
        </div>
      </div>

      <!-- ═══ PRACTICE TAB ═══ -->
      <div v-if="activeTab === 'practice' && hasCards">
        <!-- Practice not started -->
        <div v-if="!practiceActive && !practiceComplete" class="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div class="text-5xl mb-4">&#127891;</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Practice Cards / 练习卡片</h2>
          <p class="text-gray-500 mb-6">
            See the Chinese, speak it aloud, and check your pronunciation /
            看中文，大声说出来，检查你的发音
          </p>

          <!-- Card count info -->
          <div class="flex justify-center gap-4 mb-8">
            <div v-if="lessonCards.vocab.length" class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ lessonCards.vocab.length }}</div>
              <div class="text-xs text-gray-500">Vocab</div>
            </div>
            <div v-if="lessonCards.sentences.length" class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ lessonCards.sentences.length }}</div>
              <div class="text-xs text-gray-500">Sentences</div>
            </div>
            <div v-if="lessonCards.dialogue.length" class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ lessonCards.dialogue.length }}</div>
              <div class="text-xs text-gray-500">Dialogue</div>
            </div>
          </div>

          <!-- Practice Options -->
          <div class="space-y-3 max-w-md mx-auto">
            <button
              @click="startPractice('all')"
              class="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all text-lg"
            >
              Practice All ({{ totalCardCount }} cards) / 全部练习
            </button>
            <button
              v-if="lessonCards.vocab.length"
              @click="startPractice('vocab')"
              class="w-full py-3 bg-white border-2 border-purple-200 text-purple-700 rounded-xl font-medium hover:border-purple-400 transition-all"
            >
              Vocabulary Only / 仅词汇 ({{ lessonCards.vocab.length }})
            </button>
            <button
              v-if="lessonCards.sentences.length"
              @click="startPractice('sentences')"
              class="w-full py-3 bg-white border-2 border-blue-200 text-blue-700 rounded-xl font-medium hover:border-blue-400 transition-all"
            >
              Sentences Only / 仅句子 ({{ lessonCards.sentences.length }})
            </button>
          </div>

          <!-- Previous Stats -->
          <div v-if="cardStats" class="mt-6 text-sm text-gray-500">
            Last practice: {{ cardStats.correct }}/{{ cardStats.total }} correct
            ({{ Math.round((cardStats.correct / cardStats.total) * 100) }}%)
          </div>
        </div>

        <!-- Practice Active -->
        <div v-if="practiceActive" class="bg-white rounded-2xl shadow-xl p-8">
          <!-- Progress -->
          <div class="flex items-center justify-between mb-6">
            <button @click="endPractice" class="text-sm text-gray-500 hover:text-gray-700">
              End / 结束
            </button>
            <div class="text-sm text-gray-600">
              {{ practiceIndex + 1 }} / {{ practiceSet.length }}
            </div>
          </div>
          <div class="w-full h-2 bg-gray-200 rounded-full mb-8">
            <div
              class="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300"
              :style="{ width: `${((practiceIndex) / practiceSet.length) * 100}%` }"
            ></div>
          </div>

          <!-- Prompt -->
          <div v-if="!practiceShowingAnswer" class="text-center">
            <div class="text-xs text-gray-400 uppercase tracking-wide mb-2">
              {{ getCardTypeLabel(practiceCurrentCard) }}
            </div>
            <div class="text-sm text-gray-500 mb-6">
              Speak the Chinese aloud / 大声说出中文
            </div>
            <div class="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              {{ practiceCurrentCard.cn }}
            </div>
            <div v-if="practiceCurrentCard.pinyin" class="text-xl text-purple-500 mb-6">
              {{ practiceCurrentCard.pinyin }}
            </div>

            <!-- TTS Button -->
            <button
              @click="playPracticeAudio"
              class="mb-6 w-14 h-14 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-2xl hover:bg-purple-200 transition-all"
              title="Listen / 听"
            >
              &#128264;
            </button>

            <!-- Record Button -->
            <div class="mb-6">
              <div class="text-center mb-3">
                <div v-if="pronunciationAPI.analyzing.value" class="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                  <div class="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                  Analyzing... / 分析中... {{ voiceRecording.recordingDuration.value }}s
                </div>
                <div v-else-if="voiceRecording.isRecording.value" class="flex items-center justify-center gap-2 text-red-600 font-semibold">
                  <div class="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  Recording... / 录音中... {{ voiceRecording.recordingDuration.value }}s
                </div>
                <div v-else class="text-gray-500 text-sm">
                  Tap the mic to record / 点击麦克风录音
                </div>
              </div>

              <!-- Error -->
              <div v-if="voiceRecording.error.value" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
                {{ voiceRecording.error.value }}
              </div>

              <button
                @click="handlePracticeRecording"
                :disabled="pronunciationAPI.analyzing.value"
                :class="['w-24 h-24 mx-auto rounded-full font-bold text-xl transition-all shadow-lg flex items-center justify-center',
                         pronunciationAPI.analyzing.value
                           ? 'bg-blue-500 text-white cursor-wait animate-pulse'
                           : voiceRecording.isRecording.value
                           ? 'bg-red-500 text-white scale-110 shadow-2xl animate-pulse'
                           : 'bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:scale-105']"
              >
                <span v-if="pronunciationAPI.analyzing.value" class="text-3xl">&#129302;</span>
                <span v-else-if="voiceRecording.isRecording.value" class="text-3xl">&#9724;</span>
                <span v-else class="text-3xl">&#127908;</span>
              </button>
            </div>

            <!-- Skip/Show Answer -->
            <button
              @click="showPracticeAnswer(false)"
              class="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Show answer / 显示答案
            </button>
          </div>

          <!-- Answer Revealed -->
          <div v-else class="text-center space-y-6">
            <!-- Chinese + Pinyin + English -->
            <div class="bg-gray-50 rounded-xl p-6">
              <div class="text-3xl font-bold text-gray-800 mb-2">{{ practiceCurrentCard.cn }}</div>
              <div v-if="practiceCurrentCard.pinyin" class="text-xl text-purple-600 mb-2">{{ practiceCurrentCard.pinyin }}</div>
              <div class="text-lg text-gray-600">{{ practiceCurrentCard.en }}</div>

              <!-- Save to My Phrases -->
              <button
                v-if="!isCardSaved(practiceCurrentCard)"
                @click="saveCardToMyPhrases(practiceCurrentCard)"
                class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all"
              >
                &#11088; Save to My Phrases / 保存
              </button>
              <div v-else class="mt-3 text-xs text-green-600 font-medium">
                &#10003; Saved / 已保存
              </div>
            </div>

            <!-- AI Score (if available) -->
            <div v-if="practiceAIScore !== null" class="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-200 rounded-xl p-6">
              <div class="flex items-center justify-center gap-3 mb-3">
                <span class="text-3xl">&#129302;</span>
                <div class="text-3xl font-bold text-purple-600">{{ practiceAIScore.toFixed(1) }} / 10</div>
              </div>
              <div v-if="practiceAIFeedback" class="text-sm text-gray-700">
                {{ practiceAIFeedback.feedback }}
              </div>
              <div v-if="practiceAIFeedback?.feedbackCN" class="text-sm text-gray-500 mt-1">
                {{ practiceAIFeedback.feedbackCN }}
              </div>

              <!-- Play Recording -->
              <button
                v-if="voiceRecording.hasRecording.value"
                @click="voiceRecording.playRecording()"
                class="mt-3 text-purple-600 hover:text-purple-700 font-medium text-sm px-4 py-2 border border-purple-300 rounded-lg hover:bg-purple-50"
              >
                &#9654; Play my recording / 播放录音
              </button>
            </div>

            <!-- Feedback (correct/incorrect based on score) -->
            <div :class="['rounded-xl p-4 text-center',
                         practiceAIScore !== null
                           ? (practiceAIScore >= 7 ? 'bg-green-50' : practiceAIScore >= 4 ? 'bg-yellow-50' : 'bg-orange-50')
                           : 'bg-gray-50']">
              <div v-if="practiceAIScore !== null">
                <span v-if="practiceAIScore >= 7" class="text-green-700 font-bold">Great! / 很好！</span>
                <span v-else-if="practiceAIScore >= 4" class="text-yellow-700 font-bold">Good effort! / 不错！</span>
                <span v-else class="text-orange-700 font-bold">Keep practicing! / 继续练习！</span>
              </div>
            </div>

            <!-- Self Assessment (if no AI score) -->
            <div v-if="practiceAIScore === null" class="flex gap-3">
              <button
                @click="recordPracticeResult(true)"
                class="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all"
              >
                &#10003; Got it / 会了
              </button>
              <button
                @click="recordPracticeResult(false)"
                class="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all"
              >
                &#10007; Needs work / 还需练习
              </button>
            </div>

            <!-- Next (if AI scored) -->
            <button
              v-if="practiceAIScore !== null"
              @click="nextPracticeCard"
              class="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Next / 下一个 &#9654;
            </button>
          </div>
        </div>

        <!-- Practice Complete -->
        <div v-if="practiceComplete" class="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div class="text-5xl mb-4">&#127881;</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Practice Complete! / 练习完成！</h2>

          <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 my-6">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <div class="text-3xl font-bold text-purple-600">{{ practiceResults.total }}</div>
                <div class="text-sm text-gray-600">Cards / 卡片</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-green-600">{{ practiceResults.correct }}</div>
                <div class="text-sm text-gray-600">Correct / 正确</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-orange-600">{{ practiceResults.accuracy }}%</div>
                <div class="text-sm text-gray-600">Accuracy / 准确率</div>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="resetPractice"
              class="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Practice Again / 再练一次
            </button>
            <button
              @click="activeTab = 'listen'"
              class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              Back to Lesson / 返回课程
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation (always visible) -->
      <div class="flex items-center justify-between mt-8">
        <button
          v-if="prevLesson"
          @click="goToLesson(prevLesson)"
          class="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-gray-700 hover:text-purple-700"
        >
          <span>&#9664;</span>
          <div class="text-left">
            <div class="text-xs text-gray-400">Previous / 上一课</div>
            <div class="text-sm font-medium truncate max-w-[200px]">{{ prevLesson.title }}</div>
          </div>
        </button>
        <div v-else></div>

        <button
          v-if="nextLesson"
          @click="goToLesson(nextLesson)"
          class="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-gray-700 hover:text-purple-700"
        >
          <div class="text-right">
            <div class="text-xs text-gray-400">Next / 下一课</div>
            <div class="text-sm font-medium truncate max-w-[200px]">{{ nextLesson.title }}</div>
          </div>
          <span>&#9654;</span>
        </button>
        <div v-else></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCoursesStore } from '../stores/courses'
import { useFamilyStore } from '../stores/family'
import { usePhrasesStore } from '../stores/phrases'
import { useVoiceRecording } from '../composables/useVoiceRecording'
import { usePronunciationAPI } from '../composables/usePronunciationAPI'
import AudioPlayer from '../components/AudioPlayer.vue'
import BilingualButton from '../components/BilingualButton.vue'

const route = useRoute()
const router = useRouter()
const coursesStore = useCoursesStore()
const familyStore = useFamilyStore()
const phrasesStore = usePhrasesStore()
const voiceRecording = useVoiceRecording()
const pronunciationAPI = usePronunciationAPI()

const levelId = computed(() => route.params.levelId)
const lessonId = computed(() => route.params.lessonId)

// ─── Tabs ───
const activeTab = ref('listen')

// Auto-select Cards tab for lessons without audio (e.g. study notes)
watch(() => [lessonId.value, levelId.value], () => {
  const ls = levelId.value === 'vocab'
    ? coursesStore.vocab.find(v => v.id === lessonId.value)
    : coursesStore.getLessonById(levelId.value, lessonId.value)
  const hasAudio = !!(ls?.audioPath || ls?.audio)
  const hasCardsData = coursesStore.getCardCount(lessonId.value) > 0
  if (!hasAudio && hasCardsData) {
    activeTab.value = 'cards'
  }
}, { immediate: true })

// ─── Lesson Data ───
const level = computed(() => {
  if (levelId.value === 'vocab') return null
  return coursesStore.getLevelById(levelId.value)
})

const lesson = computed(() => {
  if (levelId.value === 'vocab') {
    return coursesStore.vocab.find(v => v.id === lessonId.value)
  }
  return coursesStore.getLessonById(levelId.value, lessonId.value)
})

const levelName = computed(() => {
  if (levelId.value === 'vocab') return { en: 'Vocabulary', cn: '词汇' }
  return level.value?.name || { en: '', cn: '' }
})

const lessonTitle = computed(() => lesson.value?.title || 'Lesson')

const audioUrl = computed(() => {
  const path = lesson.value?.audioPath || lesson.value?.audio
  if (!path) return null
  return coursesStore.getResourceUrl(path)
})

const levelMaterials = computed(() => {
  if (!level.value?.materials || levelId.value === 'vocab') return []
  const lessonNum = lessonId.value.split('-').pop()
  if (!lessonNum) return level.value.materials
  return level.value.materials.filter(m => {
    const matNum = m.id.match(/M(\d+)/)?.[1]
    return matNum === lessonNum
  })
})

// ─── Cards Data ───
const lessonCards = computed(() => {
  return coursesStore.getCardsForLesson(lessonId.value) || { vocab: [], sentences: [], dialogue: [] }
})

const hasCards = computed(() => {
  const c = lessonCards.value
  return (c.vocab?.length || 0) + (c.sentences?.length || 0) + (c.dialogue?.length || 0) > 0
})

const totalCardCount = computed(() => coursesStore.getCardCount(lessonId.value))

// ─── Flashcard Browser ───
const cardFilter = ref('all')
const cardIndex = ref(0)
const cardFlipped = ref(false)
const shuffledOrder = ref(null)

const cardCategories = computed(() => {
  const c = lessonCards.value
  const cats = [{ key: 'all', label: 'All / 全部', count: totalCardCount.value }]
  if (c.vocab?.length) cats.push({ key: 'vocab', label: 'Vocab / 词汇', count: c.vocab.length })
  if (c.sentences?.length) cats.push({ key: 'sentences', label: 'Sentences / 句子', count: c.sentences.length })
  if (c.dialogue?.length) cats.push({ key: 'dialogue', label: 'Dialogue / 对话', count: c.dialogue.length })
  return cats
})

const filteredCards = computed(() => {
  const c = lessonCards.value
  let cards = []
  if (cardFilter.value === 'all') {
    cards = [...(c.vocab || []).map(v => ({ ...v, _type: 'vocab' })),
             ...(c.sentences || []).map(s => ({ ...s, _type: 'sentence' })),
             ...(c.dialogue || []).map(d => ({ ...d, _type: 'dialogue' }))]
  } else if (cardFilter.value === 'vocab') {
    cards = (c.vocab || []).map(v => ({ ...v, _type: 'vocab' }))
  } else if (cardFilter.value === 'sentences') {
    cards = (c.sentences || []).map(s => ({ ...s, _type: 'sentence' }))
  } else if (cardFilter.value === 'dialogue') {
    cards = (c.dialogue || []).map(d => ({ ...d, _type: 'dialogue' }))
  }

  if (shuffledOrder.value && cardFilter.value === shuffledOrder.value.filter) {
    const orderMap = new Map(shuffledOrder.value.ids.map((id, i) => [id, i]))
    cards.sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999))
  }

  return cards
})

const currentCard = computed(() => filteredCards.value[cardIndex.value] || { cn: '', pinyin: '', en: '' })

function prevCard() {
  if (cardIndex.value > 0) {
    cardIndex.value--
    cardFlipped.value = false
  }
}

function nextCard() {
  if (cardIndex.value < filteredCards.value.length - 1) {
    cardIndex.value++
    cardFlipped.value = false
  }
}

function shuffleCards() {
  const ids = filteredCards.value.map(c => c.id)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]]
  }
  shuffledOrder.value = { filter: cardFilter.value, ids }
  cardIndex.value = 0
  cardFlipped.value = false
}

function playCardAudio() {
  if (currentCard.value?.cn) {
    phrasesStore.playAudio(currentCard.value.cn, 'zh-CN')
  }
}

function getCardTypeLabel(card) {
  if (!card?._type) return ''
  switch (card._type) {
    case 'vocab': return 'Vocabulary / 词汇'
    case 'sentence': return 'Sentence / 句子'
    case 'dialogue': return 'Dialogue / 对话'
    default: return ''
  }
}

// ─── Save Card to My Phrases ───
const savedCardIds = ref(new Set())

function isCardSaved(card) {
  if (!card?.id) return false
  // Check both runtime set and existing custom phrases
  if (savedCardIds.value.has(card.id)) return true
  return phrasesStore.customPhrases.some(p => p.sourceCardId === card.id)
}

function saveCardToMyPhrases(card) {
  if (!card?.cn || !currentUser.value) return

  const newPhrase = {
    id: crypto.randomUUID(),
    cn: card.cn,
    pinyin: card.pinyin || '',
    en: card.en || '',
    difficulty: 2,
    phase: 'custom',
    categories: ['common_phrases', 'course_vocab'],
    context: {
      en: `From course: ${lessonTitle.value}`,
      cn: `来自课程：${lessonTitle.value}`
    },
    literalTranslation: '',
    created: new Date().toISOString(),
    custom: true,
    sourceCardId: card.id
  }

  phrasesStore.addCustomPhrase(currentUser.value.id, newPhrase)
  savedCardIds.value.add(card.id)
}

// Reset card index when filter changes
watch(cardFilter, () => {
  cardIndex.value = 0
  cardFlipped.value = false
  shuffledOrder.value = null
})

// ─── Progress ───
const currentUser = computed(() => familyStore.currentUser)
const courseProgress = computed(() => currentUser.value?.courseProgress?.[lessonId.value] || {})
const savedPosition = computed(() => courseProgress.value.lastPosition || 0)
const isCompleted = computed(() => courseProgress.value.completed || false)
const completedAt = computed(() => courseProgress.value.completedAt || null)
const cardStats = computed(() => courseProgress.value.cardStats || null)

// ─── Practice Mode ───
const practiceActive = ref(false)
const practiceComplete = ref(false)
const practiceSet = ref([])
const practiceIndex = ref(0)
const practiceShowingAnswer = ref(false)
const practiceAIScore = ref(null)
const practiceAIFeedback = ref(null)
const practiceResults = ref({ correct: 0, total: 0, accuracy: 0 })

const practiceCurrentCard = computed(() => practiceSet.value[practiceIndex.value] || { cn: '', pinyin: '', en: '' })

function startPractice(type) {
  const c = lessonCards.value
  let cards = []
  if (type === 'all') {
    cards = [...(c.vocab || []).map(v => ({ ...v, _type: 'vocab' })),
             ...(c.sentences || []).map(s => ({ ...s, _type: 'sentence' })),
             ...(c.dialogue || []).map(d => ({ ...d, _type: 'dialogue' }))]
  } else if (type === 'vocab') {
    cards = (c.vocab || []).map(v => ({ ...v, _type: 'vocab' }))
  } else if (type === 'sentences') {
    cards = (c.sentences || []).map(s => ({ ...s, _type: 'sentence' }))
  }

  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]]
  }

  practiceSet.value = cards
  practiceIndex.value = 0
  practiceShowingAnswer.value = false
  practiceActive.value = true
  practiceComplete.value = false
  practiceResults.value = { correct: 0, total: 0, accuracy: 0 }
  practiceAIScore.value = null
  practiceAIFeedback.value = null
  voiceRecording.resetRecording()
}

function playPracticeAudio() {
  if (practiceCurrentCard.value?.cn) {
    phrasesStore.playAudio(practiceCurrentCard.value.cn, 'zh-CN')
  }
}

async function handlePracticeRecording() {
  if (voiceRecording.isRecording.value) {
    voiceRecording.stopRecording()
    await new Promise(resolve => setTimeout(resolve, 300))

    if (voiceRecording.hasRecording.value && voiceRecording.audioBlob.value) {
      try {
        const card = practiceCurrentCard.value
        const phraseForAnalysis = {
          cn: card.cn,
          pinyin: card.pinyin || '',
          en: card.en || ''
        }

        const result = await pronunciationAPI.analyzePronunciation(
          voiceRecording.audioBlob.value,
          phraseForAnalysis,
          'auto'
        )

        practiceAIScore.value = result.score
        practiceAIFeedback.value = result

        // Auto-record result based on score
        const isCorrect = result.score >= 7.0
        practiceResults.value.total++
        if (isCorrect) practiceResults.value.correct++
        practiceResults.value.accuracy = Math.round((practiceResults.value.correct / practiceResults.value.total) * 100)

        practiceShowingAnswer.value = true
      } catch (error) {
        console.error('Pronunciation analysis failed:', error)
        // Fall back to manual assessment
        showPracticeAnswer(false)
      }
    }
  } else {
    voiceRecording.resetRecording()
    await voiceRecording.startRecording()
  }
}

function showPracticeAnswer(skipped) {
  practiceShowingAnswer.value = true
  if (skipped) {
    practiceResults.value.total++
    practiceResults.value.accuracy = practiceResults.value.total > 0
      ? Math.round((practiceResults.value.correct / practiceResults.value.total) * 100) : 0
  }
}

function recordPracticeResult(correct) {
  practiceResults.value.total++
  if (correct) practiceResults.value.correct++
  practiceResults.value.accuracy = Math.round((practiceResults.value.correct / practiceResults.value.total) * 100)
  nextPracticeCard()
}

function nextPracticeCard() {
  if (practiceIndex.value < practiceSet.value.length - 1) {
    practiceIndex.value++
    practiceShowingAnswer.value = false
    practiceAIScore.value = null
    practiceAIFeedback.value = null
    voiceRecording.resetRecording()
  } else {
    endPractice()
  }
}

function endPractice() {
  practiceActive.value = false
  practiceComplete.value = true

  // Save stats
  if (currentUser.value && practiceResults.value.total > 0) {
    familyStore.updateCardStats(currentUser.value.id, lessonId.value, {
      correct: practiceResults.value.correct,
      total: practiceResults.value.total,
      accuracy: practiceResults.value.accuracy / 100
    })
  }
}

function resetPractice() {
  practiceActive.value = false
  practiceComplete.value = false
  practiceResults.value = { correct: 0, total: 0, accuracy: 0 }
  voiceRecording.resetRecording()
}

// ─── Navigation ───
const adjacentLessons = computed(() => {
  if (levelId.value === 'vocab') {
    const vocabList = coursesStore.vocab
    const idx = vocabList.findIndex(v => v.id === lessonId.value)
    return {
      prev: idx > 0 ? vocabList[idx - 1] : null,
      next: idx < vocabList.length - 1 ? vocabList[idx + 1] : null
    }
  }
  return coursesStore.getAdjacentLessons(levelId.value, lessonId.value)
})

const prevLesson = computed(() => adjacentLessons.value.prev)
const nextLesson = computed(() => adjacentLessons.value.next)

function onTimeUpdate(time) {
  if (!currentUser.value) return
  familyStore.updateCourseProgress(currentUser.value.id, lessonId.value, { lastPosition: time })
}

function onPlay() {
  if (!currentUser.value) return
  familyStore.updateCourseProgress(currentUser.value.id, lessonId.value, {
    started: courseProgress.value.started || new Date().toISOString()
  })
}

function onPause() {}
function onEnded() {}

function toggleComplete() {
  if (!currentUser.value) return
  const nowCompleted = !isCompleted.value
  familyStore.updateCourseProgress(currentUser.value.id, lessonId.value, {
    completed: nowCompleted,
    completedAt: nowCompleted ? new Date().toISOString() : null
  })
}

function goToLesson(targetLesson) {
  const targetLevel = levelId.value === 'vocab' ? 'vocab' : levelId.value
  router.push({ name: 'lesson', params: { levelId: targetLevel, lessonId: targetLesson.id } })
  // Reset state for new lesson
  activeTab.value = 'listen'
  cardIndex.value = 0
  cardFlipped.value = false
  resetPractice()
}

function getResourceUrl(path) {
  return coursesStore.getResourceUrl(path)
}

function getTypeLabel(type) {
  switch (type) {
    case 'hanzi': return 'Hanzi Closeup / 汉字特写'
    case 'script': return 'Recording Script / 录音脚本'
    default: return 'Lesson Notes / 课程笔记'
  }
}
</script>
