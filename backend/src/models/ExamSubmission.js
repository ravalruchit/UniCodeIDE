import mongoose from 'mongoose';

const examAnswerSnapshotSchema = new mongoose.Schema(
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
    workspaceRevision: {
      type: Number,
      required: true,
    },
    files: [
      {
        path: { type: String, required: true },
        content: { type: String, default: '' },
      },
    ],
    language: {
      type: String,
      default: 'PYTHON',
    },
    score: {
      type: Number,
      default: 0,
    },
    maxScore: {
      type: Number,
      default: 10,
    },
    executionResult: {
      type: Object,
      default: null,
    },
  },
  { _id: true }
);

const examSubmissionSchema = new mongoose.Schema(
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
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    submissionType: {
      type: String,
      enum: ['MANUAL', 'AUTO_SUBMITTED'],
      default: 'MANUAL',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    answers: [examAnswerSnapshotSchema],
    totalAutomatedScore: {
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
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

examSubmissionSchema.index({ examId: 1, studentId: 1, attemptNumber: 1 });
examSubmissionSchema.index({ sessionId: 1 }, { unique: true });

export const ExamSubmission = mongoose.model('ExamSubmission', examSubmissionSchema);
