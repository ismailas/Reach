<template>
  <div class="card-timer bg-white rounded-lg shadow-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">{{ card.title }}</h3>
      <button
        v-if="isActive"
        @click="stopTimer"
        class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
      >
        Stop
      </button>
    </div>

    <div class="text-center mb-4">
      <div class="text-4xl font-mono font-bold text-blue-600">
        {{ timer.formattedTime }}
      </div>
      <p class="text-sm text-gray-500 mt-2">
        {{ isActive ? 'Timer running...' : 'Timer stopped' }}
      </p>
    </div>

    <div class="flex gap-2 justify-center">
      <button
        v-if="!isActive"
        @click="startTimer"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Start
      </button>
      <button
        v-if="isActive"
        @click="pauseTimer"
        class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
      >
        Pause
      </button>
      <button
        @click="resetTimer"
        class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTimer } from '@/composables/useTimer'
import { useSupabase } from '@/composables/useSupabase'
import type { Card } from '@/types'

interface Props {
  card: Card
  playtimeId: string
}

const props = defineProps<Props>()

const supabase = useSupabase()
const timer = useTimer()
const isActive = ref(false)
const sessionId = ref<string | null>(null)

const getUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

const startTimer = async () => {
  if (isActive.value) return

  const userId = await getUserId()
  if (!userId) return

  // Create or resume session
  if (sessionId.value) {
    // Resume existing session
    timer.resume(timer.elapsedSeconds.value)
  } else {
    // Create new session
    const { data, error } = await supabase
      .from('card_sessions')
      .insert({
        card_id: props.card.id,
        playtime_id: props.playtimeId,
        user_id: userId,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return
    }

    sessionId.value = data.id
    timer.start()
  }

  isActive.value = true
}

const pauseTimer = () => {
  timer.stop()
  isActive.value = false
}

const stopTimer = async () => {
  if (!sessionId.value) return

  const userId = await getUserId()
  if (!userId) return

  timer.stop()
  isActive.value = false

  // Update session with end time and duration
  const { error } = await supabase
    .from('card_sessions')
    .update({
      ended_at: new Date().toISOString(),
      duration_seconds: timer.elapsedSeconds.value
    })
    .eq('id', sessionId.value)

  if (error) {
    console.error('Error updating session:', error)
  }

  sessionId.value = null
  timer.reset()
}

const resetTimer = () => {
  stopTimer()
}

// Load existing active session on mount
onMounted(async () => {
  const userId = await getUserId()
  if (!userId) return

  const { data, error } = await supabase
    .from('card_sessions')
    .select('*')
    .eq('card_id', props.card.id)
    .eq('playtime_id', props.playtimeId)
    .eq('user_id', userId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (data && !error) {
    sessionId.value = data.id
    const startTime = new Date(data.started_at)
    const now = new Date()
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
    timer.elapsedSeconds.value = elapsed
    // Auto-resume if session exists
    timer.resume(elapsed)
    isActive.value = true
  }
})

onUnmounted(() => {
  if (isActive.value) {
    stopTimer()
  }
})
</script>

<style scoped>
.card-timer {
  min-width: 250px;
}
</style>

