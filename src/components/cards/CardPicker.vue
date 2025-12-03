<template>
  <div class="card-picker">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="card in availableCards"
        :key="card.id"
        class="card-item"
        :class="{ 'selected': isSelected(card.id) }"
        @click="toggleCard(card)"
      >
        <div class="h-64">
          <CardFlip :card="card" :related-cards="getRelatedCards(card.id)" />
        </div>
        <div class="mt-2 text-center">
          <p class="text-sm font-medium truncate">{{ card.title }}</p>
        </div>
      </div>
    </div>

    <div v-if="selectedCards.length > 0" class="mt-6 p-4 bg-blue-50 rounded-lg">
      <p class="text-sm font-semibold mb-2">
        Selected: {{ selectedCards.length }} / {{ maxCards }}
      </p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="card in selectedCards"
          :key="card.id"
          class="px-3 py-1 bg-blue-600 text-white rounded-full text-xs flex items-center gap-2"
        >
          {{ card.title }}
          <button
            @click.stop="removeCard(card.id)"
            class="hover:bg-blue-700 rounded-full w-4 h-4 flex items-center justify-center"
          >
            ×
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '@/types'
import CardFlip from './CardFlip.vue'

interface Props {
  availableCards: Card[]
  selectedCards: Card[]
  maxCards?: number
  relatedCardsMap?: Record<string, Card[]>
}

const props = withDefaults(defineProps<Props>(), {
  maxCards: 7,
  relatedCardsMap: () => ({})
})

const emit = defineEmits<{
  'update:selectedCards': [cards: Card[]]
}>()

const isSelected = (cardId: string): boolean => {
  return props.selectedCards.some(c => c.id === cardId)
}

const toggleCard = (card: Card) => {
  if (isSelected(card.id)) {
    removeCard(card.id)
  } else {
    if (props.selectedCards.length < props.maxCards) {
      emit('update:selectedCards', [...props.selectedCards, card])
    }
  }
}

const removeCard = (cardId: string) => {
  emit('update:selectedCards', props.selectedCards.filter(c => c.id !== cardId))
}

const getRelatedCards = (cardId: string): Card[] => {
  return props.relatedCardsMap[cardId] || []
}
</script>

<style scoped>
.card-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-item:hover {
  transform: translateY(-4px) scale(1.02);
}

.card-item.selected {
  outline: 3px solid #3b82f6;
  outline-offset: 4px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}
</style>

