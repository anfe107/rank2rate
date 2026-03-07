import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login',                   component: () => import('../views/LoginView.vue') },
  { path: '/register',                component: () => import('../views/RegisterView.vue') },
  { path: '/dashboard',               component: () => import('../views/DashboardView.vue'),      meta: { requiresAuth: true } },
  { path: '/sessions/new',            component: () => import('../views/SessionCreateView.vue'),  meta: { requiresAuth: true } },
  { path: '/sessions/:id/grouping',   component: () => import('../views/DragDropEvaluateView.vue'), meta: { requiresAuth: true } },
  { path: '/sessions/:id',            component: () => import('../views/SessionManageView.vue'),  meta: { requiresAuth: true } },
  { path: '/sessions/:id/results',    component: () => import('../views/SessionResultsView.vue'), meta: { requiresAuth: true } },
  { path: '/session/:id',             component: () => import('../views/StudentSessionView.vue') },
  { path: '/',                        redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation Guard
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) return '/login'
  if (to.path === '/login' && token) return '/dashboard'
})

export default router
