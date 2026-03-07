import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Routes (werden hier eingebunden sobald implementiert)
// import authRoutes from './routes/auth.js'
// app.use('/api/auth', authRoutes)

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rank2rate'

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`))
  })
  .catch(err => console.error('MongoDB-Verbindungsfehler:', err))
