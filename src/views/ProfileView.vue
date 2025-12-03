<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-3xl font-bold mb-6">Profile</h1>

      <div v-if="userStore.loading" class="text-center py-12">
        <p class="text-gray-500">Loading profile...</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Statistics Overview -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <div class="text-3xl font-bold text-blue-600">
              {{ userStore.stats?.total_projects || 0 }}
            </div>
            <div class="text-sm text-gray-600 mt-2">Total Projects</div>
          </div>

          <div class="bg-white rounded-lg shadow p-6 text-center">
            <div class="text-3xl font-bold text-green-600">
              {{ userStore.stats?.total_cards || 0 }}
            </div>
            <div class="text-sm text-gray-600 mt-2">Total Cards</div>
          </div>

          <div class="bg-white rounded-lg shadow p-6 text-center">
            <div class="text-3xl font-bold text-purple-600">
              {{ formatTime(userStore.stats?.total_time_played || 0) }}
            </div>
            <div class="text-sm text-gray-600 mt-2">Time Played</div>
          </div>

          <div class="bg-white rounded-lg shadow p-6 text-center">
            <div class="text-3xl font-bold text-orange-600">
              {{ earnedAchievementsCount }}
            </div>
            <div class="text-sm text-gray-600 mt-2">Achievements</div>
          </div>
        </div>

        <!-- Time Played Chart -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Time Played by Project</h2>
          <div v-if="projectTimeData.length === 0" class="text-center py-8">
            <p class="text-gray-500">No data available</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="item in projectTimeData"
              :key="item.projectId"
              class="flex items-center"
            >
              <div class="w-32 text-sm font-medium truncate">{{ item.projectName }}</div>
              <div class="flex-1 mx-4">
                <div class="w-full bg-gray-200 rounded-full h-4">
                  <div
                    class="bg-blue-600 h-4 rounded-full"
                    :style="{ width: `${item.percentage}%` }"
                  ></div>
                </div>
              </div>
              <div class="w-24 text-sm text-gray-600 text-right">
                {{ formatTime(item.timeSeconds) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Hardest Cards -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Hardest Cards</h2>
          <div v-if="hardestCards.length === 0" class="text-center py-8">
            <p class="text-gray-500">No cards with difficulty data</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="card in hardestCards"
              :key="card.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <h3 class="font-semibold">{{ card.title }}</h3>
              <div class="mt-2 flex items-center gap-2">
                <span
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="getDifficultyClass(card.difficulty)"
                >
                  {{ card.difficulty?.toUpperCase() || 'N/A' }}
                </span>
                <span
                  v-if="card.priority"
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="getPriorityClass(card.priority)"
                >
                  {{ card.priority.toUpperCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Calendar -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Activity Calendar</h2>
          <div class="text-center py-8">
            <p class="text-gray-500">Calendar view coming soon</p>
            <p class="text-sm text-gray-400 mt-2">
              Track your daily progress and session history
            </p>
          </div>
        </div>

        <!-- Completion Metrics -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Completion Metrics</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-2">Overall Progress</h3>
              <div class="w-full bg-gray-200 rounded-full h-4">
                <div
                  class="bg-green-600 h-4 rounded-full transition-all"
                  :style="{ width: `${overallProgress}%` }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ overallProgress }}% Complete</p>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-2">Achievement Progress</h3>
              <div class="w-full bg-gray-200 rounded-full h-4">
                <div
                  class="bg-yellow-600 h-4 rounded-full transition-all"
                  :style="{ width: `${achievementProgress}%` }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{ earnedAchievementsCount }} / {{ totalAchievements }} Achievements
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Actions</h2>
          <button
            @click="recalculateStats"
            :disabled="userStore.loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Recalculate Statistics
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <Navigation />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useCardStore } from '@/stores/cardStore'
import { useProjectStore } from '@/stores/projectStore'
import { useAchievementStore } from '@/stores/achievementStore'
import { usePlaytimeStore } from '@/stores/playtimeStore'
import Navigation from '@/components/common/Navigation.vue'

const userStore = useUserStore()
const cardStore = useCardStore()
const projectStore = useProjectStore()
const achievementStore = useAchievementStore()
const playtimeStore = usePlaytimeStore()

const projectTimeData = ref<Array<{
  projectId: string
  projectName: string
  timeSeconds: number
  percentage: number
}>>([])

const hardestCards = computed(() => {
  const cards = cardStore.cards.filter(c => c.difficulty === 'hard')
  return cards.slice(0, 6) // Top 6 hardest cards
})

const earnedAchievementsCount = computed(() => {
  return achievementStore.userAchievements.length
})

const totalAchievements = computed(() => {
  return achievementStore.achievements.length
})

const overallProgress = computed(() => {
  // Simple progress calculation based on cards and projects
  const totalCards = userStore.stats?.total_cards || 0
  const totalProjects = userStore.stats?.total_projects || 0
  
  // This is a simplified calculation - you may want to track completion differently
  if (totalCards === 0 && totalProjects === 0) return 0
  
  // Weighted average (you can adjust this)
  return Math.min(100, Math.round((totalCards * 0.6 + totalProjects * 0.4) / 10))
})

const achievementProgress = computed(() => {
  if (totalAchievements.value === 0) return 0
  return Math.round((earnedAchievementsCount.value / totalAchievements.value) * 100)
})

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const getDifficultyClass = (difficulty: string | null): string => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'hard':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPriorityClass = (priority: string): string => {
  switch (priority) {
    case 'low':
      return 'bg-gray-100 text-gray-800'
    case 'medium':
      return 'bg-orange-100 text-orange-800'
    case 'high':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const loadProjectTimeData = async () => {
  // This would calculate time per project from sessions
  // For now, we'll show a placeholder
  projectTimeData.value = []
}

const recalculateStats = async () => {
  await userStore.recalculateStats()
  await loadProjectTimeData()
}

onMounted(async () => {
  await Promise.all([
    userStore.fetchStats(),
    cardStore.fetchCards(),
    projectStore.fetchProjects(),
    achievementStore.fetchAchievements(),
    achievementStore.fetchUserAchievements()
  ])
  await loadProjectTimeData()
})
</script>
