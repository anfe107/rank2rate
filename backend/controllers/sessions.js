import Session from '../models/Session.js'
import Project from '../models/Project.js'
import { decrypt } from '../utils/crypto.js'
import { generateFantasyName } from '../utils/fantasyNames.js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function createSession(req, res) {
  const { title, methods, anonymized, projects: projectsData } = req.body

  if (!title || !methods || !Array.isArray(methods) || methods.length === 0) {
    return res.status(400).json({ message: 'Titel und Methode(n) erforderlich' })
  }
  if (!projectsData || projectsData.length < 3) {
    return res.status(400).json({ message: 'Mindestens 3 Abgaben erforderlich' })
  }

  const session = await Session.create({
    teacherId: req.user.userId,
    title,
    methods,
    anonymized: anonymized || false,
  })

  const ordered = anonymized ? shuffle(projectsData) : projectsData
  const usedNames = new Set()

  const projects = await Promise.all(
    ordered.map(async p => {
      let displayName = p.actualName
      if (anonymized) {
        let name
        do { name = generateFantasyName() } while (usedNames.has(name))
        usedNames.add(name)
        displayName = name
      }
      return Project.create({ sessionId: session._id, displayName, actualName: p.actualName, link: p.link })
    })
  )

  res.status(201).json({ session, projects })
}

export async function getSession(req, res) {
  const session = await Session.findOne({ _id: req.params.id, teacherId: req.user.userId })
  if (!session) return res.status(404).json({ message: 'Session nicht gefunden' })

  const projects = await Project.find({ sessionId: session._id })
  const decryptedProjects = projects.map(p => ({
    ...p.toObject(),
    actualName: decrypt(p.actualName),
  }))

  res.json({ session, projects: decryptedProjects })
}

export async function updateProject(req, res) {
  const { title, link } = req.body
  const project = await Project.findById(req.params.pid)
  if (!project) return res.status(404).json({ message: 'Abgabe nicht gefunden' })

  if (title !== undefined) project.displayName = title
  if (link !== undefined) project.link = link
  await project.save()

  res.json({ _id: project._id, title: project.displayName, link: project.link })
}

export async function deleteProject(req, res) {
  const count = await Project.countDocuments({ sessionId: req.params.id })
  if (count <= 3) {
    return res.status(400).json({ message: 'Mindestens 3 Abgaben müssen verbleiben' })
  }
  await Project.findByIdAndDelete(req.params.pid)
  res.json({ message: 'Gelöscht' })
}
