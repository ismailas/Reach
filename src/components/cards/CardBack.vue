<template>
  <div class="card-back-content bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 h-full flex flex-col text-white">
    <div class="flex-1">
      <div v-if="card.image_url" class="mb-4">
        <img
          :src="card.image_url"
          :alt="card.title"
          class="w-full h-32 object-cover rounded-lg"
        />
      </div>
      <div v-else class="mb-4 h-32 bg-white/20 rounded-lg flex items-center justify-center">
        <span class="text-4xl">🃏</span>
      </div>

      <div v-if="relatedCards.length > 0" class="mt-4">
        <h4 class="text-sm font-semibold mb-2">Related Cards</h4>
        <div class="space-y-2">
          <div
            v-for="relatedCard in relatedCards"
            :key="relatedCard.id"
            class="bg-white/20 rounded p-2 text-sm"
          >
            <p class="font-medium">{{ relatedCard.title }}</p>
            <p v-if="relatedCard.type" class="text-xs opacity-75">
              {{ relatedCard.type }}
            </p>
          </div>
        </div>
      </div>
      <div v-else class="mt-4">
        <p class="text-sm opacity-75">No related cards</p>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-white/20">
      <p class="text-xs text-center opacity-75">Tap to flip back</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Card } from '@/types'

interface Props {
  card: Card
  relatedCards?: Card[]
}

withDefaults(defineProps<Props>(), {
  relatedCards: () => []
})
</script>

<style scoped>
.card-back-content {
  min-height: 300px;
}
</style>

