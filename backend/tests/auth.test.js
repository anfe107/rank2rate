import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import app from '../app.js'

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

afterEach(async () => {
  // Alle Collections nach jedem Test leeren
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

// A1: Registrierung erfolgreich
describe('POST /api/auth/register', () => {
  it('A1: registriert neuen Nutzer erfolgreich', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.de', password: 'sicher123' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('message')
  })

  // A2: Doppelte E-Mail
  it('A2: lehnt doppelte E-Mail ab', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'doppelt@test.de', password: 'sicher123' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'doppelt@test.de', password: 'anderes123' })

    expect(res.status).toBe(409)
  })

  // A3: Fehlendes Feld
  it('A3: lehnt fehlende Felder ab', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'kein-passwort@test.de' })

    expect(res.status).toBe(400)
  })
})

// A4–A6: Login
describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@test.de', password: 'sicher123' })
  })

  it('A4: Login mit korrekten Credentials liefert JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.de', password: 'sicher123' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(typeof res.body.token).toBe('string')
  })

  it('A5: Login mit unbekannter E-Mail → 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'unbekannt@test.de', password: 'sicher123' })

    expect(res.status).toBe(401)
  })

  it('A6: Login mit falschem Passwort → 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.de', password: 'falsch' })

    expect(res.status).toBe(401)
  })
})

// A7–A9: JWT-Middleware (testen via /api/health/protected — wird in app.js als Testroute ergänzt)
describe('JWT-Middleware', () => {
  let validToken

  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'jwt@test.de', password: 'sicher123' })
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jwt@test.de', password: 'sicher123' })
    validToken = res.body.token
  })

  it('A7: ohne Token → 401', async () => {
    const res = await request(app).get('/api/protected-test')
    expect(res.status).toBe(401)
  })

  it('A8: mit gültigem Token → 200', async () => {
    const res = await request(app)
      .get('/api/protected-test')
      .set('Authorization', `Bearer ${validToken}`)
    expect(res.status).toBe(200)
  })

  it('A9: mit ungültigem Token → 401', async () => {
    const res = await request(app)
      .get('/api/protected-test')
      .set('Authorization', 'Bearer ungueltig.token.hier')
    expect(res.status).toBe(401)
  })
})
