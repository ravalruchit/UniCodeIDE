import mongoose from 'mongoose';

export const COURSE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
};

const courseSchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: [true, 'University reference is required'],
      index: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
      index: true,
    },
    code: {
      type: String,
      required: [true, 'Course code is required (e.g. CS101)'],
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    instructors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    level: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'BEGINNER',
    },
    semester: {
      type: String,
      default: 'Fall 2026',
      trim: true,
    },
    duration: {
      type: String,
      default: '12 Weeks',
    },
    status: {
      type: String,
      enum: Object.values(COURSE_STATUS),
      default: COURSE_STATUS.DRAFT,
      index: true,
    },
    visibility: {
      type: String,
      enum: ['PUBLIC', 'ENROLLED_ONLY'],
      default: 'ENROLLED_ONLY',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of course code per university
courseSchema.index({ universityId: 1, code: 1 }, { unique: true });
courseSchema.index({ universityId: 1, departmentId: 1 });

export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
