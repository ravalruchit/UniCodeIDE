import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['LINK', 'PDF', 'DOCUMENT', 'CODE', 'SLIDES'],
      default: 'LINK',
    },
    url: {
      type: String,
      default: '',
      trim: true,
    },
    codeSnippet: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'javascript',
    },
  },
  { _id: true }
);

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Module reference is required'],
      index: true,
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: [true, 'University reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['ARTICLE', 'VIDEO', 'DOCUMENT', 'CODE_EXAMPLE', 'RESOURCE'],
      default: 'ARTICLE',
    },
    resources: [resourceSchema],
    order: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 15, // in minutes
    },
    status: {
      type: String,
      enum: ['PUBLISHED', 'DRAFT'],
      default: 'PUBLISHED',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

lessonSchema.index({ moduleId: 1, order: 1 });
lessonSchema.index({ courseId: 1, order: 1 });

export const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
