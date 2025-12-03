import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import type { Deck, ProjectDeck } from '@/types'

export const useDeckStore = defineStore('deck', () => {
  const supabase = useSupabase()
  const decks = ref<Deck[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  }

  const fetchDecks = async () => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { data, error: fetchError } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      decks.value = data || []
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching decks:', err)
    } finally {
      loading.value = false
    }
  }

  const createDeck = async (deckData: Partial<Deck>): Promise<Deck | null> => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { data, error: createError } = await supabase
        .from('decks')
        .insert({
          ...deckData,
          user_id: userId
        })
        .select()
        .single()

      if (createError) throw createError
      if (data) {
        decks.value.unshift(data)
      }
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating deck:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateDeck = async (id: string, updates: Partial<Deck>): Promise<Deck | null> => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { data, error: updateError } = await supabase
        .from('decks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (updateError) throw updateError
      if (data) {
        const index = decks.value.findIndex(d => d.id === id)
        if (index !== -1) {
          decks.value[index] = data
        }
      }
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating deck:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteDeck = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { error: deleteError } = await supabase
        .from('decks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (deleteError) throw deleteError
      decks.value = decks.value.filter(d => d.id !== id)
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting deck:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchDecksByProject = async (projectId: string): Promise<Deck[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('project_decks')
        .select('deck_id, decks(*)')
        .eq('project_id', projectId)

      if (fetchError) throw fetchError
      return (data || []).map((item: any) => item.decks).filter(Boolean)
    } catch (err: any) {
      console.error('Error fetching project decks:', err)
      return []
    }
  }

  return {
    decks,
    loading,
    error,
    fetchDecks,
    createDeck,
    updateDeck,
    deleteDeck,
    fetchDecksByProject
  }
})

