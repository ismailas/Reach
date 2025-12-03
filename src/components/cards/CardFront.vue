<template>
  <div class="card-front-content bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
    <div class="flex-1">
      <h3 class="text-xl font-bold mb-2">{{ card.title }}</h3>
      
      <p v-if="card.description" class="text-gray-600 mb-4 text-sm">
        {{ card.description }}
      </p>

      <div class="space-y-2">
        <div v-if="card.type" class="flex items-center">
          <span class="text-xs font-semibold text-gray-500 w-20">Type:</span>
          <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
            {{ card.type }}
          </span>
        </div>

        <div v-if="card.difficulty" class="flex items-center">
          <span class="text-xs font-semibold text-gray-500 w-20">Difficulty:</span>
          <span
            class="px-2 py-1 rounded text-xs font-medium"
            :class="difficultyClasses[card.difficulty]"
          >
            {{ card.difficulty.toUpperCase() }}
          </span>
        </div>

        <div v-if="card.priority" class="flex items-center">
          <span class="text-xs font-semibold text-gray-500 w-20">Priority:</span>
          <span
            class="px-2 py-1 rounded text-xs font-medium"
            :class="priorityClasses[card.priority]"
          >
            {{ card.priority.toUpperCase() }}
          </span>
        </div>

        <div v-if="card.time_estimation" class="flex items-center">
          <span class="text-xs font-semibold text-gray-500 w-20">Time:</span>
          <span class="text-sm text-gray-700">
            {{ formatTime(card.time_estimation) }}
          </span>
        </div>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-200">
      <p class="text-xs text-gray-400 text-center">Tap to flip</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Card } from '@/types'

interface Props {
  card: Card
}

defineProps<Props>()

const difficultyClasses = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800'
}

const priorityClasses = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800'
}

const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}
</script>

<style scoped>
.card-front-content {
  min-height: 300px;
}
</style>

