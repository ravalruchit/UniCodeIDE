import mongoose from 'mongoose';

export const TERMINAL_STATUS = ['ACTIVE', 'IDLE', 'TERMINATED', 'EXPIRED'];

const terminalSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    containerId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: TERMINAL_STATUS,
      default: 'ACTIVE',
      index: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

terminalSessionSchema.index({ userId: 1, workspaceId: 1, status: 1 });

export const TerminalSession = mongoose.model('TerminalSession', terminalSessionSchema);
