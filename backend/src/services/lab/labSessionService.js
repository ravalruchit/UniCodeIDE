import LabSession from '../../models/LabSession.js';
import LabDevice from '../../models/LabDevice.js';
import Lab from '../../models/Lab.js';
import { User } from '../../models/User.js';
import { signToken } from '../../utils/jwt.js';
import deviceService from './deviceService.js';
import labAuditService from './labAuditService.js';

class LabSessionService {
  /**
   * Start a student lab session on a registered lab workstation
   */
  async startLabSession({
    deviceId,
    deviceSecret,
    studentEmail,
    studentPassword,
    ipAddress = '',
    clientVersion = '1.0.0',
  }) {
    if (!deviceId || !deviceSecret || !studentEmail || !studentPassword) {
      throw new Error('Device credentials and student credentials are required');
    }

    // 1. Authenticate Device
    const device = await deviceService.authenticateDevice(deviceId, deviceSecret);
    const lab = await Lab.findById(device.labId);
    if (!lab || lab.status !== 'ACTIVE') {
      throw new Error('This laboratory is currently inactive or unavailable');
    }

    // 2. Authenticate Student User
    const student = await User.findOne({
      email: studentEmail.trim().toLowerCase(),
    }).select('+passwordHash');

    if (!student) {
      throw new Error('Invalid student credentials');
    }

    const isPasswordValid = await student.comparePassword(studentPassword);
    if (!isPasswordValid) {
      throw new Error('Invalid student credentials');
    }

    if (student.status !== 'ACTIVE') {
      throw new Error('Student account is suspended or inactive');
    }

    // 3. Mandatory Multi-Tenant Check: Student must belong to device's university
    const studentUnivId = (student.universityId?._id || student.universityId)?.toString();
    const deviceUnivId = (device.universityId?._id || device.universityId)?.toString();

    if (!studentUnivId || studentUnivId !== deviceUnivId) {
      throw new Error('Access denied: Student account belongs to a different university');
    }

    // 4. Terminate any lingering session on this device
    if (device.activeSessionId) {
      await LabSession.findByIdAndUpdate(device.activeSessionId, {
        status: 'ENDED',
        logoutReason: 'SYSTEM_RESET',
        endedAt: new Date(),
      });
    }

    // 5. Create new LabSession
    const session = new LabSession({
      universityId: device.universityId,
      deviceId: device.deviceId,
      labId: device.labId._id || device.labId,
      studentId: student._id,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      status: 'ACTIVE',
      clientVersion,
      ipAddress,
    });

    await session.save();

    // 6. Update device state
    device.activeStudentId = student._id;
    device.activeSessionId = session._id;
    device.lastStudentId = student._id;
    device.lastSessionStartedAt = new Date();
    device.lastHeartbeatAt = new Date();
    await device.save();

    // 7. Generate JWT Token for student workspace and exam operations
    const token = signToken({
      id: student._id.toString(),
      role: student.role,
      universityId: studentUnivId,
      email: student.email,
      name: student.name,
    });

    // 8. Log neutral audit event
    await labAuditService.logEvent({
      universityId: device.universityId,
      deviceId: device.deviceId,
      labId: device.labId._id || device.labId,
      studentId: student._id,
      labSessionId: session._id,
      eventType: 'STUDENT_LOGIN',
      metadata: { clientVersion, ipAddress },
      source: 'DESKTOP_CLIENT',
    });

    return {
      session: {
        id: session._id,
        deviceId: session.deviceId,
        status: session.status,
        startedAt: session.startedAt,
      },
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        department: student.department || '',
      },
      device: {
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        status: device.status,
      },
      lab: {
        id: lab._id,
        name: lab.name,
        code: lab.code,
        policies: lab.policies,
      },
    };
  }

  /**
   * Session heartbeat to keep workstation active and report current workspace / exam context
   */
  async sessionHeartbeat(sessionId, studentId, data = {}) {
    const session = await LabSession.findOne({ _id: sessionId, studentId });
    if (!session) {
      throw new Error('Session not found or unauthorized');
    }

    if (session.status !== 'ACTIVE') {
      return {
        active: false,
        status: session.status,
        logoutReason: session.logoutReason,
      };
    }

    session.lastActivityAt = new Date();
    if (data.activeWorkspaceId) session.activeWorkspaceId = data.activeWorkspaceId;
    if (data.activeExamSessionId) session.activeExamSessionId = data.activeExamSessionId;
    if (data.kioskActive !== undefined) session.kioskActive = Boolean(data.kioskActive);

    await session.save();

    return {
      active: true,
      status: session.status,
      kioskActive: session.kioskActive,
      serverTime: new Date(),
    };
  }

  /**
   * Explicit student logout
   */
  async studentLogout(sessionId, studentId, reason = 'USER_LOGOUT') {
    const session = await LabSession.findOne({ _id: sessionId, studentId });
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status === 'ENDED' || session.status === 'FORCED_LOGOUT') {
      return { success: true, message: 'Session already ended' };
    }

    session.status = 'ENDED';
    session.logoutReason = reason;
    session.endedAt = new Date();
    await session.save();

    // Release device
    await LabDevice.findOneAndUpdate(
      { deviceId: session.deviceId },
      {
        activeStudentId: null,
        activeSessionId: null,
        lastSessionEndedAt: new Date(),
      }
    );

    // Record audit event
    await labAuditService.logEvent({
      universityId: session.universityId,
      deviceId: session.deviceId,
      labId: session.labId,
      studentId: session.studentId,
      labSessionId: session._id,
      eventType: 'STUDENT_LOGOUT',
      metadata: { reason },
      source: 'DESKTOP_CLIENT',
    });

    return {
      success: true,
      message: 'Student logged out successfully; local cache reset required',
    };
  }

  /**
   * Admin-initiated forced logout of a workstation
   */
  async forceLogoutSession(sessionId, universityId, adminUserId, reason = 'FORCED_BY_ADMIN') {
    const session = await LabSession.findOne({ _id: sessionId, universityId });
    if (!session) {
      throw new Error('Session not found or access denied');
    }

    session.status = 'FORCED_LOGOUT';
    session.logoutReason = reason;
    session.endedAt = new Date();
    await session.save();

    await LabDevice.findOneAndUpdate(
      { deviceId: session.deviceId },
      {
        activeStudentId: null,
        activeSessionId: null,
        lastSessionEndedAt: new Date(),
      }
    );

    await labAuditService.logEvent({
      universityId,
      deviceId: session.deviceId,
      labId: session.labId,
      studentId: session.studentId,
      labSessionId: session._id,
      eventType: 'SESSION_FORCE_LOGOUT',
      metadata: { reason, forcedBy: adminUserId },
      source: 'ADMIN_PORTAL',
    });

    return {
      success: true,
      sessionId: session._id,
      status: session.status,
    };
  }

  /**
   * Get session details with access control
   */
  async getSessionById(sessionId, requestingUser) {
    const session = await LabSession.findById(sessionId)
      .populate('studentId', 'name email role department')
      .populate('labId', 'name code building room policies')
      .populate('activeWorkspaceId', 'name programmingLanguage')
      .lean();

    if (!session) {
      throw new Error('Session not found');
    }

    const sessionUnivId = session.universityId?.toString();
    const userUnivId = (requestingUser.universityId?._id || requestingUser.universityId)?.toString();

    // Tenant check
    if (requestingUser.role !== 'SUPER_ADMIN' && sessionUnivId !== userUnivId) {
      throw new Error('Access denied: cross-tenant session lookup prohibited');
    }

    // Role check: student can only view own session
    if (
      requestingUser.role === 'STUDENT' &&
      session.studentId._id.toString() !== requestingUser._id.toString()
    ) {
      throw new Error('Access denied: cannot view another student session');
    }

    return session;
  }
}

export const labSessionService = new LabSessionService();
export default labSessionService;
