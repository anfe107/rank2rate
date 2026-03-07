import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import app from '../app.js'
import { generateFantasyName } from '../utils/fantasyNames.js'

let mongod
let token

const BASE_PROJECTS = [
  { title: 'Webseite', actualName: 'Hans Müller' },
  { title: 'Portfolio', actualName: 'Maria Schmidt' },
  { title: 'Blog', actualName: 'Tom Weber' },
]

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
  await request(app).post('/api/auth/register').send({ email: 'lehrer@test.de', password: 'sicher123' })
  const res = await request(app).post('/api/auth/login').send({ email: 'lehrer@test.de', password: 'sicher123' })
  token = res.body.token
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

afterEach(async () => {
  const { sessions, projects } = mongoose.connection.collections
  await sessions?.deleteMany({})
  await projects?.deleteMany({})
})

async function createSession(overrides = {}) {
  return request(app)
    .post('/api/sessions')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test-Session', methods: ['drag-drop'], projects: BASE_PROJECTS, ...overrides })
}

// S1
it('S1: erstellt Session ohne Anonymisierung – displayName = actualName', async () => {
  const res = await createSession({ anonymized: false })
  expect(res.status).toBe(201)
  const names = res.body.projects.map(p => p.displayName)
  expect(names).toContain('Hans Müller')
  expect(names).toContain('Maria Schmidt')
})

// S2
it('S2: erstellt anonymisierte Session – displayName ist Fantasy-Name', async () => {
  const res = await createSession({ anonymized: true })
  expect(res.status).toBe(201)
  res.body.projects.forEach(p => {
    expect(p.displayName).not.toBe(p.actualName ?? p.displayName)
    // Fantasy-Name: CamelCase, mind. 2 Großbuchstaben
    expect(p.displayName).toMatch(/^[A-Z][a-z]+[A-Z]/)
  })
  // Fantasy-Namen eindeutig
  const names = res.body.projects.map(p => p.displayName)
  expect(new Set(names).size).toBe(names.length)
})

// S3
it('S3: GET-Session als Lehrer – actualName entschlüsselt', async () => {
  const created = await createSession({ anonymized: true })
  const sessionId = created.body.session._id

  const res = await request(app)
    .get(`/api/sessions/${sessionId}`)
    .set('Authorization', `Bearer ${token}`)

  expect(res.status).toBe(200)
  const names = res.body.projects.map(p => p.actualName)
  expect(names).toContain('Hans Müller')
})

// S4
it('S4: PATCH Abgabe – Titel und Link bearbeitbar', async () => {
  const created = await createSession()
  const { session, projects } = created.body

  const res = await request(app)
    .patch(`/api/sessions/${session._id}/projects/${projects[0]._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Neuer Titel', link: 'https://beispiel.de' })

  expect(res.status).toBe(200)
  expect(res.body.title).toBe('Neuer Titel')
  expect(res.body.link).toBe('https://beispiel.de')
})

// S5
it('S5: DELETE Abgabe erlaubt wenn > 3 verbleiben', async () => {
  const fourProjects = [...BASE_PROJECTS, { title: 'Extra', actualName: 'Extra Person' }]
  const created = await createSession({ projects: fourProjects })
  const { session, projects } = created.body

  const res = await request(app)
    .delete(`/api/sessions/${session._id}/projects/${projects[0]._id}`)
    .set('Authorization', `Bearer ${token}`)

  expect(res.status).toBe(200)
})

// S6
it('S6: DELETE Abgabe verhindert wenn nur 3 verbleiben würden', async () => {
  const created = await createSession()
  const { session, projects } = created.body

  const res = await request(app)
    .delete(`/api/sessions/${session._id}/projects/${projects[0]._id}`)
    .set('Authorization', `Bearer ${token}`)

  expect(res.status).toBe(400)
})

// S7
it('S7: GET Session ohne Auth → 401', async () => {
  const created = await createSession()
  const res = await request(app).get(`/api/sessions/${created.body.session._id}`)
  expect(res.status).toBe(401)
})

// S8
describe('S8: Fantasy-Name-Generator', () => {
  it('generiert CamelCase-Namen im Format [Adj][Adj][Kreatur]', () => {
    for (let i = 0; i < 20; i++) {
      const name = generateFantasyName()
      // CamelCase: beginnt mit Großbuchstabe, enthält mind. 2 weitere Großbuchstaben
      expect(name).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+$/)
    }
  })

  it('generiert nicht immer denselben Namen', () => {
    const names = new Set(Array.from({ length: 20 }, generateFantasyName))
    expect(names.size).toBeGreaterThan(1)
  })
})
