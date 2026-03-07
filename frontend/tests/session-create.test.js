import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import SessionCreateView from '../src/views/SessionCreateView.vue'

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/sessions/new', component: SessionCreateView },
      { path: '/sessions/:id', component: { template: '<div>Manage</div>' } },
      { path: '/login', component: { template: '<div>Login</div>' } },
    ],
  })
}

function mockFetch(ok, body) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 201 : 500,
    json: () => Promise.resolve(body),
  })
}

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  localStorage.setItem('token', 'test-token')
  const router = makeRouter()
  return mount(SessionCreateView, { global: { plugins: [router, pinia] } })
}

// Hilfsfunktion: Schritt 1 ausfüllen und zu Schritt 2 wechseln
async function goToStep2(wrapper, title = 'Meine Session') {
  await wrapper.find('input[data-testid="session-title"]').setValue(title)
  await wrapper.find('button[data-testid="step-next"]').trigger('click')
}

// Hilfsfunktion: Abgaben ausfüllen
async function fillProjects(wrapper, count = 3) {
  const inputs = wrapper.findAll('input[data-testid="project-title"]')
  for (let i = 0; i < Math.min(count, inputs.length); i++) {
    await inputs[i].setValue(`Abgabe ${i + 1}`)
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

// SC1: Schritt 1 ohne Titel → Weiter blockiert
it('SC1: Schritt 1 ohne Titel – Weiter-Button deaktiviert', async () => {
  const wrapper = mountView()
  const btn = wrapper.find('button[data-testid="step-next"]')
  expect(btn.attributes('disabled')).toBeDefined()
})

// SC2: Schritt 2 mit < 3 ausgefüllten Abgaben → Submit deaktiviert
it('SC2: weniger als 3 Abgaben – Session-erstellen-Button deaktiviert', async () => {
  const wrapper = mountView()
  await goToStep2(wrapper)
  // Nur 2 von 3 Abgaben ausfüllen
  const inputs = wrapper.findAll('input[data-testid="project-title"]')
  await inputs[0].setValue('Abgabe 1')
  await inputs[1].setValue('Abgabe 2')
  const btn = wrapper.find('button[data-testid="submit"]')
  expect(btn.attributes('disabled')).toBeDefined()
})

// SC3: Abgabe dynamisch hinzufügen
it('SC3: + Abgabe hinzufügen – neue Zeile erscheint', async () => {
  const wrapper = mountView()
  await goToStep2(wrapper)
  const before = wrapper.findAll('input[data-testid="project-title"]').length
  await wrapper.find('button[data-testid="add-project"]').trigger('click')
  const after = wrapper.findAll('input[data-testid="project-title"]').length
  expect(after).toBe(before + 1)
})

// SC4: Abgabe entfernen (mind. 1 bleibt im Formular)
it('SC4: Abgabe entfernen – Zeile verschwindet', async () => {
  const wrapper = mountView()
  await goToStep2(wrapper)
  await wrapper.find('button[data-testid="add-project"]').trigger('click')
  const before = wrapper.findAll('input[data-testid="project-title"]').length
  await wrapper.find('button[data-testid="remove-project"]').trigger('click')
  const after = wrapper.findAll('input[data-testid="project-title"]').length
  expect(after).toBe(before - 1)
})

// SC5: Formular abschicken → API-Call → Weiterleitung zu /sessions/:id
it('SC5: Formular abschicken → API-Call, Weiterleitung zu SessionManageView', async () => {
  mockFetch(true, {
    session: { _id: 'abc123' },
    projects: [],
  })
  const wrapper = mountView()
  await goToStep2(wrapper)
  await fillProjects(wrapper, 3)
  await wrapper.find('button[data-testid="submit"]').trigger('click')
  await flushPromises()
  expect(global.fetch).toHaveBeenCalledOnce()
  expect(wrapper.vm.$router.currentRoute.value.path).toBe('/sessions/abc123')
})

// SC6: API-Fehler → Fehlermeldung sichtbar
it('SC6: API-Fehler → Fehlermeldung angezeigt', async () => {
  mockFetch(false, { message: 'Serverfehler' })
  const wrapper = mountView()
  await goToStep2(wrapper)
  await fillProjects(wrapper, 3)
  await wrapper.find('button[data-testid="submit"]').trigger('click')
  await flushPromises()
  expect(wrapper.text()).toContain('Serverfehler')
})
