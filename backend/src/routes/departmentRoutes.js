import { Router } from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = Router();

// All department routes require authentication
router.use(authenticateToken);

// Read is accessible to all authenticated university members
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);

// Creation, modification, deletion restricted to UNIVERSITY_ADMIN and SUPER_ADMIN
router.post('/', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN'), createDepartment);
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN'), updateDepartment);
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN'), deleteDepartment);

export default router;
