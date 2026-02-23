<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Header -->
      <header class="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div class="flex items-center justify-between">
          <BilingualText
            en="Mandarin Courses"
            cn="普通话课程"
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
        <p class="text-gray-500 mt-2 text-sm">
          5 levels of audio lessons from absolute beginner to upper intermediate /
          从零基础到中高级的5个级别音频课程
        </p>
      </header>

      <!-- Continue Learning Card -->
      <div v-if="lastLesson" class="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500 mb-1">Continue where you left off / 继续上次的课程</div>
            <div class="font-bold text-gray-800">{{ lastLesson.title }}</div>
            <div class="text-sm text-gray-500">{{ lastLesson.levelName?.en }}</div>
          </div>
          <button
            @click="goToLesson(lastLesson.levelId, lastLesson.id)"
            class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Continue / 继续
          </button>
        </div>
      </div>

      <!-- Levels -->
      <div class="space-y-6">
        <div
          v-for="level in levels"
          :key="level.id"
          class="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <!-- Level Header (clickable to expand/collapse) -->
          <button
            @click="toggleLevel(level.id)"
            class="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="text-4xl">{{ level.icon }}</div>
              <div class="text-left">
                <div class="font-bold text-gray-800 text-lg">{{ level.name.en }}</div>
                <div class="text-gray-600">{{ level.name.cn }}</div>
                <div class="text-sm text-gray-500 mt-1">{{ level.description.en }}</div>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <!-- Progress Badge -->
              <div class="text-right">
                <div class="text-sm font-bold" :class="getProgressColor(level.id)">
                  {{ getLevelProgress(level.id).completed }}/{{ getLevelProgress(level.id).total }} lessons
                </div>
                <div class="w-24 h-2 bg-gray-200 rounded-full mt-1">
                  <div
                    class="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                    :style="{ width: getLevelProgress(level.id).percent + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Expand Arrow -->
              <div
                class="text-gray-400 text-xl transition-transform"
                :class="{ 'rotate-180': expandedLevels.includes(level.id) }"
              >
                &#9660;
              </div>
            </div>
          </button>

          <!-- Expanded Lesson List -->
          <div v-if="expandedLevels.includes(level.id)" class="border-t border-gray-100">
            <!-- Audio Lessons -->
            <div v-if="level.lessons && level.lessons.length > 0" class="p-6">
              <h3 class="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                Audio Lessons / 音频课程 ({{ level.lessons.length }})
              </h3>
              <div class="space-y-2">
                <button
                  v-for="lesson in sortedLessons(level.lessons)"
                  :key="lesson.id"
                  @click="goToLesson(level.id, lesson.id)"
                  class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors text-left group"
                >
                  <!-- Completion indicator -->
                  <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                       :class="isLessonCompleted(lesson.id)
                         ? 'bg-green-100 text-green-600'
                         : isLessonStarted(lesson.id)
                           ? 'bg-yellow-100 text-yellow-600'
                           : 'bg-gray-100 text-gray-400'"
                  >
                    <span v-if="isLessonCompleted(lesson.id)">&#10003;</span>
                    <span v-else-if="isLessonStarted(lesson.id)">&#9654;</span>
                    <span v-else class="text-sm">{{ lesson.order }}</span>
                  </div>

                  <!-- Lesson info -->
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-800 truncate group-hover:text-purple-700">
                      {{ lesson.title }}
                    </div>
                    <!-- Card count + practice stats -->
                    <div v-if="getCardCount(lesson.id)" class="flex items-center gap-2 mt-0.5">
                      <span class="text-xs text-purple-500">{{ getCardCount(lesson.id) }} cards</span>
                      <span v-if="getCardStats(lesson.id)" class="text-xs text-green-600">
                        {{ getCardStats(lesson.id).correct }}/{{ getCardStats(lesson.id).total }} correct
                      </span>
                    </div>
                  </div>

                  <!-- Play icon -->
                  <div class="text-gray-400 group-hover:text-purple-600 flex-shrink-0">
                    &#9654;
                  </div>
                </button>
              </div>
            </div>

            <!-- Materials Section -->
            <div v-if="level.materials && level.materials.length > 0" class="p-6 pt-0">
              <button
                @click="toggleMaterials(level.id)"
                class="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 hover:text-gray-700"
              >
                <span class="transition-transform" :class="{ 'rotate-90': expandedMaterials.includes(level.id) }">&#9654;</span>
                PDF Materials / PDF教材 ({{ level.materials.length }})
              </button>

              <div v-if="expandedMaterials.includes(level.id)" class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <a
                  v-for="material in level.materials"
                  :key="material.id"
                  :href="getResourceUrl(material.path)"
                  target="_blank"
                  class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-purple-50 transition-colors"
                >
                  <div class="text-xl flex-shrink-0">
                    <span v-if="material.type === 'hanzi'">&#23383;</span>
                    <span v-else-if="material.type === 'script'">&#128196;</span>
                    <span v-else>&#128213;</span>
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-medium text-gray-700 truncate">{{ material.title }}</div>
                    <div class="text-xs text-gray-400">{{ getTypeLabel(material.type) }}</div>
                  </div>
                </a>
              </div>
            </div>

            <!-- Vocab Audio (if any exist at this level) -->
            <div v-if="level.id === 'level-1' && vocab.length > 0" class="p-6 pt-0 border-t border-gray-100">
              <button
                @click="showVocab = !showVocab"
                class="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 hover:text-gray-700"
              >
                <span class="transition-transform" :class="{ 'rotate-90': showVocab }">&#9654;</span>
                Vocabulary Audio / 词汇音频 ({{ vocab.length }})
              </button>

              <div v-if="showVocab" class="space-y-2">
                <button
                  v-for="v in vocab"
                  :key="v.id"
                  @click="goToVocabLesson(v)"
                  class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors text-left group"
                >
                  <div class="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                    &#127911;
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-gray-800 group-hover:text-purple-700">{{ v.title }}</div>
                  </div>
                  <div class="text-gray-400 group-hover:text-purple-600">&#9654;</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCoursesStore } from '../stores/courses'
import { useFamilyStore } from '../stores/family'
import BilingualText from '../components/BilingualText.vue'
import BilingualButton from '../components/BilingualButton.vue'

const router = useRouter()
const coursesStore = useCoursesStore()
const familyStore = useFamilyStore()

const expandedLevels = ref([])
const expandedMaterials = ref([])
const showVocab = ref(false)

const levels = computed(() => coursesStore.levels)
const vocab = computed(() => coursesStore.vocab)
const lastLesson = computed(() => coursesStore.lastAccessedLesson)
const currentUser = computed(() => familyStore.currentUser)

function toggleLevel(levelId) {
  const idx = expandedLevels.value.indexOf(levelId)
  if (idx === -1) {
    expandedLevels.value.push(levelId)
  } else {
    expandedLevels.value.splice(idx, 1)
  }
}

function toggleMaterials(levelId) {
  const idx = expandedMaterials.value.indexOf(levelId)
  if (idx === -1) {
    expandedMaterials.value.push(levelId)
  } else {
    expandedMaterials.value.splice(idx, 1)
  }
}

function sortedLessons(lessons) {
  return [...lessons].sort((a, b) => a.order - b.order)
}

function getLevelProgress(levelId) {
  return coursesStore.getLevelProgress(levelId)
}

function getProgressColor(levelId) {
  const progress = getLevelProgress(levelId)
  if (progress.percent === 100) return 'text-green-600'
  if (progress.percent > 0) return 'text-yellow-600'
  return 'text-gray-400'
}

function isLessonCompleted(lessonId) {
  return currentUser.value?.courseProgress?.[lessonId]?.completed || false
}

function isLessonStarted(lessonId) {
  return !!currentUser.value?.courseProgress?.[lessonId]?.started
}

function goToLesson(levelId, lessonId) {
  router.push({ name: 'lesson', params: { levelId, lessonId } })
}

function goToVocabLesson(vocabItem) {
  // For vocab items, navigate to a lesson view with vocab context
  router.push({ name: 'lesson', params: { levelId: 'vocab', lessonId: vocabItem.id } })
}

function getResourceUrl(path) {
  return coursesStore.getResourceUrl(path)
}

function getCardCount(lessonId) {
  return coursesStore.getCardCount(lessonId)
}

function getCardStats(lessonId) {
  return currentUser.value?.courseProgress?.[lessonId]?.cardStats || null
}

function getTypeLabel(type) {
  switch (type) {
    case 'hanzi': return 'Hanzi Closeup / 汉字特写'
    case 'script': return 'Recording Script / 录音脚本'
    default: return 'Lesson Notes / 课程笔记'
  }
}
</script>
