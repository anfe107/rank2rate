import { it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import DragDropEvaluateView from '../src/views/DragDropEvaluateView.vue'

const SESSION = {
  _id: 'sess1',
  title: 'Test-Session',
  groupCount: 3,
  anonymized: true,
  methods: ['drag-drop'],
  status: 'draft',
}
const PROJECTS = [
  { _id: 'p1', displayName: 'ClumsyGoldenDragon', actualName: 'Hans Müller' },
  { _id: 'p2', displayName: 'WiseMightyPhoenix', actualName: 'Maria Schmidt' },
  { _id: 'p3', displayName: 'SleepyBraveTroll', actualName: 'Tom Weber' },
]

function mockFetch(responses) {
  let callCount = 0
  global.fetch = vi.fn().mockImplementation(() => {
    const r = responses[callCount] ?? responses[responses.length - 1]
    callCount++
    return Promise.resolve({ ok: r.ok ?? true, status: r.ok === false ? 500 : 200, json: () => Promise.resolve(r.body) })
  })
}

async function makeRouter(id = 'sess1') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/sessions/:id/grouping', component: DragDropEvaluateView },
      { path: '/sessions/:id/results', component: { template: '<div>Results</div>' } },
      { path: '/sessions/:id', component: { template: '<div>Manage</div>' } },
    ],
  })
  await router.push(`/sessions/${id}/grouping`)
  return router
}

async function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  localStorage.setItem('token', 'test-token')
  return mount(DragDropEvaluateView, {
    global: { plugins: [await makeRouter(), pinia] },
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.setItem('token', 'test-token')
})

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

// DD1: View lädt Session und zeigt Abgaben im Pool
it('DD1: lädt Session und zeigt Abgaben im Pool', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()
  expect(wrapper.text()).toContain('ClumsyGoldenDragon')
  expect(wrapper.text()).toContain('WiseMightyPhoenix')
  expect(wrapper.text()).toContain('SleepyBraveTroll')
})

// DD2: Speichern-Button deaktiviert solange Pool nicht leer
it('DD2: Speichern-Button deaktiviert wenn Pool nicht leer', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()
  const btn = wrapper.find('button[data-testid="save"]')
  expect(btn.attributes('disabled')).toBeDefined()
})

// DD3: Anonymisierungs-Toggle zeigt/verbirgt actualName
it('DD3: Klarnamen-Toggle zeigt actualName', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()

  // Vor Toggle: Klarname nicht sichtbar
  expect(wrapper.text()).not.toContain('Hans Müller')

  // Toggle klicken
  await wrapper.find('button[data-testid="toggle-name-p1"]').trigger('click')
  expect(wrapper.text()).toContain('Hans Müller')

  // Nochmals klicken → verbirgt
  await wrapper.find('button[data-testid="toggle-name-p1"]').trigger('click')
  expect(wrapper.text()).not.toContain('Hans Müller')
})

// DD4: Pool leer → Speichern → API-Call → Weiterleitung
it('DD4: Pool leer – Speichern ruft API auf und leitet weiter', async () => {
  mockFetch([
    { body: { session: SESSION, projects: PROJECTS } },
    { body: { status: 'ranked', groupingResult: [] } },
  ])
  const wrapper = await mountView()
  await flushPromises()

  // Pool über exposed state leeren (SortableJS-Drag nicht testbar in happy-dom)
  wrapper.vm.emptyPoolForTest()
  await wrapper.vm.$nextTick()

  const btn = wrapper.find('button[data-testid="save"]')
  expect(btn.attributes('disabled')).toBeUndefined()
  await btn.trigger('click')
  await flushPromises()

  expect(global.fetch).toHaveBeenCalledTimes(2)
  expect(wrapper.vm.$router.currentRoute.value.path).toBe('/sessions/sess1/results')
})

// DD5: API-Fehler beim Speichern → Fehlermeldung
it('DD5: API-Fehler beim Speichern → Fehlermeldung', async () => {
  mockFetch([
    { body: { session: SESSION, projects: PROJECTS } },
    { ok: false, body: { message: 'Speichern fehlgeschlagen' } },
  ])
  const wrapper = await mountView()
  await flushPromises()

  wrapper.vm.emptyPoolForTest()
  await wrapper.vm.$nextTick()
  await wrapper.find('button[data-testid="save"]').trigger('click')
  await flushPromises()

  expect(wrapper.text()).toContain('Speichern fehlgeschlagen')
})
