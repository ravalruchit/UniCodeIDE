import mongoose from 'mongoose';

export const EXAM_STATUSES = ['DRAFT', 'SCHEDULED', 'LIVE', 'ENDED', 'ARCHIVED'];
export const EXAM_TYPES = ['CODING', 'MIXED'];
export const PROCTORING_MODES = ['NONE', 'BASIC', 'STRICT'];
export const RESULT_VISIBILITY = ['IMMEDIATE', 'AFTER_REVIEW', 'HIDDEN'];

const examQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionBank',
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 1,
    },
    marks: {
      type: Number,
      required: true,
      min: 1,
      default: 10,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    // Frozen snapshot of the question at publication time
    snapshot: {
      title: String,
      description: String,
      instructions: String,
      inputDescription: String,
      outputDescription: String,
      constraints: String,
      difficulty: String,
      allowedLanguages: [String],
      starterCode: {
        type: Map,
        of: String,
      },
      testCases: [
        {
          name: String,
          input: String,
          expectedOutput: String,
          points: Number,
          isHidden: Boolean,
        },
      ],
    },
  },
  { _id: true }
);

const examSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: [true, 'University reference is required'],
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    instructions: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: EXAM_TYPES,
      default: 'CODING',
    },
    status: {
      type: String,
      enum: EXAM_STATUSES,
      default: 'DRAFT',
      index: true,
    },
    startAt: {
      type: Date,
      default: null,
    },
    endAt: {
      type: Date,
      default: null,
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [5, 'Duration must be at least 5 minutes'],
      max: [360, 'Duration cannot exceed 360 minutes'],
      default: 60,
    },
    totalMarks: {
      type: Number,
      default: 100,
      min: 1,
    },
    passingMarks: {
      type: Number,
      default: 40,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    randomizeQuestions: {
      type: Boolean,
      default: false,
    },
    allowLateEntry: {
      type: Boolean,
      default: true,
    },
    lateEntryMinutes: {
      type: Number,
      default: 15,
      min: 0,
    },
    autoSubmit: {
      type: Boolean,
      default: true,
    },
    showResultsAfterSubmit: {
      type: String,
      enum: RESULT_VISIBILITY,
      default: 'AFTER_REVIEW',
    },
    allowStudentExecution: {
      type: Boolean,
      default: true,
    },
    allowTerminal: {
      type: Boolean,
      default: false,
    },
    allowCopyPaste: {
      type: Boolean,
      default: true,
    },
    requireFullscreen: {
      type: Boolean,
      default: false,
    },
    requireCamera: {
      type: Boolean,
      default: false,
    },
    requireMicrophone: {
      type: Boolean,
      default: false,
    },
    proctoringMode: {
      type: String,
      enum: PROCTORING_MODES,
      default: 'BASIC',
    },
    questions: [examQuestionSchema],
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

examSchema.index({ universityId: 1, courseId: 1, status: 1 });
examSchema.index({ startAt: 1, endAt: 1 });

export const Exam = mongoose.model('Exam', examSchema);
