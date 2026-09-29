import deviceService from '../services/lab/deviceService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createEnrollmentToken = async (req, res) => {
  try {
    const universityId = req.user.universityId?._id || req.user.universityId;
    const { labId, expiresInHours, maxUses } = req.body;
    if (!labId) {
      return sendError(res, 'labId is required', 400);
    }
    const tokenData = await deviceService.createEnrollmentToken(
      universityId,
      labId,
      req.user._id,
      { expiresInHours, maxUses }
    );
    return sendSuccess(res, tokenData, 'Enrollment token generated successfully', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const enrollDevice = async (req, res) => {
  try {
    const deviceData = await deviceService.enrollDevice(req.body);
    return sendSuccess(res, deviceData, 'Device enrolled successfully', 201);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const deviceHeartbeat = async (req, res) => {
  try {
    const { deviceId, deviceSecret, clientVersion, labSessionId, status } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    const result = await deviceService.heartbeat(deviceId, deviceSecret, {
      clientVersion,
      labSessionId,
      status,
      ipAddress,
    });
    return sendSuccess(res, result, 'Heartbeat recorded');
  } catch (err) {
    return sendError(res, err.message, 401);
  }
};

export const getDevices = async (req, res) => {
  try {
    const universityId = req.user.universityId?._id || req.user.universityId;
    const devices = await deviceService.getDevices(universityId, req.query);
    return sendSuccess(res, devices, 'Devices retrieved successfully');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const getDeviceById = async (req, res) => {
  try {
    const universityId = req.user.universityId?._id || req.user.universityId;
    const device = await deviceService.getDeviceById(universityId, req.params.id);
    return sendSuccess(res, device, 'Device details retrieved');
  } catch (err) {
    return sendError(res, err.message, 404);
  }
};

export const enableDevice = async (req, res) => {
  try {
    const universityId = req.user.universityId?._id || req.user.universityId;
    const result = await deviceService.enableDevice(universityId, req.params.id);
    return sendSuccess(res, result, 'Device enabled successfully');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const disableDevice = async (req, res) => {
  try {
    const universityId = req.user.universityId?._id || req.user.universityId;
    const result = await deviceService.disableDevice(universityId, req.params.id);
    return sendSuccess(res, result, 'Device disabled successfully');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const revokeDevice = async (req, res) => {
  try {
    const universityId = req.user.universityId?._id || req.user.universityId;
    const result = await deviceService.revokeDevice(universityId, req.params.id);
    return sendSuccess(res, result, 'Device registration revoked');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const rotateDeviceCredential = async (req, res) => {
  try {
    const universityId = req.user.universityId?._id || req.user.universityId;
    const result = await deviceService.rotateDeviceCredential(universityId, req.params.id);
    return sendSuccess(res, result, 'Device credentials rotated successfully');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const forceLogoutDevice = async (req, res) => {
  try {
    const universityId = req.user.universityId?._id || req.user.universityId;
    const device = await deviceService.getDeviceById(universityId, req.params.id);
    if (!device.activeSessionId) {
      return sendSuccess(res, { message: 'No active session on device' });
    }
    const result = await deviceService.disableDevice(universityId, req.params.id);
    // Re-enable device so it's ready for next student
    await deviceService.enableDevice(universityId, req.params.id);
    return sendSuccess(res, result, 'Forced logout on device executed');
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const getClientVersionInfo = async (req, res) => {
  return sendSuccess(res, {
    currentVersion: '1.0.0',
    minimumSupportedVersion: '1.0.0',
    releaseChannel: 'production',
    downloadUrl: '/downloads/UniCodeIDE-Lab-Setup.exe',
  });
};
