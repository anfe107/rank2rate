import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { listSessions, createSession, getSession, updateProject, deleteProject } from '../controllers/sessions.js'
import { saveGrouping } from '../controllers/grouping.js'
import { saveRating } from '../controllers/rating.js'

const router = Router()

router.get('/', requireAuth, listSessions)
router.post('/', requireAuth, createSession)
router.get('/:id', requireAuth, getSession)
router.patch('/:id/projects/:pid', requireAuth, updateProject)
router.delete('/:id/projects/:pid', requireAuth, deleteProject)
router.patch('/:id/grouping', requireAuth, saveGrouping)
router.patch('/:id/rating', requireAuth, saveRating)

export default router
