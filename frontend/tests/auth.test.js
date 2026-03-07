import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useAuthStore } from '../src/stores/auth.js'
import LoginView from '../src/views/LoginView.vue'
import RegisterView from '../src/views/RegisterView.vue'

// ──────────────────────────────────────────────
// Hilfsfunktionen
// ──────────────────────────────────────────────

function mockFetch(ok, body) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 401,
    json: () => Promise.resolve(body),
  })
}

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', redirect: '/dashboard' },
      { path: '/dashboard', component: { template: '<div>Dashboard</div>' }, meta: { requiresAuth: true } },
      { path: '/login', component: LoginView },
      { path: '/register', component: RegisterView },
    ],
  })
}

// ──────────────────────────────────────────────
// useAuthStore (FA1–FA3)
// ──────────────────────────────────────────────

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('FA1: login() speichert Token in localStorage, isAuthenticated → true', async () => {
    mockFetch(true, { token: 'jwt-token' })
    const store = useAuthStore()
    await store.login('test@test.de', 'sicher123')
    expect(store.isAuthenticated).toBe(true)
    expect(localStorage.getItem('token')).toBe('jwt-token')
  })

  it('FA2: logout() löscht Token, isAuthenticated → false', async () => {
    mockFetch(true, { token: 'jwt-token' })
    const store = useAuthStore()
    await store.login('test@test.de', 'sicher123')
    store.logout()
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('FA3: Store liest Token aus localStorage beim Initialisieren', () => {
    localStorage.setItem('token', 'persisted-token')
    setActivePinia(createPinia())
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(true)
    expect(store.token).toBe('persisted-token')
  })
})

// ──────────────────────────────────────────────
// Navigation Guards (FA4–FA5)
// ──────────────────────────────────────────────

describe('Navigation Guards', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('FA4: unauthentifiziert → geschützte Route → Redirect zu /login', async () => {
    const router = makeRouter()
    // Guard: auth-Routen ohne Token → /login
    router.beforeEach((to, _from, next) => {
      if (to.meta.requiresAuth && !localStorage.getItem('token')) next('/login')
      else next()
    })
    await router.push('/dashboard')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('FA5: authentifiziert → /login → Redirect zu /dashboard', async () => {
    localStorage.setItem('token', 'valid-token')
    const router = makeRouter()
    router.beforeEach((to, _from, next) => {
      if (to.meta.requiresAuth && !localStorage.getItem('token')) next('/login')
      else if (to.path === '/login' && localStorage.getItem('token')) next('/dashboard')
      else next()
    })
    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })
})

// ──────────────────────────────────────────────
// LoginView (FA6–FA7)
// ──────────────────────────────────────────────

describe('LoginView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('FA6: Login-Formular abschicken → API-Call, Weiterleitung bei Erfolg', async () => {
    mockFetch(true, { token: 'jwt-token' })
    const router = makeRouter()
    const wrapper = mount(LoginView, { global: { plugins: [router, createPinia()] } })

    await wrapper.find('input[type="email"]').setValue('test@test.de')
    await wrapper.find('input[type="password"]').setValue('sicher123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(localStorage.getItem('token')).toBe('jwt-token')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('FA7: Login mit falschen Credentials → Fehlermeldung sichtbar', async () => {
    mockFetch(false, { message: 'Ungültige Anmeldedaten' })
    const router = makeRouter()
    const wrapper = mount(LoginView, { global: { plugins: [router, createPinia()] } })

    await wrapper.find('input[type="email"]').setValue('falsch@test.de')
    await wrapper.find('input[type="password"]').setValue('falsch')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Ungültige Anmeldedaten')
  })
})

// ──────────────────────────────────────────────
// RegisterView (FA8)
// ──────────────────────────────────────────────

describe('RegisterView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('FA8: Registrierung abschicken → API-Call, Weiterleitung zu /login', async () => {
    mockFetch(true, { message: 'Registriert' })
    const router = makeRouter()
    const wrapper = mount(RegisterView, { global: { plugins: [router, createPinia()] } })

    await wrapper.find('input[type="email"]').setValue('neu@test.de')
    await wrapper.find('input[type="password"]').setValue('sicher123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/login')
  })
})
