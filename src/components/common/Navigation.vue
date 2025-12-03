<template>
  <nav class="bg-white shadow-lg fixed bottom-0 left-0 right-0 z-50">
    <div class="flex justify-around items-center h-16">
      <button
        v-if="user"
        @click="handleSignOut"
        class="flex flex-col items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
        title="Sign Out"
      >
        <span class="text-lg mb-1">🚪</span>
        <span>Sign Out</span>
      </button>
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-200"
        :class="{
          'text-blue-600 scale-110': $route.path === item.path,
          'text-gray-600 hover:text-blue-500': $route.path !== item.path
        }"
      >
        <span class="text-lg mb-1 transition-transform duration-200">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'

const router = useRouter()
const supabase = useSupabase()
const user = ref<any>(null)

const menuItems = [
  { path: '/on-hand', label: 'On Hand', icon: '🃏' },
  { path: '/projects', label: 'Projects', icon: '📁' },
  { path: '/cards', label: 'All Cards', icon: '🃎' },
  { path: '/achievements', label: 'Achievements', icon: '🏆' },
  { path: '/profile', label: 'Profile', icon: '👤' }
]

const checkUser = async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
}

const handleSignOut = async () => {
  await supabase.auth.signOut()
  router.push('/auth')
}

onMounted(() => {
  checkUser()
  supabase.auth.onAuthStateChange(() => {
    checkUser()
  })
})
</script>

