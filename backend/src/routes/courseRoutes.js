import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
} from '../controllers/courseController.js';
import {
  getCourseCurriculum,
  createModule,
} from '../controllers/moduleLessonController.js';
import {
  enrollInCourse,
  unenrollFromCourse,
  getCourseStudents,
} from '../controllers/enrollmentProgressController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Course discovery & details
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.get('/:courseId/curriculum', getCourseCurriculum);

// Admin / Teacher Course Management
router.post('/', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), createCourse);
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), updateCourse);
router.patch('/:id/status', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), updateCourseStatus);
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN'), deleteCourse);

// Curriculum authoring
router.post('/:courseId/modules', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), createModule);

// Course enrollment & student roster
router.post('/:courseId/enroll', authorizeRoles('STUDENT', 'SUPER_ADMIN', 'UNIVERSITY_ADMIN'), enrollInCourse);
router.delete('/:courseId/unenroll', authorizeRoles('STUDENT', 'SUPER_ADMIN', 'UNIVERSITY_ADMIN'), unenrollFromCourse);
router.get('/:courseId/students', authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'), getCourseStudents);

export default router;
