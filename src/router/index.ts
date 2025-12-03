import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { supabase } from '@/composables/useSupabase'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/on-hand'
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('../views/AuthView.vue')
  },
  {
    path: '/on-hand',
    name: 'OnHand',
    component: () => import('../views/OnHandView.vue')
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../views/ProjectsView.vue')
  },
  {
    path: '/cards',
    name: 'AllCards',
    component: () => import('../views/AllCardsView.vue')
  },
  {
    path: '/achievements',
    name: 'Achievements',
    component: () => import('../views/AchievementsView.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard to check authentication
router.beforeEach(async (to, from, next) => {
  // Allow access to auth page without authentication
  if (to.path === '/auth') {
    next()
    return
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to auth if not authenticated
    next('/auth')
  } else {
    next()
  }
})

export default router

