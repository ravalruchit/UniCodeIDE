import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  createExecution,
  getExecution,
  cancelExecution,
  getWorkspaceExecutions,
  getExecutionEngineHealth,
  getLanguageCatalogController,
} from '../controllers/executionController.js';

const router = Router();

// Health check and runtime catalog endpoints
router.get('/health', getExecutionEngineHealth);
router.get('/catalog', getLanguageCatalogController);

// Authenticated execution routes
router.use(authenticateToken);

router.post('/', createExecution);
router.get('/:id', getExecution);
router.post('/:id/cancel', cancelExecution);
router.get('/workspaces/:workspaceId', getWorkspaceExecutions);

export default router;
