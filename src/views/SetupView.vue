<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
      <!-- Step Indicator -->
      <div class="flex justify-center mb-8">
        <div class="flex items-center gap-2">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center', step === 1 ? 'bg-purple-600 text-white' : 'bg-gray-200']">
            1
          </div>
          <div class="w-12 h-1 bg-gray-200"></div>
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center', step === 2 ? 'bg-purple-600 text-white' : 'bg-gray-200']">
            2
          </div>
        </div>
      </div>

      <!-- Step 1: Family Name -->
      <div v-if="step === 1" class="space-y-6">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Welcome to FamLingo!</h1>
          <h2 class="text-2xl font-bold text-gray-700">欢迎来到家语！</h2>
        </div>

        <BilingualText
          en="Let's set up your family learning space"
          cn="让我们设置您的家庭学习空间"
          class="text-center text-gray-600"
        />

        <!-- Sync from GitHub Option -->
        <div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <button
            @click="showGitHubSync = !showGitHubSync"
            class="w-full flex items-center justify-between text-left"
          >
            <div>
              <div class="font-bold text-blue-800">Already have a family on another device?</div>
              <div class="text-sm text-blue-600">已在其他设备上有家庭？</div>
            </div>
            <div class="text-2xl">{{ showGitHubSync ? '▼' : '▶' }}</div>
          </button>

          <div v-if="showGitHubSync" class="mt-4 space-y-3">
            <div class="text-sm text-gray-700 mb-3">
              Enter your GitHub sync settings to load your family data from another device.
              输入您的 GitHub 同步设置以从其他设备加载您的家庭数据。
            </div>

            <input
              v-model="syncToken"
              type="password"
              placeholder="GitHub Token (ghp_...)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />

            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="syncOwner"
                type="text"
                placeholder="Owner (goadintel)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                v-model="syncRepo"
                type="text"
                placeholder="Repo (famlingo)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <input
              v-model="syncFilePath"
              type="text"
              placeholder="File path (famlingo-family-data.json)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />

            <button
              @click="syncFromGitHub"
              :disabled="syncing"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300"
            >
              {{ syncing ? '⏳ Syncing...' : '🔄 Sync from GitHub' }}
            </button>

            <div v-if="syncError" class="text-sm text-red-600 mt-2">
              ❌ {{ syncError }}
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-3">
          <div class="flex-1 h-px bg-gray-300"></div>
          <div class="text-sm text-gray-500 font-medium">OR / 或</div>
          <div class="flex-1 h-px bg-gray-300"></div>
        </div>

        <!-- Create New Family Section -->
        <div class="text-center">
          <div class="font-bold text-gray-800">Create New Family / 创建新家庭</div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Family Name (English) / 家庭名称（英文）
            </label>
            <input
              v-model="familyNameEn"
              type="text"
              placeholder="The Chen Family"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Family Name (Chinese) / 家庭名称（中文）
            </label>
            <input
              v-model="familyNameCn"
              type="text"
              placeholder="陈家"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <BilingualButton
          en="Next: Add First User"
          cn="下一步：添加第一个用户"
          variant="primary"
          size="lg"
          class="w-full"
          @click="goToStep2"
        />
      </div>

      <!-- Step 2: First User -->
      <div v-if="step === 2" class="space-y-6">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Add Your First User</h1>
          <h2 class="text-2xl font-bold text-gray-700">添加第一个用户</h2>
        </div>

        <BilingualText
          en="Create a profile for the first family member"
          cn="为第一位家庭成员创建个人资料"
          class="text-center text-gray-600"
        />

        <!-- Avatar Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Choose Avatar / 选择头像
          </label>
          <div class="grid grid-cols-5 gap-3">
            <button
              v-for="emoji in avatarOptions"
              :key="emoji"
              @click="userAvatar = emoji"
              :class="['text-4xl p-3 rounded-lg border-2 hover:border-purple-400 transition-all',
                       userAvatar === emoji ? 'border-purple-600 bg-purple-50' : 'border-gray-200']"
            >
              {{ emoji }}
            </button>
          </div>
        </div>

        <!-- User Name -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Name (English) / 名字（英文）
            </label>
            <input
              v-model="userNameEn"
              type="text"
              placeholder="Xiaoming"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Name (Chinese) / 名字（中文）
            </label>
            <input
              v-model="userNameCn"
              type="text"
              placeholder="小明"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Age Group -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Age Group / 年龄组
          </label>
          <div class="grid grid-cols-3 gap-3">
            <button
              @click="userAgeGroup = 'child'"
              :class="['py-3 rounded-lg border-2 font-medium transition-all',
                       userAgeGroup === 'child' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300']"
            >
              <div>Child / 儿童</div>
              <div class="text-xs opacity-70">(5-12)</div>
            </button>
            <button
              @click="userAgeGroup = 'teen'"
              :class="['py-3 rounded-lg border-2 font-medium transition-all',
                       userAgeGroup === 'teen' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300']"
            >
              <div>Teen / 青少年</div>
              <div class="text-xs opacity-70">(13-17)</div>
            </button>
            <button
              @click="userAgeGroup = 'adult'"
              :class="['py-3 rounded-lg border-2 font-medium transition-all',
                       userAgeGroup === 'adult' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300']"
            >
              <div>Adult / 成人</div>
              <div class="text-xs opacity-70">(18+)</div>
            </button>
          </div>
        </div>

        <!-- Learning Direction -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Learning Direction / 学习方向
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="userDirection = 'cn-to-en'"
              :class="['py-4 rounded-lg border-2 font-medium transition-all',
                       userDirection === 'cn-to-en' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300']"
            >
              <div class="text-xl mb-1">🇨🇳 → 🇬🇧</div>
              <div>Chinese → English</div>
              <div class="text-sm">中文 → 英文</div>
            </button>
            <button
              @click="userDirection = 'en-to-cn'"
              :class="['py-4 rounded-lg border-2 font-medium transition-all',
                       userDirection === 'en-to-cn' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300']"
            >
              <div class="text-xl mb-1">🇬🇧 → 🇨🇳</div>
              <div>English → Chinese</div>
              <div class="text-sm">英文 → 中文</div>
            </button>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <BilingualButton
            en="Back"
            cn="返回"
            variant="outline"
            size="lg"
            class="flex-1"
            @click="step = 1"
          />
          <BilingualButton
            en="Start Learning!"
            cn="开始学习！"
            variant="primary"
            size="lg"
            class="flex-1"
            @click="completeSetup"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFamilyStore } from '../stores/family'
