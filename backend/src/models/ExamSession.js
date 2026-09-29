import mongoose from 'mongoose';

export const EXAM_SESSION_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'SUBMITTED',
  'AUTO_SUBMITTED',
  'TERMINATED',
  'DISQUALIFIED',
  'ABANDONED',
];

export const CONNECTION_STATUSES = ['ONLINE', 'DISCONNECTED'];

const examSessionQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionBank',
      required: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'ANSWERED'],
      default: 'NOT_STARTED',
    },
    latestRevision: {
      type: Number,
      default: 1,
    },
    score: {
      type: Number,
      default: 0,
    },
    earnedPoints: {
      type: Number,
      default: 0,
    },
    maxPoints: {
      type: Number,
      default: 10,
    },
    lastExecutionResult: {
      type: Object,
      default: null,
    },
  },
  { _id: true }
);

const examSessionSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: [true, 'University reference is required'],
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam reference is required'],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: EXAM_SESSION_STATUSES,
      default: 'NOT_STARTED',
      index: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    deadlineAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    lastHeartbeatAt: {
      type: Date,
      default: Date.now,
    },
    connectionStatus: {
      type: String,
      enum: CONNECTION_STATUSES,
      default: 'ONLINE',
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    questions: [examSessionQuestionSchema],
    proctoringSessionId: {
      type: String,
      default: null,
    },
    proctoringStats: {
      tabHiddenCount: { type: Number, default: 0 },
      fullscreenExitCount: { type: Number, default: 0 },
      blurCount: { type: Number, default: 0 },
      disconnectCount: { type: Number, default: 0 },
      copyPasteCount: { type: Number, default: 0 },
    },
    score: {
      type: Number,
      default: 0,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    finalGrade: {
      type: Number,
      default: null,
    },
    isEvaluated: {
      type: Boolean,
      default: false,
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    evaluatedAt: {
      type: Date,
      default: null,
    },
    teacherFeedback: {
      type: String,
      default: '',
    },
    teacherOverrides: [
      {
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        previousScore: Number,
        newScore: Number,
        reason: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    terminationReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: One attempt per student per attemptNumber
examSessionSchema.index({ examId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });
examSessionSchema.index({ examId: 1, status: 1 });

export const ExamSession = mongoose.model('ExamSession', examSessionSchema);
