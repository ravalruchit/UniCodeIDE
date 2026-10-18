import { Router } from 'express';
import authRoutes from './authRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import courseRoutes from './courseRoutes.js';
import moduleRoutes from './moduleRoutes.js';
import lessonRoutes from './lessonRoutes.js';
import enrollmentRoutes from './enrollmentRoutes.js';
import lmsRoutes from './lmsRoutes.js';
import assignmentRoutes from './assignmentRoutes.js';
import submissionRoutes from './submissionRoutes.js';
import workspaceRoutes from './workspaceRoutes.js';
import executionRoutes from './executionRoutes.js';
import terminalRoutes from './terminalRoutes.js';
import examRoutes from './examRoutes.js';
import examSessionRoutes from './examSessionRoutes.js';
import labRoutes from './labRoutes.js';
import { getDBStatus } from '../config/db.js';

const router = Router();

// API Gateway Root endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'UniCodeIDE Enterprise API Gateway is live',
    healthCheck: '/api/health',
    version: '1.0.0',
    databaseConnected: getDBStatus(),
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'UniCodeIDE Enterprise API',
    databaseConnected: getDBStatus(),
  });
});

// Mount application routes
router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/courses', courseRoutes);
router.use('/modules', moduleRoutes);
router.use('/lessons', lessonRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/submissions', submissionRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/executions', executionRoutes);
router.use('/terminal', terminalRoutes);
router.use('/exams', examRoutes);
router.use('/exam-sessions', examSessionRoutes);
router.use('/lms', lmsRoutes);
router.use('/lab', labRoutes);

export default router;
