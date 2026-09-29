import mongoose from 'mongoose';

export const LAB_STATUSES = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];

const labPoliciesSchema = new mongoose.Schema(
  {
    requireLogin: { type: Boolean, default: true },
    idleTimeoutMinutes: { type: Number, default: 30 },
    allowPersonalWorkspace: { type: Boolean, default: true },
    allowAssignmentWorkspace: { type: Boolean, default: true },
    allowExamWorkspace: { type: Boolean, default: true },
    allowTerminal: { type: Boolean, default: true },
    allowStudentExecution: { type: Boolean, default: true },
    forceFullscreenForExams: { type: Boolean, default: true },
    clearLocalCacheOnLogout: { type: Boolean, default: true },
    disableExternalNavigation: { type: Boolean, default: false },
    disableDevTools: { type: Boolean, default: true },
    autoLogoutAfterSession: { type: Boolean, default: false },
    maxSessionDurationMinutes: { type: Number, default: 240 },
  },
  { _id: false }
);

const labSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Lab name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Lab code is required'],
      trim: true,
      uppercase: true,
    },
    building: {
      type: String,
      default: '',
      trim: true,
    },
    room: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    capacity: {
      type: Number,
      default: 30,
      min: 1,
    },
    status: {
      type: String,
      enum: LAB_STATUSES,
      default: 'ACTIVE',
    },
    deviceCount: {
      type: Number,
      default: 0,
    },
    policies: {
      type: labPoliciesSchema,
      default: () => ({}),
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

labSchema.index({ universityId: 1, code: 1 }, { unique: true });
labSchema.index({ universityId: 1, status: 1 });

const Lab = mongoose.model('Lab', labSchema);

export default Lab;
