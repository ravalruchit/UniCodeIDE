import { Router } from 'express';
import { getLMSStats } from '../controllers/lmsStatsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Role-tailored LMS summary stats
router.get('/stats', getLMSStats);

export default router;
