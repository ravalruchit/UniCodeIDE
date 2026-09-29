import mongoose from 'mongoose';

export const SUBMISSION_STATUS = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'EVALUATED', 'RETURNED'];

const submissionSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: [true, 'University reference is required'],
      index: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment reference is required'],
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
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
    sourceCode: {
      type: String,
      default: '',
    },
    programmingLanguage: {
      type: String,
      default: 'PYTHON',
    },
    files: [
      {
        path: { type: String, required: true },
        content: { type: String, default: '' },
      },
    ],
    status: {
      type: String,
      enum: SUBMISSION_STATUS,
      default: 'DRAFT',
      index: true,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      default: null,
      min: 0,
    },
    maxScore: {
      type: Number,
      default: 100,
      min: 1,
    },
    feedback: {
      general: { type: String, default: '' },
      strengths: { type: String, default: '' },
      improvements: { type: String, default: '' },
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
    executionResult: {
      status: {
        type: String,
        enum: ['NOT_RUN', 'PENDING', 'PASSED', 'FAILED', 'ERROR'],
        default: 'NOT_RUN',
      },
      executedAt: { type: Date, default: null },
      details: {
        type: String,
        default: 'Manual evaluation phase. Docker container sandbox execution deferred to Phase 7.',
      },
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ studentId: 1, assignmentId: 1, attemptNumber: 1 });
submissionSchema.index({ assignmentId: 1, status: 1 });
submissionSchema.index({ studentId: 1, courseId: 1 });

export const Submission =
  mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
