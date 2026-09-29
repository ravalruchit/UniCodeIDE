import mongoose from 'mongoose';

const deviceEnrollmentTokenSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    usedByDeviceId: {
      type: String,
      default: null,
    },
    maxUses: {
      type: Number,
      default: 1,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

deviceEnrollmentTokenSchema.index({ universityId: 1, isUsed: 1 });
deviceEnrollmentTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const DeviceEnrollmentToken = mongoose.model('DeviceEnrollmentToken', deviceEnrollmentTokenSchema);

export default DeviceEnrollmentToken;
