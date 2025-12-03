import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import type { Card, CardRelationship } from '@/types'

export const useCardStore = defineStore('card', () => {
  const supabase = useSupabase()
  const cards = ref<Card[]>([])
  const relationships = ref<CardRelationship[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get current user ID (you'll need to implement auth)
  const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  }

  // Fetch all cards
  const fetchCards = async () => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { data, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      cards.value = data || []
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching cards:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch card by ID
  const fetchCardById = async (id: string): Promise<Card | null> => {
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { data, error: fetchError } = await supabase
        .from('cards')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (fetchError) throw fetchError
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching card:', err)
      return null
    }
  }

  // Create card
  const createCard = async (cardData: Partial<Card>): Promise<Card | null> => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) {
        const errorMsg = 'User not authenticated. Please sign in to create cards.'
        error.value = errorMsg
        console.error('Auth error:', errorMsg)
        return null
      }

      // Validate required fields
      if (!cardData.title || cardData.title.trim() === '') {
        const errorMsg = 'Card title is required'
        error.value = errorMsg
        return null
      }

      const { data, error: createError } = await supabase
        .from('cards')
        .insert({
          ...cardData,
          title: cardData.title.trim(),
          user_id: userId
        })
        .select()
        .single()

      if (createError) {
        // Provide more helpful error messages
        let errorMsg = createError.message
        if (createError.code === 'PGRST116' || createError.message.includes('does not exist')) {
          errorMsg = 'Database tables not found. Please run the migration file in Supabase SQL Editor.'
        } else if (createError.code === '42501' || createError.message.includes('permission')) {
          errorMsg = 'Permission denied. Please check Row Level Security (RLS) policies in Supabase.'
        } else if (createError.message.includes('violates foreign key')) {
          errorMsg = 'Invalid deck selected. Please select a valid deck or create one first.'
        }
        error.value = errorMsg
        console.error('Supabase error:', createError)
        throw new Error(errorMsg)
      }
      
      if (data) {
        cards.value.unshift(data)
      }
      return data
    } catch (err: any) {
      if (!error.value) {
        error.value = err.message || 'Failed to create card. Please try again.'
      }
      console.error('Error creating card:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Update card
  const updateCard = async (id: string, updates: Partial<Card>): Promise<Card | null> => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { data, error: updateError } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (updateError) throw updateError
      if (data) {
        const index = cards.value.findIndex(c => c.id === id)
        if (index !== -1) {
          cards.value[index] = data
        }
      }
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating card:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete card
  const deleteCard = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { error: deleteError } = await supabase
        .from('cards')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (deleteError) throw deleteError
      cards.value = cards.value.filter(c => c.id !== id)
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting card:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Fetch relationships for a card
  const fetchCardRelationships = async (cardId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('card_relationships')
        .select('*')
        .or(`card_id.eq.${cardId},related_card_id.eq.${cardId}`)

      if (fetchError) throw fetchError
      return data || []
    } catch (err: any) {
      console.error('Error fetching relationships:', err)
      return []
    }
  }

  // Create relationship
  const createRelationship = async (
    cardId: string,
    relatedCardId: string,
    relationshipType: 'blocks' | 'related' | 'depends_on'
  ): Promise<CardRelationship | null> => {
    try {
      const { data, error: createError } = await supabase
        .from('card_relationships')
        .insert({
          card_id: cardId,
          related_card_id: relatedCardId,
          relationship_type: relationshipType
        })
        .select()
        .single()

      if (createError) throw createError
      if (data) {
        relationships.value.push(data)
      }
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating relationship:', err)
      return null
    }
  }

  // Delete relationship
  const deleteRelationship = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('card_relationships')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      relationships.value = relationships.value.filter(r => r.id !== id)
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting relationship:', err)
      return false
    }
  }

  // Get related cards for a card
  const getRelatedCards = async (cardId: string): Promise<Card[]> => {
    const rels = await fetchCardRelationships(cardId)
    const relatedCardIds = rels
      .map(r => r.card_id === cardId ? r.related_card_id : r.card_id)
      .filter(id => id !== cardId)

    return cards.value.filter(c => relatedCardIds.includes(c.id))
  }

  // Filtered cards computed property
  const filteredCards = computed(() => {
    return (filters: {
      deckId?: string
      projectId?: string
      type?: string
      difficulty?: string
      priority?: string
      search?: string
    }) => {
      let result = [...cards.value]

      if (filters.deckId) {
        result = result.filter(c => c.deck_id === filters.deckId)
      }

      if (filters.type) {
        result = result.filter(c => c.type === filters.type)
      }

      if (filters.difficulty) {
        result = result.filter(c => c.difficulty === filters.difficulty)
      }

      if (filters.priority) {
        result = result.filter(c => c.priority === filters.priority)
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        result = result.filter(
          c =>
            c.title.toLowerCase().includes(searchLower) ||
            c.description?.toLowerCase().includes(searchLower)
        )
      }

      return result
    }
  })

  return {
    cards,
    relationships,
    loading,
    error,
    fetchCards,
    fetchCardById,
    createCard,
    updateCard,
    deleteCard,
    fetchCardRelationships,
    createRelationship,
    deleteRelationship,
    getRelatedCards,
    filteredCards
  }
})

