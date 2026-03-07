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
import { requireAuth } from './middleware/auth.js'
app.use('/api/auth', authRoutes)

// Test-Route für JWT-Middleware (nur für Tests genutzt)
app.get('/api/protected-test', requireAuth, (_req, res) => res.json({ ok: true }))

export default app
