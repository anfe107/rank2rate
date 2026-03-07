import mongoose from 'mongoose'
import { encrypt } from '../utils/crypto.js'

const projectSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  displayName: { type: String, required: true },
  actualName: { type: String, required: true },
  link: { type: String },
  createdAt: { type: Date, default: Date.now },
})

// AES-256-GCM: actualName wird verschlüsselt gespeichert
projectSchema.pre('save', async function () {
  if (this.isModified('actualName')) {
    this.actualName = encrypt(this.actualName)
  }
})

export default mongoose.model('Project', projectSchema)
