<template>
  <div :class="['bilingual-text', orientationClass]">
    <span class="text-en">{{ en }}</span>
    <span v-if="orientation === 'inline'" class="separator"> / </span>
    <span class="text-cn">{{ cn }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  en: {
    type: String,
    required: true
  },
  cn: {
    type: String,
    required: true
  },
  orientation: {
    type: String,
    default: 'vertical', // 'vertical' or 'inline'
    validator: (value) => ['vertical', 'inline'].includes(value)
  }
})

const orientationClass = computed(() => {
  return props.orientation === 'vertical' ? 'flex-col' : 'flex-row items-baseline'
})
</script>

<style scoped>
.bilingual-text {
  display: flex;
  gap: 0.25rem;
}

.bilingual-text.flex-col {
  align-items: center;
}

.text-en {
  font-size: 1em;
  font-weight: 600;
}

.text-cn {
  font-size: 0.9em;
  opacity: 0.9;
  font-weight: 500;
}

.separator {
  opacity: 0.5;
  margin: 0 0.25rem;
}
</style>
