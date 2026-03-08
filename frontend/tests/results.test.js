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

/** Navigiert zur Benotungs-Phase und hakt die Checkbox an (für Tests die Speichern brauchen) */
async function goToGradingAndConfirm(wrapper) {
  await wrapper.find('button[data-testid="to-grading"]').trigger('click')
  const checkbox = wrapper.find('input[data-testid="confirm-checkbox"]')
  if (checkbox.exists()) await checkbox.setValue(true)
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

// RV2: „Noten ableiten" wechselt zu Schritt 2
it('RV2: Noten-ableiten-Button → Notenvorschlag-UI sichtbar', async () => {
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

  // p2 und p3 sind beide in Mittelfeld → Vorschlag: 2
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
it('RV6: Noten übernehmen → Abschlussansicht', async () => {
  mockFetch([
    { body: { session: SESSION, projects: PROJECTS } },
    { body: { status: 'graded', ratingResult: { grades: [] } } },
  ])
  const wrapper = await mountView()
  await flushPromises()
  await goToGradingAndConfirm(wrapper)
  await wrapper.find('button[data-testid="save-rating"]').trigger('click')
  await flushPromises()

  expect(wrapper.text()).toContain('Noten festgelegt')
})

// RV7: API-Fehler → Fehlermeldung
it('RV7: API-Fehler beim Speichern → Fehlermeldung', async () => {
  mockFetch([
    { body: { session: SESSION, projects: PROJECTS } },
    { ok: false, body: { message: 'Speichern fehlgeschlagen' } },
  ])
  const wrapper = await mountView()
  await flushPromises()
  await goToGradingAndConfirm(wrapper)
  await wrapper.find('button[data-testid="save-rating"]').trigger('click')
  await flushPromises()

  expect(wrapper.text()).toContain('Speichern fehlgeschlagen')
})

// ── Neue Tests: Sprachliche Repositionierung ──

it('RV8: Schritt 1 zeigt „Noten ableiten" statt „Jetzt benoten"', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()

  expect(wrapper.text()).toContain('Noten ableiten')
  expect(wrapper.text()).not.toContain('Jetzt benoten')
})

it('RV9: Tab heißt „Notenvorschlag" statt „Benotung"', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()

  expect(wrapper.text()).toContain('Notenvorschlag')
  expect(wrapper.text()).not.toContain('Benotung')
})

it('RV10: Vorschau zeigt „Vorschlag:" statt „Note"', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()
  await wrapper.find('button[data-testid="to-grading"]').trigger('click')

  expect(wrapper.text()).toContain('Vorschlag: 1')
  expect(wrapper.text()).toContain('Vorschlag: 2')
})

it('RV11: Manuell geänderte Note zeigt „Note:" statt „Vorschlag:"', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()
  await wrapper.find('button[data-testid="to-grading"]').trigger('click')

  await wrapper.find('select[data-testid="override-p1"]').setValue('3')

  const rows = wrapper.findAll('[data-testid="grade-row"]')
  const p1Row = rows.find(r => r.text().includes('ClumsyGoldenDragon'))
  expect(p1Row?.text()).toContain('Note: 3')
  expect(p1Row?.text()).not.toContain('Vorschlag:')
})

// ── Neue Tests: Reflexionspflicht ──

it('RV12: Speichern-Button ist disabled ohne Checkbox und ohne manuelle Änderung', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()
  await wrapper.find('button[data-testid="to-grading"]').trigger('click')

  const saveBtn = wrapper.find('button[data-testid="save-rating"]')
  expect(saveBtn.attributes('disabled')).toBeDefined()
})

it('RV13: Speichern-Button wird aktiv nach Checkbox-Klick', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()
  await wrapper.find('button[data-testid="to-grading"]').trigger('click')

  const checkbox = wrapper.find('input[data-testid="confirm-checkbox"]')
  expect(checkbox.exists()).toBe(true)
  await checkbox.setValue(true)

  const saveBtn = wrapper.find('button[data-testid="save-rating"]')
  expect(saveBtn.attributes('disabled')).toBeUndefined()
})

