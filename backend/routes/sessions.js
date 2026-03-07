import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { createSession, getSession, updateProject, deleteProject } from '../controllers/sessions.js'

const router = Router()

router.post('/', requireAuth, createSession)
router.get('/:id', requireAuth, getSession)
router.patch('/:id/projects/:pid', requireAuth, updateProject)
router.delete('/:id/projects/:pid', requireAuth, deleteProject)

export default router
