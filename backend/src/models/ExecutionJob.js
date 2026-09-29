import mongoose from 'mongoose';

export const EXECUTION_STATUS = [
  'QUEUED',
  'STARTING',
  'RUNNING',
  'COMPLETED',
  'TIMEOUT',
  'FAILED',
  'CANCELLED',
  'SYSTEM_ERROR',
];

export const EXECUTION_MODES = ['RUN', 'TEST'];

const executionJobSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: [true, 'University reference is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace reference is required'],
      index: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      default: null,
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      default: null,
      index: true,
    },
    examSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamSession',
      default: null,
      index: true,
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      default: null,
      index: true,
    },
    sourceRevision: {
      type: Number,
      required: true,
      min: 1,
    },
    programmingLanguage: {
      type: String,
      required: true,
      uppercase: true,
      enum: [
        'PYTHON',
        'JAVASCRIPT',
        'TYPESCRIPT',
        'JAVA',
        'CPP',
        'C',
        'CSHARP',
        'GO',
        'RUST',
        'SQL',
        'PHP',
        'RUBY',
        'KOTLIN',
        'SWIFT',
        'DART',
        'R',
        'BASH',
        'SCALA',
        'LUA',
        'PERL',
      ],
    },
    mode: {
      type: String,
      enum: EXECUTION_MODES,
      default: 'RUN',
    },
    status: {
      type: String,
      enum: EXECUTION_STATUS,
      default: 'QUEUED',
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    timeoutMs: {
      type: Number,
      default: 5000,
      min: 1000,
      max: 15000,
    },
    memoryLimitMb: {
      type: Number,
      default: 256,
      min: 64,
      max: 512,
    },
    cpuLimit: {
      type: Number,
      default: 1.0,
      min: 0.2,
      max: 2.0,
    },
    containerId: {
      type: String,
      default: null,
    },
    resultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExecutionResult',
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for rapid lookups and retention querying
executionJobSchema.index({ universityId: 1, userId: 1, createdAt: -1 });
executionJobSchema.index({ workspaceId: 1, createdAt: -1 });
executionJobSchema.index({ status: 1, createdAt: 1 });

export const ExecutionJob = mongoose.model('ExecutionJob', executionJobSchema);
