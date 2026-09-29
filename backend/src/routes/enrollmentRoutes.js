import { Router } from 'express';
import {
  getMyEnrolledCourses,
} from '../controllers/enrollmentProgressController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Student enrolled courses query
router.get('/my-courses', authorizeRoles('STUDENT'), getMyEnrolledCourses);

export default router;
