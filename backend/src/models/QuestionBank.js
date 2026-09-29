import mongoose from 'mongoose';

export const QUESTION_TYPES = ['CODING', 'THEORY', 'MCQ'];
export const DIFFICULTY_LEVELS = ['EASY', 'MEDIUM', 'HARD'];
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

const questionBankSchema = new mongoose.Schema(
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
      default: null,
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
      required: [true, 'Question title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Problem description is required'],
      trim: true,
    },
    instructions: {
      type: String,
      default: '',
    },
    inputDescription: {
      type: String,
      default: '',
    },
    outputDescription: {
      type: String,
      default: '',
    },
    constraints: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: QUESTION_TYPES,
      default: 'CODING',
    },
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      default: 'MEDIUM',
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: [1, 'Marks must be at least 1'],
      default: 10,
    },
    allowedLanguages: {
      type: [String],
      enum: PROGRAMMING_LANGUAGES,
      default: ['PYTHON', 'JAVASCRIPT', 'JAVA', 'CPP', 'C'],
    },
    starterCode: {
      type: Map,
      of: String,
      default: () => ({
        PYTHON: '# Write your solution here\ndef solve():\n    pass\n',
        JAVASCRIPT: '// Write your solution here\nfunction solve() {\n    \n}\n',
      }),
    },
    testCases: [testCaseSchema],
    tags: {
      type: [String],
      default: [],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

questionBankSchema.index({ universityId: 1, difficulty: 1 });
questionBankSchema.index({ universityId: 1, tags: 1 });

export const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);
