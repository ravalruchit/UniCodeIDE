import { Router } from 'express';
import {
  updateModule,
  deleteModule,
  createLesson,
} from '../controllers/moduleLessonController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.put('/:id', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), updateModule);
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), deleteModule);
router.post('/:moduleId/lessons', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), createLesson);

export default router;
