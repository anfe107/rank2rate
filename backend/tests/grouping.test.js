import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import app from '../app.js'

let mongod
let token
let sessionId
let projectIds

const BASE_PROJECTS = [
  { title: 'A', actualName: 'Hans' },
  { title: 'B', actualName: 'Maria' },
  { title: 'C', actualName: 'Tom' },
]

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
  await request(app).post('/api/auth/register').send({ email: 'lehrer@test.de', password: 'sicher123' })
  const login = await request(app).post('/api/auth/login').send({ email: 'lehrer@test.de', password: 'sicher123' })
  token = login.body.token
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

async function setup() {
  const res = await request(app)
    .post('/api/sessions')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test', methods: ['drag-drop'], projects: BASE_PROJECTS })
  sessionId = res.body.session._id
  projectIds = res.body.projects.map(p => p._id)
}

// G1
it('G1: speichert Gruppierung und setzt Status auf ranked', async () => {
  await setup()
  const res = await request(app)
    .patch(`/api/sessions/${sessionId}/grouping`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      groups: [
        { label: 'Top', projectIds: [projectIds[0]] },
        { label: 'Mittelfeld', projectIds: [projectIds[1]] },
        { label: 'Unten', projectIds: [projectIds[2]] },
      ],
    })
  expect(res.status).toBe(200)
  expect(res.body.status).toBe('ranked')
  expect(res.body.groupingResult).toBeDefined()
  expect(res.body.groupingResult[0].label).toBe('Top')
})

// G2
it('G2: ohne Auth → 401', async () => {
  await setup()
  const res = await request(app)
    .patch(`/api/sessions/${sessionId}/grouping`)
    .send({ groups: [] })
  expect(res.status).toBe(401)
})

// G3
it('G3: leere Gruppen-Liste → 400', async () => {
  await setup()
  const res = await request(app)
    .patch(`/api/sessions/${sessionId}/grouping`)
    .set('Authorization', `Bearer ${token}`)
    .send({ groups: [] })
  expect(res.status).toBe(400)
})
