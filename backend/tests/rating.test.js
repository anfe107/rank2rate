import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import app from '../app.js'
import { gradeFromGroups } from '../utils/grading.js'

// ──────────────────────────────────────────────
// Unit-Tests: gradeFromGroups
// ──────────────────────────────────────────────

describe('gradeFromGroups', () => {
  const SCHULNOTEN = [1, 2, 3, 4, 5, 6]

  // R1: 3 Gruppen, Schulnoten 1–6 → Noten 1, 2, 3
  it('R1: 3 Gruppen auf Schulnoten – von oben beginnen', () => {
    const groups = [
      { label: 'Top', projectIds: ['a'] },
      { label: 'Mittelfeld', projectIds: ['b'] },
      { label: 'Unten', projectIds: ['c'] },
    ]
    const result = gradeFromGroups(groups, SCHULNOTEN)
    expect(result.find(r => r.projectId === 'a').computedGrade).toBe(1)
    expect(result.find(r => r.projectId === 'b').computedGrade).toBe(2)
    expect(result.find(r => r.projectId === 'c').computedGrade).toBe(3)
  })

  // R2: 4 Abgaben, 6 Noten → Noten 1–4, Noten 5–6 unbesetzt
  it('R2: 4 Gruppen auf 6 Noten – untere Noten bleiben unbesetzt', () => {
    const groups = [
      { label: 'G1', projectIds: ['a'] },
      { label: 'G2', projectIds: ['b'] },
      { label: 'G3', projectIds: ['c'] },
      { label: 'G4', projectIds: ['d'] },
    ]
    const result = gradeFromGroups(groups, SCHULNOTEN)
    const grades = result.map(r => r.computedGrade)
    expect(grades).toContain(1)
    expect(grades).toContain(4)
    expect(grades).not.toContain(5)
    expect(grades).not.toContain(6)
  })

  // R3: Gleichstand – beide Abgaben in einer Gruppe bekommen dieselbe (bessere) Note
  it('R3: Gleichstand – beide Projekte in einer Gruppe bekommen identische Note', () => {
    const groups = [
      { label: 'Top', projectIds: ['a'] },
      { label: 'Mittelfeld', projectIds: ['b', 'c'] }, // Gleichstand
      { label: 'Unten', projectIds: ['d'] },
    ]
    const result = gradeFromGroups(groups, SCHULNOTEN)
    const gradeB = result.find(r => r.projectId === 'b').computedGrade
    const gradeC = result.find(r => r.projectId === 'c').computedGrade
    // Beide bekommen dieselbe Note (die der Gruppe = Note 2, nicht 3)
    expect(gradeB).toBe(gradeC)
    expect(gradeB).toBe(2)
  })
})

// ──────────────────────────────────────────────
// API-Tests: PATCH /api/sessions/:id/rating
// ──────────────────────────────────────────────

let mongod, token, sessionId, projectIds

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

function buildGrades(override = {}) {
  return {
    gradeSystem: 'schulnoten',
    distributionMethod: 'linear',
    grades: [
      { projectId: projectIds[0], computedGrade: 1, finalGrade: 1 },
      { projectId: projectIds[1], computedGrade: 2, finalGrade: 2 },
      { projectId: projectIds[2], computedGrade: 3, finalGrade: 3 },
    ],
    ...override,
  }
}

// R4
it('R4: speichert ratingResult und setzt Status auf graded', async () => {
  await setup()
  const res = await request(app)
    .patch(`/api/sessions/${sessionId}/rating`)
    .set('Authorization', `Bearer ${token}`)
    .send(buildGrades())

  expect(res.status).toBe(200)
  expect(res.body.status).toBe('graded')
  expect(res.body.ratingResult).toBeDefined()
  expect(res.body.ratingResult.grades).toHaveLength(3)
})

// R5: manuelle Überschreibung – computedGrade und finalGrade werden beide gespeichert
it('R5: manuelle Überschreibung – computedGrade und finalGrade getrennt gespeichert', async () => {
  await setup()
  const grades = [
    { projectId: projectIds[0], computedGrade: 1, finalGrade: 1 },
    { projectId: projectIds[1], computedGrade: 2, finalGrade: 1 }, // manuell auf 1 geändert
    { projectId: projectIds[2], computedGrade: 3, finalGrade: 3 },
  ]
  const res = await request(app)
    .patch(`/api/sessions/${sessionId}/rating`)
    .set('Authorization', `Bearer ${token}`)
    .send({ gradeSystem: 'schulnoten', distributionMethod: 'linear', grades })

  expect(res.status).toBe(200)
  const saved = res.body.ratingResult.grades.find(g => g.projectId === projectIds[1])
  expect(saved.computedGrade).toBe(2)
  expect(saved.finalGrade).toBe(1)
})

// R6
it('R6: ohne Auth → 401', async () => {
  await setup()
  const res = await request(app)
    .patch(`/api/sessions/${sessionId}/rating`)
    .send(buildGrades())
  expect(res.status).toBe(401)
})
