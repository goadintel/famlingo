<template>
  <button
    :class="['bilingual-button', variantClass, sizeClass]"
    @click="$emit('click')"
  >
    <span class="btn-text-en">{{ en }}</span>
    <span class="btn-text-cn">{{ cn }}</span>
  </button>
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
  variant: {
    type: String,
    default: 'primary', // 'primary', 'secondary', 'outline'
    validator: (value) => ['primary', 'secondary', 'outline'].includes(value)
  },
  size: {
    type: String,
    default: 'md', // 'sm', 'md', 'lg'
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

defineEmits(['click'])

const variantClass = computed(() => {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700',
    secondary: 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
  }
  return variants[props.variant]
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  return sizes[props.size]
})
</script>

<style scoped>
.bilingual-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  border-radius: 0.75rem;
  font-weight: 700;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.bilingual-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.2);
}

.bilingual-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.btn-text-en {
  font-size: 1em;
}

.btn-text-cn {
  font-size: 0.85em;
  opacity: 0.95;
}
</style>
