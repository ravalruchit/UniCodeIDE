import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';
import {
  getExamSession,
  recordHeartbeat,
  submitExamSession,
  executeQuestionCode,
  overrideSessionScore,
  recordProctoringEvent,
  getProctoringEvents,
} from '../controllers/examSessionController.js';

const router = Router();

router.use(authenticateToken);

// Exam Session Lifecycle Endpoints
router.get('/:id', getExamSession);
router.post('/:id/heartbeat', recordHeartbeat);
router.post('/:id/submit', submitExamSession);
router.post('/:id/questions/:questionId/execute', executeQuestionCode);

// Proctoring Event Endpoints
router.post('/:id/events', recordProctoringEvent);
router.get('/:id/events', getProctoringEvents);

// Teacher Evaluation & Overrides
router.post('/:id/override-score', authorizeRoles('TEACHER', 'UNIVERSITY_ADMIN', 'SUPER_ADMIN'), overrideSessionScore);

export default router;
