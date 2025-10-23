<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAdminStore } from './stores/admin'

// Initialize admin store on app load
const adminStore = useAdminStore()

onMounted(() => {
  adminStore.loadFromStorage()
  console.log('✅ Admin store initialized')
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Noto+Sans+SC:wght@400;700&display=swap');

* {
  font-family: 'Noto Sans', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>
