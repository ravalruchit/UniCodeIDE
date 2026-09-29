import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'University name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'University code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Official contact email is required'],
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'TRIAL'],
      default: 'ACTIVE',
    },
    plan: {
      type: String,
      enum: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
      default: 'STARTER',
    },
    settings: {
      maxStudents: { type: Number, default: 30 },
      allowStudentSelfSignup: { type: Boolean, default: true },
      ssoEnabled: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

export const University = mongoose.models.University || mongoose.model('University', universitySchema);
