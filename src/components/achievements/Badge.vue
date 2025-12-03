<template>
  <div
    class="badge-container relative"
    :class="{
      'earned': isEarned,
      'locked': !isEarned
    }"
  >
    <div class="badge-icon">
      <img
        v-if="achievement.icon_url"
        :src="achievement.icon_url"
        :alt="achievement.name"
        class="w-16 h-16 object-cover rounded-full"
      />
      <div
        v-else
        class="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
        :class="isEarned ? 'bg-yellow-400' : 'bg-gray-300'"
      >
        🏆
      </div>
    </div>
    <div class="badge-info mt-2 text-center">
      <h3 class="font-semibold text-sm">{{ achievement.name }}</h3>
      <p class="text-xs text-gray-600 mt-1">{{ achievement.description }}</p>
      <div v-if="progress && !isEarned" class="mt-2">
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all"
            :style="{ width: `${progress.percentage}%` }"
          ></div>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          {{ progress.current }} / {{ progress.target }}
        </p>
      </div>
      <div v-if="isEarned" class="mt-2">
        <span class="text-xs text-green-600 font-semibold">✓ Earned</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Achievement } from '@/types'

interface Props {
  achievement: Achievement
  isEarned: boolean
  progress?: {
    current: number
    target: number
    percentage: number
  } | null
}

defineProps<Props>()
</script>

<style scoped>
.badge-container {
  transition: transform 0.2s;
}

.badge-container:hover {
  transform: translateY(-4px);
}

.badge-container.earned {
  opacity: 1;
}

.badge-container.locked {
  opacity: 0.7;
}
</style>

