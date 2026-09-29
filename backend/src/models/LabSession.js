import mongoose from 'mongoose';

export const LAB_SESSION_STATUSES = ['ACTIVE', 'IDLE', 'ENDING', 'ENDED', 'FORCED_LOGOUT', 'EXPIRED'];
export const LOGOUT_REASONS = [
  'USER_LOGOUT',
  'IDLE_TIMEOUT',
  'FORCED_BY_ADMIN',
  'DEVICE_DISABLED',
  'SESSION_EXPIRED',
  'SYSTEM_RESET',
];

const labSessionSchema = new mongoose.Schema(
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
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: LAB_SESSION_STATUSES,
      default: 'ACTIVE',
    },
    logoutReason: {
      type: String,
      enum: LOGOUT_REASONS,
      default: null,
    },
    activeWorkspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null,
    },
    activeExamSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamSession',
      default: null,
    },
    clientVersion: {
      type: String,
      default: '1.0.0',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    kioskActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

labSessionSchema.index({ universityId: 1, studentId: 1, status: 1 });
labSessionSchema.index({ deviceId: 1, status: 1 });

const LabSession = mongoose.model('LabSession', labSessionSchema);

export default LabSession;
