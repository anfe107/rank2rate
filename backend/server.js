import dotenv from 'dotenv'
import mongoose from 'mongoose'
import app from './app.js'

dotenv.config()

const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rank2rate'

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`))
  })
  .catch(err => console.error('MongoDB-Verbindungsfehler:', err))
