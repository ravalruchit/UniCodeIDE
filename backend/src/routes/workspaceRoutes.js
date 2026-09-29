import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getWorkspaces,
  getOrCreateAssignmentWorkspace,
  getOrCreatePracticeWorkspace,
  getWorkspaceById,
  getWorkspaceSyncState,
  saveWorkspace,
  resetAssignmentWorkspace,
  deleteWorkspace,
} from '../controllers/workspaceController.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getWorkspaces);
router.get('/practice/default', getOrCreatePracticeWorkspace);
router.get('/assignment/:assignmentId', getOrCreateAssignmentWorkspace);
router.get('/:id', getWorkspaceById);
router.get('/:id/sync-state', getWorkspaceSyncState);
router.put('/:id', saveWorkspace);
router.post('/:id/reset', resetAssignmentWorkspace);
router.delete('/:id', deleteWorkspace);

export default router;
