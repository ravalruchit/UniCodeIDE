import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  createTerminalSession,
  closeTerminalSession,
} from '../controllers/terminalController.js';

const router = Router();

router.use(authenticateToken);

router.post('/sessions', createTerminalSession);
router.delete('/sessions/:sessionId', closeTerminalSession);

export default router;
