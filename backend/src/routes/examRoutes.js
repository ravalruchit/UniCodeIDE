import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';
import {
  createExam,
  getExams,
  getExamById,
  updateExam,
  publishExam,
  closeExam,
  getLiveExamSessions,
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
} from '../controllers/examController.js';
import { startExamSession } from '../controllers/examSessionController.js';

const router = Router();

router.use(authenticateToken);

// Question Bank Routes
router.post('/questions', authorizeRoles('TEACHER', 'UNIVERSITY_ADMIN', 'SUPER_ADMIN'), createQuestion);
router.get('/questions', authorizeRoles('TEACHER', 'UNIVERSITY_ADMIN', 'SUPER_ADMIN'), getQuestions);
router.get('/questions/:id', authorizeRoles('TEACHER', 'UNIVERSITY_ADMIN', 'SUPER_ADMIN'), getQuestionById);
router.put('/questions/:id', authorizeRoles('TEACHER', 'UNIVERSITY_ADMIN', 'SUPER_ADMIN'), updateQuestion);

// Exam Management Routes
router.post('/', authorizeRoles('TEACHER', 'UNIVERSITY_ADMIN', 'SUPER_ADMIN'), createExam);
router.get('/', getExams);
router.get('/:id', getExamById);
router.put('/:id', authorizeRoles('TEACHER', 'UNIVERSITY_ADMIN', 'SUPER_ADMIN'), updateExam);
router.post('/:id/publish', authorizeRoles('TEACHER', 'UNIVERSITY_ADMIN', 'SUPER_ADMIN'), publishExam);
router.post('/:id/close', authorizeRoles('TEACHER', 'UNIVERSITY_ADMIN', 'SUPER_ADMIN'), closeExam);
router.get('/:id/live-sessions', authorizeRoles('TEACHER', 'UNIVERSITY_ADMIN', 'SUPER_ADMIN'), getLiveExamSessions);

// Start Exam Session Route
router.post('/:id/start', startExamSession);

export default router;
