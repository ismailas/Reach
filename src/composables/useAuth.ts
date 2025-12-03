import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from './useSupabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const supabase = useSupabase()
  const router = useRouter()
  const user = ref<User | null>(null)
  const loading = ref(true)

  const checkUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      user.value = currentUser
      return currentUser
    } catch (error) {
      console.error('Error checking user:', error)
      user.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Listen for auth changes
  onMounted(() => {
    checkUser()

    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null
      if (event === 'SIGNED_OUT') {
        router.push('/auth')
      }
    })
  })

  return {
    user,
    loading,
    checkUser,
    signOut
  }
}

