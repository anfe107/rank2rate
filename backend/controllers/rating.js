import Session from '../models/Session.js'

export async function saveRating(req, res) {
  const { gradeSystem, distributionMethod, grades, note } = req.body

  if (!grades || !Array.isArray(grades) || grades.length === 0) {
    return res.status(400).json({ message: 'grades-Array erforderlich' })
  }

  const session = await Session.findOne({ _id: req.params.id, teacherId: req.user.userId })
  if (!session) return res.status(404).json({ message: 'Session nicht gefunden' })

  const ratingResult = { gradeSystem, distributionMethod, grades }
  if (note && typeof note === 'string' && note.trim()) {
    ratingResult.note = note.trim()
  }

  session.ratingResult = ratingResult
  session.status = 'graded'
  await session.save()

  res.json({ status: session.status, ratingResult: session.ratingResult })
}
