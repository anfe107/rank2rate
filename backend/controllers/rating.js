import Session from '../models/Session.js'
import { GRADE_SYSTEMS, effectiveRange, isValidGrade } from '../utils/gradeSystems.js'
import { gradeFromGroups } from '../utils/grading.js'

export async function saveRating(req, res) {
  const { gradeSystem, distributionMethod, grades, note, gradeRange } = req.body

  if (!grades || !Array.isArray(grades) || grades.length === 0) {
    return res.status(400).json({ message: 'grades-Array erforderlich' })
  }
  if (!GRADE_SYSTEMS[gradeSystem]) {
    return res.status(400).json({ message: 'Unbekanntes Notensystem' })
  }
  // Jede finale Note muss eine gültige Note des Systems sein (kein Speichern von Müll).
  for (const g of grades) {
    if (!isValidGrade(gradeSystem, g.finalGrade)) {
      return res.status(400).json({ message: `Ungültige Note: ${g.finalGrade}` })
    }
  }

  const session = await Session.findOne({ _id: req.params.id, teacherId: req.user.userId })
  if (!session) return res.status(404).json({ message: 'Session nicht gefunden' })

  // computedGrade ist serverseitig autoritativ: aus der gespeicherten Reihung
  // abgeleitet, nicht vom Client übernommen. finalGrade bleibt Lehrer-Entscheidung
  // (manuelle Overrides). Ohne gespeicherte Reihung: Client-Werte als Fallback.
  let resolvedGrades = grades
  if (Array.isArray(session.groupingResult) && session.groupingResult.length) {
    const range = effectiveRange(gradeSystem, gradeRange)
    const computed = gradeFromGroups(session.groupingResult, range)
    const finalByProject = new Map(grades.map(g => [String(g.projectId), g.finalGrade]))
    resolvedGrades = computed.map(c => {
      const clientFinal = finalByProject.get(String(c.projectId))
      const finalGrade = isValidGrade(gradeSystem, clientFinal) ? clientFinal : c.computedGrade
      return { projectId: c.projectId, computedGrade: c.computedGrade, finalGrade }
    })
  }

  const ratingResult = { gradeSystem, distributionMethod, grades: resolvedGrades }
  if (gradeRange && gradeRange.min != null && gradeRange.max != null) {
    ratingResult.gradeRange = gradeRange
  }
  if (note && typeof note === 'string' && note.trim()) {
    ratingResult.note = note.trim()
  }

  session.ratingResult = ratingResult
  session.status = 'graded'
  await session.save()

  res.json({ status: session.status, ratingResult: session.ratingResult })
}
