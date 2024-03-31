import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/create-die',
      name: 'createDie',
      component: () => import('../views/CreateDieView.vue')
    },
    {
      path: '/die/:id',
      name: 'visualizeDie',
      component: () => import('../views/DieView.vue')
    },

    
    {
      path: "/:pathMatch(.*)*",
      component: () => import('../views/NotFoundView.vue'),
    },
  ]
})

export default router