it('RV14: Speichern-Button wird aktiv nach manueller Notenänderung (Checkbox nicht nötig)', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()
  await wrapper.find('button[data-testid="to-grading"]').trigger('click')

  await wrapper.find('select[data-testid="override-p1"]').setValue('3')

  const saveBtn = wrapper.find('button[data-testid="save-rating"]')
  expect(saveBtn.attributes('disabled')).toBeUndefined()
})

it('RV15: Checkbox verschwindet nach manueller Notenänderung', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()
  await wrapper.find('button[data-testid="to-grading"]').trigger('click')

  // Checkbox ist anfangs da
  expect(wrapper.find('input[data-testid="confirm-checkbox"]').exists()).toBe(true)

  // Nach manueller Änderung: weg
  await wrapper.find('select[data-testid="override-p1"]').setValue('3')
  expect(wrapper.find('input[data-testid="confirm-checkbox"]').exists()).toBe(false)
})

// ── Neue Tests: Kontextnotiz ──

it('RV16: Kontextnotiz wird im API-Payload mitgesendet', async () => {
  mockFetch([
    { body: { session: SESSION, projects: PROJECTS } },
    { body: { status: 'graded', ratingResult: { grades: [] } } },
  ])
  const wrapper = await mountView()
  await flushPromises()
  await goToGradingAndConfirm(wrapper)

  // Notiz eingeben
  const textarea = wrapper.find('textarea[data-testid="grading-note"]')
  await textarea.setValue('Klasse insgesamt schwach')

  await wrapper.find('button[data-testid="save-rating"]').trigger('click')
  await flushPromises()

  // Prüfe den fetch-Aufruf
  const calls = global.fetch.mock.calls
  const ratingCall = calls.find(c => c[0]?.includes('/rating'))
  const body = JSON.parse(ratingCall[1].body)
  expect(body.note).toBe('Klasse insgesamt schwach')
})

it('RV17: Kontextnotiz wird in Abschlussansicht angezeigt', async () => {
  mockFetch([
    { body: { session: SESSION, projects: PROJECTS } },
    { body: { status: 'graded', ratingResult: { grades: [] } } },
  ])
  const wrapper = await mountView()
  await flushPromises()
  await goToGradingAndConfirm(wrapper)

  await wrapper.find('textarea[data-testid="grading-note"]').setValue('Noten angehoben')
  await wrapper.find('button[data-testid="save-rating"]').trigger('click')
  await flushPromises()

  expect(wrapper.find('[data-testid="saved-note"]').text()).toContain('Noten angehoben')
})

// ── Neue Tests: Hinweisbox ──

it('RV18: Hinweisbox erscheint in Abschlussansicht bei 0 manuellen Änderungen', async () => {
  mockFetch([
    { body: { session: SESSION, projects: PROJECTS } },
    { body: { status: 'graded', ratingResult: { grades: [] } } },
  ])
  const wrapper = await mountView()
  await flushPromises()
  await goToGradingAndConfirm(wrapper)

  // Speichern ohne manuelle Änderung
  await wrapper.find('button[data-testid="save-rating"]').trigger('click')
  await flushPromises()

  expect(wrapper.find('[data-testid="all-unchanged-hint"]').exists()).toBe(true)
  expect(wrapper.text()).toContain('Algorithmus-Vorschlag')
})

it('RV19: Hinweisbox erscheint NICHT bei ≥1 manueller Änderung', async () => {
  mockFetch([
    { body: { session: SESSION, projects: PROJECTS } },
    { body: { status: 'graded', ratingResult: { grades: [] } } },
  ])
  const wrapper = await mountView()
  await flushPromises()
  await wrapper.find('button[data-testid="to-grading"]').trigger('click')

  // Note manuell ändern
  await wrapper.find('select[data-testid="override-p1"]').setValue('3')
  await wrapper.find('button[data-testid="save-rating"]').trigger('click')
  await flushPromises()

  expect(wrapper.find('[data-testid="all-unchanged-hint"]').exists()).toBe(false)
})

// ── Neuer Test: Reihung abschließen ──

it('RV20: Button „Reihung abschließen" ist sichtbar in Schritt 1', async () => {
  mockFetch([{ body: { session: SESSION, projects: PROJECTS } }])
  const wrapper = await mountView()
  await flushPromises()

  expect(wrapper.find('button[data-testid="finish-ranking"]').exists()).toBe(true)
  expect(wrapper.text()).toContain('Reihung abschließen')
})
