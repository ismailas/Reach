import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import type { Playtime, PlaytimeCard, CardSession } from '@/types'

export const usePlaytimeStore = defineStore('playtime', () => {
  const supabase = useSupabase()
  const activePlaytime = ref<Playtime | null>(null)
  const playtimeCards = ref<PlaytimeCard[]>([])
  const playtimeHistory = ref<Playtime[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  }

  // Create a new playtime
  const createPlaytime = async (
    type: 'opening' | 'hard_work' | 'work' | 'after_work',
    normalDeckId: string | null,
    specialDeckId: string | null
  ): Promise<Playtime | null> => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { data, error: createError } = await supabase
        .from('playtimes')
        .insert({
          type,
          started_at: new Date().toISOString(),
          user_id: userId
        })
        .select()
        .single()

      if (createError) throw createError
      activePlaytime.value = data
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating playtime:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // End current playtime
  const endPlaytime = async (): Promise<boolean> => {
    if (!activePlaytime.value) return false

    loading.value = true
    error.value = null
    try {
      const { error: updateError } = await supabase
        .from('playtimes')
        .update({
          ended_at: new Date().toISOString()
        })
        .eq('id', activePlaytime.value.id)

      if (updateError) throw updateError
      activePlaytime.value = null
      playtimeCards.value = []
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error ending playtime:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Add cards to playtime (max 7 cards, from max 2 decks)
  const addCardsToPlaytime = async (
    cards: Array<{ cardId: string; deckId: string }>
  ): Promise<boolean> => {
    if (!activePlaytime.value) {
      error.value = 'No active playtime'
      return false
    }

    if (cards.length > 7) {
      error.value = 'Maximum 7 cards allowed'
      return false
    }

    const uniqueDeckIds = [...new Set(cards.map(c => c.deckId))]
    if (uniqueDeckIds.length > 2) {
      error.value = 'Maximum 2 decks allowed'
      return false
    }

    loading.value = true
    error.value = null
    try {
      // Remove existing cards
      await supabase
        .from('playtime_cards')
        .delete()
        .eq('playtime_id', activePlaytime.value.id)

      // Add new cards
      const cardsToInsert = cards.map(card => ({
        playtime_id: activePlaytime.value!.id,
        card_id: card.cardId,
        deck_id: card.deckId
      }))

      const { error: insertError } = await supabase
        .from('playtime_cards')
        .insert(cardsToInsert)

      if (insertError) throw insertError

      await fetchPlaytimeCards(activePlaytime.value.id)
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error adding cards to playtime:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Fetch cards for a playtime
  const fetchPlaytimeCards = async (playtimeId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('playtime_cards')
        .select('*')
        .eq('playtime_id', playtimeId)

      if (fetchError) throw fetchError
      playtimeCards.value = data || []
      return data || []
    } catch (err: any) {
      console.error('Error fetching playtime cards:', err)
      return []
    }
  }

  // Fetch playtime history
  const fetchPlaytimeHistory = async (limit = 50) => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { data, error: fetchError } = await supabase
        .from('playtimes')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit)

      if (fetchError) throw fetchError
      playtimeHistory.value = data || []
      return data || []
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching playtime history:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Get sessions for a playtime
  const getPlaytimeSessions = async (playtimeId: string): Promise<CardSession[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('card_sessions')
        .select('*')
        .eq('playtime_id', playtimeId)
        .order('started_at', { ascending: true })

      if (fetchError) throw fetchError
      return data || []
    } catch (err: any) {
      console.error('Error fetching playtime sessions:', err)
      return []
    }
  }

  // Get playtime statistics
  const getPlaytimeStats = async (playtimeId: string) => {
    const sessions = await getPlaytimeSessions(playtimeId)
    const totalTime = sessions.reduce((sum, session) => {
      return sum + (session.duration_seconds || 0)
    }, 0)

    return {
      totalSessions: sessions.length,
      totalTimeSeconds: totalTime,
      totalTimeMinutes: Math.floor(totalTime / 60),
      totalTimeHours: Math.floor(totalTime / 3600)
    }
  }

  // Check if user has active playtime
  const checkActivePlaytime = async () => {
    try {
      const userId = await getUserId()
      if (!userId) return

      const { data, error: fetchError } = await supabase
        .from('playtimes')
        .select('*')
        .eq('user_id', userId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        throw fetchError
      }

      if (data) {
        activePlaytime.value = data
        await fetchPlaytimeCards(data.id)
      }
    } catch (err: any) {
      console.error('Error checking active playtime:', err)
    }
  }

  return {
    activePlaytime,
    playtimeCards,
    playtimeHistory,
    loading,
    error,
    createPlaytime,
    endPlaytime,
    addCardsToPlaytime,
    fetchPlaytimeCards,
    fetchPlaytimeHistory,
    getPlaytimeSessions,
    getPlaytimeStats,
    checkActivePlaytime
  }
})

