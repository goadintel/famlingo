<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Header with User Switcher -->
      <header class="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">{{ family.name.en }}</h1>
            <h2 class="text-2xl text-gray-600">{{ family.name.cn }}</h2>
          </div>

          <!-- Current User Display -->
          <div v-if="currentUser" class="flex items-center gap-4">
            <div class="text-right">
              <div class="font-bold text-gray-800">{{ currentUser.name.en }}</div>
              <div class="text-sm text-gray-600">{{ currentUser.name.cn }}</div>
            </div>
            <div class="text-5xl">{{ currentUser.avatar }}</div>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Family Stats -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Family Stats Cards -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <BilingualText
              en="Family Stats"
              cn="家庭统计"
              class="text-2xl font-bold text-center mb-6"
            />

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 text-center">
                <div class="text-3xl font-bold text-purple-600">{{ familyStats.totalSessions }}</div>
                <BilingualText en="Sessions" cn="练习次数" class="text-xs mt-1" orientation="vertical" />
              </div>
              <div class="bg-gradient-to-br from-pink-100 to-orange-100 rounded-xl p-4 text-center">
                <div class="text-3xl font-bold text-pink-600">{{ familyStats.totalPhrases }}</div>
                <BilingualText en="Phrases" cn="短语数" class="text-xs mt-1" orientation="vertical" />
              </div>
              <div class="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl p-4 text-center">
                <div class="text-3xl font-bold text-orange-600">{{ (familyStats.avgAccuracy * 100).toFixed(0) }}%</div>
                <BilingualText en="Accuracy" cn="准确率" class="text-xs mt-1" orientation="vertical" />
              </div>
              <div class="bg-gradient-to-br from-green-100 to-teal-100 rounded-xl p-4 text-center">
                <div class="text-3xl font-bold text-green-600">{{ familyStats.activeUsers }}/{{ familyStats.totalUsers }}</div>
                <BilingualText en="Active" cn="活跃用户" class="text-xs mt-1" orientation="vertical" />
              </div>
            </div>
          </div>

          <!-- Leaderboard -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <BilingualText
              en="🏆 Family Leaderboard"
              cn="🏆 家庭排行榜"
              class="text-2xl font-bold text-center mb-6"
            />

            <div class="space-y-3">
              <div
                v-for="(user, index) in usersByStreak"
                :key="user.id"
                :class="['flex items-center gap-4 p-4 rounded-xl transition-all',
                         user.id === currentUser?.id ? 'bg-purple-50 border-2 border-purple-300' : 'bg-gray-50 hover:bg-gray-100']"
              >
                <div class="text-2xl font-bold text-gray-400 w-8">{{ index + 1 }}</div>
                <div class="text-4xl">{{ user.avatar }}</div>
                <div class="flex-1">
                  <div class="font-bold text-gray-800">{{ user.name.en }} / {{ user.name.cn }}</div>
                  <div class="text-sm text-gray-600">
                    {{ user.stats.totalSessions }} sessions • {{ user.stats.totalPhrases }} phrases
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-purple-600">🔥 {{ user.stats.currentStreak }}</div>
                  <div class="text-xs text-gray-500">day streak / 天连续</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Quick Actions -->
        <div class="space-y-6">
          <!-- Current User Stats -->
          <div v-if="currentUser" class="bg-white rounded-2xl shadow-xl p-6">
            <BilingualText
              en="Your Progress"
              cn="你的进度"
              class="text-xl font-bold text-center mb-4"
            />

            <div class="space-y-4">
              <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
                <div class="text-sm text-gray-600 mb-1">Current Streak / 当前连续</div>
                <div class="text-3xl font-bold text-purple-600">🔥 {{ currentUser.stats.currentStreak }} days</div>
              </div>

              <div class="bg-gradient-to-r from-pink-100 to-orange-100 rounded-lg p-4">
                <div class="text-sm text-gray-600 mb-1">Total Phrases / 总短语</div>
                <div class="text-3xl font-bold text-pink-600">{{ currentUser.stats.totalPhrases }}</div>
              </div>

              <div class="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg p-4">
                <div class="text-sm text-gray-600 mb-1">Accuracy / 准确率</div>
                <div class="text-3xl font-bold text-orange-600">{{ (currentUser.stats.accuracy * 100).toFixed(0) }}%</div>
              </div>

              <div class="bg-gradient-to-r from-green-100 to-teal-100 rounded-lg p-4">
                <div class="text-sm text-gray-600 mb-1">Longest Streak / 最长连续</div>
                <div class="text-3xl font-bold text-green-600">🏆 {{ currentUser.stats.longestStreak }} days</div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <BilingualText
              en="Quick Actions"
              cn="快捷操作"
              class="text-xl font-bold text-center mb-4"
            />

            <div class="space-y-3">
              <BilingualButton
                en="Start Practice"
                cn="开始练习"
                variant="primary"
                size="lg"
                class="w-full"
                @click="$router.push('/practice')"
              />
              <BilingualButton
                en="My Common Phrases"
                cn="我的常用短语"
                variant="secondary"
                size="md"
                class="w-full"
                @click="$router.push('/my-phrases')"
              />
              <BilingualButton
                en="Browse Phrases"
                cn="浏览短语"
                variant="outline"
                size="md"
                class="w-full"
                @click="$router.push('/browse')"
              />
              <BilingualButton
                en="Settings & Sync"
                cn="设置与同步"
                variant="outline"
                size="md"
                class="w-full"
                @click="$router.push('/settings')"
              />
            </div>          </div>

          <!-- All Users List -->
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <BilingualText
              en="Switch User"
              cn="切换用户"
              class="text-xl font-bold text-center mb-4"
            />

            <div class="space-y-2">
              <button
                v-for="user in family.users"
                :key="user.id"
                @click="switchToUser(user.id)"
                :class="['w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                         user.id === currentUser?.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300']"
              >
                <div class="text-3xl">{{ user.avatar }}</div>
                <div class="flex-1 text-left">
                  <div class="font-bold text-gray-800 text-sm">{{ user.name.en }}</div>
                  <div class="text-xs text-gray-600">{{ user.name.cn }}</div>
                </div>
                <div v-if="user.stats.currentStreak > 0" class="text-sm">
                  🔥{{ user.stats.currentStreak }}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFamilyStore } from '../stores/family'
import BilingualText from '../components/BilingualText.vue'
import BilingualButton from '../components/BilingualButton.vue'

const familyStore = useFamilyStore()

const family = computed(() => familyStore.family)
const currentUser = computed(() => familyStore.currentUser)
const familyStats = computed(() => familyStore.familyStats)
const usersByStreak = computed(() => familyStore.usersByStreak)

function switchToUser(userId) {
  familyStore.switchUser(userId)
}
</script>
