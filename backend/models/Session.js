import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  methods: {
    type: [String],
    required: true,
    validate: { validator: v => v.length >= 1, message: 'Mindestens eine Methode erforderlich' },
  },
  anonymized: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'active', 'ranked', 'graded'], default: 'draft' },
  groupingResult: { type: mongoose.Schema.Types.Mixed },
  pairwiseResult: { type: mongoose.Schema.Types.Mixed },
  ratingResult: { type: mongoose.Schema.Types.Mixed },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  createdAt: { type: Date, default: Date.now },
})

// TTL-Index – MongoDB löscht Sessions automatisch nach expiresAt
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('Session', sessionSchema)
