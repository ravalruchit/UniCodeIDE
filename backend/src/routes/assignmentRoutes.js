import { Router } from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  updateAssignmentStatus,
  deleteAssignment,
} from '../controllers/assignmentController.js';
import {
  saveDraft,
  submitSolution,
} from '../controllers/submissionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Read assignments
router.get('/', getAssignments);
router.get('/:id', getAssignmentById);

// Author assignments (Teacher & Admins)
router.post('/', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), createAssignment);
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), updateAssignment);
router.patch('/:id/status', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), updateAssignmentStatus);
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), deleteAssignment);

// Student work & submissions for an assignment
router.put('/:assignmentId/draft', authorizeRoles('STUDENT'), saveDraft);
router.post('/:assignmentId/submissions', authorizeRoles('STUDENT'), submitSolution);

export default router;
