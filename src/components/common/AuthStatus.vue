<template>
  <div
    v-if="showWarning"
    class="fixed top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-50 max-w-md"
  >
    <div class="flex items-start gap-3">
      <span class="text-2xl">⚠️</span>
      <div class="flex-1">
        <h3 class="font-semibold text-yellow-800 mb-1">Authentication Required</h3>
        <p class="text-sm text-yellow-700 mb-2">
          You need to be signed in to create cards. Please sign in to continue.
        </p>
        <div class="flex gap-2">
          <button
            @click="goToAuth"
            class="text-xs px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Go to Sign In
          </button>
          <button
            @click="dismiss"
            class="text-xs text-yellow-800 hover:text-yellow-900 underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'

const router = useRouter()
const supabase = useSupabase()
const showWarning = ref(false)

const checkAuth = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  showWarning.value = !user
}

const dismiss = () => {
  showWarning.value = false
}

const goToAuth = () => {
  router.push('/auth')
}

onMounted(() => {
  checkAuth()
  // Check auth status periodically
  setInterval(checkAuth, 5000)
})
</script>

