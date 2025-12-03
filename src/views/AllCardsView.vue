<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="container mx-auto px-4 py-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">All Cards</h1>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create Card
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search cards..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Deck</label>
            <select
              v-model="filters.deckId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option :value="undefined">All Decks</option>
              <option
                v-for="deck in deckStore.decks"
                :key="deck.id"
                :value="deck.id"
              >
                {{ deck.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              v-model="filters.difficulty"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option :value="undefined">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              v-model="filters.priority"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option :value="undefined">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Cards Grid -->
      <div v-if="cardStore.loading" class="text-center py-12">
        <p class="text-gray-500">Loading cards...</p>
      </div>

      <div v-else-if="filteredCards.length === 0" class="text-center py-12">
        <p class="text-gray-500">No cards found</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="card in filteredCards"
          :key="card.id"
          class="cursor-pointer"
          @click="openEditModal(card)"
        >
          <div class="h-80">
            <CardFlip :card="card" :related-cards="getRelatedCards(card.id)" />
          </div>
          <div class="mt-2 flex justify-between items-center">
            <span class="text-sm font-medium">{{ card.title }}</span>
            <button
              @click.stop="handleDelete(card.id)"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Modal -->
    <CardModal
      :is-open="isModalOpen"
      :card="selectedCard"
      @close="closeModal"
      @saved="handleCardSaved"
    />

    <!-- Navigation -->
    <Navigation />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { useDeckStore } from '@/stores/deckStore'
import CardFlip from '@/components/cards/CardFlip.vue'
import CardModal from '@/components/common/CardModal.vue'
import Navigation from '@/components/common/Navigation.vue'
import type { Card } from '@/types'

const cardStore = useCardStore()
const deckStore = useDeckStore()

const isModalOpen = ref(false)
const selectedCard = ref<Card | null>(null)

const filters = ref({
  deckId: undefined as string | undefined,
  type: undefined as string | undefined,
  difficulty: undefined as string | undefined,
  priority: undefined as string | undefined,
  search: ''
})

const relatedCardsMap = ref<Record<string, Card[]>>({})

const filteredCards = computed(() => {
  return cardStore.filteredCards(filters.value)
})

const getRelatedCards = (cardId: string): Card[] => {
  return relatedCardsMap.value[cardId] || []
}

const openCreateModal = () => {
  selectedCard.value = null
  isModalOpen.value = true
}

const openEditModal = (card: Card) => {
  selectedCard.value = card
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedCard.value = null
}

const handleCardSaved = async () => {
  await cardStore.fetchCards()
  await loadRelatedCards()
}

const handleDelete = async (cardId: string) => {
  if (confirm('Are you sure you want to delete this card?')) {
    await cardStore.deleteCard(cardId)
    await cardStore.fetchCards()
  }
}

const loadRelatedCards = async () => {
  const cards = filteredCards.value
  for (const card of cards) {
    const related = await cardStore.getRelatedCards(card.id)
    relatedCardsMap.value[card.id] = related
  }
}

onMounted(async () => {
  await Promise.all([
    cardStore.fetchCards(),
    deckStore.fetchDecks()
  ])
  await loadRelatedCards()
})
</script>
