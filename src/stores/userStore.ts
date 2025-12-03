import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import type { UserStats } from '@/types'

export const useUserStore = defineStore('user', () => {
  const supabase = useSupabase()
  const stats = ref<UserStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  }

  // Fetch user stats
  const fetchStats = async () => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { data, error: fetchError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (!data) {
        // Create stats if they don't exist
        const { data: newData, error: createError } = await supabase
          .from('user_stats')
          .insert({
            user_id: userId,
            total_projects: 0,
            total_cards: 0,
            total_time_played: 0
          })
          .select()
          .single()

        if (createError) throw createError
        stats.value = newData
      } else {
        stats.value = data
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching user stats:', err)
    } finally {
      loading.value = false
    }
  }

  // Update stats
  const updateStats = async (updates: Partial<UserStats>): Promise<boolean> => {
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { data, error: updateError } = await supabase
        .from('user_stats')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      if (updateError) throw updateError
      if (data) {
        stats.value = data
      }
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating stats:', err)
      return false
    }
  }

  // Recalculate stats from actual data
  const recalculateStats = async () => {
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      // Count projects
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Count cards
      const { count: cardCount } = await supabase
        .from('cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Sum total time played
      const { data: sessions } = await supabase
        .from('card_sessions')
        .select('duration_seconds')
        .eq('user_id', userId)

      const totalTime = sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0

      await updateStats({
        total_projects: projectCount || 0,
        total_cards: cardCount || 0,
        total_time_played: totalTime
      })

      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error recalculating stats:', err)
      return false
    }
  }

  return {
    stats,
    loading,
    error,
    fetchStats,
    updateStats,
    recalculateStats
  }
})

