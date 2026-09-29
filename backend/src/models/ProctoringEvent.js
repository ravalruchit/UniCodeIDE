import mongoose from 'mongoose';

export const PROCTORING_EVENT_TYPES = [
  'EXAM_STARTED',
  'QUESTION_OPENED',
  'QUESTION_CHANGED',
  'TAB_HIDDEN',
  'TAB_VISIBLE',
  'WINDOW_BLUR',
  'WINDOW_FOCUS',
  'FULLSCREEN_ENTER',
  'FULLSCREEN_EXIT',
  'NETWORK_DISCONNECTED',
  'NETWORK_RECONNECTED',
  'CAMERA_PERMISSION_GRANTED',
  'CAMERA_PERMISSION_DENIED',
  'MIC_PERMISSION_GRANTED',
  'MIC_PERMISSION_DENIED',
  'COPY_ATTEMPT',
  'PASTE_ATTEMPT',
  'CODE_EXECUTED',
  'CODE_SAVED',
  'AUTO_SUBMITTED',
  'EXAM_SUBMITTED',
  'SESSION_RECONNECTED',
  'TERMINATED_BY_TEACHER',
];

export const EVENT_SEVERITIES = ['INFO', 'NOTICE', 'ATTENTION'];

const proctoringEventSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamSession',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: PROCTORING_EVENT_TYPES,
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: EVENT_SEVERITIES,
      default: 'INFO',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

proctoringEventSchema.index({ sessionId: 1, timestamp: -1 });

export const ProctoringEvent = mongoose.model('ProctoringEvent', proctoringEventSchema);
