import LabAuditEvent, { LAB_AUDIT_EVENT_TYPES } from '../../models/LabAuditEvent.js';

class LabAuditService {
  /**
   * Log an append-only neutral lab audit event
   */
  async logEvent({
    universityId,
    deviceId,
    labId = null,
    studentId = null,
    labSessionId = null,
    eventType,
    metadata = {},
    source = 'DESKTOP_CLIENT',
  }) {
    if (!LAB_AUDIT_EVENT_TYPES.includes(eventType)) {
      console.warn(`[LabAuditService] Unsupported event type: ${eventType}`);
      return null;
    }

    try {
      const auditEvent = new LabAuditEvent({
        universityId,
        deviceId,
        labId,
        studentId,
        labSessionId,
        eventType,
        metadata,
        source,
        timestamp: new Date(),
      });

      return await auditEvent.save();
    } catch (err) {
      console.error('[LabAuditService] Failed to record audit event:', err.message);
      return null;
    }
  }

  /**
   * Fetch audit events with tenant isolation
   */
  async getEvents(universityId, filters = {}) {
    const query = { universityId };

    if (filters.deviceId) query.deviceId = filters.deviceId;
    if (filters.labId) query.labId = filters.labId;
    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.labSessionId) query.labSessionId = filters.labSessionId;
    if (filters.eventType) query.eventType = filters.eventType;

    const limit = Math.min(parseInt(filters.limit, 10) || 50, 200);
    const skip = parseInt(filters.skip, 10) || 0;

    const [events, total] = await Promise.all([
      LabAuditEvent.find(query)
        .populate('studentId', 'name email role')
        .populate('labId', 'name code building room')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LabAuditEvent.countDocuments(query),
    ]);

    return { events, total, limit, skip };
  }
}

export const labAuditService = new LabAuditService();
export default labAuditService;
