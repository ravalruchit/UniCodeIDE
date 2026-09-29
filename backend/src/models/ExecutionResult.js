import mongoose from 'mongoose';

export const RESULT_STATUS = [
  'PASSED',
  'FAILED',
  'TIMEOUT',
  'RUNTIME_ERROR',
  'COMPILE_ERROR',
  'MEMORY_LIMIT',
  'OUTPUT_LIMIT',
  'CANCELLED',
  'SYSTEM_ERROR',
];

const testResultSchema = new mongoose.Schema(
  {
    testCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    name: {
      type: String,
      default: 'Test Case',
    },
    status: {
      type: String,
      enum: RESULT_STATUS,
      default: 'FAILED',
    },
    input: {
      type: String,
      default: '',
    },
    expectedOutput: {
      type: String,
      default: '',
    },
    actualOutput: {
      type: String,
      default: '',
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    memoryUsedBytes: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
      default: null,
    },
    points: {
      type: Number,
      default: 0,
    },
    earnedPoints: {
      type: Number,
      default: 0,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const executionResultSchema = new mongoose.Schema(
  {
    executionJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExecutionJob',
      required: true,
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
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      default: null,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      default: null,
    },
    examSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamSession',
      default: null,
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      default: null,
    },
    status: {
      type: String,
      enum: RESULT_STATUS,
      default: 'FAILED',
      index: true,
    },
    exitCode: {
      type: Number,
      default: null,
    },
    signal: {
      type: String,
      default: null,
    },
    stdout: {
      type: String,
      default: '',
    },
    stderr: {
      type: String,
      default: '',
    },
    compileOutput: {
      type: String,
      default: '',
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    memoryUsedBytes: {
      type: Number,
      default: 0,
    },
    timedOut: {
      type: Boolean,
      default: false,
    },
    outputLimitExceeded: {
      type: Boolean,
      default: false,
    },
    tests: [testResultSchema],
    summary: {
      total: { type: Number, default: 0 },
      passed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      totalPoints: { type: Number, default: 0 },
      earnedPoints: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

executionResultSchema.index({ workspaceId: 1, createdAt: -1 });

export const ExecutionResult = mongoose.model('ExecutionResult', executionResultSchema);
