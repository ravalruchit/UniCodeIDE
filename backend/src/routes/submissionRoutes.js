import { Router } from 'express';
import {
  getSubmissions,
  getSubmissionById,
  evaluateSubmission,
  returnSubmission,
} from '../controllers/submissionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

// List submissions
router.get('/', getSubmissions);
router.get('/:id', getSubmissionById);

// Evaluation & Return actions (Teacher & Admins)
router.patch('/:id/evaluate', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), evaluateSubmission);
router.patch('/:id/return', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), returnSubmission);

export default router;
