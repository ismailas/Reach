import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import type { Project, ProjectDeck } from '@/types'

export const useProjectStore = defineStore('project', () => {
  const supabase = useSupabase()
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  }

  const fetchProjects = async () => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      projects.value = data || []
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  const createProject = async (projectData: Partial<Project>): Promise<Project | null> => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { data, error: createError } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: userId
        })
        .select()
        .single()

      if (createError) throw createError
      if (data) {
        projects.value.unshift(data)
      }
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating project:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { data, error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (updateError) throw updateError
      if (data) {
        const index = projects.value.findIndex(p => p.id === id)
        if (index !== -1) {
          projects.value[index] = data
        }
      }
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating project:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteProject = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      const userId = await getUserId()
      if (!userId) throw new Error('User not authenticated')

      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (deleteError) throw deleteError
      projects.value = projects.value.filter(p => p.id !== id)
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting project:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const linkDeckToProject = async (projectId: string, deckId: string): Promise<boolean> => {
    try {
      const { error: linkError } = await supabase
        .from('project_decks')
        .insert({
          project_id: projectId,
          deck_id: deckId
        })

      if (linkError) throw linkError
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error linking deck to project:', err)
      return false
    }
  }

  const unlinkDeckFromProject = async (projectId: string, deckId: string): Promise<boolean> => {
    try {
      const { error: unlinkError } = await supabase
        .from('project_decks')
        .delete()
        .eq('project_id', projectId)
        .eq('deck_id', deckId)

      if (unlinkError) throw unlinkError
      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Error unlinking deck from project:', err)
      return false
    }
  }

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    linkDeckToProject,
    unlinkDeckFromProject
  }
})

