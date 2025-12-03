import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import type { Achievement, UserAchievement } from '@/types'

export const useAchievementStore = defineStore('achievement', () => {
  const supabase = useSupabase()
  const achievements = ref<Achievement[]>([])
  const userAchievements = ref<UserAchievement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  }

  // Fetch all achievements
  const fetchAchievements = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      achievements.value = data || []
      return data || []
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching achievements:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch user's earned achievements
  const fetchUserAchievements = async () => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { data, error: fetchError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      if (fetchError) throw fetchError
      userAchievements.value = data || []
      return data || []
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching user achievements:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Check if user has earned an achievement
  const hasAchievement = (achievementId: string): boolean => {
    return userAchievements.value.some(ua => ua.achievement_id === achievementId)
  }

  // Unlock achievement for user
  const unlockAchievement = async (achievementId: string): Promise<boolean> => {
    if (hasAchievement(achievementId)) {
      return false // Already unlocked
    }

    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { data, error: unlockError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId
        })
        .select()
        .single()

      if (unlockError) throw unlockError
      if (data) {
        userAchievements.value.push(data)
      }
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error unlocking achievement:', err)
      return false
    }
  }

  // Check and unlock achievements based on criteria
  const checkAchievements = async (stats: {
    totalProjects?: number
    totalCards?: number
    totalTimePlayed?: number
    completedProjects?: number
  }) => {
    await fetchAchievements()

    for (const achievement of achievements.value) {
      if (hasAchievement(achievement.id)) continue

      const criteria = achievement.criteria
      let shouldUnlock = true

      if (criteria.minProjects && (stats.totalProjects || 0) < criteria.minProjects) {
        shouldUnlock = false
      }

      if (criteria.minCards && (stats.totalCards || 0) < criteria.minCards) {
        shouldUnlock = false
      }

      if (criteria.minTimePlayed && (stats.totalTimePlayed || 0) < criteria.minTimePlayed) {
        shouldUnlock = false
      }

      if (criteria.minCompletedProjects && (stats.completedProjects || 0) < criteria.minCompletedProjects) {
        shouldUnlock = false
      }

      if (shouldUnlock) {
        await unlockAchievement(achievement.id)
      }
    }
  }

  // Get achievement progress
  const getAchievementProgress = (achievement: Achievement, stats: {
    totalProjects?: number
    totalCards?: number
    totalTimePlayed?: number
    completedProjects?: number
  }): { current: number; target: number; percentage: number } => {
    const criteria = achievement.criteria
    let current = 0
    let target = 0

    if (criteria.minProjects) {
      current = stats.totalProjects || 0
      target = criteria.minProjects
    } else if (criteria.minCards) {
      current = stats.totalCards || 0
      target = criteria.minCards
    } else if (criteria.minTimePlayed) {
      current = stats.totalTimePlayed || 0
      target = criteria.minTimePlayed
    } else if (criteria.minCompletedProjects) {
      current = stats.completedProjects || 0
      target = criteria.minCompletedProjects
    }

    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0

    return { current, target, percentage }
  }

  return {
    achievements,
    userAchievements,
    loading,
    error,
    fetchAchievements,
    fetchUserAchievements,
    hasAchievement,
    unlockAchievement,
    checkAchievements,
    getAchievementProgress
  }
})

