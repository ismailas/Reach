<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-3xl font-bold mb-6">On Hand</h1>

      <!-- Playtime Management -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div v-if="!playtimeStore.activePlaytime" class="space-y-4">
          <h2 class="text-xl font-semibold mb-4">Start a Playtime</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              v-for="type in playtimeTypes"
              :key="type.value"
              @click="startPlaytime(type.value)"
              class="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ type.label }}
            </button>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-xl font-semibold">
                {{ getPlaytimeTypeLabel(playtimeStore.activePlaytime.type) }}
              </h2>
              <p class="text-sm text-gray-500">
                Started: {{ formatDate(playtimeStore.activePlaytime.started_at) }}
              </p>
            </div>
            <button
              @click="endCurrentPlaytime"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              End Playtime
            </button>
          </div>

          <!-- Deck Selection -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Normal Deck
              </label>
              <select
                v-model="selectedNormalDeck"
                @change="onDeckSelectionChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option :value="null">Select Deck</option>
                <option
                  v-for="deck in normalDecks"
                  :key="deck.id"
                  :value="deck.id"
                >
                  {{ deck.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Special Deck (Optional)
              </label>
              <select
                v-model="selectedSpecialDeck"
                @change="onDeckSelectionChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option :value="null">No Special Deck</option>
                <option
                  v-for="deck in specialDecks"
                  :key="deck.id"
                  :value="deck.id"
                >
                  {{ deck.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Selection -->
      <div v-if="playtimeStore.activePlaytime && availableCards.length > 0" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">
          Select Cards ({{ selectedCards.length }} / 7)
        </h2>
        <CardPicker
          :available-cards="availableCards"
          :selected-cards="selectedCards"
          :max-cards="7"
          :related-cards-map="relatedCardsMap"
          @update:selected-cards="handleCardSelection"
        />
        <div v-if="selectedCards.length > 0" class="mt-4">
          <button
            @click="confirmCardSelection"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Confirm Selection
          </button>
        </div>
      </div>

      <!-- Active Timers -->
      <div v-if="playtimeStore.activePlaytime && selectedCards.length > 0" class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Active Cards</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardTimer
            v-for="card in selectedCards"
            :key="card.id"
            :card="card"
            :playtime-id="playtimeStore.activePlaytime!.id"
          />
        </div>
      </div>

      <!-- Session History -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Session History</h2>
        <div v-if="playtimeStore.loading" class="text-center py-8">
          <p class="text-gray-500">Loading history...</p>
        </div>
        <div v-else-if="playtimeStore.playtimeHistory.length === 0" class="text-center py-8">
          <p class="text-gray-500">No session history yet</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="playtime in playtimeStore.playtimeHistory"
            :key="playtime.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold">{{ getPlaytimeTypeLabel(playtime.type) }}</h3>
                <p class="text-sm text-gray-500">
                  {{ formatDate(playtime.started_at) }}
                  <span v-if="playtime.ended_at">
                    - {{ formatDate(playtime.ended_at) }}
                  </span>
                </p>
              </div>
              <button
                @click="viewPlaytimeDetails(playtime.id)"
                class="text-blue-600 hover:text-blue-800 text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <Navigation />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePlaytimeStore } from '@/stores/playtimeStore'
import { useDeckStore } from '@/stores/deckStore'
import { useCardStore } from '@/stores/cardStore'
import CardPicker from '@/components/cards/CardPicker.vue'
import CardTimer from '@/components/timer/CardTimer.vue'
import Navigation from '@/components/common/Navigation.vue'
import type { Card } from '@/types'

const playtimeStore = usePlaytimeStore()
const deckStore = useDeckStore()
const cardStore = useCardStore()

const selectedNormalDeck = ref<string | null>(null)
const selectedSpecialDeck = ref<string | null>(null)
const selectedCards = ref<Card[]>([])
const relatedCardsMap = ref<Record<string, Card[]>>({})

const playtimeTypes = [
  { value: 'opening', label: 'Opening' },
  { value: 'hard_work', label: 'Hard Work' },
  { value: 'work', label: 'Work' },
  { value: 'after_work', label: 'After Work' }
]

const normalDecks = computed(() => {
  return deckStore.decks.filter(d => !d.is_special)
})

const specialDecks = computed(() => {
  return deckStore.decks.filter(d => d.is_special)
})

const availableCards = computed(() => {
  const deckIds: string[] = []
  if (selectedNormalDeck.value) deckIds.push(selectedNormalDeck.value)
  if (selectedSpecialDeck.value) deckIds.push(selectedSpecialDeck.value)

  if (deckIds.length === 0) return []

  return cardStore.cards.filter(c => deckIds.includes(c.deck_id || ''))
})

const getPlaytimeTypeLabel = (type: string): string => {
  const playtime = playtimeTypes.find(p => p.value === type)
  return playtime?.label || type
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

const startPlaytime = async (type: 'opening' | 'hard_work' | 'work' | 'after_work') => {
  await playtimeStore.createPlaytime(type, null, null)
  await playtimeStore.checkActivePlaytime()
}

const endCurrentPlaytime = async () => {
  if (confirm('Are you sure you want to end this playtime?')) {
    await playtimeStore.endPlaytime()
    selectedNormalDeck.value = null
    selectedSpecialDeck.value = null
    selectedCards.value = []
  }
}

const onDeckSelectionChange = async () => {
  selectedCards.value = []
  await loadCardsFromDecks()
}

const loadCardsFromDecks = async () => {
  await cardStore.fetchCards()
  // Load related cards for available cards
  for (const card of availableCards.value) {
    const related = await cardStore.getRelatedCards(card.id)
    relatedCardsMap.value[card.id] = related
  }
}

const handleCardSelection = (cards: Card[]) => {
  selectedCards.value = cards
}

const confirmCardSelection = async () => {
  if (!playtimeStore.activePlaytime) return

  // Map cards to their decks
  const cardsWithDecks = selectedCards.value.map(card => ({
    cardId: card.id,
    deckId: card.deck_id || selectedNormalDeck.value || selectedSpecialDeck.value || ''
  }))

  await playtimeStore.addCardsToPlaytime(cardsWithDecks)
}

const viewPlaytimeDetails = async (playtimeId: string) => {
  const sessions = await playtimeStore.getPlaytimeSessions(playtimeId)
  const stats = await playtimeStore.getPlaytimeStats(playtimeId)
  
  alert(`Playtime Details:\nTotal Sessions: ${stats.totalSessions}\nTotal Time: ${stats.totalTimeHours}h ${Math.floor((stats.totalTimeMinutes % 60))}m`)
}

onMounted(async () => {
  await Promise.all([
    deckStore.fetchDecks(),
    cardStore.fetchCards(),
    playtimeStore.checkActivePlaytime(),
    playtimeStore.fetchPlaytimeHistory()
  ])

  if (playtimeStore.activePlaytime) {
    await playtimeStore.fetchPlaytimeCards(playtimeStore.activePlaytime.id)
  }
})
</script>
