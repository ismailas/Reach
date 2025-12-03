<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="close"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full">
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-4">
          {{ project ? 'Edit Project' : 'Create New Project' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ loading ? 'Saving...' : project ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import type { Project } from '@/types'

interface Props {
  isOpen: boolean
  project?: Project | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  saved: []
}>()

const projectStore = useProjectStore()

const loading = ref(false)
const formData = ref<Partial<Project>>({
  name: '',
  description: null
})

watch(() => props.project, (newProject) => {
  if (newProject) {
    formData.value = { ...newProject }
  } else {
    formData.value = {
      name: '',
      description: null
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  loading.value = true
  try {
    if (props.project) {
      await projectStore.updateProject(props.project.id, formData.value)
    } else {
      await projectStore.createProject(formData.value)
    }
    emit('saved')
    close()
  } catch (error) {
    console.error('Error saving project:', error)
  } finally {
    loading.value = false
  }
}

const close = () => {
  emit('close')
}
</script>

