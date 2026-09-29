import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import LabDevice from '../../models/LabDevice.js';
import DeviceEnrollmentToken from '../../models/DeviceEnrollmentToken.js';
import Lab from '../../models/Lab.js';
import LabSession from '../../models/LabSession.js';
import labAuditService from './labAuditService.js';

class DeviceService {
  /**
   * Generate an expiring enrollment token for a lab
   */
  async createEnrollmentToken(universityId, labId, adminUserId, options = {}) {
    const lab = await Lab.findOne({ _id: labId, universityId });
    if (!lab) {
      throw new Error('Lab not found or access denied');
    }

    const tokenString = `ENROLL-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    const expiresInHours = options.expiresInHours || 24;
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const tokenDoc = new DeviceEnrollmentToken({
      universityId,
      labId,
      token: tokenString,
      createdBy: adminUserId,
      expiresAt,
      maxUses: options.maxUses || 1,
    });

    await tokenDoc.save();

    return {
      token: tokenString,
      labId: lab._id,
      labName: lab.name,
      labCode: lab.code,
      expiresAt,
      maxUses: tokenDoc.maxUses,
    };
  }

  /**
   * Enroll a new desktop lab client machine using an enrollment token
   */
  async enrollDevice({
    enrollmentToken,
    deviceName,
    machineIdentifier = '',
    operatingSystem = 'windows',
    clientVersion = '1.0.0',
  }) {
    if (!enrollmentToken || !deviceName) {
      throw new Error('Enrollment token and device name are required');
    }

    const tokenDoc = await DeviceEnrollmentToken.findOne({
      token: enrollmentToken.trim().toUpperCase(),
    });

    if (!tokenDoc) {
      throw new Error('Invalid enrollment token');
    }

    if (tokenDoc.isUsed || tokenDoc.usedCount >= tokenDoc.maxUses) {
      throw new Error('Enrollment token has already been used');
    }

    if (new Date() > tokenDoc.expiresAt) {
      throw new Error('Enrollment token has expired');
    }

    const lab = await Lab.findById(tokenDoc.labId);
    if (!lab || lab.status === 'INACTIVE') {
      throw new Error('Target lab is inactive or not found');
    }

    const deviceId = `DEV-${crypto.randomUUID().slice(0, 13).toUpperCase()}`;
    const rawSecret = crypto.randomBytes(32).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const deviceCredentialHash = await bcrypt.hash(rawSecret, salt);

    const device = new LabDevice({
      universityId: tokenDoc.universityId,
      deviceId,
      deviceName: deviceName.trim(),
      machineIdentifier: machineIdentifier.trim(),
      deviceCredentialHash,
      labId: tokenDoc.labId,
      operatingSystem,
      clientVersion,
      status: 'ACTIVE',
      registeredAt: new Date(),
      activatedAt: new Date(),
    });

    await device.save();

    // Update token usage
    tokenDoc.usedCount += 1;
    if (tokenDoc.usedCount >= tokenDoc.maxUses) {
      tokenDoc.isUsed = true;
    }
    tokenDoc.usedAt = new Date();
    tokenDoc.usedByDeviceId = deviceId;
    await tokenDoc.save();

    // Increment lab device count
    await Lab.findByIdAndUpdate(tokenDoc.labId, { $inc: { deviceCount: 1 } });

    // Log audit event
    await labAuditService.logEvent({
      universityId: tokenDoc.universityId,
      deviceId,
      labId: tokenDoc.labId,
      eventType: 'DEVICE_ENROLLED',
      metadata: { deviceName, operatingSystem, clientVersion },
      source: 'DESKTOP_CLIENT',
    });

    return {
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      universityId: device.universityId,
      labId: device.labId,
      status: device.status,
      deviceSecret: rawSecret, // Returned ONCE upon enrollment for OS secure storage
    };
  }

  /**
   * Authenticate a device using its deviceId and secret
   */
  async authenticateDevice(deviceId, deviceSecret) {
    if (!deviceId || !deviceSecret) {
      throw new Error('Device credentials missing');
    }

    const device = await LabDevice.findOne({ deviceId })
      .select('+deviceCredentialHash')
      .populate('labId', 'name code policies status');

    if (!device) {
      throw new Error('Device not found or not enrolled');
    }

    const isMatch = await bcrypt.compare(deviceSecret, device.deviceCredentialHash);
    if (!isMatch) {
      throw new Error('Invalid device credentials');
    }

    if (device.status === 'DISABLED') {
      throw new Error('Device has been disabled by laboratory administration');
    }

    if (device.status === 'REVOKED') {
      throw new Error('Device registration has been revoked');
    }

    return device;
  }

  /**
   * Process periodic heartbeat from desktop client
   */
  async heartbeat(deviceId, deviceSecret, data = {}) {
    const device = await this.authenticateDevice(deviceId, deviceSecret);

    device.lastHeartbeatAt = new Date();
    if (data.clientVersion) device.clientVersion = data.clientVersion;
    if (data.ipAddress) device.location = data.ipAddress;
    await device.save();

    // Check if there is an active session marked for forced logout
    let sessionStatus = 'NO_SESSION';
    let forceLogout = false;

    if (device.activeSessionId) {
      const session = await LabSession.findById(device.activeSessionId);
      if (session) {
        sessionStatus = session.status;
        if (session.status === 'FORCED_LOGOUT' || session.status === 'ENDED') {
          forceLogout = true;
        }
      }
    }

    return {
      success: true,
      deviceId: device.deviceId,
      status: device.status,
      serverTime: new Date(),
      sessionStatus,
      forceLogout,
    };
  }

  /**
   * Get devices for a university
   */
  async getDevices(universityId, filters = {}) {
    const query = { universityId };
    if (filters.labId) query.labId = filters.labId;
    if (filters.status) query.status = filters.status;

    return await LabDevice.find(query)
      .populate('labId', 'name code building room')
      .populate('activeStudentId', 'name email role')
      .populate('lastStudentId', 'name email')
      .sort({ deviceName: 1 })
      .lean();
  }

  /**
   * Get device by deviceId
   */
  async getDeviceById(universityId, deviceId) {
    const device = await LabDevice.findOne({ deviceId, universityId })
      .populate('labId', 'name code building room policies')
      .populate('activeStudentId', 'name email role')
      .populate('lastStudentId', 'name email')
      .lean();

    if (!device) {
      throw new Error('Device not found or access denied');
    }
    return device;
  }

  /**
   * Enable a disabled device
   */
  async enableDevice(universityId, deviceId) {
    const device = await LabDevice.findOne({ deviceId, universityId });
    if (!device) {
      throw new Error('Device not found');
    }
    if (device.status === 'REVOKED') {
      throw new Error('Cannot enable a revoked device. Re-enrollment required.');
    }

    device.status = 'ACTIVE';
    device.activatedAt = new Date();
    await device.save();

    await labAuditService.logEvent({
      universityId,
      deviceId,
      labId: device.labId,
      eventType: 'DEVICE_ENABLED',
      source: 'ADMIN_PORTAL',
    });

    return { success: true, deviceId, status: device.status };
  }

  /**
   * Disable a device (terminates active session)
   */
  async disableDevice(universityId, deviceId) {
    const device = await LabDevice.findOne({ deviceId, universityId });
    if (!device) {
      throw new Error('Device not found');
    }

    device.status = 'DISABLED';
    device.deactivatedAt = new Date();

    // Terminate any active session on this device
    if (device.activeSessionId) {
      await LabSession.findByIdAndUpdate(device.activeSessionId, {
        status: 'FORCED_LOGOUT',
        logoutReason: 'DEVICE_DISABLED',
        endedAt: new Date(),
      });
      device.activeSessionId = null;
      device.activeStudentId = null;
    }

    await device.save();

    await labAuditService.logEvent({
      universityId,
      deviceId,
      labId: device.labId,
      eventType: 'DEVICE_DISABLED',
      source: 'ADMIN_PORTAL',
    });

    return { success: true, deviceId, status: device.status };
  }

  /**
   * Revoke device registration
   */
  async revokeDevice(universityId, deviceId) {
    const device = await LabDevice.findOne({ deviceId, universityId });
    if (!device) {
      throw new Error('Device not found');
    }

    device.status = 'REVOKED';
    device.deactivatedAt = new Date();

    if (device.activeSessionId) {
      await LabSession.findByIdAndUpdate(device.activeSessionId, {
        status: 'FORCED_LOGOUT',
        logoutReason: 'DEVICE_DISABLED',
        endedAt: new Date(),
      });
      device.activeSessionId = null;
      device.activeStudentId = null;
    }

    // Scramble credentials
    device.deviceCredentialHash = 'REVOKED_' + crypto.randomUUID();
    await device.save();

    await labAuditService.logEvent({
      universityId,
      deviceId,
      labId: device.labId,
      eventType: 'DEVICE_REVOKED',
      source: 'ADMIN_PORTAL',
    });

    return { success: true, deviceId, status: device.status };
  }

  /**
   * Rotate device secret
   */
  async rotateDeviceCredential(universityId, deviceId) {
    const device = await LabDevice.findOne({ deviceId, universityId });
    if (!device) {
      throw new Error('Device not found');
    }
    if (device.status === 'REVOKED') {
      throw new Error('Cannot rotate credentials on a revoked device');
    }

    const newRawSecret = crypto.randomBytes(32).toString('hex');
    const salt = await bcrypt.genSalt(10);
    device.deviceCredentialHash = await bcrypt.hash(newRawSecret, salt);
    await device.save();

    await labAuditService.logEvent({
      universityId,
      deviceId,
      labId: device.labId,
      eventType: 'DEVICE_CREDENTIAL_ROTATED',
      source: 'ADMIN_PORTAL',
    });

    return {
      deviceId: device.deviceId,
      newDeviceSecret: newRawSecret,
    };
  }
}

export const deviceService = new DeviceService();
export default deviceService;
