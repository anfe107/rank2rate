import Session from '../models/Session.js'

export async function saveGrouping(req, res) {
  const { groups } = req.body

  if (!groups || !Array.isArray(groups) || groups.length === 0) {
    return res.status(400).json({ message: 'Mindestens eine Gruppe erforderlich' })
  }

  const session = await Session.findOne({ _id: req.params.id, teacherId: req.user.userId })
  if (!session) return res.status(404).json({ message: 'Session nicht gefunden' })

  session.groupingResult = groups
  session.status = 'ranked'
  await session.save()

  res.json({ status: session.status, groupingResult: session.groupingResult })
}
