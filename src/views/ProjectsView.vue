<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="container mx-auto px-4 py-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Projects</h1>
        <div class="flex gap-3">
          <button
            @click="openCreateDeckModal"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Create Deck
          </button>
          <button
            @click="openCreateProjectModal"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create Project
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Projects Section -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-semibold mb-4">Projects</h2>
          
          <div v-if="projectStore.loading" class="text-center py-8">
            <p class="text-gray-500">Loading projects...</p>
          </div>

          <div v-else-if="projectStore.projects.length === 0" class="text-center py-8">
            <p class="text-gray-500">No projects yet</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="project in projectStore.projects"
              :key="project.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="font-semibold text-lg">{{ project.name }}</h3>
                  <p v-if="project.description" class="text-sm text-gray-600 mt-1">
                    {{ project.description }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="openEditProjectModal(project)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    @click="handleDeleteProject(project.id)"
                    class="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div class="mt-3">
                <p class="text-xs text-gray-500 mb-2">Linked Decks:</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="deck in getProjectDecks(project.id)"
                    :key="deck.id"
                    class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {{ deck.name }}
                    <button
                      @click="unlinkDeck(project.id, deck.id)"
                      class="ml-1 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                  <select
                    v-model="selectedDeckForProject[project.id]"
                    @change="linkDeckToProject(project.id, selectedDeckForProject[project.id])"
                    class="px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option :value="null">+ Add Deck</option>
                    <option
                      v-for="deck in availableDecksForProject(project.id)"
                      :key="deck.id"
                      :value="deck.id"
                    >
                      {{ deck.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Decks Section -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-semibold mb-4">Decks</h2>
          
          <div v-if="deckStore.loading" class="text-center py-8">
            <p class="text-gray-500">Loading decks...</p>
          </div>

          <div v-else-if="deckStore.decks.length === 0" class="text-center py-8">
            <p class="text-gray-500">No decks yet</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="deck in deckStore.decks"
              :key="deck.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start mb-2">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-lg">{{ deck.name }}</h3>
                    <span
                      v-if="deck.is_special"
                      class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                    >
                      Special
                    </span>
                  </div>
                  <p v-if="deck.description" class="text-sm text-gray-600 mt-1">
                    {{ deck.description }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="openEditDeckModal(deck)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    @click="handleDeleteDeck(deck.id)"
                    class="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div class="mt-3">
                <p class="text-xs text-gray-500">
                  Linked to {{ getDeckProjects(deck.id).length }} project(s)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ProjectModal
      :is-open="isProjectModalOpen"
      :project="selectedProject"
      @close="closeProjectModal"
      @saved="handleProjectSaved"
    />

    <DeckModal
      :is-open="isDeckModalOpen"
      :deck="selectedDeck"
      @close="closeDeckModal"
      @saved="handleDeckSaved"
    />

    <!-- Navigation -->
    <Navigation />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { useDeckStore } from '@/stores/deckStore'
import { useSupabase } from '@/composables/useSupabase'
import ProjectModal from '@/components/common/ProjectModal.vue'
import DeckModal from '@/components/common/DeckModal.vue'
import Navigation from '@/components/common/Navigation.vue'
import type { Project, Deck } from '@/types'

const projectStore = useProjectStore()
const deckStore = useDeckStore()
const supabase = useSupabase()

const isProjectModalOpen = ref(false)
const isDeckModalOpen = ref(false)
const selectedProject = ref<Project | null>(null)
const selectedDeck = ref<Deck | null>(null)
const selectedDeckForProject = ref<Record<string, string | null>>({})
const projectDecksMap = ref<Record<string, Deck[]>>({})

const getProjectDecks = (projectId: string): Deck[] => {
  return projectDecksMap.value[projectId] || []
}

const getDeckProjects = (deckId: string): Project[] => {
  return projectStore.projects.filter(p => 
    getProjectDecks(p.id).some(d => d.id === deckId)
  )
}

const availableDecksForProject = (projectId: string): Deck[] => {
  const linkedDeckIds = getProjectDecks(projectId).map(d => d.id)
  return deckStore.decks.filter(d => !linkedDeckIds.includes(d.id))
}

const openCreateProjectModal = () => {
  selectedProject.value = null
  isProjectModalOpen.value = true
}

const openEditProjectModal = (project: Project) => {
  selectedProject.value = project
  isProjectModalOpen.value = true
}

const closeProjectModal = () => {
  isProjectModalOpen.value = false
  selectedProject.value = null
}

const handleProjectSaved = async () => {
  await projectStore.fetchProjects()
  await loadProjectDecks()
}

const openCreateDeckModal = () => {
  selectedDeck.value = null
  isDeckModalOpen.value = true
}

const openEditDeckModal = (deck: Deck) => {
  selectedDeck.value = deck
  isDeckModalOpen.value = true
}

const closeDeckModal = () => {
  isDeckModalOpen.value = false
  selectedDeck.value = null
}

const handleDeckSaved = async () => {
  await deckStore.fetchDecks()
  await loadProjectDecks()
}

const handleDeleteProject = async (id: string) => {
  if (confirm('Are you sure you want to delete this project?')) {
    await projectStore.deleteProject(id)
    await loadProjectDecks()
  }
}

const handleDeleteDeck = async (id: string) => {
  if (confirm('Are you sure you want to delete this deck?')) {
    await deckStore.deleteDeck(id)
    await loadProjectDecks()
  }
}

const linkDeckToProject = async (projectId: string, deckId: string | null) => {
  if (!deckId) return
  await projectStore.linkDeckToProject(projectId, deckId)
  selectedDeckForProject.value[projectId] = null
  await loadProjectDecks()
}

const unlinkDeck = async (projectId: string, deckId: string) => {
  await projectStore.unlinkDeckFromProject(projectId, deckId)
  await loadProjectDecks()
}

const loadProjectDecks = async () => {
  const projects = projectStore.projects
  for (const project of projects) {
    const decks = await deckStore.fetchDecksByProject(project.id)
    projectDecksMap.value[project.id] = decks
  }
}

onMounted(async () => {
  await Promise.all([
    projectStore.fetchProjects(),
    deckStore.fetchDecks()
  ])
  await loadProjectDecks()
})
</script>
