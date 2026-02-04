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

        <!-- Logged in as -->
        <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center text-sm">
          <span class="text-purple-700">Logged in as: {{ authEmail }}</span>
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
              <div class="text-xl mb-1">CN -> EN</div>
              <div>Chinese -> English</div>
              <div class="text-sm">中文 -> 英文</div>
            </button>
            <button
              @click="userDirection = 'en-to-cn'"
              :class="['py-4 rounded-lg border-2 font-medium transition-all',
                       userDirection === 'en-to-cn' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-purple-300']"
            >
              <div class="text-xl mb-1">EN -> CN</div>
              <div>English -> Chinese</div>
              <div class="text-sm">英文 -> 中文</div>
            </button>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {{ error }}
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
            :disabled="saving"
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
import { useAuth } from '../composables/useAuth'
import BilingualText from '../components/BilingualText.vue'
import BilingualButton from '../components/BilingualButton.vue'

const router = useRouter()
const familyStore = useFamilyStore()
const auth = useAuth()

const authEmail = auth.authEmail

const step = ref(1)
const familyNameEn = ref('')
const familyNameCn = ref('')
const saving = ref(false)
const error = ref(null)

const avatarOptions = ['👦', '👧', '👨', '👩', '👴', '👵', '🧒', '🧑', '👱', '🙋']
const userAvatar = ref('👤')
const userNameEn = ref('')
const userNameCn = ref('')
const userAgeGroup = ref('adult')
const userDirection = ref('cn-to-en')

function goToStep2() {
  if (!familyNameEn.value || !familyNameCn.value) {
    alert('Please enter both family names / 请输入两个家庭名称')
    return
  }
  step.value = 2
}

async function completeSetup() {
  if (!userNameEn.value || !userNameCn.value) {
    alert('Please enter both user names / 请输入两个用户名')
    return
  }

  saving.value = true
  error.value = null

  try {
    // Create family on backend
    const family = await auth.saveFamily(familyNameEn.value, familyNameCn.value)

    // Add first member on backend
    const member = await auth.addMember({
      nameEn: userNameEn.value,
      nameCn: userNameCn.value,
      avatar: userAvatar.value,
      ageGroup: userAgeGroup.value,
      learningDirection: userDirection.value
    })

    // Update local store
    familyStore.family = {
      id: family.id,
      name: family.name,
      created: family.created,
      users: [member]
    }
    familyStore.saveFamilyToStorage()
    familyStore.switchUser(member.id)

    console.log('✅ Setup complete!')
    router.push('/dashboard')
  } catch (err) {
    console.error('❌ Setup error:', err)
    error.value = err.message
  } finally {
    saving.value = false
  }
}
</script>
