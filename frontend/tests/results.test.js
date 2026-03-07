import { it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import SessionResultsView from '../src/views/SessionResultsView.vue'

const PROJECTS = [
  { _id: 'p1', displayName: 'ClumsyGoldenDragon', actualName: 'Hans' },
  { _id: 'p2', displayName: 'WiseMightyPhoenix', actualName: 'Maria' },
  { _id: 'p3', displayName: 'SleepyBraveTroll', actualName: 'Tom' },
]

const SESSION = {
  _id: 'sess1',
  title: 'Test',
  anonymized: true,
  groupCount: 3,
  methods: ['drag-drop'],
  status: 'ranked',
  groupingResult: [
    { label: 'Top', projectIds: ['p1'] },
    { label: 'Mittelfeld', projectIds: ['p2', 'p3'] }, // Gleichstand
    { label: 'Untere Gruppe', projectIds: [] },
  ],
}

function mockFetch(responses) {
  let i = 0
  global.fetch = vi.fn().mockImplementation(() => {
    const r = responses[i] ?? responses[responses.length - 1]
    i++
    return Promise.resolve({
      ok: r.ok ?? true,
      status: (r.ok ?? true) ? 200 : 500,
      json: () => Promise.resolve(r.body),
    })
  })
}

async function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  localStorage.setItem('token', 'test-token')
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/sessions/:id/results', component: SessionResultsView },
      { path: '/sessions/:id', component: { template: '<div>Manage</div>' } },
      { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    ],
  })
  await router.push('/sessions/sess1/results')
  return mount(SessionResultsView, { global: { plugins: [router, pinia] } })
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.setItem('token', 'test-token')
})
afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

// RV1: zeigt Gruppen-Ergebnis (Schritt 1)
it('RV1: lädt groupingResult und zeigt Gruppen', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()

  expect(wrapper.text()).toContain('Top')
  expect(wrapper.text()).toContain('ClumsyGoldenDragon')
  expect(wrapper.text()).toContain('Mittelfeld')
  expect(wrapper.text()).toContain('WiseMightyPhoenix')
})

// RV2: „Jetzt benoten" wechselt zu Schritt 2
it('RV2: Jetzt-benoten-Button → Benotungs-UI sichtbar', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()

  await wrapper.find('button[data-testid="to-grading"]').trigger('click')
  expect(wrapper.find('[data-testid="grade-system-select"]').exists()).toBe(true)
})

// RV3: Notensystem-Auswahl → Live-Vorschau aktualisiert sich
it('RV3: Notensystem-Wechsel aktualisiert Vorschau sofort', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()
  await wrapper.find('button[data-testid="to-grading"]').trigger('click')

  const select = wrapper.find('[data-testid="grade-system-select"]')
  await select.setValue('abitur')
  // Abiturpunkte statt Schulnoten im Preview sichtbar
  expect(wrapper.text()).toContain('15')
})

// RV4: Gleichstand → beide in Mittelfeld bekommen Note 2
it('RV4: Gleichstand – beide Abgaben in Gruppe bekommen identische Note', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()
  await wrapper.find('button[data-testid="to-grading"]').trigger('click')

  // p2 und p3 sind beide in Mittelfeld → Note 2
  const rows = wrapper.findAll('[data-testid="grade-row"]')
  const p2Row = rows.find(r => r.text().includes('WiseMightyPhoenix'))
  const p3Row = rows.find(r => r.text().includes('SleepyBraveTroll'))
  expect(p2Row?.text()).toContain('2')
  expect(p3Row?.text()).toContain('2')
})

// RV5: Manuelle Note überschreiben → visuell markiert
it('RV5: manuelle Überschreibung → markiert', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()
  await wrapper.find('button[data-testid="to-grading"]').trigger('click')

  // erste Abgabe manuell auf 3 ändern (war 1)
  const overrideSelect = wrapper.find('select[data-testid="override-p1"]')
  await overrideSelect.setValue('3')

  // visuelles Markierungs-Element vorhanden
  expect(wrapper.find('[data-testid="manual-mark-p1"]').exists()).toBe(true)
})

// RV6: Speichern → API-Call → Abschlussansicht
it('RV6: Benotung speichern → Abschlussansicht', async () => {
  mockFetch([
    { body: { session: SESSION, projects: PROJECTS } },
    { body: { status: 'graded', ratingResult: { grades: [] } } },
  ])
  const wrapper = await mountView()
  await flushPromises()
  await wrapper.find('button[data-testid="to-grading"]').trigger('click')
  await wrapper.find('button[data-testid="save-rating"]').trigger('click')
  await flushPromises()

  expect(wrapper.text()).toContain('abgeschlossen')
})

// RV7: API-Fehler → Fehlermeldung
it('RV7: API-Fehler beim Speichern → Fehlermeldung', async () => {
  mockFetch([
    { body: { session: SESSION, projects: PROJECTS } },
    { ok: false, body: { message: 'Speichern fehlgeschlagen' } },
  ])
  const wrapper = await mountView()
  await flushPromises()
  await wrapper.find('button[data-testid="to-grading"]').trigger('click')
  await wrapper.find('button[data-testid="save-rating"]').trigger('click')
  await flushPromises()

  expect(wrapper.text()).toContain('Speichern fehlgeschlagen')
})
