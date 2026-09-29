import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
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
      required: [true, 'Module title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'DRAFT'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

moduleSchema.index({ courseId: 1, order: 1 });

export const Module = mongoose.models.Module || mongoose.model('Module', moduleSchema);
