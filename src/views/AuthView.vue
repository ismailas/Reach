<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-3xl font-bold text-center mb-8">Reach</h1>
      
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
        {{ errorMessage }}
      </div>

      <!-- Sign In Form -->
      <div v-if="mode === 'signin'">
        <h2 class="text-2xl font-semibold mb-6 text-center">Sign In</h2>
        <form @submit.prevent="handleSignIn" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="mt-4 text-center">
          <button
            @click="mode = 'signup'"
            class="text-sm text-blue-600 hover:text-blue-800"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>

      <!-- Sign Up Form -->
      <div v-else>
        <h2 class="text-2xl font-semibold mb-6 text-center">Sign Up</h2>
        <form @submit.prevent="handleSignUp" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="•••••••• (min 6 characters)"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {{ loading ? 'Creating account...' : 'Sign Up' }}
          </button>
        </form>

        <div class="mt-4 text-center">
          <button
            @click="mode = 'signin'"
            class="text-sm text-blue-600 hover:text-blue-800"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'

const router = useRouter()
const supabase = useSupabase()

const mode = ref<'signin' | 'signup'>('signin')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const handleSignIn = async () => {
  loading.value = true
  errorMessage.value = null

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (error) throw error

    if (data.user) {
      router.push('/on-hand')
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to sign in. Please check your credentials.'
    console.error('Sign in error:', error)
  } finally {
    loading.value = false
  }
}

const handleSignUp = async () => {
  loading.value = true
  errorMessage.value = null

  try {
    if (password.value.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })

    if (error) throw error

    if (data.user) {
      // Check if email confirmation is required
      if (data.session) {
        // User is automatically signed in
        router.push('/on-hand')
      } else {
        errorMessage.value = 'Please check your email to confirm your account.'
      }
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to create account. Please try again.'
    console.error('Sign up error:', error)
  } finally {
    loading.value = false
  }
}
</script>

