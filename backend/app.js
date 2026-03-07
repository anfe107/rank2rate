import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Routes
import authRoutes from './routes/auth.js'
import sessionRoutes from './routes/sessions.js'
import { requireAuth } from './middleware/auth.js'
app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionRoutes)

// Test-Route für JWT-Middleware (nur für Tests genutzt)
app.get('/api/protected-test', requireAuth, (_req, res) => res.json({ ok: true }))

// Globaler Fehler-Handler
app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({ message: err.message })
})

export default app
