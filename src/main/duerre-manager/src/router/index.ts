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
      path: '/order-dashboard',
      name: 'orderDashboard',
      component: () => import('../views/OrderDashboardView.vue')
    },
    {
      path: '/create-order',
      name: 'createOrder',
      component: () => import('../views/CreateOrderView.vue')
    },

    {
      path: '/die-dashboard',
      name: 'dieDashboard',
      component: () => import('../views/DieDashboardView.vue')
    },
    {
      path: '/create-die',
      name: 'createDie',
      component: () => import('../views/CreateDieView.vue')
    },
    {
      path: '/edit-die/:id',
      name: 'editDie',
      component: () => import('../views/EditDieView.vue')
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
