import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';
import {
  createLab,
  getLabs,
  getLabById,
  updateLab,
  deleteLab,
} from '../controllers/labController.js';
import {
  createEnrollmentToken,
  enrollDevice,
  deviceHeartbeat,
  getDevices,
  getDeviceById,
  enableDevice,
  disableDevice,
  revokeDevice,
  rotateDeviceCredential,
  forceLogoutDevice,
  getClientVersionInfo,
} from '../controllers/labDeviceController.js';
import {
  startSession,
  sessionHeartbeat,
  studentLogout,
  forceLogoutSession,
  getSessionById,
  getAuditEvents,
} from '../controllers/labSessionController.js';

const router = Router();

// --- Client Version Info ---
router.get('/client/version', getClientVersionInfo);

// --- Computer Labs ---
router.post('/labs', authenticateToken, authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN'), createLab);
router.get('/labs', authenticateToken, getLabs);
router.get('/labs/:id', authenticateToken, getLabById);
router.patch('/labs/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN'), updateLab);
router.delete('/labs/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN'), deleteLab);

// --- Lab Devices ---
router.post(
  '/devices/enrollment-tokens',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN'),
  createEnrollmentToken
);
router.post('/devices/enroll', enrollDevice);
router.post('/devices/heartbeat', deviceHeartbeat);
router.get(
  '/devices',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'),
  getDevices
);
router.get(
  '/devices/:id',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'),
  getDeviceById
);
router.post(
  '/devices/:id/enable',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN'),
  enableDevice
);
router.post(
  '/devices/:id/disable',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN'),
  disableDevice
);
router.post(
  '/devices/:id/revoke',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN'),
  revokeDevice
);
router.post(
  '/devices/:id/rotate-credential',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN'),
  rotateDeviceCredential
);
router.post(
  '/devices/:id/force-logout',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN'),
  forceLogoutDevice
);

// --- Student Lab Sessions ---
router.post('/sessions/start', startSession);
router.post('/sessions/:id/heartbeat', authenticateToken, sessionHeartbeat);
router.post('/sessions/:id/logout', authenticateToken, studentLogout);
router.post(
  '/sessions/:id/force-logout',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN'),
  forceLogoutSession
);
router.get('/sessions/:id', authenticateToken, getSessionById);

// --- Audit Events ---
router.get(
  '/audit-events',
  authenticateToken,
  authorizeRoles('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER'),
  getAuditEvents
);

export default router;