import { useGitHubSync } from '../composables/useGitHubSync'
import BilingualText from '../components/BilingualText.vue'
import BilingualButton from '../components/BilingualButton.vue'

const router = useRouter()
const familyStore = useFamilyStore()
const { saveGitHubSettings, syncWithGitHub } = useGitHubSync()

const step = ref(1)
const familyNameEn = ref('')
const familyNameCn = ref('')

// GitHub sync state
const showGitHubSync = ref(false)
const syncToken = ref('')
const syncOwner = ref('goadintel')
const syncRepo = ref('famlingo')
const syncFilePath = ref('famlingo-family-data.json')
const syncing = ref(false)
const syncError = ref(null)

const avatarOptions = ['👦', '👧', '👨', '👩', '👴', '👵', '🧒', '🧑', '👱', '🙋']
const userAvatar = ref('👤')
const userNameEn = ref('')
const userNameCn = ref('')
const userAgeGroup = ref('adult')
const userDirection = ref('cn-to-en')

async function syncFromGitHub() {
  syncError.value = null

  if (!syncToken.value || !syncOwner.value || !syncRepo.value) {
    syncError.value = 'Please fill in all fields / 请填写所有字段'
    return
  }

  syncing.value = true

  try {
    // Save GitHub settings
    saveGitHubSettings(syncToken.value, syncOwner.value, syncRepo.value, syncFilePath.value)

    // Sync from GitHub
    const result = await syncWithGitHub()

    console.log('✅ Sync successful!', result)

    // Check if we got family data
    if (familyStore.isFamilyInitialized) {
      alert(`Success! Found ${result.userCount} family members / 成功！找到 ${result.userCount} 个家庭成员`)
      router.push('/dashboard')
    } else {
      syncError.value = 'No family data found on GitHub. Create a new family below. / GitHub 上未找到家庭数据。请在下面创建新家庭。'
    }
  } catch (error) {
    console.error('❌ Sync error:', error)
    syncError.value = error.message
  } finally {
    syncing.value = false
  }
}

function goToStep2() {
  if (!familyNameEn.value || !familyNameCn.value) {
    alert('Please enter both family names / 请输入两个家庭名称')
    return
  }
  step.value = 2
}

function completeSetup() {
  if (!userNameEn.value || !userNameCn.value) {
    alert('Please enter both user names / 请输入两个用户名')
    return
  }

  familyStore.initializeFamily(familyNameEn.value, familyNameCn.value)
  const userId = familyStore.addUser({
    nameEn: userNameEn.value,
    nameCn: userNameCn.value,
    avatar: userAvatar.value,
    ageGroup: userAgeGroup.value,
    learningDirection: userDirection.value
  })
  familyStore.switchUser(userId)
  router.push('/dashboard')
}
</script>
