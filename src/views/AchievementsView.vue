<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-3xl font-bold mb-6">Achievements</h1>

      <div v-if="achievementStore.loading" class="text-center py-12">
        <p class="text-gray-500">Loading achievements...</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Earned Achievements -->
        <div v-if="earnedAchievements.length > 0">
          <h2 class="text-2xl font-semibold mb-4">Earned Badges</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <Badge
              v-for="achievement in earnedAchievements"
              :key="achievement.id"
              :achievement="achievement"
              :is-earned="true"
            />
          </div>
        </div>

        <!-- Locked Achievements -->
        <div>
          <h2 class="text-2xl font-semibold mb-4">Available Badges</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <Badge
              v-for="achievement in lockedAchievements"
              :key="achievement.id"
              :achievement="achievement"
              :is-earned="false"
              :progress="getAchievementProgress(achievement)"
            />
          </div>
        </div>

        <!-- Statistics -->
        <div class="bg-white rounded-lg shadow p-6 mt-6">
          <h2 class="text-xl font-semibold mb-4">Progress</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600">
                {{ earnedAchievements.length }}
              </div>
              <div class="text-sm text-gray-600 mt-1">Earned</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-600">
                {{ lockedAchievements.length }}
              </div>
              <div class="text-sm text-gray-600 mt-1">Locked</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600">
                {{ achievementPercentage }}%
              </div>
              <div class="text-sm text-gray-600 mt-1">Complete</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-purple-600">
                {{ totalAchievements }}
              </div>
              <div class="text-sm text-gray-600 mt-1">Total</div>
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
import { computed, onMounted } from 'vue'
import { useAchievementStore } from '@/stores/achievementStore'
import { useUserStore } from '@/stores/userStore'
import Badge from '@/components/achievements/Badge.vue'
import Navigation from '@/components/common/Navigation.vue'

const achievementStore = useAchievementStore()
const userStore = useUserStore()

const earnedAchievements = computed(() => {
  return achievementStore.achievements.filter(a =>
    achievementStore.hasAchievement(a.id)
  )
})

const lockedAchievements = computed(() => {
  return achievementStore.achievements.filter(a =>
    !achievementStore.hasAchievement(a.id)
  )
})

const totalAchievements = computed(() => {
  return achievementStore.achievements.length
})

const achievementPercentage = computed(() => {
  if (totalAchievements.value === 0) return 0
  return Math.round((earnedAchievements.value.length / totalAchievements.value) * 100)
})

const getAchievementProgress = (achievement: any) => {
  if (!userStore.stats) return null
  return achievementStore.getAchievementProgress(achievement, {
    totalProjects: userStore.stats.total_projects,
    totalCards: userStore.stats.total_cards,
    totalTimePlayed: userStore.stats.total_time_played,
    completedProjects: 0 // You may need to track this separately
  })
}

onMounted(async () => {
  await Promise.all([
    achievementStore.fetchAchievements(),
    achievementStore.fetchUserAchievements(),
    userStore.fetchStats()
  ])
})
</script>
