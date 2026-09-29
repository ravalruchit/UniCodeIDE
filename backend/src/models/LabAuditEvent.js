import mongoose from 'mongoose';

export const LAB_AUDIT_EVENT_TYPES = [
  'DEVICE_ENROLLED',
  'DEVICE_ENABLED',
  'DEVICE_DISABLED',
  'DEVICE_CREDENTIAL_ROTATED',
  'DEVICE_REVOKED',
  'STUDENT_LOGIN',
  'STUDENT_LOGOUT',
  'SESSION_EXPIRED',
  'SESSION_FORCE_LOGOUT',
  'DEVICE_HEARTBEAT',
  'KIOSK_ENTERED',
  'KIOSK_EXITED',
  'EXAM_MODE_ENTERED',
  'EXAM_MODE_EXITED',
  'NETWORK_DISCONNECTED',
  'NETWORK_RECONNECTED',
  'CLIENT_UPDATE_AVAILABLE',
];

const labAuditEventSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      default: null,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    labSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabSession',
      default: null,
    },
    eventType: {
      type: String,
      required: true,
      enum: LAB_AUDIT_EVENT_TYPES,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ['DESKTOP_CLIENT', 'SERVER', 'ADMIN_PORTAL'],
      default: 'DESKTOP_CLIENT',
    },
  },
  {
    timestamps: true,
  }
);

labAuditEventSchema.index({ universityId: 1, deviceId: 1, timestamp: -1 });
labAuditEventSchema.index({ labSessionId: 1 });

const LabAuditEvent = mongoose.model('LabAuditEvent', labAuditEventSchema);

export default LabAuditEvent;
