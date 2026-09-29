import mongoose from 'mongoose';

export const DEVICE_STATUSES = ['ACTIVE', 'INACTIVE', 'DISABLED', 'MAINTENANCE', 'REVOKED'];

const labDeviceSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    deviceName: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true,
    },
    machineIdentifier: {
      type: String,
      trim: true,
      default: '',
    },
    deviceCredentialHash: {
      type: String,
      required: true,
      select: false, // Don't expose credential hash by default
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    operatingSystem: {
      type: String,
      default: 'windows',
      trim: true,
    },
    clientVersion: {
      type: String,
      default: '1.0.0',
      trim: true,
    },
    status: {
      type: String,
      enum: DEVICE_STATUSES,
      default: 'ACTIVE',
    },
    lastHeartbeatAt: {
      type: Date,
      default: null,
    },
    lastStudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    activeStudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    activeSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabSession',
      default: null,
    },
    lastSessionStartedAt: {
      type: Date,
      default: null,
    },
    lastSessionEndedAt: {
      type: Date,
      default: null,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    activatedAt: {
      type: Date,
      default: Date.now,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

labDeviceSchema.index({ universityId: 1, labId: 1 });
labDeviceSchema.index({ universityId: 1, status: 1 });

const LabDevice = mongoose.model('LabDevice', labDeviceSchema);

export default LabDevice;
