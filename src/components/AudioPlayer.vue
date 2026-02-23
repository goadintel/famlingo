<template>
  <div class="bg-white rounded-2xl shadow-xl p-6">
    <!-- Now Playing Info -->
    <div class="text-center mb-4">
      <div class="font-bold text-gray-800 text-lg">{{ title }}</div>
      <div v-if="subtitle" class="text-sm text-gray-500">{{ subtitle }}</div>
    </div>

    <!-- Progress Bar -->
    <div
      class="relative h-3 bg-gray-200 rounded-full cursor-pointer mb-2 group"
      @click="seek($event)"
      ref="progressBar"
    >
      <div
        class="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all"
        :style="{ width: progressPercent + '%' }"
      ></div>
      <div
        class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-purple-600 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
        :style="{ left: progressPercent + '%', marginLeft: '-8px' }"
      ></div>
    </div>

    <!-- Time Display -->
    <div class="flex justify-between text-xs text-gray-500 mb-4">
      <span>{{ formatTime(currentTime) }}</span>
      <span>{{ formatTime(duration) }}</span>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-center gap-4">
      <button
        @click="skipBack(15)"
        class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 transition-colors"
        title="Back 15 seconds"
      >
        -15
      </button>

      <button
        @click="togglePlay"
        class="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <span v-if="isLoading" class="animate-spin">&#9696;</span>
        <span v-else-if="isPlaying">&#9208;</span>
        <span v-else>&#9654;</span>
      </button>

      <button
        @click="skipForward(15)"
        class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 transition-colors"
        title="Forward 15 seconds"
      >
        +15
      </button>
    </div>

    <!-- Playback Speed -->
    <div class="flex justify-center gap-2 mt-4">
      <button
        v-for="speed in [0.75, 1.0, 1.25, 1.5]"
        :key="speed"
        @click="setPlaybackRate(speed)"
        :class="['px-3 py-1 rounded-lg text-sm font-medium transition-all',
                 playbackRate === speed
                   ? 'bg-purple-600 text-white'
                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
      >
        {{ speed }}x
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-3 text-center text-sm text-red-500">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch, onMounted } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  initialPosition: { type: Number, default: 0 }
})

const emit = defineEmits(['timeUpdate', 'ended', 'play', 'pause'])

const progressBar = ref(null)
const isPlaying = ref(false)
const isLoading = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const playbackRate = ref(1.0)
const progressPercent = ref(0)
const error = ref('')

let audio = null

function initAudio() {
  if (audio) {
    audio.pause()
    audio.src = ''
  }

  audio = new Audio()
  audio.preload = 'metadata'
  isLoading.value = true
  error.value = ''

  audio.addEventListener('loadedmetadata', () => {
    duration.value = audio.duration
    if (props.initialPosition > 0 && props.initialPosition < audio.duration) {
      audio.currentTime = props.initialPosition
    }
    isLoading.value = false
  })

  audio.addEventListener('timeupdate', () => {
    currentTime.value = audio.currentTime
    if (audio.duration > 0) {
      progressPercent.value = (audio.currentTime / audio.duration) * 100
    }
  })

  audio.addEventListener('ended', () => {
    isPlaying.value = false
    emit('ended')
  })

  audio.addEventListener('error', () => {
    isLoading.value = false
    isPlaying.value = false
    error.value = 'Failed to load audio. Check your connection.'
  })

  audio.addEventListener('waiting', () => {
    isLoading.value = true
  })

  audio.addEventListener('canplay', () => {
    isLoading.value = false
  })

  audio.src = props.src
}

// Save position periodically
const saveInterval = setInterval(() => {
  if (isPlaying.value && audio) {
    emit('timeUpdate', audio.currentTime)
  }
}, 5000)

// Watch for src changes (lesson navigation)
watch(() => props.src, () => {
  initAudio()
})

onMounted(() => {
  initAudio()
})

onUnmounted(() => {
  clearInterval(saveInterval)
  if (audio) {
    audio.pause()
    audio.src = ''
    audio = null
  }
})

function togglePlay() {
  if (!audio) return

  if (isPlaying.value) {
    audio.pause()
    isPlaying.value = false
    emit('pause')
    emit('timeUpdate', audio.currentTime)
  } else {
    audio.play().catch(e => {
      error.value = 'Playback failed: ' + e.message
    })
    isPlaying.value = true
    emit('play')
  }
}

function seek(event) {
  if (!audio || !progressBar.value || !duration.value) return

  const rect = progressBar.value.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  audio.currentTime = percent * duration.value
  emit('timeUpdate', audio.currentTime)
}

function skipBack(seconds) {
  if (!audio) return
  audio.currentTime = Math.max(0, audio.currentTime - seconds)
}

function skipForward(seconds) {
  if (!audio) return
  audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + seconds)
}

function setPlaybackRate(rate) {
  playbackRate.value = rate
  if (audio) {
    audio.playbackRate = rate
  }
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>
