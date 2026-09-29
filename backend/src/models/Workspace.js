import mongoose from 'mongoose';

export const WORKSPACE_TYPES = ['ASSIGNMENT', 'COURSE', 'PRACTICE', 'EXAM'];
export const WORKSPACE_STATUSES = ['ACTIVE', 'ARCHIVED'];
export const WORKSPACE_LANGUAGES = [
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

// Helper to deduce language mode for Monaco editor from file extension
export const detectFileLanguage = (filePath = '') => {
  const ext = filePath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'py':
      return 'python';
    case 'js':
    case 'jsx':
    case 'mjs':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'java':
      return 'java';
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'hpp':
    case 'h':
      return 'cpp';
    case 'c':
      return 'c';
    case 'cs':
      return 'csharp';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    case 'sql':
      return 'sql';
    case 'php':
      return 'php';
    case 'rb':
      return 'ruby';
    case 'kt':
      return 'kotlin';
    case 'swift':
      return 'swift';
    case 'dart':
      return 'dart';
    case 'r':
      return 'r';
    case 'sh':
    case 'bash':
      return 'shell';
    case 'scala':
      return 'scala';
    case 'lua':
      return 'lua';
    case 'pl':
    case 'pm':
      return 'perl';
    case 'json':
      return 'json';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    default:
      return 'plaintext';
  }
};

const workspaceFileSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'plaintext',
    },
    size: {
      type: Number,
      default: 0,
    },
    isEntry: {
      type: Boolean,
      default: false,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const workspaceSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: [true, 'University reference is required'],
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner reference is required'],
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
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
    examQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: 120,
    },
    type: {
      type: String,
      enum: WORKSPACE_TYPES,
      default: 'ASSIGNMENT',
    },
    status: {
      type: String,
      enum: WORKSPACE_STATUSES,
      default: 'ACTIVE',
    },
    language: {
      type: String,
      enum: WORKSPACE_LANGUAGES,
      default: 'PYTHON',
    },
    files: [workspaceFileSchema],
    activeFilePath: {
      type: String,
      default: 'main.py',
    },
    settings: {
      fontSize: { type: Number, default: 14, min: 10, max: 32 },
      tabSize: { type: Number, default: 4, min: 2, max: 8 },
      wordWrap: { type: String, enum: ['on', 'off'], default: 'on' },
      minimap: { type: Boolean, default: true },
      theme: { type: String, default: 'vs-dark' },
    },
    revision: {
      type: Number,
      default: 1,
      min: 1,
    },
    lastOpenedAt: {
      type: Date,
      default: Date.now,
    },
    lastSavedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
workspaceSchema.index({ universityId: 1, ownerId: 1, assignmentId: 1 });
workspaceSchema.index({ ownerId: 1, updatedAt: -1 });
workspaceSchema.index({ assignmentId: 1, status: 1 });

export const Workspace = mongoose.model('Workspace', workspaceSchema);
