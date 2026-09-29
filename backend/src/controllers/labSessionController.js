import labSessionService from '../services/lab/labSessionService.js';
import labAuditService from '../services/lab/labAuditService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const startSession = async (req, res) => {
  try {
    const { deviceId, deviceSecret, studentEmail, studentPassword, clientVersion } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';

    const sessionData = await labSessionService.startLabSession({
      deviceId,
      deviceSecret,
      studentEmail,
      studentPassword,
      ipAddress,
      clientVersion,
    });

    return sendSuccess(res, sessionData, 'Lab session started successfully', 201);
  } catch (err) {
    const status = err.message.includes('Access denied') ? 403 : 401;
    return sendError(res, err.message, status);
  }
};

export const sessionHeartbeat = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;
    const result = await labSessionService.sessionHeartbeat(id, studentId, req.body);
    return sendSuccess(res, result, 'Session heartbeat recorded');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const studentLogout = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;
    const { reason } = req.body;
    const result = await labSessionService.studentLogout(id, studentId, reason);
    return sendSuccess(res, result, 'Student logged out successfully');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const forceLogoutSession = async (req, res) => {
  try {
    const { id } = req.params;
    const universityId = req.user.universityId?._id || req.user.universityId;
    const adminUserId = req.user._id;
    const { reason } = req.body;

    const result = await labSessionService.forceLogoutSession(
      id,
      universityId,
      adminUserId,
      reason
    );
    return sendSuccess(res, result, 'Session force-terminated');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await labSessionService.getSessionById(id, req.user);
    return sendSuccess(res, session, 'Session details retrieved');
  } catch (err) {
    const status = err.message.includes('Access denied') ? 403 : 404;
    return sendError(res, err.message, status);
  }
};

export const getAuditEvents = async (req, res) => {
  try {
    const universityId = req.user.universityId?._id || req.user.universityId;
    const events = await labAuditService.getEvents(universityId, req.query);
    return sendSuccess(res, events, 'Lab audit events retrieved');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};
