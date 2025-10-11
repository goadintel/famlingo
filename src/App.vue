<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
    <div class="container mx-auto px-4 py-8">
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
      </header>

      <!-- Main Content -->
      <main class="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
        <BilingualText
          en="Welcome to FamLingo!"
          cn="欢迎来到家语！"
          class="text-2xl font-bold text-center mb-6"
        />

        <div class="text-center space-y-4">
          <p class="text-gray-600">
            🚀 Project setup complete / 项目设置完成<br>
            Building the 0.1% that wins in China! / 打造在中国市场成功的0.1%！
          </p>

          <div class="mt-8">
            <BilingualButton
              en="Start Learning"
              cn="开始学习"
              variant="primary"
              size="lg"
            />
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="text-center mt-8 text-white/70 text-sm">
        <p>v0.1.0 • 2025-10-12</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import BilingualText from './components/BilingualText.vue'
import BilingualButton from './components/BilingualButton.vue'
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Noto+Sans+SC:wght@400;700&display=swap');

* {
  font-family: 'Noto Sans', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>
