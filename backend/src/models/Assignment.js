import mongoose from 'mongoose';

export const ASSIGNMENT_TYPES = ['CODING', 'THEORY', 'PROJECT'];
export const PROGRAMMING_LANGUAGES = [
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
];
export const DIFFICULTY_LEVELS = ['EASY', 'MEDIUM', 'HARD'];
export const ASSIGNMENT_STATUS = ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'];

const testCaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    input: {
      type: String,
      default: '',
    },
    expectedOutput: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 10,
      min: 0,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const assignmentSchema = new mongoose.Schema(
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
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      default: null,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
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
      enum: ASSIGNMENT_TYPES,
      default: 'CODING',
    },
    programmingLanguage: {
      type: String,
      enum: PROGRAMMING_LANGUAGES,
      default: 'PYTHON',
    },
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      default: 'MEDIUM',
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks are required'],
      min: [1, 'Total marks must be at least 1'],
      default: 100,
    },
    passingMarks: {
      type: Number,
      required: [true, 'Passing marks are required'],
      min: [0, 'Passing marks cannot be negative'],
      default: 40,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ASSIGNMENT_STATUS,
      default: 'DRAFT',
      index: true,
    },
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    latePenaltyPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    starterCode: {
      type: String,
      default: '',
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: [1, 'At least 1 attempt is required'],
    },
    testCases: [testCaseSchema],
    resources: [
      {
        title: { type: String, required: true },
        url: { type: String, default: '' },
        type: { type: String, default: 'LINK' },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ universityId: 1, courseId: 1 });
assignmentSchema.index({ courseId: 1, status: 1 });

export const Assignment =
  mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
