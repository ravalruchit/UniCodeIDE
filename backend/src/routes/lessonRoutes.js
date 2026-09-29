import { Router } from 'express';
import {
  getLessonById,
  updateLesson,
  deleteLesson,
} from '../controllers/moduleLessonController.js';
import {
  toggleLessonProgress,
} from '../controllers/enrollmentProgressController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/:id', getLessonById);
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), updateLesson);
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), deleteLesson);

// Student progress toggle
router.patch('/:lessonId/progress', authorizeRoles('STUDENT'), toggleLessonProgress);

export default router;
