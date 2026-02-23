<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Header -->
      <header class="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <BilingualText
            en="Reference Library"
            cn="参考图书馆"
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
        <div class="flex flex-wrap gap-3 mb-4">
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
            <span class="text-sm">{{ category.name?.en || 'Category' }}</span>
          </button>
        </div>

        <!-- Search -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search books... / 搜索书籍..."
            class="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none text-gray-700"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">&#128269;</span>
        </div>
      </header>

      <!-- Results Count -->
      <div class="text-center mb-4">
        <span class="text-white text-sm bg-white/20 px-4 py-1 rounded-full">
          {{ filteredBooks.length }} books / {{ filteredBooks.length }} 本书
        </span>
      </div>

      <!-- Book Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          v-for="book in filteredBooks"
          :key="book.id"
          :href="getResourceUrl(book.path)"
          target="_blank"
          @click="trackBookOpen(book)"
          class="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group"
        >
          <!-- Category Icon -->
          <div class="flex items-center justify-between mb-3">
            <span class="text-2xl">{{ book.categoryIcon }}</span>
            <span
              class="text-xs px-2 py-1 rounded-full font-medium"
              :class="getLevelClass(book.level)"
            >
              {{ getLevelLabel(book.level) }}
            </span>
          </div>

          <!-- Title -->
          <div class="font-bold text-gray-800 mb-1 group-hover:text-purple-700 transition-colors">
            {{ book.title?.en || book.title }}
          </div>
          <div v-if="book.title?.cn" class="text-sm text-gray-500 mb-3">
            {{ book.title.cn }}
          </div>

          <!-- Description -->
          <div class="text-sm text-gray-600 mb-4 line-clamp-2">
            {{ book.description?.en || '' }}
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span>{{ book.categoryName?.en || '' }}</span>
            <span class="flex items-center gap-1 group-hover:text-purple-600">
              <span class="hidden md:inline">Open PDF &#8599;</span>
              <span class="md:hidden">Download PDF &#8595;</span>
            </span>
          </div>

          <!-- Size Warning -->
          <div v-if="book.sizeWarning" class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
            Large file (~630MB) - may take time to load / 大文件 - 加载可能需要时间
          </div>
        </a>
      </div>

      <!-- Empty State -->
      <div v-if="filteredBooks.length === 0" class="bg-white rounded-2xl shadow-xl p-12 text-center">
        <div class="text-4xl mb-4">&#128214;</div>
        <BilingualText
          en="No books found"
          cn="未找到书籍"
          class="text-xl text-gray-600"
        />
        <p class="text-gray-400 mt-2 text-sm">Try a different category or search term</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCoursesStore } from '../stores/courses'
import BilingualText from '../components/BilingualText.vue'
import BilingualButton from '../components/BilingualButton.vue'

const coursesStore = useCoursesStore()

const selectedCategory = ref(null)
const searchQuery = ref('')

const categories = computed(() => coursesStore.libraryCategories)

const filteredBooks = computed(() => {
  let books = selectedCategory.value
    ? coursesStore.getBooksByCategory(selectedCategory.value).map(b => {
        const cat = categories.value.find(c => c.id === selectedCategory.value)
        return { ...b, categoryId: cat?.id, categoryName: cat?.name, categoryIcon: cat?.icon }
      })
    : coursesStore.allBooks

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    books = books.filter(book => {
      const titleEn = (book.title?.en || book.title || '').toLowerCase()
      const titleCn = book.title?.cn || ''
      const desc = (book.description?.en || '').toLowerCase()
      return titleEn.includes(query) || titleCn.includes(query) || desc.includes(query)
    })
  }

  return books
})

function getResourceUrl(path) {
  return coursesStore.getResourceUrl(path)
}

function getLevelClass(level) {
  switch (level) {
    case 'beginner': return 'bg-green-100 text-green-700'
    case 'intermediate': return 'bg-yellow-100 text-yellow-700'
    case 'advanced': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

function getLevelLabel(level) {
  switch (level) {
    case 'beginner': return 'Beginner'
    case 'intermediate': return 'Intermediate'
    case 'advanced': return 'Advanced'
    default: return 'All Levels'
  }
}

function trackBookOpen(book) {
  console.log(`📖 Opened: ${book.title?.en || book.title}`)
}
</script>
