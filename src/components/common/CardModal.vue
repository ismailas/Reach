<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="close"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-4">
          {{ card ? 'Edit Card' : 'Create New Card' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm"
          >
            {{ errorMessage }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              v-model="formData.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <input
                v-model="formData.type"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Time Estimation (minutes)
              </label>
              <input
                v-model.number="formData.time_estimation"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                v-model="formData.difficulty"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option :value="null">None</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                v-model="formData.priority"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option :value="null">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              v-model="formData.image_url"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Deck
            </label>
            <select
              v-model="formData.deck_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option :value="null">No Deck</option>
              <option
                v-for="deck in decks"
                :key="deck.id"
                :value="deck.id"
              >
                {{ deck.name }}
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ loading ? 'Saving...' : card ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useCardStore } from '@/stores/cardStore'
import { useDeckStore } from '@/stores/deckStore'
import type { Card } from '@/types'

interface Props {
  isOpen: boolean
  card?: Card | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  saved: []
}>()

const cardStore = useCardStore()
const deckStore = useDeckStore()

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const formData = ref<Partial<Card>>({
  title: '',
  description: null,
  type: null,
  difficulty: null,
  priority: null,
  time_estimation: null,
  image_url: null,
  deck_id: null
})

const decks = computed(() => deckStore.decks)

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    errorMessage.value = null
  }
})

watch(() => props.card, (newCard) => {
  if (newCard) {
    formData.value = { ...newCard }
  } else {
    formData.value = {
      title: '',
      description: null,
      type: null,
      difficulty: null,
      priority: null,
      time_estimation: null,
      image_url: null,
      deck_id: null
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  loading.value = true
  errorMessage.value = null
  
  try {
    let result
    if (props.card) {
      result = await cardStore.updateCard(props.card.id, formData.value)
    } else {
      result = await cardStore.createCard(formData.value)
    }
    
    if (!result) {
      // Check store error
      if (cardStore.error) {
        errorMessage.value = cardStore.error
      } else {
        errorMessage.value = 'Failed to save card. Please check your connection and try again.'
      }
      return
    }
    
    emit('saved')
    close()
  } catch (error: any) {
    console.error('Error saving card:', error)
    errorMessage.value = error.message || 'An unexpected error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

const close = () => {
  emit('close')
}
</script>

